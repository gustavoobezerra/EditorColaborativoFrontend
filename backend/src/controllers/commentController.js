import Comment from '../models/Comment.js';
import { triggerWebhook } from '../services/webhookService.js';

// Listar comentários de um documento
export const getComments = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status } = req.query;

    const query = { document: documentId };
    if (status) query.status = status;

    const comments = await Comment.find(query)
      .populate('author', 'name email color avatar')
      .populate({
        path: 'reactions.user',
        select: 'name'
      })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ comments });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({ message: 'Erro ao listar comentários' });
  }
};

// Criar comentário
export const createComment = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { content, selection, parentId } = req.body;
    const userId = req.user._id;

    const comment = new Comment({
      document: documentId,
      author: userId,
      content,
      selection,
      parent: parentId || null
    });

    await comment.save();
    await comment.populate('author', 'name email color avatar');

    // Trigger webhook
    await triggerWebhook('comment.added', {
      commentId: comment._id,
      documentId,
      author: req.user.name,
      content: content.substring(0, 100)
    }, req.user._id);

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ message: 'Erro ao criar comentário' });
  }
};

// Atualizar comentário
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    // Apenas autor pode editar
    if (!comment.author.equals(userId)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'name email color avatar');

    res.json({ comment });
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    res.status(500).json({ message: 'Erro ao atualizar comentário' });
  }
};

// Deletar comentário
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    // Apenas autor pode deletar
    if (!comment.author.equals(userId)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Deletar também respostas (thread)
    await Comment.deleteMany({ parent: id });
    await comment.deleteOne();

    res.json({ message: 'Comentário deletado' });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).json({ message: 'Erro ao deletar comentário' });
  }
};

// Resolver/reabrir comentário
export const toggleResolve = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    comment.status = comment.status === 'open' ? 'resolved' : 'open';
    await comment.save();
    await comment.populate('author', 'name email color avatar');

    // Trigger webhook only when resolved
    if (comment.status === 'resolved') {
      await triggerWebhook('comment.resolved', {
        commentId: comment._id,
        documentId: comment.document,
        resolvedBy: req.user.name
      }, req.user._id);
    }

    res.json({ comment });
  } catch (error) {
    console.error('Erro ao resolver comentário:', error);
    res.status(500).json({ message: 'Erro ao resolver comentário' });
  }
};

// Adicionar reação
export const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    // Remove reação anterior do usuário
    comment.reactions = comment.reactions.filter(
      r => !r.user.equals(userId)
    );

    // Adiciona nova reação
    comment.reactions.push({ user: userId, emoji });
    await comment.save();
    await comment.populate('author', 'name email color avatar');

    res.json({ comment });
  } catch (error) {
    console.error('Erro ao adicionar reação:', error);
    res.status(500).json({ message: 'Erro ao adicionar reação' });
  }
};
