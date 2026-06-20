const router = require('express').Router();
const controller = require('../controllers/crisisController');
const { validate } = require('../middleware/validate');

router.get('/', controller.getAllCrises);
router.get('/meta/enums', controller.getEnums);
router.get('/:id', controller.getCrisisById);
router.post('/', validate(['title', 'category', 'severity']), controller.createCrisis);
router.put('/:id', controller.updateCrisis);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/timeline', controller.addTimelineEvent);
router.delete('/:id', controller.deleteCrisis);

module.exports = router;
