const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/analyticsController');

router.get('/instructor', protect, authorize('instructor'), c.instructorAnalytics);
router.get('/admin', protect, authorize('admin'), c.adminAnalytics);

module.exports = router;
