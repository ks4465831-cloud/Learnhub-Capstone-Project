const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/quizController');

router.get('/attempts/me', protect, authorize('student'), c.myAttempts);
router.post('/:id/attempt', protect, authorize('student'), c.submitAttempt);
router.delete('/:id', protect, authorize('instructor', 'admin'), c.deleteQuiz);

module.exports = router;
