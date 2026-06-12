import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DebtorList from './components/DebtorList';
import Navigation from './components/Navigation';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'debtors'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'dashboard' ? <Dashboard /> : <DebtorList />}
      </main>
    </div>
  );
}
