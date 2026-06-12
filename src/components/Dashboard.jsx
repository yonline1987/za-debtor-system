import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Wallet, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalOutstanding: 0, totalOverdue: 0, totalPaid: 0, overdueCount: 0 });
  const [overdueDebtors, setOverdueDebtors] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: invoices } = await supabase.from('invoices').select('*, debtors(first_name, last_name, company_name)');
    
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let totalPaid = 0;
    let overdueCount = 0;
    let overdueList = [];

    invoices?.forEach(inv => {
      const remaining = inv.amount_due - inv.amount_paid;
      totalPaid += parseFloat(inv.amount_paid);
      
      if (remaining > 0) {
        totalOutstanding += remaining;
        if (new Date(inv.due_date) < new Date() || inv.status === 'Overdue') {
          totalOverdue += remaining;
          overdueCount++;
          overdueList.push({
            id: inv.id,
            name: inv.debtors ? `${inv.debtors.first_name} ${inv.debtors.last_name}` : 'Unknown',
            company: inv.debtors?.company_name || 'N/A',
            remaining,
            dueDate: inv.due_date
          });
        }
      }
    });

    setStats({ totalOutstanding, totalOverdue, totalPaid, overdueCount });
    setOverdueDebtors(overdueList);
  };

  const formatZAR = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Financial Insights Dashboard</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Outstanding Balance</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatZAR(stats.totalOutstanding)}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Wallet /></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Overdue Amount</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatZAR(stats.totalOverdue)}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600"><AlertTriangle /></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Collected (Payments)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatZAR(stats.totalPaid)}</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><CheckCircle /></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Overdue Accounts Count</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.overdueCount}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-full text-amber-600"><Clock /></div>
        </div>
      </div>

      {/* Overdue List Watchlist */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          Critical Overdue Watchlist
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs">
                <th className="p-3">Debtor Name</th>
                <th className="p-3">Company</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Outstanding Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overdueDebtors.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-gray-400">No overdue critical bills found! 🙌</td></tr>
              ) : overdueDebtors.map((debtor, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{debtor.name}</td>
                  <td className="p-3 text-gray-600">{debtor.company}</td>
                  <td className="p-3 text-red-500 font-medium">{debtor.dueDate}</td>
                  <td className="p-3 font-semibold text-gray-900">{formatZAR(debtor.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
