import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest, verifyMachine } from '../api/authApi.js';

const LANGUAGES = ['EN', 'AM', 'OR', 'SO', 'TI'];
const MACHINE_PROFILE = {
  deviceName: 'Station A — Lane 03',
  macAddress: '00:1B:44:11:3A:B7',
  certificateSerial: 'ETH-TEL-2025-INSPECT',
};
const TRUSTED_MACHINE_IDS = new Set(['00:1B:44:11:3A:B7', '00:1B:44:11:3A:B8']);

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('EN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handshakeState, setHandshakeState] = useState('idle'); // idle | verifying | trusted | denied

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
          description:
            'Mutual certificate handshake in progress (RFP Items 44 & 50).',
          tone: 'text-yellow-700 bg-yellow-50 border-yellow-100',
          spinner: true,
        };
      case 'trusted':
        return {
          label: 'Trusted Machine Verified',
          description:
            'Hardware certificate and MAC address matched central registry.',
          tone: 'text-[#00652E] bg-green-50 border-green-100',
        };
      case 'denied':
        return {
          label: 'Access Denied — Untrusted Hardware',
          description:
            'Machine MAC address not listed. Transmission blocked for safety.',
          tone: 'text-red-700 bg-red-50 border-red-100',
        };
      default:
        return {
          label: 'Ready for secure login',
          description: 'Device bound to Ethio Telecom PKI. Awaiting operator.',
          tone: 'text-gray-600 bg-gray-50 border-gray-100',
        };
    }
  }, [handshakeState]);

  return (
    <div className="min-h-full w-full bg-[#F4F7F5] flex items-center justify-center relative px-4 py-12">
      {/* Gradient halo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E0F2E7] via-transparent to-[#F7FBF9] pointer-events-none" />

      {/* Language selector + security badge */}
      <div className="absolute top-6 right-8 flex items-center space-x-4">
        <div className="flex rounded-full bg-white/90 border border-gray-200 shadow px-4 py-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelectedLang(lang)}
              className={`text-xs font-semibold tracking-wide px-2 transition ${
                lang === selectedLang
                  ? 'text-[#009639]'
                  : 'text-gray-500 hover:text-[#009639]'
              }`}
              aria-label={`Switch language to ${lang}`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div
          className="flex items-center space-x-2 bg-white/90 border border-gray-200 rounded-full px-3 py-1 shadow"
          title="Secure mutual TLS connection"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#00652E]"
            aria-hidden="true"
          >
            <rect
              x="7"
              y="11"
              width="10"
              height="7"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M9 11V8a3 3 0 1 1 6 0v3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-xs font-semibold text-gray-600">Secure</span>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-white/70 px-10 py-12">
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col items-center">
            <div className="w-24 h-12 bg-[#009639]/10 rounded-xl flex items-center justify-center text-[#009639] text-xs font-bold uppercase">
              Ethio Telecom
            </div>
            <span className="text-xs text-gray-500 mt-2 tracking-wide">
              Vehicle Inspection
            </span>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Kiosk
            </p>
            <p className="text-sm font-semibold text-[#00652E]">
              Multi-Lingual
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 text-xs font-semibold">
              Gov. Partner
            </div>
            <span className="text-xs text-gray-500 mt-2 tracking-wide">
              Transport Authority
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#009639] mb-2">
            Vehicle Inspection Login
          </h1>
          <p className="text-sm text-gray-500">
            Authenticate to access inspection, machine test, and payment
            consoles.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <label className="block">
            <span className="text-sm font-semibold text-[#00652E] mb-2 block">
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Inspector ID / username"
              className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-[#009639] focus:ring-[#009639]/30 focus:ring-2 outline-none text-gray-800 text-lg transition"
              inputMode="text"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#00652E] mb-2 block">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter secure PIN/password"
              className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-[#009639] focus:ring-[#009639]/30 focus:ring-2 outline-none text-gray-800 text-lg transition"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl bg-[#009639] text-white text-lg font-semibold tracking-wide shadow-lg shadow-[#009639]/30 hover:bg-[#007c2d] disabled:opacity-70 disabled:cursor-not-allowed transition-transform active:scale-[0.99]"
          >
            {isSubmitting ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm flex items-start space-x-3 ${handshakeMessage.tone}`}
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
            <div className="mt-3 text-[11px] uppercase tracking-[0.25em] text-gray-400">
              {MACHINE_PROFILE.deviceName} • {MACHINE_PROFILE.macAddress} •{' '}
              {MACHINE_PROFILE.certificateSerial}
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Ethio Telecom</span>
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#009639]" />
            <span>Online mode</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
