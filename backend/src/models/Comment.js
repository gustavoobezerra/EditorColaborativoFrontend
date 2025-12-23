import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema({
  document: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  selection: {
    index: Number,
    length: Number,
    text: String
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },
  reactions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String
  }]
}, {
  timestamps: true
});

// Índices compostos para queries eficientes
commentSchema.index({ document: 1, parent: 1 });
commentSchema.index({ document: 1, status: 1 });

export default mongoose.model('Comment', commentSchema);
