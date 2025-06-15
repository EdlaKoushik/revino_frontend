import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';
import logo from '../assets/logo.png';

const SIDEBAR = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'interviews', label: 'Interview Sessions' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'logs', label: 'Export Logs' },
];

const AdminPanel = () => {
  const [tab, setTab] = useState('dashboard');
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7fb]">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#23234c] text-white flex flex-col py-8 px-4 min-h-screen h-[100vh] fixed left-0 top-0 bottom-0">
          <div className="flex items-center gap-2 mb-8">
            {/* <img src={logo} alt="Logo" className="h-10 w-auto bg-white p-1" style={{ borderRadius: 0 }} /> */}
            <span className="text-2xl font-extrabold tracking-tight">AI Interview Prep</span>
          </div>
          <div className="text-xs text-[#bdbdf7] mb-6">Admin Panel</div>
          <nav className="flex flex-col gap-2">
            {SIDEBAR.map(t => (
              <button
                key={t.key}
                className={`text-left px-4 py-2 rounded-lg font-semibold transition ${tab === t.key ? 'bg-[#6c47ff] text-white' : 'hover:bg-[#35357a] text-gray-200'}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 ml-64 p-10">
          {tab === 'dashboard' && <AdminDashboard />}
          {tab === 'users' && <UsersTable />}
          {tab === 'subscriptions' && <SubscriptionsTable />}
          {tab === 'interviews' && <InterviewSessionsTable />}
          {tab === 'invoices' && <InvoicesTable />}
          {tab === 'logs' && <ExportLogs />}
        </main>
      </div>
      <Footer />
    </div>
  );
};

// --- Dashboard with stats and users table ---
const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, active: 0, interviews: 0, revenue: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const usersRes = await axios.get('/api/admin/users');
      const interviewsRes = await axios.get('/api/interview/all');
      // Revenue: sum of all users with Premium plan * 499 (or fetch from Stripe if available)
      const usersArr = usersRes.data.users || [];
      const activeUsers = usersArr.filter(u => u.plan === 'Premium' || u.plan === 'Free').length;
      const premiumUsers = usersArr.filter(u => u.plan === 'Premium').length;
      const revenue = premiumUsers * 499; // ₹499/mo per premium user
      setStats({
        users: usersArr.length,
        active: activeUsers,
        interviews: (interviewsRes.data.interviews || []).length,
        revenue,
      });
      setUsers(usersArr);
    } catch (err) {
      setError('Failed to load stats.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
    // Expose refresh function globally for UsersTable to call
    window.refreshAdminStats = fetchStats;
    return () => { window.refreshAdminStats = null; };
  }, []);
  return (
    <div>
      <div className="flex gap-8 mb-8">
        <StatCard label="Active Users" value={stats.active} />
        <StatCard label="Interviews Completed" value={stats.interviews} />
        <StatCard label="Subscription Revenue" value={`₹${stats.revenue.toLocaleString()}`} highlight />
      </div>
      <UsersTable users={users} loading={loading} error={error} hideTitle />
    </div>
  );
};

const StatCard = ({ label, value, highlight }) => (
  <div className={`rounded-xl shadow-xl p-8 bg-white min-w-[180px] text-center`}> 
    <div className={`text-3xl font-extrabold mb-2 ${highlight ? 'text-[#23234c]' : ''}`}>{value}</div>
    <div className={`text-lg font-semibold ${highlight ? 'text-[#23234c]' : 'text-gray-600'}`}>{label}</div>
  </div>
);

// --- Users Table ---
const UsersTable = ({ users: propUsers, loading: propLoading, error: propError, hideTitle }) => {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("Free");
  const [users, setUsers] = useState(propUsers || []);
  const [loading, setLoading] = useState(propLoading || false);
  const [error, setError] = useState(propError || "");
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', plan: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => { if (propUsers) setUsers(propUsers); }, [propUsers]);
  useEffect(() => { setLoading(propLoading); }, [propLoading]);
  useEffect(() => { setError(propError); }, [propError]);

  useEffect(() => {
    if (!propUsers) {
      setLoading(true);
      axios.get('/api/admin/users').then(res => {
        setUsers(res.data.users || []);
        setLoading(false);
      }).catch(() => {
        setError('Failed to load users.');
        setLoading(false);
      });
    }
  }, [propUsers]);

  const filtered = users.filter(u =>
    (!planFilter || u.plan === planFilter) &&
    (u.email?.toLowerCase().includes(search.toLowerCase()) || u.clerkUserId?.toLowerCase().includes(search.toLowerCase()))
  );

  // Dummy name from email (for demo)
  const getName = (email) => {
    if (!email) return '';
    const [name] = email.split('@');
    return name.replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ email: user.email, plan: user.plan });
    setSaveError('');
  };
  const closeEdit = () => setEditUser(null);
  const handleEditChange = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await axios.put(`/api/admin/users/${editUser._id || editUser.clerkUserId}`, editForm);
      setUsers(users.map(u => (u._id === res.data.user._id ? res.data.user : u)));
      closeEdit();
      // Notify parent to refresh stats if callback provided
      if (typeof window.refreshAdminStats === 'function') window.refreshAdminStats();
    } catch (err) {
      setSaveError('Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {!hideTitle && <h2 className="text-2xl font-bold mb-6">Users</h2>}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select
          className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm"
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
        >
          <option value="">All Users</option>
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
          <option value="Inactive">Inactive</option>
        </select>
        <input
          className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm"
          placeholder="Search by email or user ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f7f7fb] text-gray-700">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.clerkUserId || i} className="border-b last:border-0 hover:bg-[#f7f7fb]">
                  <td className="px-4 py-2">{getName(u.email)}</td>
                  <td className="px-4 py-2 text-blue-700 underline cursor-pointer">{u.email}</td>
                  <td className="px-4 py-2">{u.plan}</td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${u.plan === 'Premium' ? 'bg-green-100 text-green-700' : u.plan === 'Free' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>{u.plan === 'Premium' ? 'Active' : u.plan === 'Free' ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-xs text-[#6c47ff] underline mr-2" onClick={() => openEdit(u)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[320px]">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input name="email" value={editForm.email} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Plan</label>
              <select name="plan" value={editForm.plan} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full">
                <option value="Free">Free</option>
                <option value="Premium">Premium</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            {saveError && <div className="text-red-600 text-sm mb-2">{saveError}</div>}
            <div className="flex gap-2 mt-4">
              <button className="bg-[#6c47ff] text-white px-4 py-2 rounded-lg font-semibold" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-200 px-4 py-2 rounded-lg font-semibold" onClick={closeEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subscriptions Table ---
const SubscriptionsTable = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all users and show those with Premium plan as subscriptions
        const res = await axios.get('/api/admin/users');
        const users = res.data.users || [];
        setSubs(users.filter(u => u.plan === 'Premium'));
      } catch (err) {
        setError('Failed to load subscriptions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Subscriptions</h2>
      {loading ? (
        <div>Loading subscriptions...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7fb] text-gray-700">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Subscribed Since</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((u, i) => (
                <tr key={u.clerkUserId || i} className="border-b last:border-0 hover:bg-[#f7f7fb]">
                  <td className="px-4 py-2">{u.email?.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                  <td className="px-4 py-2 text-blue-700 underline cursor-pointer">{u.email}</td>
                  <td className="px-4 py-2">{u.plan}</td>
                  <td className="px-4 py-2">
                    <span className="px-3 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Active</span>
                  </td>
                  <td className="px-4 py-2">{u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Interview Sessions Table ---
const InterviewSessionsTable = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editSession, setEditSession] = useState(null);
  const [editSessionForm, setEditSessionForm] = useState({ status: '', feedback: '', overallFeedback: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all interview sessions (admin: no userId filter)
        const res = await axios.get('/api/interview/all');
        setSessions(res.data.interviews || []);
      } catch (err) {
        setError('Failed to load interview sessions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const openEdit = (s) => {
    setEditSession(s);
    setEditSessionForm({
      status: s.status,
      feedback: Array.isArray(s.feedback) ? s.feedback.join(' | ') : (s.feedback || ''),
      overallFeedback: s.overallFeedback || ''
    });
    setSaveError('');
  };
  const closeEdit = () => setEditSession(null);
  const handleEditChange = e => setEditSessionForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const updates = {
        status: editSessionForm.status,
        feedback: editSessionForm.feedback.split(' | '),
        overallFeedback: editSessionForm.overallFeedback
      };
      const res = await axios.put(`/api/interview/admin/interviews/${editSession._id}`, updates);
      setSessions(sessions.map(s => (s._id === res.data.interview._id ? res.data.interview : s)));
      closeEdit();
    } catch (err) {
      setSaveError('Failed to update session.');
    } finally {
      setSaving(false);
    }
  };
  const openDelete = id => { setDeleteId(id); setDeleteError(''); };
  const closeDelete = () => setDeleteId(null);
  const handleDelete = async () => {
    setSaving(true);
    setDeleteError('');
    try {
      await axios.delete(`/api/interview/admin/interviews/${deleteId}`);
      setSessions(sessions.filter(s => s._id !== deleteId));
      closeDelete();
    } catch (err) {
      setDeleteError('Failed to delete session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Interview Sessions</h2>
      {loading ? (
        <div>Loading interview sessions...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7fb] text-gray-700">
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s._id || i} className="border-b last:border-0 hover:bg-[#f7f7fb]">
                  <td className="px-4 py-2 font-mono text-xs">{s.userId}</td>
                  <td className="px-4 py-2 text-blue-700 underline cursor-pointer">{s.email}</td>
                  <td className="px-4 py-2">{s.jobRole}</td>
                  <td className="px-4 py-2 capitalize">{s.mode}</td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${s.status === 'completed' ? 'bg-green-100 text-green-700' : s.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>{s.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-2">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-2">
                    <button className="text-xs text-[#6c47ff] underline mr-2" onClick={() => openEdit(s)}>Edit</button>
                    <button className="text-xs text-red-600 underline" onClick={() => openDelete(s._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Edit Session Modal */}
      {editSession && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[340px]">
            <h3 className="text-lg font-bold mb-4">Edit Interview Session</h3>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select name="status" value={editSessionForm.status} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full">
                <option value="created">Created</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Feedback (separate by |)</label>
              <input name="feedback" value={editSessionForm.feedback} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Overall Feedback</label>
              <input name="overallFeedback" value={editSessionForm.overallFeedback} onChange={handleEditChange} className="border rounded-lg px-3 py-2 w-full" />
            </div>
            {saveError && <div className="text-red-600 text-sm mb-2">{saveError}</div>}
            <div className="flex gap-2 mt-4">
              <button className="bg-[#6c47ff] text-white px-4 py-2 rounded-lg font-semibold" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-200 px-4 py-2 rounded-lg font-semibold" onClick={closeEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[320px]">
            <h3 className="text-lg font-bold mb-4">Delete Interview Session?</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this interview session? This action cannot be undone.</p>
            {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
            <div className="flex gap-2 mt-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</button>
              <button className="bg-gray-200 px-4 py-2 rounded-lg font-semibold" onClick={closeDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Invoices Table ---
const InvoicesTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError("");
      try {
        // For demo: fetch all users and show dummy invoice per premium user
        const res = await axios.get('/api/admin/users');
        const users = res.data.users || [];
        // In real app, fetch from Stripe or your backend invoices endpoint
        const invoicesList = users.filter(u => u.plan === 'Premium').map((u, i) => ({
          id: `INV-${i + 1}`,
          email: u.email,
          userId: u.clerkUserId,
          amount: 499,
          status: 'Paid',
          date: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : '',
        }));
        setInvoices(invoicesList);
      } catch (err) {
        setError('Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Invoices</h2>
      {loading ? (
        <div>Loading invoices...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7fb] text-gray-700">
                <th className="px-4 py-3 text-left">Invoice #</th>
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-[#f7f7fb]">
                  <td className="px-4 py-2">{inv.id}</td>
                  <td className="px-4 py-2 font-mono text-xs">{inv.userId}</td>
                  <td className="px-4 py-2 text-blue-700 underline cursor-pointer">{inv.email}</td>
                  <td className="px-4 py-2">₹{inv.amount}</td>
                  <td className="px-4 py-2">
                    <span className="px-3 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">{inv.status}</span>
                  </td>
                  <td className="px-4 py-2">{inv.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Export Logs ---
const ExportLogs = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setDownloading(true);
    setError("");
    try {
      const res = await axios.get('/api/interview/export/logs', {
        responseType: 'blob',
      });
      // Create a link to download the CSV
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'interview_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to export logs.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Export User Performance Logs</h2>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <button className="bg-[#6c47ff] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4f2fcf] w-fit" onClick={handleExport} disabled={downloading}>
          {downloading ? "Exporting..." : "Export Logs (CSV)"}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
        <span className="text-gray-500 text-sm">Download all user performance logs for analytics or compliance.</span>
      </div>
    </div>
  );
};

// --- Footer Component ---
function Footer() {
  return (
    <footer className="bg-[#23234c] text-white text-center py-4 mt-12 rounded-t-xl shadow-inner">
      <div className="flex items-center justify-center gap-2">
        <img src={logo} alt="Logo" className="h-6 w-auto bg-white p-1" style={{ borderRadius: 0 }} />
        <span>© {new Date().getFullYear()} AI Interview Prep</span>
      </div>
    </footer>
  );
}

export default AdminPanel;
