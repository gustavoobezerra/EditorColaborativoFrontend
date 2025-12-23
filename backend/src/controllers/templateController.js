import Template from '../models/Template.js';
import Document from '../models/Document.js';

// Listar templates (públicos + do usuário)
export const getTemplates = async (req, res) => {
  try {
    const { category, search } = req.query;
    const userId = req.user._id;

    let query = {
      $or: [
        { isPublic: true },
        { author: userId }
      ]
    };

    // Filtro por categoria
    if (category && category !== 'all') {
      query.category = category;
    }

    // Busca por texto
    if (search) {
      query.$text = { $search: search };
    }

    const templates = await Template.find(query)
      .populate('author', 'name email')
      .sort({ usageCount: -1, createdAt: -1 })
      .lean();

    res.json({ templates });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({ message: 'Erro ao listar templates' });
  }
};

// Obter template por ID
export const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await Template.findById(id).populate('author', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    // Verifica se usuário tem acesso
    if (!template.isPublic && !template.author._id.equals(userId)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Erro ao obter template:', error);
    res.status(500).json({ message: 'Erro ao obter template' });
  }
};

// Criar template
export const createTemplate = async (req, res) => {
  try {
    const { title, description, content, category, icon, isPublic, tags } = req.body;
    const userId = req.user._id;

    const template = new Template({
      title,
      description,
      content,
      category,
      icon,
      author: userId,
      isPublic: isPublic || false,
      tags: tags || []
    });

    await template.save();
    await template.populate('author', 'name email');

    res.status(201).json({ template });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({ message: 'Erro ao criar template' });
  }
};

// Atualizar template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    // Apenas autor pode atualizar
    if (!template.author.equals(userId)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Atualiza campos permitidos
    const allowedUpdates = ['title', 'description', 'content', 'category', 'icon', 'isPublic', 'tags'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        template[field] = updates[field];
      }
    });

    await template.save();
    await template.populate('author', 'name email');

    res.json({ template });
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    res.status(500).json({ message: 'Erro ao atualizar template' });
  }
};

// Deletar template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    // Apenas autor pode deletar
    if (!template.author.equals(userId)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    await template.deleteOne();

    res.json({ message: 'Template deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar template:', error);
    res.status(500).json({ message: 'Erro ao deletar template' });
  }
};

// Usar template (criar documento a partir de template)
export const useTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title } = req.body;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    // Verifica acesso
    if (!template.isPublic && !template.author.equals(userId)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Cria documento com conteúdo do template
    const document = new Document({
      title: title || `${template.title} - Cópia`,
      content: template.content,
      icon: template.icon,
      owner: userId,
      tags: template.tags
    });

    await document.save();

    // Incrementa contador de uso
    template.usageCount += 1;
    await template.save();

    res.status(201).json({ document });
  } catch (error) {
    console.error('Erro ao usar template:', error);
    res.status(500).json({ message: 'Erro ao criar documento do template' });
  }
};

// Criar template a partir de documento existente
export const createFromDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, description, category, isPublic } = req.body;
    const userId = req.user._id;

    // Busca documento
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    // Verifica se usuário é dono
    if (!document.owner.equals(userId)) {
      return res.status(403).json({ message: 'Apenas o dono pode criar template' });
    }

    // Cria template com conteúdo do documento
    const template = new Template({
      title: title || `Template: ${document.title}`,
      description: description || '',
      content: document.content,
      category: category || 'other',
      icon: document.icon,
      author: userId,
      isPublic: isPublic || false,
      tags: document.tags || []
    });

    await template.save();
    await template.populate('author', 'name email');

    res.status(201).json({ template });
  } catch (error) {
    console.error('Erro ao criar template de documento:', error);
    res.status(500).json({ message: 'Erro ao criar template' });
  }
};
