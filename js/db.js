// js/db.js

const INITIAL_DATA = {
    currentUser: { name: "Admin User", email: "admin@staffnet.com", avatar: "https://i.pravatar.cc/150?u=admin" },
    
    stats: {
        totalStaff: 128,
        activeTasks: 42,
        pendingApprovals: 5,
        promotions: 2
    },

    staff: [
        { id: 1, name: "Lindsay Walton", role: "Frontend Dev", email: "lindsay.w@example.com", status: "Active", avatar: "https://i.pravatar.cc/150?img=32" },
        { id: 2, name: "Tom Cook", role: "Product Manager", email: "tom.cook@example.com", status: "On Leave", avatar: "https://i.pravatar.cc/150?img=11" },
        { id: 3, name: "Whitney Francis", role: "Designer", email: "whitney.f@example.com", status: "Active", avatar: "https://i.pravatar.cc/150?img=5" },
        { id: 4, name: "Leonard Krasner", role: "Director", email: "leonard.k@example.com", status: "Active", avatar: "https://i.pravatar.cc/150?img=8" }
    ],

    tasks: [
        { id: 101, title: "Update Brand Guidelines", assignee: [1, 3], status: "In Progress", priority: "High", due: "2024-10-26" },
        { id: 102, title: "Fix API Integration", assignee: [1], status: "Blocked", priority: "Medium", due: "2024-10-28" },
        { id: 103, title: "Q4 Marketing Plan", assignee: [2], status: "Done", priority: "Low", due: "2024-10-15" }
    ],

    chat: [
        { id: 1, sender: "Jane Doe", text: "Hey! I've just finished the first draft of the new onboarding flow. 🎨", time: "10:05 AM", isMe: false, avatar: "https://i.pravatar.cc/150?img=41" },
        { id: 2, sender: "You", text: "That's awesome! Send it over. 🚀", time: "10:06 AM", isMe: true, avatar: "https://i.pravatar.cc/150?u=admin" }
    ]
};

// Initialize DB
function initDB() {
    if (!localStorage.getItem('staffNet_db')) {
        console.log("Initializing Simulation Database...");
        localStorage.setItem('staffNet_db', JSON.stringify(INITIAL_DATA));
    }
}

// Get Data
function getDB() {
    return JSON.parse(localStorage.getItem('staffNet_db')) || INITIAL_DATA;
}

// Save Data
function saveDB(data) {
    localStorage.setItem('staffNet_db', JSON.stringify(data));
}

// Run init
initDB();
