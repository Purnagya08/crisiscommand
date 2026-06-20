const router = require('express').Router();
const controller = require('../controllers/analyticsController');

router.get('/overview', controller.getOverview);
router.get('/alerts', controller.getAlerts);
router.patch('/alerts/:id/read', controller.markAlertRead);
router.get('/timeline', controller.getTimeline);

module.exports = router;
