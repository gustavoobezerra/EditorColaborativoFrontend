import mongoose from 'mongoose';
import crypto from 'crypto';

const versionSchema = new mongoose.Schema({
  content: { type: Object, required: true },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  savedAt: { type: Date, default: Date.now },
  label: { type: String }
});

const documentSchema = new mongoose.Schema({
  title: { type: String, default: 'Documento sem título' },
  content: { type: Object, default: { ops: [{ insert: '\n' }] } },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' },
    addedAt: { type: Date, default: Date.now }
  }],
  isPublic: { type: Boolean, default: false },

  // Compartilhamento via link
  shareLink: { type: String, unique: true, sparse: true },
  shareLinkPermission: { type: String, enum: ['view', 'edit'], default: 'view' },
  shareLinkEnabled: { type: Boolean, default: false },

  // Histórico de versões
  versions: [versionSchema],
  maxVersions: { type: Number, default: 50 },

  // Metadados
  icon: { type: String, default: '📄' },
  color: { type: String, default: '#3B82F6' },
  starred: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },

  // Estatísticas
  viewCount: { type: Number, default: 0 },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Tags para organização
  tags: [{ type: String }]
}, { timestamps: true });

// Gerar link de compartilhamento único
documentSchema.methods.generateShareLink = function() {
  this.shareLink = crypto.randomBytes(16).toString('hex');
  this.shareLinkEnabled = true;
  return this.shareLink;
};

// Salvar versão no histórico
documentSchema.methods.saveVersion = async function(userId, label = null) {
  this.versions.push({
    content: this.content,
    savedBy: userId,
    label
  });

  // Manter apenas as últimas N versões
  if (this.versions.length > this.maxVersions) {
    this.versions = this.versions.slice(-this.maxVersions);
  }

  await this.save();
};

// Verificar se usuário tem permissão
documentSchema.methods.hasPermission = function(userId, requiredPermission = 'view') {
  // Owner tem todas as permissões
  if (this.owner.toString() === userId.toString()) {
    return true;
  }

  // Verificar colaboradores
  const collaborator = this.collaborators.find(
    c => c.user.toString() === userId.toString()
  );

  if (!collaborator) return false;

  if (requiredPermission === 'view') {
    return ['view', 'edit'].includes(collaborator.permission);
  }

  return collaborator.permission === 'edit';
};

// Índices para busca
documentSchema.index({ title: 'text', tags: 'text' });
documentSchema.index({ owner: 1, updatedAt: -1 });
documentSchema.index({ shareLink: 1 });

export default mongoose.model('Document', documentSchema);
