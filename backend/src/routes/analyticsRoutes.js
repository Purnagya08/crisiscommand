const router = require('express').Router();
const ctrl   = require('../controllers/analyticsController');

router.get ('/overview',          ctrl.getOverview);
router.get ('/alerts',            ctrl.getAlerts);
router.patch('/alerts/:id/read',  ctrl.markAlertRead);
router.get ('/timeline',          ctrl.getTimeline);

module.exports = router;
