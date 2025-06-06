import React, { useState, useEffect } from 'react';
import { useUser, useAuth, useClerk, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import InvoiceViewer from '../components/InvoiceViewer';
import PastInterviewsSettings from '../components/PastInterviewsSettings';
import axios from 'axios';

const Settings = () => {
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const { signOut, openUserProfileModal, openUserProfileDeleteModal, openUserProfilePasswordModal } = useClerk();
  const [plan, setPlan] = useState('Free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!isSignedIn || !user) return;
      setLoading(true);
      try {
        const token = await getToken();
        const res = await axios.get('/api/user/plan', {
          params: { clerkUserId: user.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlan(res.data.plan || 'Free');
      } catch {
        setPlan('Free');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [isSignedIn, user, getToken]);

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-12 py-5 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/vite.svg" alt="logo" className="h-7 w-7 cursor-pointer" onClick={() => window.location.href = '/dashboard'} />
          <span className="text-2xl font-extrabold text-[#6c47ff] tracking-tight cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
            AI Interview Prep
          </span>
        </div>
        <div className="flex items-center gap-8">
          <a href="/dashboard" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">Dashboard</a>
          <a href="/upgrade" className="text-base font-medium text-gray-800 hover:text-[#6c47ff] transition">Upgrade</a>
          <a href="/settings" className="text-base font-medium text-[#6c47ff] font-bold transition">Settings</a>
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
      <div className="flex flex-col items-center px-4 pt-12 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-[#6c47ff] mb-2 text-center">Account Settings</h2>
          <p className="text-gray-600 mb-8 text-center">Manage your profile, subscription, and billing</p>
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f7f7fb] rounded-xl p-8 border border-gray-100 items-center">
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-gray-800 mb-1">Name</span>
                <span className="text-lg text-gray-900 break-words">{user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-gray-800 mb-1">Email</span>
                <span className="text-lg text-gray-900 break-words">{user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress}</span>
              </div>
              <div className="flex flex-col gap-2 items-start md:items-end">
                <span className="font-semibold text-gray-800 mb-1">Plan</span>
                <span className={plan === 'Premium' ? 'text-green-600 font-bold text-lg' : 'text-gray-700 text-lg'}>{loading ? 'Loading...' : plan}</span>
                {plan === 'Free' && (
                  <a href="/upgrade" className="mt-2 px-4 py-2 rounded bg-[#6c47ff] text-white text-base font-semibold shadow hover:bg-[#4f2fcf] transition whitespace-nowrap">Upgrade</a>
                )}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <h3 className="font-semibold text-lg mb-3 text-[#6c47ff]">Billing History</h3>
            <div className="bg-[#f7f7fb] rounded-xl p-5 border border-gray-100">
              <InvoiceViewer />
            </div>
          </div>
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-3 text-[#6c47ff]">Your Past Interviews</h3>
            <div className="bg-white rounded-2xl shadow-xl p-0 w-full max-w-2xl text-center mx-auto">
              <PastInterviewsSettings />
            </div>
          </div>
          <div className="flex flex-col gap-3 bg-[#f7f7fb] rounded-xl p-5 border border-gray-100">
            <h3 className="font-semibold text-lg mb-3 text-[#6c47ff]">Account Actions</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => openUserProfileModal()} className="w-full py-2 rounded-lg bg-[#f3f0ff] text-[#6c47ff] font-semibold shadow hover:bg-[#e0d7ff] transition">Manage Profile</button>
              <button onClick={() => openUserProfilePasswordModal()} className="w-full py-2 rounded-lg bg-[#f3f0ff] text-[#6c47ff] font-semibold shadow hover:bg-[#e0d7ff] transition">Change Password</button>
              <button onClick={() => openUserProfileDeleteModal()} className="w-full py-2 rounded-lg bg-red-50 text-red-600 font-semibold shadow hover:bg-red-100 transition">Delete Account</button>
              <button onClick={() => signOut()} className="w-full py-2 rounded-lg border border-[#6c47ff] text-[#6c47ff] font-semibold shadow hover:bg-[#f3f0ff] transition">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
