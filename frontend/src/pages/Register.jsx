import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    registrationNumber: '',
    department: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [batch, setBatch] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    // Auto-extract batch from registration number
    if (name === 'registrationNumber' && value.length >= 4) {
      setBatch(value.substring(0, 4));
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    // Role-specific validation
    if (formData.role === 'student' && !formData.registrationNumber) {
      setError('Registration number is required for students');
      return;
    }

    if (formData.role === 'student' && !/^\d{4}/.test(formData.registrationNumber)) {
      setError('Registration number must start with 4-digit year (e.g., 2021331008)');
      return;
    }

    if ((formData.role === 'student' || formData.role === 'teacher') && !formData.department) {
      setError('Department is required for students and teachers');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/send-otp', {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        registrationNumber: formData.role === 'student' ? formData.registrationNumber : undefined,
        department: formData.department,
        phone: formData.phone
      });

      setBatch(res.data.batch);
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp,
        password: formData.password
      });

      // Check if user needs admin approval
      if (res.data.requiresApproval) {
        alert('✅ Registration successful!\n\nYour account is pending admin approval. You will receive an email once approved.\n\nPlease login after approval.');
        navigate('/login');
      } else {
        // Auto-approved users get tokens and can login
        setUser(res.data);
        localStorage.setItem('hasAuth', 'true');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        registrationNumber: formData.role === 'student' ? formData.registrationNumber : undefined,
        department: formData.department,
        phone: formData.phone
      });

      startResendTimer();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🎓</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Join SUST Connect</h2>
          <p className="text-gray-600">SUST Student Community Platform</p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {step === 1 ? 'Step 1: Enter Details' : 'Step 2: Verify OTP'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="MD Sakin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="2021331008"
                  />
                  {batch && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      ✓ Batch: {batch}
                    </p>
                  )}
                </div>
              )}

              {formData.role !== 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="">Select Department</option>

                    {/* Engineering & Technology */}
                    <optgroup label="Engineering & Technology">
                      <option value="Architecture">Architecture</option>
                      <option value="CEP">Chemical Engineering & Polymer Science</option>
                      <option value="Civil">Civil & Environmental Engineering</option>
                      <option value="CSE">Computer Science & Engineering</option>
                      <option value="EEE">Electrical & Electronic Engineering</option>
                      <option value="FET">Food Engineering & Tea Technology</option>
                      <option value="IPE">Industrial & Production Engineering</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                      <option value="PME">Petroleum and Mining Engineering</option>
                      <option value="SWE">Software Engineering</option>
                    </optgroup>

                    {/* Life Sciences */}
                    <optgroup label="Life Sciences">
                      <option value="BMB">Biochemistry and Molecular Biology</option>
                      <option value="GEB">Genetic Engineering & Biotechnology</option>
                      <option value="Forestry">Forestry & Environmental Science</option>
                    </optgroup>

                    {/* Physical Sciences */}
                    <optgroup label="Physical Sciences">
                      <option value="Chemistry">Chemistry</option>
                      <option value="Geography">Geography and Environment</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Statistics">Statistics</option>
                      <option value="Oceanography">Oceanography</option>
                    </optgroup>

                    {/* Social Sciences */}
                    <optgroup label="Social Sciences">
                      <option value="Anthropology">Anthropology</option>
                      <option value="Bangla">Bangla</option>
                      <option value="Economics">Economics</option>
                      <option value="English">English</option>
                      <option value="Political">Political Studies</option>
                      <option value="PublicAdmin">Public Administration</option>
                      <option value="SocialWork">Social Work</option>
                      <option value="Sociology">Sociology</option>
                    </optgroup>

                    {/* Business Studies */}
                    <optgroup label="Business Studies">
                      <option value="BBA">Business Administration</option>
                    </optgroup>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="your@email.com"
                />
                {/* <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-1">📧 Email Requirements:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>✓ <strong>@student.sust.edu</strong> - Auto-approved after OTP</li>
                    <li>✓ <strong>@teacher.sust.edu</strong> - Auto-approved after OTP</li>
                    <li>⏳ <strong>Other emails</strong> - Requires admin approval after OTP</li>
                  </ul>
                </div> */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="01XXXXXXXXX"
                  pattern="[0-9]{11}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required - 11 digit Bangladeshi phone number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
              >
                {loading ? 'Sending OTP...' : 'Send OTP →'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-indigo-800">
                  📧 We've sent a 6-digit OTP to <strong>{formData.email}</strong>
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Check your inbox and spam folder
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP *
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Valid for 10 minutes</p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Verifying...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-800">
            <strong>🔒 Security Notice:</strong> Never share your OTP with anyone. SUST Connect will never ask for your OTP via phone or other means.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
