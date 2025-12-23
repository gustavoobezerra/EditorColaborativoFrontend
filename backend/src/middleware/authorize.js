import { ForbiddenError } from '@casl/ability';
import defineAbilitiesFor from '../config/abilities.js';

/**
 * Middleware de autorização usando CASL
 */
export function authorize(action, subject, getSubjectFn = null) {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Se getSubjectFn fornecida, obtém o recurso
      let resource = null;
      if (getSubjectFn) {
        resource = await getSubjectFn(req);
        if (!resource) {
          return res.status(404).json({ message: `${subject} não encontrado` });
        }
      }

      // Define habilidades do usuário
      const ability = defineAbilitiesFor(user, resource);

      // Verifica permissão
      const canPerform = resource
        ? ability.can(action, resource)
        : ability.can(action, subject);

      if (!canPerform) {
        return res.status(403).json({
          message: 'Você não tem permissão para realizar esta ação',
          action,
          subject
        });
      }

      // Anexa ability ao request para uso posterior
      req.ability = ability;
      req.resource = resource;

      next();
    } catch (error) {
      console.error('Erro na autorização:', error);
      res.status(500).json({ message: 'Erro ao verificar permissões' });
    }
  };
}

/**
 * Helper para obter documento
 */
export async function getDocument(req) {
  const Document = (await import('../models/Document.js')).default;
  const docId = req.params.id || req.params.documentId;
  return await Document.findById(docId).populate('collaborators.user');
}

/**
 * Helper para obter template
 */
export async function getTemplate(req) {
  const Template = (await import('../models/Template.js')).default;
  return await Template.findById(req.params.id);
}

/**
 * Helper para obter comentário
 */
export async function getComment(req) {
  const Comment = (await import('../models/Comment.js')).default;
  return await Comment.findById(req.params.id);
}

export default authorize;
