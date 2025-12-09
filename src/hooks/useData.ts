import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('profiles').select('*, roles(name)').order('created_at', { ascending: false });
    if (error) console.error("Staff Fetch Error:", error);
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
    if (error) console.error("Tasks Fetch Error:", error);
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
      
    if (error) console.error("Chat Fetch Error:", error);
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
      // 1. Try to find ANY existing user
      let { data: user } = await supabase.from('profiles').select('id').limit(1).single();

      // 2. If NO user exists, CREATE one automatically
      if (!user) {
        console.log("Database empty. Creating Demo User...");
        const { data: newUser, error: createError } = await supabase.from('profiles').insert([{
            full_name: 'Demo User',
            email: 'demo@staffnet.com',
            avatar_url: 'https://i.pravatar.cc/150?u=demo'
        }]).select().single();
        
        if (createError) throw createError;
        user = newUser;
      }

      // 3. Send Message
      const { error } = await supabase.from('messages').insert([{ 
        content: text, 
        sender_id: user.id, 
        channel_id: 'general' 
      }]);

      if (error) throw error;
      fetchMessages(); // Refresh UI immediately

    } catch (err: any) {
      console.error("Chat Error:", err);
      alert(`Error: ${err.message || "Check console details"}`);
    }
  };

  return { messages, sendMessage };
}
