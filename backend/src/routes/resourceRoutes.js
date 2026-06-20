const router = require('express').Router();
const ctrl   = require('../controllers/resourceController');

router.get ('/',              ctrl.getAllResources);
router.get ('/meta/types',    ctrl.getResourceTypes);
router.get ('/:id',           ctrl.getResourceById);
router.post('/',              ctrl.createResource);
router.put ('/:id',           ctrl.updateResource);
router.patch('/:id/status',   ctrl.updateResourceStatus);

module.exports = router;
