// js/app.js

// --- 1. GLOBAL STATE & NAVIGATION ---
const db = getDB(); // Load data from db.js logic

function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('section[id^="view-"]').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('animate-fade');
    });
    
    // Reset Nav Buttons
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-primary/10', 'text-primary');
        el.classList.add('text-slate-500', 'hover:bg-slate-50');
        const icon = el.querySelector('.material-symbols-outlined');
        if(icon) icon.style.fontVariationSettings = "'FILL' 0";
    });

    // Show active view
    const activeView = document.getElementById(`view-${tabId}`);
    activeView.classList.remove('hidden');
    activeView.classList.add('animate-fade');

    // Highlight Button
    const activeBtn = document.getElementById(`nav-${tabId}`);
    activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-50');
    activeBtn.classList.add('bg-primary/10', 'text-primary');
    const activeIcon = activeBtn.querySelector('.material-symbols-outlined');
    if(activeIcon) activeIcon.style.fontVariationSettings = "'FILL' 1";

    // Refresh Data for that view
    if(tabId === 'dashboard') renderDashboard();
    if(tabId === 'staff') renderStaff();
    if(tabId === 'tasks') renderTasks();
    if(tabId === 'chat') renderChat();
}

// --- 2. DASHBOARD LOGIC ---
function renderDashboard() {
    // Recalculate stats based on real data arrays
    document.getElementById('stat-total-staff').innerText = db.staff.length;
    document.getElementById('stat-active-tasks').innerText = db.tasks.filter(t => t.status !== 'Done').length;
}

// --- 3. STAFF LOGIC ---
function renderStaff() {
    const tbody = document.getElementById('staff-table-body');
    tbody.innerHTML = ''; // Clear current

    db.staff.forEach(person => {
        const row = `
            <tr class="hover:bg-slate-50 border-b border-slate-50">
                <td class="px-6 py-4 flex items-center gap-3">
                    <img src="${person.avatar}" class="h-9 w-9 rounded-full">
                    <span class="font-bold text-sm text-slate-900">${person.name}</span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-500">${person.role}</td>
                <td class="px-6 py-4 text-sm text-slate-500">${person.email}</td>
                <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${person.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}">
                        ${person.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deleteStaff(${person.id})" class="text-slate-400 hover:text-red-500 transition">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function handleAddStaff(e) {
    e.preventDefault();
    const name = document.getElementById('new-staff-name').value;
    const role = document.getElementById('new-staff-role').value;
    const email = document.getElementById('new-staff-email').value;

    const newStaff = {
        id: Date.now(),
        name,
        role,
        email,
        status: 'Active',
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
    };

    db.staff.unshift(newStaff); // Add to top
    saveDB(db);
    renderStaff();
    toggleModal('add-staff-modal'); // Close modal
    e.target.reset(); // Clear form
}

function deleteStaff(id) {
    if(confirm("Are you sure you want to remove this staff member?")) {
        db.staff = db.staff.filter(s => s.id !== id);
        saveDB(db);
        renderStaff();
    }
}

// --- 4. TASK LOGIC ---
function renderTasks() {
    const tbody = document.getElementById('task-table-body');
    tbody.innerHTML = '';

    db.tasks.forEach(task => {
        // Find assignee avatars
        let avatars = task.assignee.map(id => {
            const person = db.staff.find(s => s.id === id);
            return person ? `<img class="h-8 w-8 rounded-full border-2 border-white" src="${person.avatar}" title="${person.name}">` : '';
        }).join('');

        // Status Colors
        let badgeColor = 'bg-slate-100 text-slate-800';
        if(task.status === 'In Progress') badgeColor = 'bg-yellow-100 text-yellow-800';
        if(task.status === 'Done') badgeColor = 'bg-green-100 text-green-700';
        if(task.status === 'Blocked') badgeColor = 'bg-red-100 text-red-800';

        const row = `
            <tr onclick="openTaskDetail(${task.id})" class="hover:bg-slate-50 cursor-pointer transition border-b border-slate-50">
                <td class="px-6 py-4 text-sm font-semibold text-slate-900">${task.title}</td>
                <td class="px-6 py-4"><div class="flex -space-x-2">${avatars}</div></td>
                <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor}">${task.status}</span></td>
                <td class="px-6 py-4 text-sm text-slate-500">${task.priority}</td>
                <td class="px-6 py-4 text-sm text-slate-500">${task.due}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function handleAddTask(e) {
    e.preventDefault();
    const title = document.getElementById('new-task-title').value;
    const due = document.getElementById('new-task-date').value;
    
    const newTask = {
        id: Date.now(),
        title,
        status: "Todo",
        priority: "Medium",
        due,
        assignee: [1] // Default to first user for demo
    };

    db.tasks.unshift(newTask);
    saveDB(db);
    renderTasks();
    toggleModal('add-task-modal');
    e.target.reset();
}

// --- 5. CHAT LOGIC ---
function renderChat() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = `<div class="flex justify-center mb-4"><span class="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span></div>`;

    db.chat.forEach(msg => {
        if(msg.isMe) {
            container.innerHTML += `
                <div class="flex gap-4 max-w-lg ml-auto flex-row-reverse animate-fade">
                    <img src="${msg.avatar}" class="h-8 w-8 rounded-full mt-1">
                    <div class="space-y-1 items-end flex flex-col">
                        <div class="flex items-baseline gap-2 flex-row-reverse">
                            <span class="font-bold text-sm text-slate-900">You</span>
                            <span class="text-xs text-slate-400">${msg.time}</span>
                        </div>
                        <div class="bg-primary p-3 rounded-2xl rounded-tr-none text-sm text-white shadow-md shadow-blue-500/20">
                            ${msg.text}
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML += `
                <div class="flex gap-4 max-w-lg animate-fade">
                    <img src="${msg.avatar}" class="h-8 w-8 rounded-full mt-1">
                    <div class="space-y-1">
                        <div class="flex items-baseline gap-2">
                            <span class="font-bold text-sm text-slate-900">${msg.sender}</span>
                            <span class="text-xs text-slate-400">${msg.time}</span>
                        </div>
                        <div class="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-sm text-slate-800 shadow-sm">
                            ${msg.text}
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    // Auto scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;

    // 1. Add User Message
    db.chat.push({
        id: Date.now(),
        sender: "You",
        text: text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isMe: true,
        avatar: "https://i.pravatar.cc/150?u=admin"
    });
    saveDB(db);
    renderChat();
    input.value = '';

    // 2. Simulate Bot Reply
    setTimeout(() => {
        db.chat.push({
            id: Date.now()+1,
            sender: "Jane Doe",
            text: "Got it! I'll take a look shortly. 👍",
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            isMe: false,
            avatar: "https://i.pravatar.cc/150?img=41"
        });
        saveDB(db);
        renderChat();
    }, 1500);
}

// --- UTILS ---
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle('hidden');
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    renderDashboard();
    
    // Listeners for Enter key in chat
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });
});
