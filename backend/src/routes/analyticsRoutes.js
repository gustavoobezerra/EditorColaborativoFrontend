import express from 'express';
import {
  trackActivity,
  getAnalyticsSummary,
  getMostEditedDocuments,
  getReadabilityScore
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/track', trackActivity);
router.get('/summary', getAnalyticsSummary);
router.get('/documents', getMostEditedDocuments);
router.get('/readability/:documentId', getReadabilityScore);

export default router;
