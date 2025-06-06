import React from 'react';
import { useUser } from '@clerk/clerk-react';

const InterviewSimulator = () => {
  const { user } = useUser();
  // Use backend plan for gating
  const plan = user?.publicMetadata?.plan || user?.plan || 'Free';

  return (
    <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Interview Simulator</h2>
      {plan === 'Premium' ? (
        <div>
          <p className="text-green-700 font-semibold mb-2">You have access to all premium features!</p>
          {/* Premium simulator features go here */}
          <div className="mt-4">[Premium Interview Simulator UI]</div>
        </div>
      ) : (
        <div>
          <p className="text-yellow-700 font-semibold mb-2">
            You are on the Free plan. Upgrade to unlock unlimited interviews and advanced features.
          </p>
          {/* Free simulator features go here */}
          <div className="mt-4">[Free Interview Simulator UI - limited features]</div>
        </div>
      )}
    </div>
  );
};

export default InterviewSimulator;
