const router = require('express').Router();
const controller = require('../controllers/resourceController');
const { validate } = require('../middleware/validate');

router.get('/', controller.getAllResources);
router.get('/meta/types', controller.getResourceTypes);
router.get('/:id', controller.getResourceById);
router.post('/', validate(['name', 'type']), controller.createResource);
router.put('/:id', controller.updateResource);
router.patch('/:id/status', controller.updateResourceStatus);
router.delete('/:id', controller.deleteResource);

module.exports = router;
