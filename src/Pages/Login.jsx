import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb] px-2 sm:px-4">
    <SignIn routing="path" path="/signin" signUpUrl="/signup" />
  </div>
);

export default Login;
