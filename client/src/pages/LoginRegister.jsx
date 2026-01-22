import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom CSS to hide scrollbar but keep scroll functionality
const hideScrollbar = {
  scrollbarWidth: 'none',  /* Firefox */
  '&::-webkit-scrollbar': {
    display: 'none',  /* Chrome, Safari, Opera */
  },
  '&': {
    msOverflowStyle: 'none',  /* IE and Edge */
  }
};
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import {
  ShieldCheck,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Ship,
  Anchor,
  Loader2,
} from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

const ADMIN_EMAIL = "admin@vesselapp.com";
const ADMIN_PASSWORD = "admin123";

const LoginRegister = () => {
  const [authMode, setAuthMode] = useState("login");
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState("operator");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isAdminLogin =
    authMode === "login" &&
    formData.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    formData.password === ADMIN_PASSWORD;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setErrors({});
    setAuthError("");
    setShowSuccess(false);
  }, [authMode]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (authError) setAuthError("");
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    const nextErrors = {};
    const trimmed = {
      username: formData.username ? formData.username.trim() : '',
      email: formData.email ? formData.email.trim() : '',
      password: formData.password || '',
      confirmPassword: formData.confirmPassword || '',
    };

    if (authMode === 'register') {
      // Username validation
      if (!trimmed.username) {
        nextErrors.username = 'Username is required';
      } else if (trimmed.username.length < 3) {
        nextErrors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9@.+\-_]+$/.test(trimmed.username)) {
        nextErrors.username = 'Username can only contain letters, numbers, and @/./+/-/_';
      }

      // Email validation
      if (!trimmed.email) {
        nextErrors.email = 'Email is required';
      } else if (!validateEmail(trimmed.email)) {
        nextErrors.email = 'Please enter a valid email';
      }

      // Password validations
      if (!trimmed.password) {
        nextErrors.password = 'Password is required';
      } else if (trimmed.password.length < 8) {
        nextErrors.password = 'Password must be at least 8 characters';
      } else if (/^\d+$/.test(trimmed.password)) {
        nextErrors.password = 'Password cannot be all numbers';
      } else if (['password', '12345678', 'qwerty', 'letmein'].includes(trimmed.password.toLowerCase())) {
        nextErrors.password = 'Please choose a stronger password';
      }

      // Confirm password
      if (!trimmed.confirmPassword) {
        nextErrors.confirmPassword = 'Please confirm your password';
      } else if (trimmed.password !== trimmed.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Login validations - accept username or email
      if (!trimmed.username && !trimmed.email) {
        nextErrors.username = 'Username or email is required';
      }
      if (!trimmed.password) {
        nextErrors.password = 'Password is required';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Sync authMode with URL path
  useEffect(() => {
    if (location.pathname.includes("/register")) {
      setAuthMode("register");
    } else {
      setAuthMode("login");
    }
  }, [location.pathname]);

// In client/src/pages/LoginRegister.jsx - REPLACE the handleSubmit function with this:

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!validateForm()) {
    setIsSubmitting(false);
    return;
  }

  setIsSubmitting(true);
  setAuthError("");

  try {
    if (authMode === "register") {
      // Prepare registration data according to backend requirements
      const username = (formData.username || '').trim();
      const email = (formData.email || '').trim();
      
      // Double-check required fields
      if (!username) {
        setErrors(prev => ({ ...prev, username: 'Username is required' }));
        setAuthError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      if (!email) {
        setErrors(prev => ({ ...prev, email: 'Email is required' }));
        setAuthError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      const registrationData = {
        username: username,
        email: email,
        password: formData.password,
        password2: formData.confirmPassword,
        role: selectedRole,
      };
      
      console.log('Form Data:', formData);
      console.log('Registration payload:', registrationData);
      
      // Handle registration
      const response = await authAPI.register(registrationData);
      
      const roleText = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
      setSuccessMessage(`Account created successfully as ${roleText}.`);

      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      // Handle login - use username or email
      const loginIdentifier = formData.username.trim() || formData.email.trim();
      
      // ========== IMPORTANT: SEND SELECTED ROLE FOR VALIDATION ==========
      const response = await authAPI.login({
        username: loginIdentifier,
        password: formData.password,
        selected_role: selectedRole  // SEND THE SELECTED ROLE
      });
      
      const user = response.user;
      const role = user.role || 'operator';
      const roleText = role.charAt(0).toUpperCase() + role.slice(1);
      
      setSuccessMessage(`${roleText} login successful.`);
      
      // Redirect based on user role
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'analyst') {
          navigate('/analyst/dashboard');
        } else {
          navigate('/operator/dashboard');
        }
      }, 1500);
    }
    
    setShowSuccess(true);
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle validation errors from backend
    let errorMessage = 'An error occurred during authentication. Please try again.';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle field-specific validation errors
      if (typeof errorData === 'object') {
        // Handle non_field_errors specially
        if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
        }
        // Handle selected_role errors (role mismatch)
        else if (errorData.selected_role) {
          errorMessage = Array.isArray(errorData.selected_role)
            ? errorData.selected_role[0]
            : errorData.selected_role;
        }
        // Handle other field errors
        else {
          const fieldErrors = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              fieldErrors.push(messages.join(', '));
            } else if (typeof messages === 'string') {
              fieldErrors.push(messages);
            }
          }
          
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(' | ');
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setAuthError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const getRoleConfig = () => {
    const configs = {
      operator: {
        icon: Briefcase,
        gradient: "from-blue-500 to-cyan-600",
        bgGradient: "bg-sky-400/20 dark:bg-sky-500/10",
        title: "Operator Login",
        subtitle: "Sign in with your operator account.",
        headerTitle: "Operator Login",
        headerSubtitle: "Manage operations efficiently.",
        registerTitle: "Register as Operator",
        registerSubtitle: "Join as an operator and manage vessel operations.",
      },
      analyst: {
        icon: TrendingUp,
        gradient: "from-emerald-500 to-teal-600",
        bgGradient: "bg-emerald-400/20 dark:bg-emerald-500/10",
        title: "Analyst Login",
        subtitle: "Sign in with your analyst account.",
        headerTitle: "Analyst Login",
        headerSubtitle: "Analyze and generate insights.",
        registerTitle: "Register as Analyst",
        registerSubtitle: "Join as an analyst and generate valuable insights.",
      },
      admin: {
        icon: ShieldCheck,
        gradient: "from-indigo-500 to-purple-600",
        bgGradient: "bg-purple-400/20 dark:bg-purple-600/10",
        title: "Admin Login",
        subtitle: "Sign in with admin email and password.",
        headerTitle: "Admin Login",
        headerSubtitle: "Administrative access.",
        registerTitle: "Register as Admin",
        registerSubtitle: "Join as an administrator and manage the system.",
      },
    };

    if (authMode === "login" && isAdminLogin) {
      return configs.admin;
    }
    return configs[selectedRole] || configs.operator;
  };

  const roleConfig = getRoleConfig();
  const PrimaryIcon = roleConfig.icon;

  const renderTextInput = ({ id, label, placeholder, icon: Icon, type = "text" }) => (
    <label className="block space-y-1" key={id}>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Icon className="w-4 h-4" />
        </span>
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          name={id}
          value={formData[id] || ''}
          onChange={handleInput}
          placeholder={placeholder}
          className={`w-full rounded-2xl border bg-white/80 dark:bg-slate-900/80 py-3 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner transition focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 ${
            errors[id] ? "border-red-400 focus:ring-red-500" : "border-transparent"
          }`}
          disabled={isSubmitting}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={isSubmitting}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {errors[id] && <span className="text-xs text-red-500">{errors[id]}</span>}
    </label>
  );

  const modeFields = [
    authMode === "register"
      ? renderTextInput({
          id: "username",
          label: "Username",
          placeholder: "Enter a unique username",
          icon: User,
        })
      : renderTextInput({
          id: "username",
          label: "Username or Email",
          placeholder: "Enter username or email",
          icon: User,
        }),
    authMode === "register"
      ? renderTextInput({
          id: "email",
          label: "Email",
          placeholder: "user@example.com",
          icon: Mail,
          type: "email",
        })
      : null,
    renderTextInput({
      id: "password",
      label: "Password",
      placeholder: "Enter your password",
      icon: Lock,
      type: "password",
    }),
    authMode === "register"
      ? renderTextInput({
          id: "confirmPassword",
          label: "Confirm Password",
          placeholder: "Confirm your password",
          icon: Lock,
          type: "password",
        })
      : null,
  ].filter(Boolean);

  return (
    <div
      className={`relative flex min-h-screen w-full overflow-hidden transition-colors duration-500 ${
        darkMode ? "dark bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Dark Mode Toggle - Top Right Corner */}
      <div className="absolute top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      {/* Left Side - Map Section */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a1428 0%, #1a3a52 25%, #0f5a6f 50%, #1a3a52 75%, #0a1428 100%)'
      }}>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Top glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full blur-3xl"
          ></motion.div>
          
          {/* Bottom glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl"
          ></motion.div>

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
              className="absolute w-1 h-1 bg-cyan-300 rounded-full blur-sm"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                opacity: 0.4 - i * 0.05
              }}
            ></motion.div>
          ))}

          {/* Grid background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.1) 25%, rgba(99, 102, 241, 0.1) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.1) 75%, rgba(99, 102, 241, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.1) 25%, rgba(99, 102, 241, 0.1) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.1) 75%, rgba(99, 102, 241, 0.1) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* India Map Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-center p-6"
        >
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              opacity: [1, 0.95, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2 tracking-widest">M V T P S</h1>
            <p className="text-cyan-200/80">Maritime Vessel Tracking & Port Safety</p>
          </motion.div>

          {/* Map representation */}
          <svg viewBox="0 0 400 500" className="w-full h-auto max-h-[450px] mb-8 drop-shadow-lg">
            {/* Sea background with glow */}
            <defs>
              <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#0369a1", stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 0.6 }} />
              </linearGradient>
              <radialGradient id="shipGlow1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: "#3b82f6", stopOpacity: 0 }} />
              </radialGradient>
              <radialGradient id="shipGlow2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: "#10b981", stopOpacity: 0 }} />
              </radialGradient>
              <radialGradient id="shipGlow3" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{ stopColor: "#f59e0b", stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: "#f59e0b", stopOpacity: 0 }} />
              </radialGradient>
            </defs>

            <rect width="400" height="500" fill="url(#seaGradient)" />

            {/* India coast with glow */}
            <defs>
              <filter id="coastGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 100 60 L 140 75 L 165 110 L 180 150 L 175 190 L 195 250 L 188 310 L 155 370 L 115 400 L 80 388 L 70 320 L 75 260 L 62 200 L 68 140 L 85 80 Z"
              fill="#10b981"
              opacity="0.8"
              stroke="#34d399"
              strokeWidth="2"
              filter="url(#coastGlow)"
            />

            {/* Vessels/Ships with glow effects */}
            <g>
              {/* Ship 1 - Blue - Active Project */}
              <motion.g
                animate={{ x: [0, 25, 0], y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <circle cx="220" cy="140" r="12" fill="url(#shipGlow1)" opacity="0.6" />
                {/* Ship body */}
                <rect x="215" y="135" width="10" height="8" fill="#3b82f6" rx="2" />
                {/* Ship sail/mast */}
                <line x1="220" y1="132" x2="220" y2="125" stroke="#60a5fa" strokeWidth="1.5" />
                <polygon points="220,125 218,130 222,130" fill="#60a5fa" />
                <text x="220" y="165" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">Proj 1</text>
              </motion.g>

              {/* Ship 2 - Green - Monitored Vessel */}
              <motion.g
                animate={{ x: [0, -20, 0], y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              >
                <circle cx="300" cy="230" r="12" fill="url(#shipGlow2)" opacity="0.6" />
                {/* Ship body */}
                <rect x="295" y="225" width="10" height="8" fill="#10b981" rx="2" />
                {/* Ship sail/mast */}
                <line x1="300" y1="222" x2="300" y2="215" stroke="#6ee7b7" strokeWidth="1.5" />
                <polygon points="300,215 298,220 302,220" fill="#6ee7b7" />
                <text x="300" y="255" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="bold">Proj 2</text>
              </motion.g>

              {/* Ship 3 - Orange - Cargo Ship */}
              <motion.g
                animate={{ x: [0, 28, 0], y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
              >
                <circle cx="260" cy="360" r="12" fill="url(#shipGlow3)" opacity="0.6" />
                {/* Ship body */}
                <rect x="255" y="355" width="10" height="8" fill="#f59e0b" rx="2" />
                {/* Ship sail/mast */}
                <line x1="260" y1="352" x2="260" y2="345" stroke="#fbbf24" strokeWidth="1.5" />
                <polygon points="260,345 258,350 262,350" fill="#fbbf24" />
                <text x="260" y="385" textAnchor="middle" fill="#fcd34d" fontSize="11" fontWeight="bold">Proj 3</text>
              </motion.g>

              {/* Port 1 - Western Coast */}
              <motion.g
                animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.6, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <rect x="75" y="146" width="10" height="10" fill="none" stroke="#06b6d4" strokeWidth="2" rx="2" />
                <circle cx="80" cy="151" r="1.5" fill="#06b6d4" />
                <text x="80" y="175" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">Port-W</text>
              </motion.g>

              {/* Port 2 - Southern Coast */}
              <motion.g
                animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.6, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <rect x="148" y="366" width="10" height="10" fill="none" stroke="#06b6d4" strokeWidth="2" rx="2" />
                <circle cx="153" cy="371" r="1.5" fill="#06b6d4" />
                <text x="153" y="395" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">Port-S</text>
              </motion.g>
            </g>

            {/* Animated depth lines */}
            <motion.line 
              x1="0" y1="250" x2="400" y2="250" 
              stroke="#06b6d4" 
              strokeWidth="1" 
              opacity="0.15" 
              strokeDasharray="10,5"
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <line x1="200" y1="0" x2="200" y2="500" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.1" strokeDasharray="5,5" />
          </svg>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30 shadow-lg w-full max-w-sm"
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shrink-0"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                ></motion.div>
                <span className="text-cyan-200">Active Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shrink-0"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                ></motion.div>
                <span className="text-cyan-200">Monitored Vessels</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shrink-0"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                ></motion.div>
                <span className="text-cyan-200">Cargo Ships</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-3 h-3 border-2 border-cyan-400 shrink-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity }}
                ></motion.div>
                <span className="text-cyan-200">Port Locations</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <motion.section
            layout
            className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80"
          >
            <motion.div
              className={`absolute inset-x-16 top-0 h-40 rounded-b-[40%] bg-linear-to-r ${roleConfig.gradient} opacity-20 blur-2xl`}
              layout
            />

            <div className="relative z-10 space-y-4">
              <motion.div
                layout
                className="flex items-center gap-3"
              >
                <span className="rounded-2xl bg-slate-900/5 p-3 text-slate-600 dark:bg-white/5 dark:text-white">
                  <PrimaryIcon className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Secure Access</p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {authMode === "register" ? roleConfig.registerTitle : roleConfig.headerTitle}
                  </h2>
                </div>
              </motion.div>

              <motion.p
                layout
                className="text-sm text-slate-500 dark:text-slate-300"
              >
                {authMode === "register" ? roleConfig.registerSubtitle : roleConfig.headerSubtitle}
              </motion.p>

              <div className="flex gap-2 rounded-2xl border border-slate-100 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    navigate("/login");
                  }}
                  className={`flex-1 rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                    authMode === "login"
                      ? "bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                  disabled={isSubmitting}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    navigate("/register");
                  }}
                  className={`flex-1 rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                    authMode === "register"
                      ? "bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                  disabled={isSubmitting}
                >
                  Register
                </button>
              </div>

              {authMode === "register" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Select Role</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "operator", label: "Operator", icon: Briefcase },
                      { id: "analyst", label: "Analyst", icon: TrendingUp },
                      { id: "admin", label: "Admin", icon: ShieldCheck },
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        disabled={isSubmitting}
                        className={`flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                          selectedRole === role.id
                            ? "bg-blue-500 text-white shadow-lg"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <role.icon className="w-4 h-4" />
                        {role.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {authMode === "login" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Login As</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "operator", label: "Operator", icon: Briefcase },
                      { id: "analyst", label: "Analyst", icon: TrendingUp },
                      { id: "admin", label: "Admin", icon: ShieldCheck },
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        disabled={isSubmitting}
                        className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                          (selectedRole === role.id || (role.id === "admin" && isAdminLogin))
                            ? "bg-blue-500 text-white shadow-lg"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <role.icon className="w-3 h-3" />
                        <span className="leading-tight">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-red-200 bg-red-100/50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
                >
                  <p className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {authError}
                  </p>
                </motion.div>
              )}
<div className="max-h-[280px] overflow-y-auto pr-2 -mr-2" style={hideScrollbar}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={authMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3"
                  >
                    {modeFields}
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.form
                onSubmit={handleSubmit}
                className="pt-4"
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full overflow-hidden rounded-2xl bg-linear-to-r ${
                    roleConfig.gradient
                  } px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent"
                        />
                        {isSubmitting ? 'Processing...' : (authMode === "register" ? 'Create Account' : 'Login')}
                      </>
                    ) : (
                      <>
                        <PrimaryIcon className="w-4 h-4" />
                        {authMode === "register" ? "Create account" : "Login"}
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
                </button>
              </motion.form>

              {/* <motion.div
                layout
                className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
              >
                <p className="font-semibold text-slate-600 dark:text-white">Note</p>
                <p className="mt-1 text-xs">
                  {authMode === "register"
                    ? "Register as Operator or Analyst. Admin accounts cannot be registered."
                    : "Admin can log in using admin@vesselapp.com / admin123"}
                </p>
              </motion.div> */}
            </div>
          </motion.section>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-6 z-50 w-full max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-700 shadow-2xl backdrop-blur dark:border-emerald-500/40 dark:bg-slate-900/80 dark:text-emerald-200"
          >
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginRegister;