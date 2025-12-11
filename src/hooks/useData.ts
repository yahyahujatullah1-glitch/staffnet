import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  
  const fetchStaff = async () => {
    const { data } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (data) setStaff(data.map(s => ({ ...s, roles: { name: s.role, color: 'bg-blue-600' } })));
  };

  useEffect(() => {
    fetchStaff();
    const ch = supabase.channel('staff').on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, fetchStaff).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const addStaff = async (name: string, email: string, role: string) => {
    await supabase.from('staff').insert([{ name, email, role, avatar: `https://i.pravatar.cc/150?u=${Date.now()}` }]);
  };

  const fireStaff = async (id: string) => {
    await supabase.from('staff').delete().eq('id', id);
  };

  return { staff, refresh: fetchStaff, addStaff, fireStaff, roles: [] };
}

// --- TASKS ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    // Fetch staff to map avatars
    const { data: staff } = await supabase.from('staff').select('*');
    
    if (data) {
      const merged = data.map(t => {
        const assignee = staff?.find(s => s.id === t.assigned_to);
        return { ...t, profiles: assignee || { avatar: 'https://i.pravatar.cc/150?u=x' } };
      });
      setTasks(merged);
    }
  };

  useEffect(() => {
    fetchTasks();
    const ch = supabase.channel('tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const addTask = async (title: string, date: string) => {
    // Assign to first user
    const { data: users } = await supabase.from('staff').select('id').limit(1);
    await supabase.from('tasks').insert([{ title, due_date: date, assigned_to: users?.[0]?.id }]);
  };

  return { tasks, refresh: fetchTasks, addTask };
}

// --- CHAT ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(m => ({
        ...m,
        profiles: { full_name: m.sender_name, avatar_url: m.sender_avatar }
      })));
    }
  };

  useEffect(() => {
    fetchMessages();
    const ch = supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchMessages).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const sendMessage = async (text: string) => {
    await supabase.from('messages').insert([{
      content: text,
      sender_name: 'Admin User',
      sender_avatar: 'https://i.pravatar.cc/150?u=admin'
    }]);
  };

  return { messages, sendMessage };
}

// --- ADMIN ---
export function useAdmin() {
  return { logs: [] };
}
