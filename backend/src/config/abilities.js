import { AbilityBuilder, createMongoAbility } from '@casl/ability';

/**
 * Define permissões baseadas em CASL
 */
export function defineAbilitiesFor(user, document = null) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user) {
    // Usuário não autenticado - apenas leitura de documentos públicos
    can('read', 'Document', { shareLinkEnabled: true });
    return build();
  }

  // Usuário autenticado - permissões básicas
  can('read', 'Document', { owner: user._id });
  can('create', 'Document');
  can('update', 'Document', { owner: user._id });
  can('delete', 'Document', { owner: user._id });
  can('share', 'Document', { owner: user._id });

  // Templates - criar, ler próprios, ler públicos
  can('create', 'Template');
  can('read', 'Template', { $or: [{ author: user._id }, { isPublic: true }] });
  can('update', 'Template', { author: user._id });
  can('delete', 'Template', { author: user._id });

  // Comentários - criar, editar próprios, ler todos do documento
  can('create', 'Comment');
  can('read', 'Comment');
  can('update', 'Comment', { author: user._id });
  can('delete', 'Comment', { author: user._id });
  can('resolve', 'Comment'); // Qualquer um pode resolver

  // Se documento específico foi fornecido
  if (document) {
    // Dono tem todas permissões
    if (document.owner.equals(user._id)) {
      can('manage', 'Document', { _id: document._id });
    }

    // Colaborador com permissão de edição
    const collaborator = document.collaborators?.find(c =>
      c.user.equals(user._id)
    );

    if (collaborator) {
      can('read', 'Document', { _id: document._id });

      if (collaborator.permission === 'edit') {
        can('update', 'Document', { _id: document._id });
        can('create', 'Comment', { document: document._id });
      }

      // Colaborador não pode deletar ou compartilhar
      cannot('delete', 'Document', { _id: document._id });
      cannot('share', 'Document', { _id: document._id });
    }
  }

  return build();
}

export default defineAbilitiesFor;
