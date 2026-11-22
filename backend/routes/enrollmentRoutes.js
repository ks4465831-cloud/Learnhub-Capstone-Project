const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/enrollmentController');

router.use(protect, authorize('student'));
router.get('/me', c.myEnrollments);
router.get('/:courseId', c.myEnrollmentForCourse);
router.post('/:courseId/lessons/:lessonId/complete', c.toggleLesson);

module.exports = router;
