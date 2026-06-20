const router = require('express').Router();
const ctrl   = require('../controllers/crisisController');
const { validate } = require('../middleware/validate');

router.get ('/',                    ctrl.getAllCrises);
router.get ('/meta/enums',          ctrl.getEnums);
router.get ('/:id',                 ctrl.getCrisisById);
router.post('/',      validate(['title','category','severity']), ctrl.createCrisis);
router.put ('/:id',                 ctrl.updateCrisis);
router.patch('/:id/status',         ctrl.updateStatus);
router.post ('/:id/timeline',       ctrl.addTimelineEvent);
router.delete('/:id',              ctrl.deleteCrisis);

module.exports = router;
