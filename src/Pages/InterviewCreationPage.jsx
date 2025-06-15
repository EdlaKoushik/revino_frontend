import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaRegKeyboard, FaVideo, FaCheckCircle } from 'react-icons/fa';
import ResumeUpload from '../components/ResumeUpload';
import axios from 'axios';
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useAuth } from "@clerk/clerk-react";
import { Toaster, toast } from "react-hot-toast";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import toggleImg from '../assets/toggle.png';
import logo from '../assets/logo.png';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const InterviewCreationPage = () => {
  const [mode, setMode] = useState('text');
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pastResumes, setPastResumes] = useState([]);
  const [pastJobDescs, setPastJobDescs] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJobDesc, setSelectedJobDesc] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleHour, setScheduleHour] = useState('');
  const [scheduleMinute, setScheduleMinute] = useState('');
  const [scheduleSecond, setScheduleSecond] = useState('');
  const [scheduleAmpm, setScheduleAmpm] = useState('');
  const [plan, setPlan] = useState('Free');
  const navigate = useNavigate();
  const { getToken, user } = useAuth();
  const { user: userObj } = useUser(); // Get Clerk user object

  // Fetch past resumes and job descriptions
  React.useEffect(() => {
    const fetchPastMaterials = async () => {
      if (!userObj) return;
      try {
        const token = await getToken();
        const res = await axios.get('/api/interview/past-materials', {
          params: { userId: userObj.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setPastResumes(res.data.resumes || []);
        setPastJobDescs(res.data.jobDescs || []);
      } catch (err) {
        // ignore
      }
    };
    fetchPastMaterials();
  }, [userObj, getToken]);

  // Fetch user plan for gating interview creation
  React.useEffect(() => {
    const fetchPlan = async () => {
      if (!userObj) return;
      try {
        const token = await getToken();
        const res = await axios.get('/api/user/plan', {
          params: { clerkUserId: userObj.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlan(res.data.plan || 'Free');
      } catch {
        setPlan('Free');
      }
    };
    fetchPlan();
  }, [userObj, getToken, loading]); // Only use defined dependencies

  const handleResumeUpload = async (file) => {
    setResume(file);
    setError('');
    if (file && file.type === 'application/pdf') {
      try {
        setLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + ' ';
        }
        setResumeText(text.slice(0, 2000)); // Limit to 2000 chars for prompt
      } catch (err) {
        setError('Failed to extract text from PDF. Please ensure the PDF is not encrypted or scanned.');
        setResumeText('');
      } finally {
        setLoading(false);
      }
    } else {
      setResumeText('');
      setError('Please upload a valid PDF file.');
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setError("");
    toast.loading("Starting interview...");
    if (!role || !experience) {
      setError("Job role and experience level are required");
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }
    // --- Free plan gating (frontend UX) ---
    if (plan === 'Free') {
      try {
        const token = await getToken();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const res = await axios.get('/api/interview/all', {
          params: { userId: userObj.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        const thisMonthCount = (res.data.interviews || []).filter(i => {
          const created = new Date(i.createdAt);
          return created >= startOfMonth;
        }).length;
        // --- Add backend check for plan in case admin changed it ---
        if (res.data.userPlan === 'Premium' || plan === 'Premium') {
          // User is now premium, skip limit
        } else if (thisMonthCount >= 3) {
          toast.dismiss();
          toast.error('Free plan: Only 3 mock interviews allowed per month. Upgrade to Premium for unlimited access.');
          setError('Free plan: Only 3 mock interviews allowed per month. Upgrade to Premium for unlimited access.');
          setLoading(false);
          return;
        }
      } catch (err) {
        // fallback: let backend enforce
      }
    }
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Not authenticated. Please sign in.");
        throw new Error("Not authenticated. Please sign in.");
      }
      // If scheduling fields are filled, schedule the mock
      if (scheduleDate && scheduleHour && scheduleMinute && scheduleSecond && scheduleAmpm) {
        let h = parseInt(scheduleHour, 10);
        if (scheduleAmpm === 'PM' && h !== 12) h += 12;
        if (scheduleAmpm === 'AM' && h === 12) h = 0;
        const hourStr = h.toString().padStart(2, '0');
        const time24 = `${hourStr}:${scheduleMinute}:${scheduleSecond}`;
        const isoString = `${scheduleDate}T${time24}`;
        const scheduledFor = new Date(isoString);
        if (isNaN(scheduledFor.getTime())) {
          setError('Invalid date or time. Please check your input.');
          setLoading(false);
          return;
        }
        await axios.post('/api/schedule-mock', {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
          scheduledFor,
          mode,
          jobRole: role,
          industry,
          experience,
          resumeText,
          jobDescription: jobDesc,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.dismiss();
        toast.success('Mock interview scheduled! Confirmation sent to your email.', {
          duration: 2500,
          position: 'top-right',
          style: { background: '#6c47ff', color: '#fff', fontWeight: 600 },
          iconTheme: { primary: '#fff', secondary: '#6c47ff' },
        });
        setTimeout(() => navigate('/dashboard'), 1200);
        setLoading(false);
        return;
      }
      // 1. Create interview session
      const createRes = await axios.post('/api/interview/create', {
        mode,
        jobRole: role,
        industry,
        experience,
        jobDescription: jobDesc,
        resumeText,
        userId: userObj?.id, // Use Clerk user object for id
        email: userObj?.primaryEmailAddress?.emailAddress || userObj?.emailAddresses?.[0]?.emailAddress // Use Clerk user object for email
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!createRes.data?.interview?._id) {
        toast.error('Failed to create interview session');
        throw new Error('Invalid response from server');
      }
      const interviewId = createRes.data.interview._id;
      toast.success('Interview created successfully!');
      // 2. Start interview (send resumeText for custom questions)
      const startRes = await axios.post('/api/interview/start', {
        interviewId,
        resumeText: resumeText || undefined,
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      toast.dismiss();
      toast.success('Interview started! Good luck!', {
        duration: 3000,
        position: 'top-center',
        style: { background: '#4CAF50', color: '#fff' },
      });
      setTimeout(() => {
        navigate(`/interview-session/${interviewId}`);
      }, 1200);
    } catch (err) {
      toast.dismiss();
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Failed to start interview: ${errorMessage}`);
      toast.error(`Failed to start interview: ${errorMessage}`, {
        duration: 5000,
        position: 'top-center',
        style: { background: '#f44336', color: '#fff' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] flex flex-col items-center py-8 px-2 relative">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Default options for specific types
          success: {
            duration: 3000,
            style: {
              background: '#4CAF50',
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#f44336',
              color: '#fff',
            },
          },
          loading: {
            duration: 3000,
            style: {
              background: '#2196F3',
              color: '#fff',
            },
          },
        }}
      />
      {/* Navbar - improved: sticky, full-width, visually distinct */}
      <nav className="fixed top-0 left-0 w-full z-50 flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 md:px-12 py-3 sm:py-5 bg-white shadow-lg border-b border-gray-200 gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-7 w-auto cursor-pointer" style={{ borderRadius: 0 }} onClick={() => window.location.href = '/dashboard'} />
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
          <button className="ml-2 p-2 rounded-full hover:bg-[#e0d7ff] transition cursor-pointer" aria-label="Toggle dark mode">
            <img src={toggleImg} alt="toggle" className="w-7 h-7 object-contain" />
          </button>
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

      {/* Main Content - single page form, margin for sticky navbar */}
      <div className="flex flex-col items-center w-full min-h-screen bg-[#f7f7fb] pt-24 sm:pt-32 pb-6 sm:pb-10 px-2">
        <div className="w-full max-w-xs sm:max-w-2xl bg-white rounded-xl shadow p-4 sm:p-8">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-4 sm:mb-8 text-[#6c47ff] text-center">Create New Interview</h2>
          <form onSubmit={e => { e.preventDefault(); handleStartInterview(); }} className="space-y-4 sm:space-y-7">
            <div>
              <label className="block text-sm sm:text-md font-semibold mb-1 sm:mb-2">Interview Mode</label>
              <div className="flex gap-2 sm:gap-6 flex-wrap">
                <button type="button"
                  className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg border-2 transition w-20 sm:w-28 ${mode === 'text' ? 'border-[#6c47ff] bg-[#f3f0ff]' : 'border-gray-200 bg-white'} cursor-pointer`}
                  onClick={() => setMode('text')}
                >
                  <FaRegKeyboard className="text-lg sm:text-2xl" />
                  <span>Text</span>
                </button>
                <button type="button"
                  className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg border-2 transition w-20 sm:w-28 ${mode === 'audio' ? 'border-[#6c47ff] bg-[#f3f0ff]' : 'border-gray-200 bg-white'} cursor-pointer`}
                  onClick={() => setMode('audio')}
                >
                  <FaMicrophone className="text-lg sm:text-2xl" />
                  <span>Audio</span>
                </button>
                <button type="button"
                  className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg border-2 transition w-20 sm:w-28 ${mode === 'video' ? 'border-[#6c47ff] bg-[#f3f0ff]' : 'border-gray-200 bg-white'} cursor-pointer`}
                  onClick={() => setMode('video')}
                >
                  <FaVideo className="text-lg sm:text-2xl" />
                  <span>Video</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm sm:text-md font-semibold mb-1 sm:mb-2">Industry</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Software, Finance" />
            </div>
            <div>
              <label className="block text-sm sm:text-md font-semibold mb-1 sm:mb-2">Job Role</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Developer" />
            </div>
            <div>
              <label className="block text-sm sm:text-md font-semibold mb-1 sm:mb-2">Experience Level</label>
              <select className="w-full border rounded-lg px-3 py-2" value={experience} onChange={e => setExperience(e.target.value)}>
                <option value="">Select</option>
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <label className="block text-sm sm:text-md font-semibold mb-1 sm:mb-2">Resume</label>
                {pastResumes.length > 0 && (
                  <select className="w-full border rounded-lg px-3 py-2 mb-2" value={selectedResume} onChange={e => {
                    setSelectedResume(e.target.value);
                    setResume(null);
                    setResumeText(e.target.value);
                  }}>
                    <option value="">Select previously used resume</option>
                    {pastResumes.map((r, i) => (
                      <option key={i} value={r.slice(0, 100)}>{r.slice(0, 100)}...</option>
                    ))}
                  </select>
                )}
                <ResumeUpload onFile={handleResumeUpload} file={resume} />
                {loading && <div className="text-xs text-blue-600 mt-2">Extracting text from PDF...</div>}
                {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
              </div>
              <div className="flex-1">
                <label className="block text-sm sm:text-md font-semibold mb-1 sm:mb-2">Job Description</label>
                {pastJobDescs.length > 0 && (
                  <select className="w-full border rounded-lg px-3 py-2 mb-2" value={selectedJobDesc} onChange={e => {
                    setSelectedJobDesc(e.target.value);
                    setJobDesc(e.target.value);
                  }}>
                    <option value="">Select previously used job description</option>
                    {pastJobDescs.map((j, i) => (
                      <option key={i} value={j.slice(0, 100)}>{j.slice(0, 100)}...</option>
                    ))}
                  </select>
                )}
                <textarea
                  className="w-full border rounded-lg px-3 py-2 min-h-[100px] sm:min-h-[160px] bg-[#fafbff] placeholder:text-gray-400"
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here..."
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-[#f7f7fb] rounded-xl shadow-inner p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg flex-wrap">
                <span className="bg-[#f3f0ff] p-1 sm:p-2 rounded-full"><FaRegKeyboard className={`text-base sm:text-xl ${mode==='text' ? 'text-[#6c47ff]' : 'text-gray-400'}`} /></span>
                <span className="bg-[#f3f0ff] p-1 sm:p-2 rounded-full"><FaMicrophone className={`text-base sm:text-xl ${mode==='audio' ? 'text-[#6c47ff]' : 'text-gray-400'}`} /></span>
                <span className="bg-[#f3f0ff] p-1 sm:p-2 rounded-full"><FaVideo className="text-base sm:text-xl text-gray-300" /></span>
                <span className="ml-1 sm:ml-2 font-semibold">Mode:</span>
                <span className="capitalize text-[#6c47ff] font-bold">{mode}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg flex-wrap">
                <span className="bg-[#e6f9ed] p-1 sm:p-2 rounded-full text-[#1db954] font-bold">🏢</span>
                <span className="font-semibold">Industry:</span>
                <span className="text-gray-700">{industry || <span className="italic text-gray-400">Not specified</span>}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg flex-wrap">
                <span className="bg-[#f3f0ff] p-1 sm:p-2 rounded-full text-[#6c47ff] font-bold">💼</span>
                <span className="font-semibold">Role:</span>
                <span className="text-gray-700">{role || <span className="italic text-gray-400">Not specified</span>}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg flex-wrap">
                <span className="bg-[#fffbe6] p-1 sm:p-2 rounded-full text-[#eab308] font-bold">⭐</span>
                <span className="font-semibold">Experience:</span>
                <span className="text-gray-700">{experience || <span className="italic text-gray-400">Not specified</span>}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg flex-wrap">
                <span className="bg-[#f3f0ff] p-1 sm:p-2 rounded-full text-[#6c47ff] font-bold">📄</span>
                <span className="font-semibold">Resume:</span>
                <span className={resume ? "text-green-600 font-semibold" : "text-gray-400 italic"}>{resume ? resume.name : 'Not uploaded'}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg flex-wrap">
                <span className="bg-[#f3f0ff] p-1 sm:p-2 rounded-full text-[#6c47ff] font-bold">📝</span>
                <span className="font-semibold">Job Description:</span>
                <span className={jobDesc ? "text-[#6c47ff] font-semibold" : "text-gray-400 italic"}>{jobDesc ? 'Provided' : 'Not provided'}</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 text-center">
              <span className="inline-block bg-[#e6f9ed] text-[#1db954] px-3 sm:px-4 py-2 rounded-full font-semibold text-sm sm:text-md shadow">Ready to start your interview? Click below!</span>
            </div>
            <div className="flex justify-end mt-4 sm:mt-8">
              <button
                type="submit"
                className="px-5 sm:px-7 py-2 sm:py-3 rounded-lg bg-[#6c47ff] text-white font-bold text-base sm:text-lg shadow-lg hover:bg-[#5433c6] transition w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Starting...' : 'Start Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewCreationPage;





