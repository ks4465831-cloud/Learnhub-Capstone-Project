const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/courses/:id/enroll  (student)
exports.enroll = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || course.status !== 'approved') throw new AppError('Course not available for enrolment', 404);
  if (await Enrollment.exists({ student: req.user._id, course: course._id })) {
    throw new AppError('You are already enrolled in this course', 409);
  }
  const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
  res.status(201).json({ enrollment });
});

// GET /api/enrollments/me  - enrolments with progress percentage
exports.myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({ path: 'course', select: 'title category instructor', populate: { path: 'instructor', select: 'name' } })
    .sort('-createdAt');

  const courseIds = enrollments.filter((e) => e.course).map((e) => e.course._id);
  const totals = await Lesson.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: '$course', total: { $sum: 1 } } },
  ]);
  const totalMap = Object.fromEntries(totals.map((t) => [String(t._id), t.total]));

  const result = enrollments
    .filter((e) => e.course)
    .map((e) => {
      const total = totalMap[String(e.course._id)] || 0;
      const done = e.completedLessons.length;
      return {
        _id: e._id,
        course: e.course,
        completedLessons: e.completedLessons,
        totalLessons: total,
        progress: total ? Math.round((done / total) * 100) : 0,
      };
    });
  res.json({ enrollments: result });
});

// GET /api/enrollments/:courseId  - my enrolment for one course
exports.myEnrollmentForCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  res.json({ enrollment });
});

// POST /api/enrollments/:courseId/lessons/:lessonId/complete  - toggles completion
exports.toggleLesson = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrollment) throw new AppError('You are not enrolled in this course', 403);
  const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
  if (!lesson) throw new AppError('Lesson not found in this course', 404);

  const done = enrollment.completedLessons.some((id) => String(id) === lessonId);
  const update = done ? { $pull: { completedLessons: lesson._id } } : { $addToSet: { completedLessons: lesson._id } };
  const updated = await Enrollment.findByIdAndUpdate(enrollment._id, update, { new: true });
  res.json({ completedLessons: updated.completedLessons, completed: !done });
});
