const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isOwnerOrAdmin } = require('../utils/access');

const findCourseOr404 = async (id) => {
  const course = await Course.findById(id);
  if (!course) throw new AppError('Course not found', 404);
  return course;
};

// GET /api/courses?q=&category=&page=&limit=   (public, approved only)
exports.listCourses = asyncHandler(async (req, res) => {
  const { q, category } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 9, 50);
  const filter = { status: 'approved' };
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const [courses, total, categories] = await Promise.all([
    Course.find(filter).populate('instructor', 'name').sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Course.countDocuments(filter),
    Course.distinct('category', { status: 'approved' }),
  ]);
  res.json({ courses, total, page, pages: Math.ceil(total / limit), categories });
});

// GET /api/courses/:id  (public; non-approved only visible to owner/admin)
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name email');
  if (!course) throw new AppError('Course not found', 404);
  const owner = isOwnerOrAdmin(req.user, { instructor: course.instructor._id });
  if (course.status !== 'approved' && !owner) throw new AppError('Course not available', 404);

  const lessons = await Lesson.find({ course: course._id }).select('title module order').sort('order');
  let enrolled = false;
  if (req.user && req.user.role === 'student') {
    enrolled = !!(await Enrollment.exists({ student: req.user._id, course: course._id }));
  }
  res.json({ course, lessons, enrolled, isOwner: owner });
});

// POST /api/courses  (instructor)
exports.createCourse = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const course = await Course.create({ title, description, category, instructor: req.user._id });
  res.status(201).json({ course });
});

// GET /api/courses/mine/list  (instructor)
exports.myCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
  res.json({ courses });
});

// PUT /api/courses/:id  (owner)
exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.id);
  if (!isOwnerOrAdmin(req.user, course)) throw new AppError('Not your course', 403);
  ['title', 'description', 'category'].forEach((f) => {
    if (req.body[f] !== undefined) course[f] = req.body[f];
  });
  await course.save();
  res.json({ course });
});

// DELETE /api/courses/:id  (owner or admin) - also removes lessons, quizzes, enrolments
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.id);
  if (!isOwnerOrAdmin(req.user, course)) throw new AppError('Not your course', 403);
  await Promise.all([
    Lesson.deleteMany({ course: course._id }),
    Quiz.deleteMany({ course: course._id }),
    Enrollment.deleteMany({ course: course._id }),
    course.deleteOne(),
  ]);
  res.json({ message: 'Course deleted' });
});

// POST /api/courses/:id/modules  (owner)
exports.addModule = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.id);
  if (!isOwnerOrAdmin(req.user, course)) throw new AppError('Not your course', 403);
  course.modules.push({ title: req.body.title, order: course.modules.length });
  await course.save();
  res.status(201).json({ course });
});
