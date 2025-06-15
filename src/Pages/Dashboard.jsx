import React, { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHistory, FaCalendarAlt, FaClock, FaMicrophone, FaRegKeyboard, FaVideo } from 'react-icons/fa';
import plusImg from '../assets/plus.png';
import { toast } from 'react-hot-toast';
import ScheduledMocksList from '../components/ScheduledMocksList';
import logo from '../assets/logo.png';

const Dashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const cardClass = "bg-white rounded-xl shadow p-6 flex flex-col gap-3 hover:shadow-xl hover:scale-[1.01] transition-transform w-full min-w-0 h-full border border-gray-100";

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        if (!user) return;
        const token = await getToken();
        // Always send userId as query param to guarantee user-specific filtering
        const res = await axios.get('/api/interview/all', {
          params: { userId: user.id },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });
        setInterviews(res.data.interviews || []);
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchInterviews();
  }, [user, getToken]);

  useEffect(() => {
    if (scheduled) {
      toast.success('Mock interview scheduled! You will receive an email reminder.', {
        duration: 2500,
        position: 'top-right',
        style: { background: '#6c47ff', color: '#fff', fontWeight: 600 },
        iconTheme: { primary: '#fff', secondary: '#6c47ff' },
      });
      setScheduled(false);
    }
  }, [scheduled]);

  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f7fb]">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold text-[#6c47ff] mb-4">Please Sign In</h2>
            <p className="mb-6 text-gray-600">You must be signed in to access the dashboard.</p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 rounded-lg bg-[#6c47ff] text-white font-semibold text-base shadow-md hover:bg-[#4f2fcf] transition">Sign In / Login</button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="bg-[#f7f7fb] min-h-screen font-sans flex flex-col">
          {/* Navbar */}
          <nav className="sticky top-0 z-20 flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 md:px-12 py-4 sm:py-5 bg-white shadow-sm gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
            
              <span className="text-2xl font-extrabold text-[#6c47ff] tracking-tight cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
                AI Interview Prep App
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a href="/dashboard" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">Dashboard</a>
              <a href="/upgrade" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">Upgrade</a>
              <a href="/settings" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">Settings</a>
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-6 py-2 rounded-lg border border-[#d1d5db] bg-white text-[#6c47ff] font-semibold text-base shadow-sm hover:bg-[#f3f0ff] transition">Sign In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {/* Create Interview */}
            <div className="max-w-3xl mx-auto mt-6 sm:mt-10 px-2 sm:px-0">
              <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <span className="bg-[#f3f0ff] text-[#6c47ff] rounded-full p-2 sm:p-3 flex items-center justify-center cursor-pointer">
                    <img src={plusImg} alt="plus" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                  </span>
                  <div>
                    <div className="font-bold text-base sm:text-lg text-gray-900">Create New Interview</div>
                    <div className="text-gray-500 text-xs sm:text-sm">Start a new mock interview with AI tailored to your job role</div>
                  </div>
                </div>
                <button
                  className="bg-[#6c47ff] text-white font-bold px-5 sm:px-8 py-2 sm:py-3 rounded-xl shadow hover:bg-[#4f2fcf] transition text-base sm:text-lg flex items-center gap-2 w-full sm:w-auto"
                  onClick={() => navigate('/interview-creation')}
                >
                  <img src={plusImg} alt="plus" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                  New Interview
                </button>
              </div>
            </div>

            {/* Past Interviews */}
            <div className="max-w-4xl mx-auto px-2 sm:px-0">
              <div className="flex items-center gap-2 text-[#6c47ff] font-semibold text-base sm:text-lg mb-2 sm:mb-4 mt-2">
                <FaHistory /> Your Past Interviews
              </div>
              {loading ? (
                <div>Loading...</div>
              ) : interviews.length === 0 ? (
                <div>No interviews found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 auto-rows-fr">
                  {interviews.map((interview) => {
                    const created = new Date(interview.createdAt);
                    const dateStr = created.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                    const timeStr = created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
                    const score = Array.isArray(interview.answers) ? Math.round((interview.answers.filter(a => a && a.length > 0).length / (interview.questions?.length || 1)) * 100) : 0;
                    const summary = interview.overallFeedback || (Array.isArray(interview.feedback) ? interview.feedback.find(f => f && f.length > 0) : '');
                    const modeIcon = interview.mode === 'audio' ? <FaMicrophone className="text-[#6c47ff] text-lg mr-2" />
                      : interview.mode === 'video' ? <FaVideo className="text-[#6c47ff] text-lg mr-2" />
                      : <FaRegKeyboard className="text-[#6c47ff] text-lg mr-2" />;

                    return (
                      <div key={interview._id} className={cardClass}>
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-2">
                          {modeIcon}
                          {interview.jobRole || 'Interview'}
                        </div>
                        <div className="flex items-center gap-4 text-gray-500 text-sm mb-1">
                          <FaCalendarAlt /> {dateStr}
                          <FaClock className="ml-2" /> {timeStr}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#e6f9ed] text-[#1db954] font-bold px-3 py-1 rounded-lg text-xs">Score: {score}%</span>
                          <span className="text-gray-500 text-xs">{summary ? `"${summary}"` : ''}</span>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2">
                          <button
                            className="bg-white border border-[#6c47ff] text-[#6c47ff] font-semibold px-4 py-2 rounded-lg shadow hover:bg-[#f3f0ff] transition flex-1"
                            onClick={() => navigate(`/feedback/${interview._id}`)}
                          >
                            Feedback
                          </button>
                          <button
                            className="bg-[#6c47ff] text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-[#4f2fcf] transition flex-1"
                            onClick={() => navigate(`/interview-session/${interview._id}`)}
                          >
                            Retake
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scheduled Mocks */}
            <div className="max-w-4xl mx-auto px-2 sm:px-0">
              <div className="flex justify-end mb-4 sm:mb-6">
                <button
                  className="bg-[#6c47ff] text-white font-bold px-4 sm:px-6 py-2 rounded-lg shadow hover:bg-[#4f2fcf] transition w-full sm:w-auto"
                  onClick={() => navigate('/schedule-mock')}
                >
                  Schedule Next Mock
                </button>
              </div>
              <div className="flex items-center gap-2 text-[#6c47ff] font-semibold text-base sm:text-lg mb-2 sm:mb-4 mt-2">
                <FaCalendarAlt />
                Scheduled Mocks
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 auto-rows-fr">
                <ScheduledMocksList cardClass={cardClass} refresh={scheduled} onRefreshed={() => setScheduled(false)} />
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 py-4 bg-white border-t border-gray-200 text-xs sm:text-sm mt-auto gap-2">
            <div className="font-bold text-[#6c47ff]">© 2025 AI Interview Prep App</div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#6c47ff]" aria-label="LinkedIn"><i className="fa-brands fa-linkedin text-lg"></i></a>
              <a href="#" className="text-gray-400 hover:text-[#6c47ff]" aria-label="Twitter"><i className="fa-brands fa-twitter text-lg"></i></a>
            </div>
          </footer>
        </div>
      </SignedIn>
    </>
  );
};

export default Dashboard;


