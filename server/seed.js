const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@crimewatch.com' });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log('✅ Existing user upgraded to admin');
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@crimewatch.com',
        password: 'admin123',
        role: 'admin',
        phone: ''
      });
      console.log('✅ Admin user created');
    }

    console.log('\n📧 Email:    admin@crimewatch.com');
    console.log('🔑 Password: admin123\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
