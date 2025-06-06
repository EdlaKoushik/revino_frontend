import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const InvoiceViewer = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!isSignedIn || !user) return;
      setLoading(true);
      setError('');
      try {
        const token = await getToken();
        const res = await axios.get('/api/stripe/invoices', {
          params: { clerkUserId: user.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(res.data.invoices || []);
      } catch (err) {
        setError('Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [isSignedIn, user, getToken]);

  if (!isSignedIn) return null;
  if (loading) return <div>Loading invoices...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-lg mb-4 text-left">Billing History</h4>
      {invoices.length === 0 ? (
        <div className="text-gray-500">No invoices found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
            <thead>
              <tr className="bg-[#f7f7fb] text-gray-700 text-sm">
                <th className="px-4 py-3 text-left font-semibold">Invoice #</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-[#f7f7fb] transition">
                  <td className="px-4 py-2 font-mono text-gray-900">{inv.number}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{new Date(inv.created * 1000).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {inv.invoice_pdf ? (
                      <a
                        href={`/api/stripe/invoice/${inv.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6c47ff] underline font-medium hover:text-[#4f2fcf] flex items-center gap-1"
                        title="Download PDF Invoice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
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

export default InvoiceViewer;
