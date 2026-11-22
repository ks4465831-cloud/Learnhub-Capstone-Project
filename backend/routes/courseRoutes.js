const router = require('express').Router();
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const course = require('../controllers/courseController');
const lesson = require('../controllers/lessonController');
const enrollment = require('../controllers/enrollmentController');
const quiz = require('../controllers/quizController');

router.get('/', course.listCourses);
router.get('/mine/list', protect, authorize('instructor'), course.myCourses);
router.post('/', protect, authorize('instructor'), course.createCourse);

router.get('/:id', optionalAuth, course.getCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), course.updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), course.deleteCourse);

router.post('/:id/modules', protect, authorize('instructor'), course.addModule);
router.get('/:id/lessons', protect, lesson.getLessons);
router.post('/:id/lessons', protect, authorize('instructor'), lesson.addLesson);
router.post('/:id/enroll', protect, authorize('student'), enrollment.enroll);
router.get('/:id/quizzes', protect, quiz.getQuizzes);
router.post('/:id/quizzes', protect, authorize('instructor'), quiz.createQuiz);

module.exports = router;
