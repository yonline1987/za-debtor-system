import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Download, Mail, MessageSquare, CreditCard, Plus, Trash2 } from 'lucide-react';

export default function DebtorList() {
  const [debtors, setDebtors] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    fetchDebtors();
  }, []);

  const fetchDebtors = async () => {
    const { data, error } = await supabase
      .from('debtors')
      .select(`
        *,
        invoices (
          amount_due,
          amount_paid,
          status
        )
      `);
    if (!error) setDebtors(data);
  };

  const calculateBalances = (invoices) => {
    let totalDue = 0;
    let totalPaid = 0;
    let status = 'Paid';

    invoices?.forEach(inv => {
      totalDue += parseFloat(inv.amount_due);
      totalPaid += parseFloat(inv.amount_paid);
      if (inv.status === 'Overdue') status = 'Overdue';
      else if (inv.status === 'Unpaid' && status !== 'Overdue') status = 'Unpaid';
    });

    return {
      outstanding: totalDue - totalPaid,
      status: totalDue === totalPaid ? 'Paid' : status
    };
  };

  const handleAddDebtor = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('debtors').insert([
      { first_name: firstName, last_name: lastName, email, phone_number: phone, id_number: idNumber, company_name: company }
    ]);
    if (!error) {
      setShowModal(false);
      fetchDebtors();
      // Reset Form fields
      setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setIdNumber(''); setCompany('');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account profile?')) {
      await supabase.from('debtors').delete().eq('id', id);
      fetchDebtors();
    }
  };

  // Export Data to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "First Name,Last Name,Company,Email,Phone,Outstanding Balance\n";
    
    debtors.forEach(d => {
      const bal = calculateBalances(d.invoices);
      csvContent += `${d.first_name},${d.last_name},${d.company_name || 'N/A'},${d.email},${d.phone_number},${bal.outstanding}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ZA_Debtors_Book_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock Communication Triggers
  const sendEmailReminder = (email) => {
    alert(`⚡ Email Payment Reminder System:\nOutbound notification compiled successfully for: ${email}`);
  };

  const triggerYocoLink = (name) => {
    alert(`💳 Yoco Payment Link Generation:\nReady to dispatch custom payment gateway token interface for ${name}.`);
  };

  const triggerWhatsApp = (phone) => {
    alert(`💬 WhatsApp Business API Action:\nTemplate scheduled to target ${phone}`);
  };

  const filteredDebtors = debtors.filter(d => {
    const info = calculateBalances(d.invoices);
    const fullName = `${d.first_name} ${d.last_name} ${d.company_name}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    
    if (filter === 'All') return matchesSearch;
    return matchesSearch && info.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Debtors Ledger Book</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" /> Add Debtor Profile
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium w-full sm:w-auto justify-center">
            <Download className="w-4 h-4" /> Export Book
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search by name, identity or business title..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
          <option value="All">All Standings</option>
          <option value="Paid">Settled (Paid)</option>
          <option value="Unpaid">Open Balance</option>
          <option value="Overdue">Overdue Arrears</option>
        </select>
      </div>

      {/* Mobile-Responsive Grid/Table Ecosystem */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">
                <th className="p-4">Account Information</th>
                <th className="p-4">Contact Channels</th>
                <th className="p-4">Status Flag</th>
                <th className="p-4">Outstanding Balance</th>
                <th className="p-4 text-right">Actions / Future Modality Linkage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDebtors.map((debtor) => {
                const financial = calculateBalances(debtor.invoices);
                return (
                  <tr key={debtor.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{debtor.first_name} {debtor.last_name}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{debtor.company_name || 'Individual Client'} • {debtor.id_number || 'No National ID'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-700">{debtor.email}</div>
                      <div className="text-gray-400 text-xs">{debtor.phone_number}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        financial.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        financial.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {financial.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(financial.outstanding)}
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button onClick={() => sendEmailReminder(debtor.email)} title="Email Reminder" className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition"><Mail className="w-4 h-4 inline" /></button>
                      <button onClick={() => triggerWhatsApp(debtor.phone_number)} title="WhatsApp (Upcoming)" className="p-1.5 hover:bg-green-50 text-green-600 rounded transition opacity-60 hover:opacity-100"><MessageSquare className="w-4 h-4 inline" /></button>
                      <button onClick={() => triggerYocoLink(`${debtor.first_name} ${debtor.last_name}`)} title="Yoco Link (Upcoming)" className="p-1.5 hover:bg-purple-50 text-purple-600 rounded transition opacity-60 hover:opacity-100"><CreditCard className="w-4 h-4 inline" /></button>
                      <button onClick={() => handleDelete(debtor.id)} title="Purge Record" className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal View Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Register New Debtor</h3>
            <form onSubmit={handleAddDebtor} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500">First Name</label>
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full mt-1 p-2 text-sm border rounded" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Last Name</label>
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full mt-1 p-2 text-sm border rounded" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">ZA ID Number (Optional)</label>
                <input type="text" maxLength="13" value={idNumber} onChange={e => setIdNumber(e.target.value)} className="w-full mt-1 p-2 text-sm border rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Company Legal Name</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full mt-1 p-2 text-sm border rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-2 text-sm border rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Phone Number (International Code - e.g. +27)</label>
                <input type="text" required placeholder="+27" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 p-2 text-sm border rounded" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700">Save Debtor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
