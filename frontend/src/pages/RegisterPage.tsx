import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('Advocate Rajesh Sharma');
  const [email, setEmail] = useState('r.sharma@lexanalyze.law');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex bg-slate-900 text-amber-400 p-3 rounded-xl shadow-sm mb-1">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Create Advocate Profile</h1>
          <p className="text-xs text-slate-500">Register to initialize your LexAnalyze legal workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg transition shadow-md flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Register & Launch Workspace'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-amber-700 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
