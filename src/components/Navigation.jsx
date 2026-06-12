import React from 'react';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function Navigation({ currentView, setCurrentView }) {
  return (
    <nav className="bg-gray-900 text-white w-full md:w-64 p-4 flex flex-col justify-between md:min-h-screen">
      <div>
        <div className="text-xl font-bold tracking-wider mb-8 text-emerald-400 p-2 border-b border-gray-800">
          🇿🇦 DebtorTrack
        </div>
        <div className="space-y-2">
          <button onClick={() => setCurrentView('dashboard')}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition ${currentView === 'dashboard' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => setCurrentView('debtors')}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition ${currentView === 'debtors' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}>
            <Users className="w-5 h-5" />
            <span>Debtors Book</span>
          </button>
        </div>
      </div>
      <button onClick={() => supabase.auth.signOut()}
        className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-950 text-red-400 mt-8 transition">
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </nav>
  );
}