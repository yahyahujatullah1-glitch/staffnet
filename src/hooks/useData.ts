import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch Profiles and join with Roles
      const { data: s, error: sErr } = await supabase
        .from('profiles')
        .select('*, roles(name, color, id)')
        .order('created_at', { ascending: false });

      if (sErr) throw sErr;

      // Fetch All Roles
      const { data: r, error: rErr } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rErr) throw rErr;

      if (s) setStaff(s);
      if (r) setRoles(r);
    } catch (err) {
      console.error("Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ACTIONS
  const createRole = async (name: string, color: string) => {
    await supabase.from('roles').insert([{ name, color, permissions: 'read_write' }]);
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
    // 1. Create Auth User
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    // 2. Create Profile linked to Auth ID
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
      // Simplified Query: Just get everything, we will filter in UI if needed
      // Note: We use 'profiles' to get the assignee details
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:assigned_to ( full_name, avatar_url )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTasks(data);
    } catch (err) {
      console.error("Task Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // ACTIONS
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
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id ( full_name, avatar_url )
      `)
      .order('created_at', { ascending: true });

    if (error) console.error("Chat Error:", error);
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    // Self-Healing User Finder
    let { data: user } = await supabase.from('profiles').select('id').eq('email', 'admin@staffnet.com').single();
    
    // Fallback
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
