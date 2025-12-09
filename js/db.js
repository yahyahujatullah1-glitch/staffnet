// js/db.js

const INITIAL_DATA = {
    currentUser: { id: 999, name: "Admin User", email: "admin@staffnet.com", role: "Admin", avatar: "https://i.pravatar.cc/150?u=admin" },
    
    settings: {
        maintenanceMode: false,
        allowSignup: true,
        appName: "StaffNet"
    },

    auditLogs: [
        { id: 1, action: "System Startup", user: "System", time: new Date().toLocaleString() },
        { id: 2, action: "User Login", user: "Admin User", time: new Date().toLocaleString() }
    ],

    stats: { totalStaff: 128, activeTasks: 42, pendingApprovals: 5, promotions: 2 },

    staff: [
        { id: 1, name: "Lindsay Walton", role: "Developer", email: "lindsay.w@example.com", status: "Active", avatar: "https://i.pravatar.cc/150?img=32" },
        { id: 2, name: "Tom Cook", role: "Manager", email: "tom.cook@example.com", status: "On Leave", avatar: "https://i.pravatar.cc/150?img=11" },
        { id: 3, name: "Whitney Francis", role: "Designer", email: "whitney.f@example.com", status: "Active", avatar: "https://i.pravatar.cc/150?img=5" },
        { id: 4, name: "Leonard Krasner", role: "Director", email: "leonard.k@example.com", status: "Active", avatar: "https://i.pravatar.cc/150?img=8" }
    ],

    tasks: [
        { id: 101, title: "Update Brand Guidelines", assignee: [1, 3], status: "In Progress", priority: "High", due: "2024-10-26" },
        { id: 102, title: "Fix API Integration", assignee: [1], status: "Blocked", priority: "Medium", due: "2024-10-28" }
    ],

    chat: [
        { id: 1, sender: "Jane Doe", text: "Hey! I've just finished the first draft. 🎨", time: "10:05 AM", isMe: false, avatar: "https://i.pravatar.cc/150?img=41" }
    ]
};

// --- DATABASE FUNCTIONS ---

function initDB() {
    if (!localStorage.getItem('staffNet_db')) {
        console.log("Initializing Simulation Database...");
        localStorage.setItem('staffNet_db', JSON.stringify(INITIAL_DATA));
    }
}

function getDB() {
    return JSON.parse(localStorage.getItem('staffNet_db')) || INITIAL_DATA;
}

function saveDB(data) {
    localStorage.setItem('staffNet_db', JSON.stringify(data));
}

// Helper to add log automatically
function addAuditLog(action) {
    const db = getDB();
    const newLog = {
        id: Date.now(),
        action: action,
        user: db.currentUser.name,
        time: new Date().toLocaleString()
    };
    db.auditLogs.unshift(newLog); // Add to top
    saveDB(db);
}

initDB();
