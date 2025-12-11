const connectDB = require('./_db');
const { User } = require('./_models');

module.exports = async (req, res) => {
  await connectDB();
  
  if (req.method === 'POST') {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) return res.json(user);
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  res.status(405).send("Method Not Allowed");
};
