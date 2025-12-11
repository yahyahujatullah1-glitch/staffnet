const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  full_name: String,
  email: { type: String, unique: true },
  password: String, 
  role: String,
  avatar_url: String,
  status: { type: String, default: 'Active' }
});

const TaskSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: 'Todo' },
  priority: { type: String, default: 'Medium' },
  due_date: String,
  proof_url: String,
  proof_status: { type: String, default: 'none' },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  content: String,
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

const LogSchema = new mongoose.Schema({
  action: String,
  created_at: { type: Date, default: Date.now }
});

const RoleSchema = new mongoose.Schema({
  name: String,
  color: String
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Task: mongoose.model('Task', TaskSchema),
  Message: mongoose.model('Message', MessageSchema),
  Log: mongoose.model('Log', LogSchema),
  Role: mongoose.model('Role', RoleSchema)
};
