import mongoose from 'mongoose';

const { Schema } = mongoose;

const auditLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['read', 'create', 'update', 'delete', 'share', 'export', 'login', 'logout']
  },
  resource: {
    type: String,
    required: true,
    enum: ['Document', 'Template', 'Comment', 'User']
  },
  resourceId: {
    type: Schema.Types.ObjectId
  },
  ipAddress: String,
  userAgent: String,
  metadata: Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  }
}, {
  timestamps: true
});

// Índices compostos
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
