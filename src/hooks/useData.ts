import { useState, useEffect } from 'react';

// --- INITIAL DATA (Default Admin) ---
const INITIAL_DB = {
  staff: [
    { 
      id: '1', 
      full_name: 'Admin User', 
      email: 'admin@staffnet.com', 
      password: 'password123', // <--- Stored locally
      role: 'Admin', 
      status: 'Active', 
      avatar_url: 'https://i.pravatar.cc/150?u=admin' 
    },
    { 
      id: '2', 
      full_name: 'Sarah Connor', 
      email: 'sarah@staffnet.com', 
      password: 'password123',
      role: 'Manager', 
      status: 'Active', 
      avatar_url: 'https://i.pravatar.cc/150?img=5' 
    }
  ],
  tasks: [
    { id: '101', title: 'Update Brand Guidelines', status: 'In Progress', due_date: '2024-10-26', priority: 'High', assigned_to: '2', proof_url: '', proof_status: 'none' },
  ],
  messages: [
    { id: 1, content: "Welcome to StaffNet! 🚀", sender_id: '1', created_at: new Date().toISOString() }
  ],
  logs: [],
  roles: [
    { id: 'r1', name: 'Admin', color: 'bg-red-600' },
    { id: 'r2', name: 'Manager', color: 'bg-orange-500' },
    { id: 'r3', name: 'Staff', color: 'bg-blue-600' }
  ]
};

// --- DATABASE ENGINE ---
const getDB = () => {
  const saved = localStorage.getItem('staffnet_db');
  return saved ? JSON.parse(saved) : INITIAL_DB;
};

const saveDB = (data: any) => {
  localStorage.setItem('staffnet_db', JSON.stringify(data));
  window.dispatchEvent(new Event('db-update'));
};

// --- AUTH HELPER ---
export const validateLogin = (email: string, pass: string) => {
  const db = getDB();
  const user = db.staff.find((u: any) => u.email === email && u.password === pass);
  return user;
};

// --- HOOKS ---

export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const refresh = () => {
    const db = getDB();
    const merged = db.staff.map((s: any) => {
      const r = db.roles.find((role: any) => role.name === s.role);
      return { ...s, roles: r || { name: s.role, color: 'bg-gray-500' } };
    });
    setStaff(merged);
    setRoles(db.roles);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('db-update', refresh);
    return () => window.removeEventListener('db-update', refresh);
  }, []);

  // ADD USER (With Password)
  const addStaff = (name: string, email: string, role: string, password: string) => {
    const db = getDB();
    db.staff.push({
      id: Date.now().toString(),
      full_name: name,
      email,
      password, // Save password
      role,
      status: 'Active',
      avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`
    });
    saveDB(db);
  };

  const fireStaff = (id: string) => {
    const db = getDB();
    db.staff = db.staff.filter((s: any) => s.id !== id);
    saveDB(db);
  };

  const createRole = (name: string, color: string) => {
    const db = getDB();
    db.roles.push({ id: Date.now().toString(), name, color });
    saveDB(db);
  };

  return { staff, roles, refresh, addStaff, fireStaff, createRole };
}

export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);

  const refresh = () => {
    const db = getDB();
    const merged = db.tasks.map((t: any) => ({
      ...t,
      profiles: db.staff.find((s: any) => s.id === t.assigned_to)
    }));
    setTasks(merged);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('db-update', refresh);
    return () => window.removeEventListener('db-update', refresh);
  }, []);

  const addTask = (title: string, date: string) => {
    const db = getDB();
    db.tasks.unshift({
      id: Date.now().toString(),
      title,
      due_date: date,
      status: 'Todo',
      assigned_to: db.staff[0]?.id,
      proof_status: 'none'
    });
    saveDB(db);
  };

  return { tasks, refresh, addTask };
}

export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);

  const refresh = () => {
    const db = getDB();
    const merged = db.messages.map((m: any) => ({
      ...m,
      profiles: db.staff.find((s: any) => s.id === m.sender_id) || { full_name: 'Unknown', avatar_url: '' }
    }));
    setMessages(merged);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('db-update', refresh);
    return () => window.removeEventListener('db-update', refresh);
  }, []);

  const sendMessage = (text: string) => {
    const db = getDB();
    // Get current logged in user ID
    const session = JSON.parse(localStorage.getItem('staffnet_user') || '{}');
    
    db.messages.push({
      id: Date.now(),
      content: text,
      sender_id: session.id || '1', 
      created_at: new Date().toISOString()
    });
    saveDB(db);
  };

  return { messages, sendMessage };
}

export function useAdmin() {
  return { logs: [] };
}
