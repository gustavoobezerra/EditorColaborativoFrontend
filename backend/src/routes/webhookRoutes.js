import express from 'express';
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook
} from '../controllers/webhookController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getWebhooks);
router.post('/', createWebhook);
router.put('/:id', updateWebhook);
router.delete('/:id', deleteWebhook);

export default router;
