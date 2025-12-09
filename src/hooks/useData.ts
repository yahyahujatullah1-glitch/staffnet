import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    const { data } = await supabase.from('profiles').select('*, roles(name)').order('created_at', { ascending: false });
    if (data) setStaff(data);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);
  return { staff, loading, refresh: fetchStaff };
}

// --- TASKS HOOK ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*, profiles!assigned_to(full_name, avatar_url)').order('created_at', { ascending: false });
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);
  return { tasks, loading, refresh: fetchTasks };
}

// --- CHAT HOOK (FIXED) ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  
  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*, profiles(full_name, avatar_url)').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // When a new message comes in, refresh
        fetchMessages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    // 1. Optimistic Update (Show immediately)
    const tempId = Date.now();
    const tempMsg = {
        id: tempId,
        content: text,
        sender_id: 'temp',
        profiles: { full_name: 'You', avatar_url: 'https://i.pravatar.cc/150?u=admin' }
    };
    setMessages((prev) => [...prev, tempMsg]);

    // 2. Find User ID (Self-Healing)
    let { data: user } = await supabase.from('profiles').select('id').eq('full_name', 'Admin User').single();
    
    if (!user) {
        // Fallback: Get ANY user
        const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single();
        user = anyUser;
    }

    if (!user) {
        // Create if empty
        const { data: newUser } = await supabase.from('profiles').insert([{
            full_name: 'Admin User',
            email: 'admin@staffnet.com',
            avatar_url: 'https://i.pravatar.cc/150?u=admin'
        }]).select().single();
        user = newUser;
    }

    // 3. Send to DB
    if(user) {
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
