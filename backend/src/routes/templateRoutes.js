import express from 'express';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  createFromDocument
} from '../controllers/templateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todas rotas requerem autenticação
router.use(protect);

// CRUD básico
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

// Ações especiais
router.post('/:id/use', useTemplate);
router.post('/from-document/:documentId', createFromDocument);

export default router;
