import express from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleResolve,
  addReaction
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todas rotas requerem autenticação
router.use(protect);

// Comentários de um documento
router.get('/document/:documentId', getComments);
router.post('/document/:documentId', createComment);

// Operações em comentário específico
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.patch('/:id/resolve', toggleResolve);
router.post('/:id/react', addReaction);

export default router;
