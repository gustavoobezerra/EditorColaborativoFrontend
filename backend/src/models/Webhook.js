import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema } = mongoose;

const webhookSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL inválida'
    }
  },
  events: [{
    type: String,
    enum: [
      'document.created',
      'document.updated',
      'document.deleted',
      'document.shared',
      'comment.added',
      'comment.resolved'
    ]
  }],
  secret: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  active: {
    type: Boolean,
    default: true
  },
  lastTriggered: Date,
  failureCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Webhook', webhookSchema);
