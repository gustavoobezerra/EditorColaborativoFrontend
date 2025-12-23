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
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Rota pública para documentos compartilhados
router.get('/shared/:shareLink', optionalAuth, getDocumentByShareLink);

// Rotas protegidas
router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(createDocument);

router.route('/:id')
  .get(authorize('read'), getDocument)
  .put(authorize('update'), updateDocument)
  .delete(authorize('delete'), deleteDocument);

// Compartilhamento
router.post('/:id/share', authorize('share'), generateShareLink);
router.delete('/:id/share', authorize('share'), disableShareLink);

// Colaboradores
router.post('/:id/collaborators', authorize('share'), addCollaborator);
router.delete('/:id/collaborators/:userId', authorize('share'), removeCollaborator);

// Versões
router.get('/:id/versions', authorize('read'), getVersions);
router.post('/:id/versions/:versionId/restore', authorize('update'), restoreVersion);

// Ações
router.post('/:id/duplicate', authorize('read'), duplicateDocument);
router.post('/:id/star', authorize('read'), toggleStar);

export default router;
