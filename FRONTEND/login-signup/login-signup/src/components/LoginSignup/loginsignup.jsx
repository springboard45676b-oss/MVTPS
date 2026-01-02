
// src/components/LoginSignup/loginsignup.jsx - FIXED VERSION

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';
import { saveTokens } from '../../utils/api';
const LoginSignup = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupRole, setSignupRole] = useState('Operator');

  const [LoginMessage, setLoginMessage] = useState('');
  const [SignupMessage, setSignupMessage] = useState('');

  const roleOptions = ['Operator', 'Analyst', 'Admin'];

  const clearMessage = (setter, ms = 3000) => {
    setTimeout(() => setter(''), ms);
  };

  const redirectToRolePage = (role) => {
    const roleRoutes = {
      operator: '/operator',
      admin: '/admin',
      analyst: '/analyst',
    };
    const route = roleRoutes[role] || '/home';
    navigate(route);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const resp = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await resp.json();
      console.log('✅ Full login response:', data);

      if (!resp.ok) {
        // Handle error responses
        let errorMessage = 'Login failed';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'object') {
          const errors = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = errors || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setLoginMessage(errorMessage);
        clearMessage(setLoginMessage);
        return;
      }

      // ✅ FIXED: Handle multiple response formats safely
      let accessToken = null;
      let refreshToken = null;
      let username = null;
      let role = null;

      // Try to extract tokens (handle both formats)
      if (data.tokens) {
        accessToken = data.tokens.access;
        refreshToken = data.tokens.refresh;
      } else if (data.token) {
        accessToken = data.token; // Old format
      }

      // Try to extract user info (handle multiple formats)
      if (data.user) {
        username = data.user.username;
        role = data.user.role || data.role;
      } else {
        username = data.username || loginEmail.split('@')[0];
        role = data.role;
      }

      // Default role if not provided
      role = role || 'operator';

      console.log('📦 Extracted data:', { accessToken: accessToken ? '✓' : '✗', refreshToken: refreshToken ? '✓' : '✗', username, role });

      // Save tokens to localStorage
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('jwt', accessToken); // Keep for backward compatibility
      }
      
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      
      // Save user info
      localStorage.setItem('user_role', role.toLowerCase());
      localStorage.setItem('username', username);
      localStorage.setItem('email', loginEmail);
      

      setLoginMessage(data.message || 'Login successful. Redirecting...');
      console.log('✅ Login successful! User:', username, 'Role:', role);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        redirectToRolePage(role);
      }, 1500);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginMessage('Network error: ' + error.message);
      clearMessage(setLoginMessage);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupPassword !== signupConfirm) {
      setSignupMessage('Passwords do not match');
      clearMessage(setSignupMessage);
      return;
    }

    const roleMap = {
      Operator: 'operator',
      Analyst: 'analyst',
      Admin: 'admin',
    };

    try {
      const resp = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
          password2: signupConfirm,
          role: roleMap[signupRole],
        }),
      });

      const data = await resp.json();
      console.log('✅ Signup response:', data);

      if (!resp.ok) {
        let errorMessage = 'Registration failed';
        
        if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'object') {
          const errors = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = errors || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setSignupMessage(errorMessage);
        clearMessage(setSignupMessage);
        return;
      }

      setSignupMessage(data.message || 'Registration successful! Please log in.');
      
      // Clear form
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirm('');
      setSignupRole('Operator');

      // Switch to login after 2 seconds
      setTimeout(() => {
        setIsLogin(true);
        setSignupMessage('');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Signup error:', err);
      setSignupMessage('Network error: ' + err.message);
      clearMessage(setSignupMessage);
    }
  };

  const isErrorMessage = (msg) => /error|failed|invalid|network|required/i.test(msg || '');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 font-inter bg-[linear-gradient(180deg,#001219,#005f73,#0a9396)]">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-5 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Welcome to MVTPS</h1>
            <p className="text-sm text-gray-500 mt-1">Login or create an account to continue</p>

            <div className="mt-4 bg-gray-100 rounded-lg p-1 w-full flex gap-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition ${
                  isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition ${
                  !isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">Login to your account</h2>

                {LoginMessage && (
                  <p className={`text-sm p-3 rounded ${
                    isErrorMessage(LoginMessage) 
                      ? 'bg-red-100 text-red-700 border border-red-300' 
                      : 'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                    {LoginMessage}
                  </p>
                )}

                <label className="flex items-center gap-3 border rounded-lg px-3 py-2">
                  <img src={email_icon} alt="email" className="w-5 h-5 opacity-80" />
                  <input
                    className="w-full outline-none text-gray-700 bg-transparent"
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="flex items-center gap-3 border rounded-lg px-3 py-2">
                  <img src={password_icon} alt="password" className="w-5 h-5 opacity-80" />
                  <input
                    className="w-full outline-none text-gray-700 bg-transparent"
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                >
                  Login
                </button>

                <p className="text-sm text-center text-gray-600">
                  Not a member?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLogin(false);
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Sign Up
                  </a>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">Create your account</h2>

                {SignupMessage && (
                  <p className={`text-sm p-3 rounded ${
                    isErrorMessage(SignupMessage) 
                      ? 'bg-red-100 text-red-700 border border-red-300' 
                      : 'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                    {SignupMessage}
                  </p>
                )}

                <label className="flex items-center gap-3 border rounded-lg px-3 py-2">
                  <img src={user_icon} alt="user" className="w-5 h-5 opacity-80" />
                  <input
                    className="w-full outline-none text-gray-700 bg-transparent"
                    type="text"
                    placeholder="Username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                  />
                </label>

                <label className="flex items-center gap-3 border rounded-lg px-3 py-2">
                  <img src={email_icon} alt="email" className="w-5 h-5 opacity-80" />
                  <input
                    className="w-full outline-none text-gray-700 bg-transparent"
                    type="email"
                    placeholder="Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="flex items-center gap-3 border rounded-lg px-3 py-2">
                  <img src={password_icon} alt="password" className="w-5 h-5 opacity-80" />
                  <input
                    className="w-full outline-none text-gray-700 bg-transparent"
                    type="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </label>

                <label className="flex items-center gap-3 border rounded-lg px-3 py-2">
                  <img src={password_icon} alt="confirm" className="w-5 h-5 opacity-80" />
                  <input
                    className="w-full outline-none text-gray-700 bg-transparent"
                    type="password"
                    placeholder="Confirm Password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    required
                  />
                </label>

                <label className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2">
                  <span className="text-gray-700 font-medium">Role</span>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className="bg-transparent outline-none text-gray-700"
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                >
                  Sign Up
                </button>

                <p className="text-sm text-center text-gray-600">
                  Already have an account?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLogin(true);
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Login
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-white/80 mt-4 font-semibold tracking-wide">
          By continuing you agree to our terms and privacy.
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;