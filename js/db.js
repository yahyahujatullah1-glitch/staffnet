// js/db.js

// --- 1. CONFIGURATION ---
const SUPABASE_URL = "https://riluxnxxndwocrjuwzpd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbHV4bnh4bmR3b2NyanV3enBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTM1MDEsImV4cCI6MjA4MDY2OTUwMX0.xcLBQijXfbCB3dM1FH4uzo08IPs-trovOy6T_vdpc_o";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cache
let db = { staff: [], tasks: [], chat: [], logs: [] };

// --- 2. FETCH DATA ---

async function fetchStats() {
    const { count: staffCount } = await supabase.from('profiles').select('*', { count: 'exact' });
    const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact' }).neq('status', 'Done');
    return { totalStaff: staffCount || 0, activeTasks: taskCount || 0 };
}

async function fetchStaff() {
    // Fetch profiles + role name
    const { data } = await supabase.from('profiles').select('*, roles(name)').order('created_at', { ascending: false });
    
    return (data || []).map(p => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        avatar: p.avatar_url,
        role: p.roles?.name || 'Staff',
        status: 'Active' // Default
    }));
}

async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*, profiles!assigned_to(full_name, avatar_url)').order('created_at', { ascending: false });
    
    return (data || []).map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        due: t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A',
        assignee_avatar: t.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=unknown'
    }));
}

async function fetchChat() {
    // Join with profiles to get sender name/avatar
    const { data } = await supabase.from('messages').select('*, profiles(full_name, avatar_url)').order('created_at', { ascending: true });
    
    return (data || []).map(m => ({
        id: m.id,
        text: m.content,
        sender: m.profiles?.full_name || 'Unknown',
        avatar: m.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=x',
        isMe: m.profiles?.full_name === 'Admin User' // Simulating "Me"
    }));
}

// --- 3. ACTIONS ---

async function addStaffDB(person) {
    // 1. Get default role ID (Staff)
    const { data: role } = await supabase.from('roles').select('id').eq('name', 'Staff').single();
    const roleId = role?.id; 

    const { error } = await supabase.from('profiles').insert([{
        full_name: person.name,
        email: person.email,
        role_id: roleId,
        avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`
    }]);
    
    if(!error) await addAuditLog(`Added staff: ${person.name}`);
    return error;
}

async function deleteStaffDB(id, name) {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if(!error) await addAuditLog(`Deleted staff: ${name}`);
    return error;
}

async function addTaskDB(task) {
    // Assign to first user found for now
    const { data: user } = await supabase.from('profiles').select('id').limit(1).single();
    
    const { error } = await supabase.from('tasks').insert([{
        title: task.title,
        status: 'Todo',
        priority: 'Medium',
        due_date: task.due_date,
        assigned_to: user?.id
    }]);

    if(!error) await addAuditLog(`Created task: ${task.title}`);
    return error;
}

async function sendChatDB(text) {
    // Get Admin ID
    const { data: admin } = await supabase.from('profiles').select('id').eq('full_name', 'Admin User').single();
    
    await supabase.from('messages').insert([{
        content: text,
        sender_id: admin?.id,
        channel_id: 'general'
    }]);
}

async function addAuditLog(action) {
    // Get Admin ID
    const { data: admin } = await supabase.from('profiles').select('id').eq('full_name', 'Admin User').single();
    
    await supabase.from('audit_logs').insert([{
        action: action,
        details: 'Performed via Dashboard',
        user_id: admin?.id
    }]);
}

// --- 4. DATA LOADER ---
async function refreshData() {
    const stats = await fetchStats();
    db.staff = await fetchStaff();
    db.tasks = await fetchTasks();
    db.chat = await fetchChat();
    
    // UI Updates
    const statStaff = document.getElementById('stat-total-staff');
    const statTask = document.getElementById('stat-active-tasks');
    if(statStaff) statStaff.innerText = stats.totalStaff;
    if(statTask) statTask.innerText = stats.activeTasks;
}

// Subscribe to changes (Realtime Chat)
supabase.channel('public:messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async () => {
    db.chat = await fetchChat();
    renderChat();
}).subscribe();
