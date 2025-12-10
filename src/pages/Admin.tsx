import { useState } from "react";
import { useStaff } from "@/hooks/useData";
import { Shield, UserPlus, Trash2, Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Admin() {
  const { staff, roles, updateUserRole, fireStaff, createRole, createUser, refresh } = useStaff();
  const [activeTab, setActiveTab] = useState<'staff' | 'create' | 'roles'>('staff');

  // Form States
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', roleId: '' });
  const [newRole, setNewRole] = useState({ name: '', color: 'bg-gray-500' });

  const handleCreateUser = async (e: any) => {
    e.preventDefault();
    try {
      await createUser(newUser.email, newUser.password, newUser.name, newUser.roleId);
      alert("User created successfully!");
      setNewUser({ name: '', email: '', password: '', roleId: '' });
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateRole = async (e: any) => {
    e.preventDefault();
    await createRole(newRole.name, newRole.color);
    setNewRole({ name: '', color: 'bg-gray-500' });
    alert("Role created!");
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="text-primary"/> Admin Console</h2>
        <div className="flex gap-2 bg-surface p-1 rounded-lg border border-border">
          <button onClick={() => setActiveTab('staff')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'staff' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Staff</button>
          <button onClick={() => setActiveTab('create')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Add User</button>
          <button onClick={() => setActiveTab('roles')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'roles' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Roles</button>
        </div>
      </div>

      {/* --- TAB 1: MANAGE STAFF --- */}
      {activeTab === 'staff' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 border-b border-border">
              <tr><th className="p-4 text-xs">NAME</th><th className="p-4 text-xs">CURRENT ROLE</th><th className="p-4 text-xs">CHANGE ROLE</th><th className="p-4 text-xs text-right">ACTIONS</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map(u => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="p-4 font-medium text-gray-200">{u.full_name}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold text-white ${u.roles?.color || 'bg-gray-600'}`}>{u.roles?.name || 'No Role'}</span></td>
                  <td className="p-4">
                    <select 
                      className="bg-background border border-border rounded px-2 py-1 text-sm text-white focus:border-primary outline-none"
                      value={u.role_id || ''}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                    >
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => { if(confirm("Fire this staff member?")) fireStaff(u.id) }} className="text-red-500 hover:bg-red-500/10 p-2 rounded flex items-center gap-1 ml-auto"><Trash2 size={16}/> Fire</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 2: CREATE USER --- */}
      {activeTab === 'create' && (
        <div className="max-w-xl mx-auto bg-surface border border-border rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><UserPlus className="text-primary"/> Create New Login</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div><label className="text-xs text-gray-400 font-bold">Full Name</label><input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400 font-bold">Email</label><input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400 font-bold">Password</label><input type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <div>
              <label className="text-xs text-gray-400 font-bold">Assign Role</label>
              <select required value={newUser.roleId} onChange={e => setNewUser({...newUser, roleId: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1">
                <option value="">Select a role...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <Button className="w-full mt-4">Create User</Button>
          </form>
        </div>
      )}

      {/* --- TAB 3: MANAGE ROLES --- */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Existing Roles</h3>
            <div className="space-y-2">
              {roles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="font-medium text-gray-200">{r.name}</span>
                  <div className={`h-6 w-6 rounded-full ${r.color}`}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Create New Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div><label className="text-xs text-gray-400 font-bold">Role Name</label><input required value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
              <div>
                <label className="text-xs text-gray-400 font-bold">Role Color</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-pink-600'].map(c => (
                    <button key={c} type="button" onClick={() => setNewRole({...newRole, color: c})} className={`h-8 w-8 rounded-full ${c} ${newRole.color === c ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'}`}></button>
                  ))}
                </div>
              </div>
              <Button className="w-full">Save Role</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
