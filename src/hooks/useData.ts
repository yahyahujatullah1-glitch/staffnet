import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('profiles').select('*, roles(name)').order('created_at', { ascending: false });
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
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);
  return { tasks, loading, refresh: fetchTasks };
}

// --- CHAT HOOK (DEBUG MODE) ---
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    try {
      // 1. Find the Admin User ID
      let { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', 'Admin User')
        .single();

      // If user missing, try to fetch ANY user
      if (!user) {
         const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single();
         user = anyUser;
      }

      if (!user) {
        alert("DATABASE ERROR: No 'Admin User' found in profiles table. Did you run the SQL script?");
        return;
      }

      // 2. Insert Message
      const { error: msgError } = await supabase.from('messages').insert([{ 
        content: text, 
        sender_id: user.id, 
        channel_id: 'general' 
      }]);

      if (msgError) {
        alert(`SEND ERROR: ${msgError.message}`);
        console.error(msgError);
      } else {
        // Success - Refresh UI
        fetchMessages();
      }

    } catch (err: any) {
      alert(`CRITICAL ERROR: ${err.message}`);
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
