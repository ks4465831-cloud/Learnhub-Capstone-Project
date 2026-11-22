const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccess } = require('../utils/tokens');

// Protected route: valid access token required
exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new AppError('Not authorised, token missing', 401);
  const decoded = verifyAccess(header.split(' ')[1]);
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User no longer exists', 401);
  req.user = user;
  next();
});

// Public route that still wants to know who is calling (if anyone)
exports.optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const decoded = verifyAccess(header.split(' ')[1]);
      req.user = await User.findById(decoded.id);
    }
  } catch (e) { /* ignore invalid token */ }
  next();
};

// RBAC: allow only the listed roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(`Role '${req.user.role}' is not allowed to do this`, 403));
  }
  next();
};
