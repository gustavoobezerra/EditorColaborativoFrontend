import mongoose from 'mongoose';

const { Schema } = mongoose;

const templateSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  content: {
    type: Object, // Quill Delta format
    default: { ops: [{ insert: '\n' }] }
  },
  category: {
    type: String,
    enum: ['meeting', 'report', 'project', 'notes', 'other'],
    default: 'other'
  },
  icon: {
    type: String,
    default: '📄'
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Índices
templateSchema.index({ title: 'text', description: 'text', tags: 'text' });
templateSchema.index({ author: 1, createdAt: -1 });
templateSchema.index({ isPublic: 1, usageCount: -1 });
templateSchema.index({ category: 1 });

export default mongoose.model('Template', templateSchema);
