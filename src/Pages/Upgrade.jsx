import React, { useState } from 'react';
import { useAuth, useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import SubscriptionPlan from '../components/SubscriptionPlan';
import logo from '../assets/logo.png';

const Upgrade = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [loading, setLoading] = useState(false);
  const isSuccess = new URLSearchParams(location.search).get('success') === '1';

  // Fetch current plan from backend
  React.useEffect(() => {
    const fetchPlan = async () => {
      if (!isSignedIn || !user) return;
      try {
        const token = await getToken();
        const res = await axios.get('/api/user/plan', {
          params: { clerkUserId: user.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentPlan(res.data.plan || 'Free');
      } catch {
        setCurrentPlan('Free');
      }
    };
    fetchPlan();
  }, [isSignedIn, user, getToken]);

  const handleUpgrade = async () => {
    if (!isSignedIn || !user) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.post('/api/stripe/create-checkout-session', {
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('Failed to start checkout.');
      }
    } catch (err) {
      alert('Stripe error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-20 flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 md:px-12 py-4 sm:py-5 bg-white shadow-sm gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          {/* <img src={logo} alt="logo" className="h-7 w-auto cursor-pointer" style={{ borderRadius: 0 }} onClick={() => window.location.href = '/dashboard'} /> */}
          <span className="text-2xl font-extrabold text-[#6c47ff] tracking-tight cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
            AI Interview Prep
          </span>
        </div>
        <div className="flex items-center gap-8">
          <a href="/dashboard" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">Dashboard</a>
          <a href="/upgrade" className="text-base font-bold text-[#6c47ff] transition">Upgrade</a>
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
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center px-2 sm:px-4 pt-10 sm:pt-20">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-xs sm:max-w-lg text-center mt-6 sm:mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#6c47ff] mb-2 sm:mb-4">Thank you for upgrading!</h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">You now have Premium access. Enjoy unlimited interviews and advanced features.</p>
            <button
              className="mt-2 sm:mt-4 px-4 sm:px-6 py-2 bg-[#6c47ff] text-white rounded-lg font-semibold shadow hover:bg-[#4f2fcf] transition w-full sm:w-auto"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center px-2 sm:px-4 pt-10 sm:pt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#6c47ff] mb-4 sm:mb-8">Choose Your Plan</h2>
          <div className="w-full flex flex-col items-center">
            <SubscriptionPlan currentPlan={currentPlan} onUpgrade={handleUpgrade} />
          </div>
          {loading && <div className="mt-2 sm:mt-4 text-[#6c47ff]">Redirecting to payment...</div>}
          {/* Removed Billing History from Upgrade page for professionalism and to avoid redundancy */}
        </div>
      )}
    </div>
  );
};

export default Upgrade;
