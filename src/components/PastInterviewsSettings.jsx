import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { FaTrash, FaCalendarAlt, FaClock, FaRegKeyboard, FaMicrophone, FaVideo } from 'react-icons/fa';

const PastInterviewsSettings = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        // Revert: do not filter by userId, let backend handle filtering or return all
        const res = await axios.get('/api/interview/all', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });
        setInterviews(res.data.interviews || []);
      } catch (err) {
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [getToken]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      const token = await getToken();
      await axios.delete(`/api/interview/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });
      setInterviews((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert('Failed to delete interview.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="py-8">Loading interviews...</div>;
  if (interviews.length === 0) return <div className="py-8 text-gray-500">No interviews found.</div>;

  return (
    <div className="divide-y divide-gray-100">
      {interviews.map((interview) => {
        let score = 0;
        if (Array.isArray(interview.answers) && interview.answers.length > 0) {
          const answered = interview.answers.filter(a => a && a.length > 0).length;
          score = Math.round((answered / (interview.questions?.length || 1)) * 100);
        }
        const created = new Date(interview.createdAt);
        const dateStr = created.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        let modeIcon = null;
        if (interview.mode === 'audio') modeIcon = <FaMicrophone className="text-[#6c47ff] text-lg mr-2" title="Audio" />;
        else if (interview.mode === 'video') modeIcon = <FaVideo className="text-[#6c47ff] text-lg mr-2" title="Video" />;
        else modeIcon = <FaRegKeyboard className="text-[#6c47ff] text-lg mr-2" title="Text" />;
        return (
          <div key={interview._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-2 hover:bg-[#f7f7fb] rounded-xl transition">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {modeIcon}
              <div className="font-semibold text-gray-900 truncate">{interview.jobRole || 'Interview'}</div>
              <div className="flex items-center gap-2 text-gray-500 text-xs ml-2">
                <FaCalendarAlt /> {dateStr}
                <FaClock className="ml-2" /> {timeStr}
              </div>
              <span className="ml-4 bg-[#e6f9ed] text-[#1db954] font-bold px-3 py-1 rounded-lg text-xs">Score: {score}%</span>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold shadow hover:bg-red-100 transition"
              onClick={() => handleDelete(interview._id)}
              disabled={deleting === interview._id}
              title="Delete Interview"
            >
              <FaTrash />
              {deleting === interview._id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PastInterviewsSettings;
