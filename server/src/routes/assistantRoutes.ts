import { Router } from 'express';
import { AssistantController } from '../controllers/assistantController';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Nexora AI Backend'
  });
});

router.post('/chat', AssistantController.handleChat);
router.post('/page-summary', AssistantController.handlePageSummary);
router.post('/explain-text', AssistantController.handleExplainText);
router.post('/reply', AssistantController.handleWhatsAppReply);
router.post('/analyse-claim', AssistantController.handleAnalyseClaim);

export default router;
