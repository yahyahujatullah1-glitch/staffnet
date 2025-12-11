const connectDB = require('./_db');
const { User, Role } = require('./_models');

module.exports = async (req, res) => {
  await connectDB();
  
  await User.deleteMany({});
  await Role.deleteMany({});
  
  await Role.create({ name: 'Admin', color: 'bg-red-600' });
  await Role.create({ name: 'Staff', color: 'bg-blue-600' });

  await User.create({
    full_name: 'Admin User',
    email: 'admin@staffnet.com',
    password: 'password123',
    role: 'Admin',
    avatar_url: 'https://i.pravatar.cc/150?u=admin'
  });
  
  res.send("✅ Database Seeded on Vercel!");
};
