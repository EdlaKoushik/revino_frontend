import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TABS = [
  { key: 'users', label: 'Users & Subscriptions' },
  { key: 'questions', label: 'Question Bank' },
  { key: 'logs', label: 'Export Logs' },
  { key: 'content', label: 'Content Management' },
  { key: 'flagged', label: 'Flagged Content' },
  { key: 'billing', label: 'Billing & Analytics' },
];

const AdminPanel = () => {
  const [tab, setTab] = useState('users');

  return (
    <div className="min-h-screen flex bg-[#f7f7fb]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#23234c] text-white flex flex-col py-8 px-4 min-h-screen">
        <div className="text-2xl font-extrabold mb-8 tracking-tight">Admin Panel</div>
        <nav className="flex flex-col gap-2">
          {TABS.map(t => (
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
      <main className="flex-1 p-10">
        {tab === 'users' && <UsersSubscriptions />}
        {tab === 'questions' && <QuestionBank />}
        {tab === 'logs' && <ExportLogs />}
        {tab === 'content' && <ContentManagement />}
        {tab === 'flagged' && <FlaggedContent />}
        {tab === 'billing' && <BillingAnalytics />}
      </main>
    </div>
  );
};

// --- Section Stubs ---
const UsersSubscriptions = () => {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    (!planFilter || u.plan === planFilter) &&
    (u.email?.toLowerCase().includes(search.toLowerCase()) || u.clerkUserId?.toLowerCase().includes(search.toLowerCase()))
  );

  // Change plan handler
  const handleChangePlan = async (clerkUserId, newPlan) => {
    try {
      setLoading(true);
      await axios.post(`/api/admin/user/${clerkUserId}/plan`, { plan: newPlan });
      setUsers(users => users.map(u => u.clerkUserId === clerkUserId ? { ...u, plan: newPlan } : u));
    } catch {
      setError('Failed to update plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users & Subscriptions</h2>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
        >
          <option value="">All Plans</option>
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
        </select>
        <input
          className="border rounded-lg px-3 py-2 text-sm"
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
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7fb] text-gray-700">
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.clerkUserId || i} className="border-b last:border-0 hover:bg-[#f7f7fb]">
                  <td className="px-4 py-2 font-mono text-xs">{u.clerkUserId}</td>
                  <td className="px-4 py-2 text-blue-700 underline cursor-pointer">{u.email}</td>
                  <td className="px-4 py-2">{u.plan}</td>
                  <td className="px-4 py-2">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <select
                      className="px-2 py-1 rounded border text-xs"
                      value={u.plan}
                      onChange={e => handleChangePlan(u.clerkUserId, e.target.value)}
                      disabled={loading}
                    >
                      <option value="Free">Free</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const QuestionBank = () => {
  const [questions, setQuestions] = useState([
    { id: 1, text: "Tell me about yourself.", category: "General" },
    { id: 2, text: "What are your strengths?", category: "General" },
    { id: 3, text: "Describe a challenge you faced.", category: "Behavioral" },
  ]);
  const [newQ, setNewQ] = useState("");
  const [newCat, setNewCat] = useState("");
  const addQuestion = () => {
    if (!newQ.trim()) return;
    setQuestions([...questions, { id: Date.now(), text: newQ, category: newCat || "General" }]);
    setNewQ(""); setNewCat("");
  };
  const deleteQuestion = (id) => setQuestions(questions.filter(q => q.id !== id));
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Question Bank</h2>
      <div className="flex gap-2 mb-4">
        <input className="border rounded-lg px-3 py-2 text-sm flex-1" placeholder="New question..." value={newQ} onChange={e => setNewQ(e.target.value)} />
        <input className="border rounded-lg px-3 py-2 text-sm w-40" placeholder="Category" value={newCat} onChange={e => setNewCat(e.target.value)} />
        <button className="bg-[#6c47ff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4f2fcf]" onClick={addQuestion}>Add</button>
      </div>
      <div className="bg-white rounded-xl shadow p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#f7f7fb] text-gray-700">
              <th className="px-4 py-3 text-left">Question</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id} className="border-b last:border-0 hover:bg-[#f7f7fb]">
                <td className="px-4 py-2">{q.text}</td>
                <td className="px-4 py-2">{q.category}</td>
                <td className="px-4 py-2">
                  <button className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition" onClick={() => deleteQuestion(q.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExportLogs = () => {
  const [downloading, setDownloading] = useState(false);
  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1200); // Simulate download
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Export User Performance Logs</h2>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <button className="bg-[#6c47ff] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4f2fcf] w-fit" onClick={handleExport} disabled={downloading}>
          {downloading ? "Exporting..." : "Export Logs (CSV)"}
        </button>
        <span className="text-gray-500 text-sm">Download all user performance logs for analytics or compliance.</span>
      </div>
    </div>
  );
};

const ContentManagement = () => {
  const [tips, setTips] = useState(["Be confident.", "Practice common questions."]);
  const [faqs, setFaqs] = useState([
    { q: "How do I schedule a mock?", a: "Go to Dashboard and click 'Schedule Next Mock'." },
    { q: "Can I upload my own questions?", a: "Not yet, but coming soon!" },
  ]);
  const [newTip, setNewTip] = useState("");
  const addTip = () => { if (newTip.trim()) setTips([...tips, newTip]); setNewTip(""); };
  const deleteTip = (i) => setTips(tips.filter((_, idx) => idx !== i));
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Content Management</h2>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="font-semibold mb-2">Tips</h3>
        <div className="flex gap-2 mb-2">
          <input className="border rounded-lg px-3 py-2 text-sm flex-1" placeholder="Add tip..." value={newTip} onChange={e => setNewTip(e.target.value)} />
          <button className="bg-[#6c47ff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4f2fcf]" onClick={addTip}>Add</button>
        </div>
        <ul className="list-disc pl-6">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-center gap-2 mb-1">{tip} <button className="text-xs text-red-500" onClick={() => deleteTip(i)}>Delete</button></li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-2">FAQs</h3>
        <ul className="list-decimal pl-6">
          {faqs.map((f, i) => (
            <li key={i} className="mb-2"><span className="font-semibold">Q:</span> {f.q}<br /><span className="font-semibold">A:</span> {f.a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const FlaggedContent = () => {
  const [flagged, setFlagged] = useState([
    { id: 1, type: "Question", content: "What is your salary expectation?", reason: "Inappropriate" },
    { id: 2, type: "Tip", content: "Lie if you don't know the answer.", reason: "Bad advice" },
  ]);
  const handleApprove = (id) => setFlagged(flagged.filter(f => f.id !== id));
  const handleDecline = (id) => setFlagged(flagged.filter(f => f.id !== id));
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Flagged Content</h2>
      <div className="bg-white rounded-xl shadow p-6">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#f7f7fb] text-gray-700">
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Content</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map(f => (
              <tr key={f.id} className="border-b last:border-0 hover:bg-[#f7f7fb]">
                <td className="px-4 py-2">{f.type}</td>
                <td className="px-4 py-2">{f.content}</td>
                <td className="px-4 py-2">{f.reason}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="px-3 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition" onClick={() => handleApprove(f.id)}>Approve</button>
                  <button className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition" onClick={() => handleDecline(f.id)}>Decline</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BillingAnalytics = () => {
  // Placeholder stats
  const stats = [
    { label: "Active Users", value: 1250 },
    { label: "Interviews Completed", value: 3287 },
    { label: "Subscription Revenue", value: "$6,590" },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Billing Overview & Analytics</h2>
      <div className="flex gap-8 mb-8">
        {stats.map((s, i) => (
          <div key={i} className={`rounded-xl shadow-xl p-8 bg-white min-w-[180px] text-center${i === 2 ? '' : ''}`}>
            <div className={`text-3xl font-extrabold mb-2${i === 2 ? ' text-black' : ''}`}>{s.value}</div>
            <div className="text-gray-600 text-lg font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">Analytics charts and billing history coming soon.</div>
    </div>
  );
};

export default AdminPanel;
