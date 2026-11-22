const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/courses', c.allCourses);
router.patch('/courses/:id/status', c.setCourseStatus);
router.get('/users', c.allUsers);

module.exports = router;
