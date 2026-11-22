const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const lesson = require('../controllers/lessonController');

router.put('/:lessonId', protect, authorize('instructor', 'admin'), lesson.updateLesson);
router.delete('/:lessonId', protect, authorize('instructor', 'admin'), lesson.deleteLesson);

module.exports = router;
