const connectDB = require('./_db');
const { Message } = require('./_models');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const messages = await Message.find().populate('sender_id').sort({ created_at: 1 });
    const formatted = messages.map(m => ({
      id: m._id,
      content: m.content,
      profiles: m.sender_id
    }));
    return res.json(formatted);
  }

  if (req.method === 'POST') {
    const msg = new Message(req.body);
    await msg.save();
    return res.json(msg);
  }
};
