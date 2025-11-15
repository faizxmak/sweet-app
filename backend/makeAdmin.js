require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Get email from command line or use default
const email = process.argv[2] || 'faizanxmakrani@gmail.com';

async function makeUserAdmin() {
  try {
    console.log(`🔗 Connecting to MongoDB...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Connected to MongoDB`);
    
    console.log(`\n🔍 Finding user with email: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      await mongoose.disconnect();
      return;
    }
    
    console.log(`👤 User found: ${user.name}`);
    
    // Update user to admin
    user.is_admin = true;
    user.adminCode = null;
    user.adminCodeExpiry = null;
    await user.save();
    
    console.log(`✅ Successfully made ${user.name} an ADMIN!`);
    console.log(`\n📋 User Details:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Is Admin: ${user.is_admin}`);
    
    await mongoose.disconnect();
    console.log(`\n✅ Done!`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

makeUserAdmin();
