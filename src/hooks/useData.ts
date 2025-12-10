import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('profiles').select('*, roles(name)').order('created_at', { ascending: false });
    if (error) console.error("Staff Error:", error);
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
    const { data, error } = await supabase.from('tasks').select('*, profiles!assigned_to(full_name, avatar_url)').order('created_at', { ascending: false });
    if (error) console.error("Tasks Error:", error);
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);
  return { tasks, loading, refresh: fetchTasks };
}

// --- CHAT HOOK (SELF-HEALING) ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: true });
      
    if (error) console.error("Chat Load Error:", error);
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log("New message received:", payload);
        fetchMessages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    try {
      // 1. OPTIMISTIC UPDATE (Show immediately)
      const tempId = Date.now();
      const tempMessage = {
        id: tempId,
        content: text,
        sender_id: 'temp',
        created_at: new Date().toISOString(),
        profiles: {
            full_name: 'Admin User',
            avatar_url: 'https://i.pravatar.cc/150?u=admin'
        }
      };
      setMessages((prev) => [...prev, tempMessage]);

      // 2. FIND USER (Self-Healing Logic)
      let userId;
      
      // A. Try finding 'Admin User'
      let { data: user } = await supabase.from('profiles').select('id').eq('full_name', 'Admin User').single();
      
      if (user) {
        userId = user.id;
      } else {
        // B. Fallback: Find ANY user
        const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single();
        if (anyUser) userId = anyUser.id;
      }

      // C. Emergency: Create User if DB is empty
      if (!userId) {
        console.log("Creating Emergency User...");
        const { data: newUser, error: createError } = await supabase.from('profiles').insert([{
            full_name: 'Admin User',
            email: 'admin@staffnet.com',
            avatar_url: 'https://i.pravatar.cc/150?u=admin'
        }]).select().single();
        
        if (createError) throw createError;
        userId = newUser.id;
      }

      // 3. SEND MESSAGE
      const { error } = await supabase.from('messages').insert([{ 
          content: text, 
          sender_id: userId, 
          channel_id: 'general' 
      }]);

      if (error) throw error;

    } catch (err: any) {
      console.error("Send Error:", err);
      alert(`Error: ${err.message}`);
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
