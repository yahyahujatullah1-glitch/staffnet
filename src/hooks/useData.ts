import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Fetch Profiles
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
      if (pErr) throw pErr;

      // 2. Fetch Roles
      const { data: roleList, error: rErr } = await supabase.from('roles').select('*');
      if (rErr) throw rErr;

      // 3. Manual Join (Fixes Schema Error)
      const mergedStaff = profiles.map(p => {
        const role = roleList.find(r => r.id === p.role_id);
        return { ...p, roles: role || { name: 'Staff', color: 'bg-gray-500' } };
      });

      setStaff(mergedStaff);
      setRoles(roleList);
    } catch (err) {
      console.error("Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Actions
  const createRole = async (name: string, color: string) => {
    await supabase.from('roles').insert([{ name, color }]);
    fetchData();
  };

  const updateUserRole = async (userId: string, roleId: string) => {
    await supabase.from('profiles').update({ role_id: roleId }).eq('id', userId);
    fetchData();
  };

  const fireStaff = async (userId: string) => {
    await supabase.from('profiles').delete().eq('id', userId);
    fetchData();
  };

  const createUser = async (email: string, password: string, name: string, roleId: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').insert([{
        id: data.user.id,
        email,
        full_name: name,
        role_id: roleId,
        avatar_url: `https://i.pravatar.cc/150?u=${data.user.id}`
      }]);
    }
    fetchData();
  };

  return { staff, roles, loading, refresh: fetchData, createRole, updateUserRole, fireStaff, createUser };
}

// --- TASKS HOOK ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      // Fetch Tasks
      const { data: taskList, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch Profiles for avatars
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url');

      // Manual Join
      const mergedTasks = taskList.map(t => {
        const assignee = profiles?.find(p => p.id === t.assigned_to);
        return { ...t, profiles: assignee };
      });

      setTasks(mergedTasks);
    } catch (err) {
      console.error("Task Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const submitProof = async (taskId: string, link: string) => {
    await supabase.from('tasks').update({ proof_url: link, proof_status: 'pending', status: 'Review' }).eq('id', taskId);
    fetchTasks();
  };

  const reviewTask = async (taskId: string, status: 'approved' | 'rejected') => {
    const newStatus = status === 'approved' ? 'Done' : 'In Progress';
    await supabase.from('tasks').update({ proof_status: status, status: newStatus }).eq('id', taskId);
    fetchTasks();
  };

  return { tasks, loading, refresh: fetchTasks, submitProof, reviewTask };
}

// --- CHAT HOOK ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  
  const fetchMessages = async () => {
    const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url');

    if (msgs && profiles) {
      const merged = msgs.map(m => {
        const sender = profiles.find(p => p.id === m.sender_id);
        return { ...m, profiles: sender };
      });
      setMessages(merged);
    }
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    let { data: user } = await supabase.from('profiles').select('id').eq('email', 'admin@staffnet.com').single();
    
    // Fallback if Admin missing
    if (!user) {
        const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single();
        user = anyUser;
    }

    if (user) {
        await supabase.from('messages').insert([{ 
            content: text, 
            sender_id: user.id, 
            channel_id: 'general' 
        }]);
    }
  };

  return { messages, sendMessage };
}

// --- ADMIN HOOK ---
export function useAdmin() {
    const [logs, setLogs] = useState<any[]>([]);
    useEffect(() => {
        const fetchLogs = async () => {
            const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
            if(data) setLogs(data);
        };
        fetchLogs();
    }, []);
    return { logs };
  }
