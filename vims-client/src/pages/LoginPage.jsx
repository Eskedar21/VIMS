import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest, verifyMachine } from '../api/authApi.js';

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'AM', label: 'አማርኛ' },
  { code: 'OR', label: 'Oromiffa' },
  { code: 'SO', label: 'Somali' },
  { code: 'TI', label: 'ትግርኛ' },
];
const MACHINE_PROFILE = {
  deviceName: 'Station A — Lane 03',
  macAddress: '00:1B:44:11:3A:B7',
  certificateSerial: 'ETH-TEL-2025-INSPECT',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handshakeState, setHandshakeState] = useState('idle');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    setIsSubmitting(true);
    setHandshakeState('verifying');

    try {
      const machineResponse = await verifyMachine({
        macAddress: MACHINE_PROFILE.macAddress,
        certificateSerial: MACHINE_PROFILE.certificateSerial,
      });

      if (!machineResponse.trusted) {
        setHandshakeState('denied');
        const err = new Error(
          'Machine ID not recognized. Please contact the VIMS security administrator.',
        );
        err.code = 'UNTRUSTED_MACHINE';
        throw err;
      }

      setHandshakeState('trusted');

      await loginRequest({
        username,
        password,
        machineId: machineResponse.machineId,
      });

      navigate('/dashboard');
    } catch (err) {
      const message =
        err?.message ||
        'Unable to sign in. Please verify your credentials and machine trust status.';
      setError(message);
      if (err?.code !== 'UNTRUSTED_MACHINE') {
        setHandshakeState((prev) => (prev === 'verifying' ? 'trusted' : prev));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handshakeMessage = useMemo(() => {
    switch (handshakeState) {
      case 'verifying':
        return {
          label: 'Verifying Machine Security…',
          description: 'Mutual certificate handshake in progress.',
          tone: 'text-yellow-700 bg-yellow-50 border-yellow-100',
          spinner: true,
        };
      case 'trusted':
        return {
          label: 'Trusted Machine Verified',
          description: 'Hardware certificate and MAC address matched.',
          tone: 'text-[#00652E] bg-green-50 border-green-100',
        };
      case 'denied':
        return {
          label: 'Access Denied — Untrusted Hardware',
          description: 'Machine MAC address not listed.',
          tone: 'text-red-700 bg-red-50 border-red-100',
        };
      default:
        return null;
    }
  }, [handshakeState]);

  const selectedLangLabel = LANGUAGES.find((l) => l.code === selectedLang)?.label || 'English';

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      {/* Language selector dropdown */}
      <div className="absolute top-6 right-8">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:bg-gray-50 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M2 12h20M12 2c2.5 2.5 4 5.5 4 10s-1.5 7.5-4 10c-2.5-2.5-4-5.5-4-10s1.5-7.5 4-10z" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{selectedLangLabel}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {langDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    lang.code === selectedLang ? 'text-[#009639] font-semibold' : 'text-gray-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-[#009639] tracking-tight">VIS</h1>
          <p className="text-xs text-gray-500 mt-1">
            powered by <span className="font-semibold text-[#009639]">Ethiotelecom</span>
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1.5 block">Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Inspector ID / username"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#009639] focus:ring-[#009639]/30 focus:ring-2 outline-none text-gray-800 transition"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1.5 block">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#009639] focus:ring-[#009639]/30 focus:ring-2 outline-none text-gray-800 transition"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 h-12 rounded-xl bg-[#009639] text-white font-semibold shadow-lg shadow-[#009639]/20 hover:bg-[#007c2d] disabled:opacity-70 disabled:cursor-not-allowed transition-transform active:scale-[0.98]"
            >
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>
          </div>
        </form>

        {handshakeMessage && (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm flex items-start space-x-3 ${handshakeMessage.tone}`}
          >
            <div className="mt-0.5">
              {handshakeMessage.spinner ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full inline-block animate-spin" />
              ) : (
                <span className="w-3 h-3 rounded-full inline-block bg-current" />
              )}
            </div>
            <div>
              <p className="font-semibold">{handshakeMessage.label}</p>
              <p className="text-xs mt-1">{handshakeMessage.description}</p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Ethio Telecom
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
