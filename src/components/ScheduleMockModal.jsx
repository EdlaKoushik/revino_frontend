import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const ScheduleMockModal = ({ open, onClose, onScheduled }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [second, setSecond] = useState('');
  const [ampm, setAmpm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSchedule = async (e) => {
    e.preventDefault();
    setError('');
    if (!date || !hour || !minute || !second || !ampm) {
      setError('Please select date and time.');
      return;
    }
    // Validate date format (should be YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Please select a valid date.');
      return;
    }
    // Convert 12-hour time with AM/PM to 24-hour format
    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const hourStr = h.toString().padStart(2, '0');
    const time24 = `${hourStr}:${minute}:${second}`;
    // Construct ISO string and validate
    const isoString = `${date}T${time24}`;
    const scheduledFor = new Date(isoString);
    if (isNaN(scheduledFor.getTime())) {
      setError('Invalid date or time. Please check your input.');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      await axios.post('/api/schedule-mock', {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
        scheduledFor,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Mock interview scheduled! Confirmation sent to your email.', {
        duration: 2500,
        position: 'top-right',
        style: { background: '#6c47ff', color: '#fff', fontWeight: 600 },
        iconTheme: { primary: '#fff', secondary: '#6c47ff' },
      });
      onScheduled();
      onClose();
    } catch (err) {
      setError('Failed to schedule mock.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 2500,
          style: {
            background: '#6c47ff',
            color: '#fff',
            fontWeight: 600,
            borderRadius: '10px',
            boxShadow: '0 4px 24px rgba(108,71,255,0.12)',
            fontSize: '1rem',
            padding: '16px 24px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#6c47ff',
          },
        }}
      />
      <div className="fixed inset-0 z-50 flex items-start justify-end p-8 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative pointer-events-auto mt-20 mr-8 border border-[#e5e7eb]">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
          <h2 className="text-2xl font-bold text-[#6c47ff] mb-4">Schedule Next Mock Interview</h2>
          <form onSubmit={handleSchedule} className="flex flex-col gap-4">
            <div>
              <label className="block font-semibold mb-1">Date</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Time</label>
              <div className="flex gap-2">
                <select className="border rounded-lg px-2 py-2 font-mono" value={hour} onChange={e => setHour(e.target.value)} required>
                  <option value="">HH</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={String(i+1).padStart(2, '0')}>{String(i+1).padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="self-center">:</span>
                <select className="border rounded-lg px-2 py-2 font-mono" value={minute} onChange={e => setMinute(e.target.value)} required>
                  <option value="">MM</option>
                  {[...Array(60)].map((_, i) => (
                    <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="self-center">:</span>
                <select className="border rounded-lg px-2 py-2 font-mono" value={second} onChange={e => setSecond(e.target.value)} required>
                  <option value="">SS</option>
                  {[...Array(60)].map((_, i) => (
                    <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                  ))}
                </select>
                <select className="border rounded-lg px-2 py-2 font-mono" value={ampm} onChange={e => setAmpm(e.target.value)} required>
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <span className="text-xs text-gray-500">Format: 12-hour (e.g., 07:09:00 PM)</span>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="bg-[#6c47ff] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#4f2fcf] transition" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ScheduleMockModal;