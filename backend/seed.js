// Creates the first admin account:  npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = (process.env.ADMIN_EMAIL || 'admin@learnhub.com').toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) console.log('Admin already exists:', email);
  else {
    await User.create({ name: process.env.ADMIN_NAME || 'Admin', email, password: process.env.ADMIN_PASSWORD || 'Admin@123', role: 'admin' });
    console.log('Admin created:', email);
  }
  await mongoose.disconnect();
})();
