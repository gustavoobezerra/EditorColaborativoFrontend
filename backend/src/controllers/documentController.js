import Document from '../models/Document.js';
import User from '../models/User.js';

// Criar documento
export const createDocument = async (req, res) => {
  try {
    const { title, icon, color, tags } = req.body;

    const document = await Document.create({
      title: title || 'Documento sem título',
      owner: req.user._id,
      content: { ops: [{ insert: '\n' }] },
      icon: icon || '📄',
      color: color || '#3B82F6',
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Listar documentos
export const getDocuments = async (req, res) => {
  try {
    const { search, starred, archived, tag } = req.query;

    let query = {
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ],
      archived: archived === 'true'
    };

    // Filtro de favoritos
    if (starred === 'true') {
      query.starred = true;
    }

    // Filtro por tag
    if (tag) {
      query.tags = tag;
    }

    let documents = Document.find(query)
      .populate('owner', 'name email avatar color')
      .populate('lastEditedBy', 'name')
      .sort({ updatedAt: -1 });

    // Busca por texto
    if (search) {
      documents = Document.find({
        ...query,
        $text: { $search: search }
      })
        .populate('owner', 'name email avatar color')
        .populate('lastEditedBy', 'name')
        .sort({ score: { $meta: 'textScore' }, updatedAt: -1 });
    }

    const result = await documents;

    res.json({
      success: true,
      documents: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter documento por ID
export const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email avatar color')
      .populate('collaborators.user', 'name email avatar color')
      .populate('lastEditedBy', 'name avatar')
      .populate('versions.savedBy', 'name avatar');

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    // Incrementar visualizações
    document.viewCount += 1;
    await document.save();

    res.json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter documento por link de compartilhamento
export const getDocumentByShareLink = async (req, res) => {
  try {
    const { shareLink } = req.params;

    const document = await Document.findOne({
      shareLink,
      shareLinkEnabled: true
    })
      .populate('owner', 'name avatar')
      .populate('collaborators.user', 'name avatar');

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado ou link expirado' });
    }

    document.viewCount += 1;
    await document.save();

    res.json({
      success: true,
      document: {
        _id: document._id,
        title: document.title,
        content: document.content,
        owner: document.owner,
        permission: document.shareLinkPermission,
        icon: document.icon,
        color: document.color
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar documento
export const updateDocument = async (req, res) => {
  try {
    const { title, content, icon, color, tags, starred, archived } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    // Salvar versão anterior se o conteúdo mudou significativamente
    if (content && JSON.stringify(content) !== JSON.stringify(document.content)) {
      await document.saveVersion(req.user._id);
    }

    // Atualizar campos
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (icon !== undefined) document.icon = icon;
    if (color !== undefined) document.color = color;
    if (tags !== undefined) document.tags = tags;
    if (starred !== undefined) document.starred = starred;
    if (archived !== undefined) document.archived = archived;

    document.lastEditedBy = req.user._id;

    await document.save();

    res.json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deletar documento
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: 'Documento deletado'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gerar link de compartilhamento
export const generateShareLink = async (req, res) => {
  try {
    const { permission } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode gerar links de compartilhamento' });
    }

    const shareLink = document.generateShareLink();
    document.shareLinkPermission = permission || 'view';
    await document.save();

    res.json({
      success: true,
      shareLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${shareLink}`,
      permission: document.shareLinkPermission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Desabilitar link de compartilhamento
export const disableShareLink = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    document.shareLinkEnabled = false;
    await document.save();

    res.json({
      success: true,
      message: 'Link de compartilhamento desabilitado'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adicionar colaborador
export const addCollaborator = async (req, res) => {
  try {
    const { email, permission } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode adicionar colaboradores' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se já é colaborador
    const existingCollaborator = document.collaborators.find(
      c => c.user.toString() === user._id.toString()
    );

    if (existingCollaborator) {
      existingCollaborator.permission = permission || 'view';
    } else {
      document.collaborators.push({
        user: user._id,
        permission: permission || 'view'
      });
    }

    await document.save();
    await document.populate('collaborators.user', 'name email avatar color');

    res.json({
      success: true,
      collaborators: document.collaborators
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remover colaborador
export const removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Apenas o dono pode remover colaboradores' });
    }

    document.collaborators = document.collaborators.filter(
      c => c.user.toString() !== userId
    );

    await document.save();

    res.json({
      success: true,
      message: 'Colaborador removido'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter histórico de versões
export const getVersions = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .select('versions title')
      .populate('versions.savedBy', 'name avatar');

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    res.json({
      success: true,
      versions: document.versions.reverse()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restaurar versão
export const restoreVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    const version = document.versions.id(versionId);
    if (!version) {
      return res.status(404).json({ message: 'Versão não encontrada' });
    }

    // Salvar versão atual antes de restaurar
    await document.saveVersion(req.user._id, 'Antes de restaurar');

    // Restaurar
    document.content = version.content;
    document.lastEditedBy = req.user._id;
    await document.save();

    res.json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Duplicar documento
export const duplicateDocument = async (req, res) => {
  try {
    const original = await Document.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    const duplicate = await Document.create({
      title: `${original.title} (cópia)`,
      content: original.content,
      owner: req.user._id,
      icon: original.icon,
      color: original.color,
      tags: original.tags
    });

    res.status(201).json({
      success: true,
      document: duplicate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle favorito
export const toggleStar = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    document.starred = !document.starred;
    await document.save();

    res.json({
      success: true,
      starred: document.starred
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
