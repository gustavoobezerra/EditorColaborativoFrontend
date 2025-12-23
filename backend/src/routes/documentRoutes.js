import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocument,
  getDocumentByShareLink,
  updateDocument,
  deleteDocument,
  generateShareLink,
  disableShareLink,
  addCollaborator,
  removeCollaborator,
  getVersions,
  restoreVersion,
  duplicateDocument,
  toggleStar
} from '../controllers/documentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Rota pública para documentos compartilhados
router.get('/shared/:shareLink', optionalAuth, getDocumentByShareLink);

// Rotas protegidas
router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(createDocument);

router.route('/:id')
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

// Compartilhamento
router.post('/:id/share', generateShareLink);
router.delete('/:id/share', disableShareLink);

// Colaboradores
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);

// Versões
router.get('/:id/versions', getVersions);
router.post('/:id/versions/:versionId/restore', restoreVersion);

// Ações
router.post('/:id/duplicate', duplicateDocument);
router.post('/:id/star', toggleStar);

export default router;
