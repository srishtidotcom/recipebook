import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChefHat, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-sage-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 fade-up">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-terracotta-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ChefHat size={24} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-bark-900 mb-1">Create your account</h1>
          <p className="text-bark-500 text-sm">Join thousands of home cooks on RecipeBook</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-bark-800 mb-1.5">Username</label>
              <input
                type="text" name="username" required
                value={form.username} onChange={handleChange}
                placeholder="chef_yourname"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bark-800 mb-1.5">Email</label>
              <input
                type="email" name="email" required
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bark-800 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'} name="password" required
                  value={form.password} onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="input-field pr-10"
                />
                <button
                  type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-500 hover:text-bark-700"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwdStrength ? strengthColors[pwdStrength] : 'bg-cream-200'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${pwdStrength === 3 ? 'text-sage-600' : pwdStrength === 2 ? 'text-amber-500' : 'text-red-500'}`}>
                    {strengthLabels[pwdStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-cream-100 rounded-xl p-3 space-y-1.5">
              {['Share unlimited recipes', 'Comment and engage with others', 'Build your personal cookbook'].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-bark-700">
                  <CheckCircle2 size={14} className="text-sage-500 shrink-0" /> {b}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-bark-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-terracotta-500 hover:text-terracotta-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
