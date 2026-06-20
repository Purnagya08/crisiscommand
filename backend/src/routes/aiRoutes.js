const router = require('express').Router();
const ctrl   = require('../controllers/aiController');

router.post('/analyze/:crisisId',   ctrl.analyzeCrisis);
router.post('/recommend-resources', ctrl.recommendResources);
router.post('/generate-report',     ctrl.generateReport);
router.post('/chat',                ctrl.chat);
router.post('/prioritize',          ctrl.prioritizeCrises);
router.get ('/logs',                ctrl.getAiLogs);

module.exports = router;
