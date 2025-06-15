import React, { useEffect } from 'react';
import { SignedIn, SignedOut, useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import heroImg from '../assets/heroimage.png';
import logo from '../assets/logo.png';

const LandingPage = () => {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-[#f7f7fb] flex flex-col">
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#6c47ff',
                color: '#fff',
                fontWeight: 600,
              },
              success: {
                style: { background: '#4CAF50', color: '#fff' },
              },
              error: {
                style: { background: '#f44336', color: '#fff' },
              },
            }}
          />
          
          {/* Navbar */}
          <nav className="sticky top-0 z-20 flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 md:px-12 py-4 sm:py-5 bg-white shadow-sm gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              {/* <img
                src={logo}
                alt="Logo"
                className="h-8 w-auto bg-white p-1 cursor-pointer"
                style={{ borderRadius: 0 }}
                onClick={() => window.location.href = '/'}
              /> */}
              <span
                className="text-2xl font-extrabold text-[#6c47ff] tracking-tight cursor-pointer"
                onClick={() => window.location.href = '/'}
              >
                AI Interview Prep
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#features" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">Features</a>
              <a href="#packs" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">Packs</a>
              <a href="#faq" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">FAQ</a>
            </div>
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="px-6 py-2 rounded-lg border border-[#d1d5db] bg-white text-[#6c47ff] font-semibold text-base shadow-sm hover:bg-[#f3f0ff] transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 rounded-lg bg-[#6c47ff] text-white font-semibold text-base shadow-sm hover:bg-[#4f2fcf] transition">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-24 gap-10 md:gap-0">
            <div className="flex-1 md:pr-12 w-full md:w-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#23234c] mb-4 sm:mb-6 leading-tight text-center md:text-left">
                Ace Your Next Interview<br />with <span className="text-[#6c47ff]">AI-Powered Prep</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-xl mx-auto md:mx-0 text-center md:text-left">
                Practice real interview questions, get instant feedback, and track your progress. Unlock premium features for unlimited mock interviews, advanced analytics, and more.
              </p>
              <div className="flex justify-center md:justify-start">
                <SignUpButton mode="modal">
                  <button className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-[#6c47ff] text-white font-bold text-base sm:text-lg shadow hover:bg-[#4f2fcf] transition w-full sm:w-auto">
                    Get Started Free
                  </button>
                </SignUpButton>
              </div>
            </div>
            <div className="flex-1 flex justify-center items-center mt-8 md:mt-0 w-full md:w-auto">
              <img src={heroImg} alt="AI Interview Prep" className="w-full max-w-xs sm:max-w-md rounded-2xl shadow-xl" />
            </div>
          </section>

           {/* Key Features Section - Enhanced for Eye Catching UX */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#6c47ff] mb-6 sm:mb-10">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 sm:gap-x-10 gap-y-6 sm:gap-y-10 justify-items-center">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-start hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out min-w-[260px] min-h-[180px]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#6c47ff] text-3xl"><i className="fa-solid fa-file-shield"></i></span>
                    <span className="font-bold text-xl text-gray-900">AI Role Fit Analysis</span>
                  </div>
                  <p className="text-gray-700 text-base">Upload your CV and Job Description to instantly see your match score, missing skills, and personalized improvement tips.</p>
                </div>
                {/* <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-start hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out min-w-[260px] min-h-[180px]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#6c47ff] text-3xl"><i className="fa-solid fa-video"></i></span>
                    <span className="font-bold text-xl text-gray-900">Video AI Feedback</span>
                  </div>
                  <p className="text-gray-700 text-base">Get real-time feedback on eye contact, smiling, voice modulation, and filler words via your webcam. Instantly view improvement tips.</p>
                </div> */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-start hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out min-w-[260px] min-h-[180px]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#6c47ff] text-3xl"><i className="fa-solid fa-boxes-stacked"></i></span>
                    <span className="font-bold text-xl text-gray-900">Industry-Specific Packs</span>
                  </div>
                  <p className="text-gray-700 text-base">Practice with domain-tailored packs for Tech, Sales, Consulting, Data Science, BFSI, and more.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-start hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out min-w-[260px] min-h-[180px]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#6c47ff] text-3xl"><i className="fa-solid fa-microphone-lines"></i></span>
                    <span className="font-bold text-xl text-gray-900">Voice-to-Text Comparison</span>
                  </div>
                  <p className="text-gray-700 text-base">Record your answers, auto-transcribe, and compare with ideal responses. Instantly spot missed keywords.</p>
                </div>
              </div>
            </section>

            {/* Industry Packs Section */}
            <section id="packs" className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#6c47ff] mb-6 sm:mb-10">Industry Packs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 sm:gap-x-10 gap-y-6 sm:gap-y-10 justify-items-center">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-center min-w-[240px] min-h-[170px] hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out">
                  <span className="text-[#6c47ff] text-5xl mb-4"><i className="fa-solid fa-laptop-code"></i></span>
                  <span className="font-bold text-2xl text-gray-900 mb-2">Tech</span>
                  <span className="text-gray-700 text-base text-center">Coding, system design & technical interviews</span>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-center min-w-[240px] min-h-[170px] hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out">
                  <span className="text-[#6c47ff] text-5xl mb-4"><i className="fa-solid fa-chart-line"></i></span>
                  <span className="font-bold text-2xl text-gray-900 mb-2">Sales</span>
                  <span className="text-gray-700 text-base text-center">Pitching, negotiation & closing skills</span>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-center min-w-[240px] min-h-[170px] hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out">
                  <span className="text-[#6c47ff] text-5xl mb-4"><i className="fa-regular fa-lightbulb"></i></span>
                  <span className="font-bold text-2xl text-gray-900 mb-2">Consulting</span>
                  <span className="text-gray-700 text-base text-center">Case, estimation, and behavioral rounds</span>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-center min-w-[240px] min-h-[170px] hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out">
                  <span className="text-[#6c47ff] text-5xl mb-4"><i className="fa-solid fa-database"></i></span>
                  <span className="font-bold text-2xl text-gray-900 mb-2">Data Science</span>
                  <span className="text-gray-700 text-base text-center">Analytics & ML interview prep</span>
                </div>
              </div>
              <div className="flex justify-center mt-6 sm:mt-10 flex-wrap gap-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 flex flex-col items-center min-w-[240px] min-h-[170px] hover:scale-105 hover:shadow-2xl transition-all duration-200 ease-in-out">
                  <span className="text-[#6c47ff] text-5xl mb-4"><i className="fa-solid fa-building-columns"></i></span>
                  <span className="font-bold text-2xl text-gray-900 mb-2">BFSI</span>
                  <span className="text-gray-700 text-base text-center">Banking, finance, and insurance focus</span>
                </div>
              </div>
            </section>

          {/* Features Section
          <section className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
              <span className="text-4xl text-[#6c47ff] mb-4">🤖</span>
              <h3 className="font-bold text-xl mb-2">AI-Powered Mock Interviews</h3>
              <p className="text-gray-600">Get realistic interview questions tailored to your job role and experience level.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
              <span className="text-4xl text-[#6c47ff] mb-4">📊</span>
              <h3 className="font-bold text-xl mb-2">Instant Feedback & Analytics</h3>
              <p className="text-gray-600">Receive actionable feedback and track your improvement over time.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center">
              <span className="text-4xl text-[#6c47ff] mb-4">🔒</span>
              <h3 className="font-bold text-xl mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your data and interview results are encrypted and never shared.</p>
            </div>
          </section> */}

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-[#6c47ff] mb-4 sm:mb-6 text-center">Frequently Asked Questions</h2>
            <details className="mb-4 bg-white rounded-xl shadow p-6 group cursor-pointer">
              <summary className="font-semibold text-lg text-gray-900 flex justify-between items-center cursor-pointer select-none">
                <span>Can I try it for free before subscribing?</span>
                <svg className="w-6 h-6 text-[#6c47ff] ml-2 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="mt-3 text-gray-700 text-base leading-relaxed">
                Absolutely! You can start with a free trial and unlock premium features anytime.
              </div>
            </details>
            <details className="mb-4 bg-white rounded-xl shadow p-6 group cursor-pointer">
              <summary className="font-semibold text-lg text-gray-900 flex justify-between items-center cursor-pointer select-none">
                <span>Is my data and video feedback secure?</span>
                <svg className="w-6 h-6 text-[#6c47ff] ml-2 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="mt-3 text-gray-700 text-base leading-relaxed">
                Yes, your data is encrypted and stored securely. We never share your information without your consent.
              </div>
            </details>
            <details className="mb-4 bg-white rounded-xl shadow p-6 group cursor-pointer">
              <summary className="font-semibold text-lg text-gray-900 flex justify-between items-center cursor-pointer select-none">
                <span>What makes the premium plan different?</span>
                <svg className="w-6 h-6 text-[#6c47ff] ml-2 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="mt-3 text-gray-700 text-base leading-relaxed">
                Premium users get unlimited interviews, advanced analytics, downloadable reports, and priority support.
              </div>
            </details>
          </section>

          {/* Call to Action */}
          <section className="py-5 bg-[#6c47ff] text-white text-center px-2 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Ready to ace your next interview?</h2>
            <a href="/signup" className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white text-[#6c47ff] font-bold text-base sm:text-lg shadow hover:bg-[#f3f0ff] transition w-full sm:w-auto">Start Practicing Free</a>
          </section>

          {/* Footer */}
          <footer className="w-full flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 py-4 bg-white border-t border-gray-200 text-xs sm:text-sm mt-auto gap-2">
            <div className="flex items-center gap-2">
              {/* <img src={logo} alt="Logo" className="h-6 w-auto bg-white p-1" style={{ borderRadius: 0 }} /> */}
              <span className="font-bold text-[#6c47ff]">© {new Date().getFullYear()} AI Interview Prep</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#6c47ff]" aria-label="LinkedIn"><i className="fa-brands fa-linkedin text-lg"></i></a>
              <a href="#" className="text-gray-400 hover:text-[#6c47ff]" aria-label="Twitter"><i className="fa-brands fa-twitter text-lg"></i></a>
            </div>
          </footer>
        </div>
      </SignedOut>
    </>
  );
};

export default LandingPage;