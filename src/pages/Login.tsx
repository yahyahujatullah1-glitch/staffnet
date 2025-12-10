import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      if (data.session) {
        navigate("/"); // Go to Dashboard
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-white font-sans selection:bg-primary/30">
      
      {/* LEFT PANEL - BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-surface relative overflow-hidden items-center justify-center border-r border-border">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-orange-900/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-12 max-w-lg">
          <div className="h-16 w-16 bg-gradient-to-br from-primary to-orange-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
            <span className="text-3xl font-bold text-white">SN</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">Manage your team with <span className="text-primary">precision.</span></h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Streamline workflows, track progress, and collaborate effectively. The all-in-one workspace for modern teams.
          </p>
          
          <div className="mt-12 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="h-8 w-8 rounded-full border-2 border-surface" />
              ))}
            </div>
            <p>Trusted by 100+ teams</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-gray-400">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 bg-surface border border-border rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <a href="#" className="text-xs text-primary hover:text-orange-400 font-medium">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 bg-surface border border-border rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don't have an account? <span className="text-gray-400">Contact your Admin.</span>
          </p>
        </div>
        
        {/* Mobile Footer */}
        <div className="absolute bottom-6 text-xs text-gray-600 lg:hidden">
          © 2024 StaffNet. All rights reserved.
        </div>
      </div>
    </div>
  );
        }
