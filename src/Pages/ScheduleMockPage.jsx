import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import ResumeUpload from '../components/ResumeUpload';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

const ScheduleMockPage = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('text');
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [pastResumes, setPastResumes] = useState([]);
  const [pastJobDescs, setPastJobDescs] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJobDesc, setSelectedJobDesc] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [second, setSecond] = useState('');
  const [ampm, setAmpm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPastMaterials = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const res = await axios.get('/api/interview/past-materials', {
          params: { userId: user.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setPastResumes(res.data.resumes || []);
        setPastJobDescs(res.data.jobDescs || []);
      } catch {}
    };
    fetchPastMaterials();
  }, [user, getToken]);

  const handleResumeUpload = async (file) => {
    setResume(file);
    setError('');
    if (file && file.type === 'application/pdf') {
      try {
        setLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
        const workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + ' ';
        }
        setResumeText(text.slice(0, 2000));
      } catch (err) {
        setError('Failed to extract text from PDF.');
        setResumeText('');
      } finally {
        setLoading(false);
      }
    } else {
      setResumeText('');
      setError('Please upload a valid PDF file.');
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setError('');
    if (!role || !experience || !date || !hour || !minute || !second || !ampm) {
      setError('Please fill all required fields.');
      return;
    }
    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const hourStr = h.toString().padStart(2, '0');
    const time24 = `${hourStr}:${minute}:${second}`;
    const isoString = `${date}T${time24}`;
    const scheduledFor = new Date(isoString);
    if (isNaN(scheduledFor.getTime())) {
      setError('Invalid date or time.');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
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
      toast.success('Next mock scheduled! Redirecting to dashboard...', {
        duration: 2000,
        position: 'top-right',
        style: { background: '#6c47ff', color: '#fff', fontWeight: 600 },
        iconTheme: { primary: '#fff', secondary: '#6c47ff' },
      });
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError('Failed to schedule mock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f7f7fb] p-2 sm:p-6">
      <Toaster position="top-right" />
      <div className="bg-white rounded-xl shadow p-4 sm:p-8 max-w-xs sm:max-w-2xl w-full mt-8 sm:mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#6c47ff] mb-4 sm:mb-6 text-center">Schedule Next Mock Interview</h2>
        <form onSubmit={handleSchedule} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block font-semibold mb-1">Interview Mode</label>
            <div className="flex gap-2 sm:gap-4 flex-wrap">
              <button type="button" className={`px-3 sm:px-4 py-2 rounded-lg border-2 ${mode==='text'?'border-[#6c47ff] bg-[#f3f0ff]':'border-gray-200 bg-white'}`} onClick={()=>setMode('text')}>Text</button>
              <button type="button" className={`px-3 sm:px-4 py-2 rounded-lg border-2 ${mode==='audio'?'border-[#6c47ff] bg-[#f3f0ff]':'border-gray-200 bg-white'}`} onClick={()=>setMode('audio')}>Audio</button>
              <button type="button" className={`px-3 sm:px-4 py-2 rounded-lg border-2 ${mode==='video'?'border-[#6c47ff] bg-[#f3f0ff]':'border-gray-200 bg-white'}`} onClick={()=>setMode('video')}>Video</button>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Industry</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2" value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="e.g. Software, Finance" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Job Role</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Frontend Developer" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Experience Level</label>
            <select className="w-full border rounded-lg px-3 py-2" value={experience} onChange={e=>setExperience(e.target.value)}>
              <option value="">Select</option>
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Resume</label>
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
              <label className="block font-semibold mb-1">Job Description</label>
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
              <textarea className="w-full border rounded-lg px-3 py-2 min-h-[100px] sm:min-h-[120px] bg-[#fafbff] placeholder:text-gray-400" value={jobDesc} onChange={e=>setJobDesc(e.target.value)} placeholder="Paste the job description here..." />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={date} onChange={e=>setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Time</label>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <select className="border rounded-lg px-2 py-2 font-mono" value={hour} onChange={e=>setHour(e.target.value)} required>
                <option value="">HH</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={String(i+1).padStart(2, '0')}>{String(i+1).padStart(2, '0')}</option>
                ))}
              </select>
              <span>:</span>
              <select className="border rounded-lg px-2 py-2 font-mono" value={minute} onChange={e=>setMinute(e.target.value)} required>
                <option value="">MM</option>
                {[...Array(60)].map((_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
              <span>:</span>
              <select className="border rounded-lg px-2 py-2 font-mono" value={second} onChange={e=>setSecond(e.target.value)} required>
                <option value="">SS</option>
                {[...Array(60)].map((_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
              <select className="border rounded-lg px-2 py-2 font-mono" value={ampm} onChange={e=>setAmpm(e.target.value)} required>
                <option value="">AM/PM</option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <span className="text-xs text-gray-500">Format: 12-hour (e.g., 07:09:00 PM)</span>
          </div>
          <button type="submit" className="w-full bg-[#6c47ff] text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow hover:bg-[#4f2fcf] transition mt-2 sm:mt-4" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Mock'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMockPage;
