const router = require('express').Router();
const controller = require('../controllers/aiController');

router.post('/analyze/:crisisId', controller.analyzeCrisis);
router.post('/recommend-resources', controller.recommendResources);
router.post('/generate-report', controller.generateReport);
router.post('/chat', controller.chat);
router.post('/prioritize', controller.prioritizeCrises);
router.get('/logs', controller.getAiLogs);

module.exports = router;
