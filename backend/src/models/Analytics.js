import mongoose from 'mongoose';

const { Schema } = mongoose;

const analyticsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  document: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  wordsAdded: {
    type: Number,
    default: 0
  },
  wordsDeleted: {
    type: Number,
    default: 0
  },
  sessionsCount: {
    type: Number,
    default: 0
  },
  totalTimeMs: {
    type: Number,
    default: 0
  },
  activityHeatmap: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Índices compostos para queries eficientes
analyticsSchema.index({ user: 1, date: -1 });
analyticsSchema.index({ user: 1, document: 1, date: -1 });

export default mongoose.model('Analytics', analyticsSchema);
