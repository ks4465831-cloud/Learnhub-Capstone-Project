const Enrollment = require('../models/Enrollment');

// Course owner (instructor) or admin
exports.isOwnerOrAdmin = (user, course) =>
  !!user && (user.role === 'admin' || String(course.instructor) === String(user._id));

// Owner, admin, or an enrolled student
exports.canAccessCourse = async (user, course) => {
  if (exports.isOwnerOrAdmin(user, course)) return true;
  const enrolled = await Enrollment.exists({ student: user._id, course: course._id });
  return !!enrolled;
};
