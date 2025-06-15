import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaTrash, FaCheckCircle, FaTimesCircle, FaPlayCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ScheduledMocksList = ({ refresh, onRefreshed, cardClass }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMocks = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await getToken();
        const res = await axios.get('/api/schedule-mock', {
          params: { userId: user.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setMocks(res.data.mocks || []);
      } catch (err) {
        setError('Failed to fetch scheduled mocks.');
      } finally {
        setLoading(false);
        if (onRefreshed) onRefreshed();
      }
    };
    if (user) fetchMocks();
  }, [user, getToken, refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled mock? This action cannot be undone.')) return;
    try {
      const token = await getToken();
      await axios.delete(`/api/schedule-mock/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMocks((prev) => prev.filter((m) => m._id !== id));
      toast.success('Scheduled mock deleted.', {
        duration: 2000,
        position: 'top-right',
        style: { background: '#f44336', color: '#fff', fontWeight: 600 },
        iconTheme: { primary: '#fff', secondary: '#f44336' },
      });
    } catch (err) {
      toast.error('Failed to delete scheduled mock.', {
        duration: 2500,
        position: 'top-right',
      });
    }
  };

  const handleTake = async (mock) => {
    try {
      const token = await getToken();
      const createRes = await axios.post('/api/interview/create', {
        mode: mock.mode,
        jobRole: mock.jobRole,
        industry: mock.industry,
        experience: mock.experience,
        resumeText: mock.resumeText,
        jobDescription: mock.jobDescription,
        userId: user.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!createRes.data?.interview?._id) throw new Error('Failed to create interview session');
      const interviewId = createRes.data.interview._id;
      await axios.post('/api/interview/start', { interviewId, resumeText: mock.resumeText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Mock interview started!', { position: 'top-right', duration: 2000 });
      window.location.href = `/interview-session/${interviewId}`;
    } catch (err) {
      toast.error('Failed to start mock interview.', { position: 'top-right', duration: 3000 });
    }
  };

  if (loading) return <div>Loading scheduled mocks...</div>;
  if (error) return (<div className="text-red-600">{error}</div>);
  if (!mocks.length) return (<div className="text-gray-500">No scheduled mocks found.</div>);

  return (
    <>
      {mocks.map((mock) => {
        const dateObj = new Date(mock.scheduledFor);
        const now = new Date();
        const isExpired = dateObj < now;
        const dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

        return (
          <div key={mock._id} className={`${cardClass} relative`}>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-lg opacity-70 hover:opacity-100 transition"
              onClick={() => handleDelete(mock._id)}
              title="Delete scheduled mock"
            >
              <FaTrash />
            </button>

            <div className="flex items-center gap-2 text-[#6c47ff] font-bold text-lg mb-1">
              <FaCalendarAlt /> {dateStr}
            </div>
            <div className="flex items-center gap-2 text-gray-700 text-base mb-1">
              <FaClock /> {timeStr}
            </div>
            <div className="text-gray-500 text-xs mb-2">Email: {mock.email}</div>

            <div className="flex gap-2 items-center mt-auto pt-2">
              {isExpired ? (
                <span className="flex items-center gap-1 text-xs text-gray-400"><FaTimesCircle className="text-red-400" />Expired</span>
              ) : (
                <>
                  <span className="flex items-center gap-1 text-xs text-green-600"><FaCheckCircle />Upcoming</span>
                  <button
                    className="ml-auto flex items-center gap-1 px-3 py-1 bg-[#6c47ff] text-white rounded-lg text-xs font-semibold shadow hover:bg-[#4f2fcf] transition"
                    onClick={() => handleTake(mock)}
                  >
                    <FaPlayCircle /> Take
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ScheduledMocksList;
