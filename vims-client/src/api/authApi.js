import httpClient from './httpClient.js';

const USE_MOCKS =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_API_USE_MOCKS !== 'false') ||
  true;

const mockDelay = (ms = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function login({ username, password, machineId }) {
  if (USE_MOCKS) {
    await mockDelay();
    if (username.toLowerCase().includes('fail')) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }
    return {
      token: 'mock-token',
      user: {
        id: 'inspector-001',
        username,
        role: 'INSPECTOR',
      },
      machineId,
    };
  }

  return httpClient.post('/auth/login', {
    username,
    password,
    machineId,
  });
}

export async function verifyMachine({ macAddress, certificateSerial }) {
  if (USE_MOCKS) {
    await mockDelay(500);
    const trusted = macAddress?.startsWith('00:1B:44');
    return {
      trusted,
      machineId: trusted ? `M-${macAddress.replace(/:/g, '')}` : null,
      certificateSerial,
    };
  }

  return httpClient.post('/auth/machine/verify', {
    macAddress,
    certificateSerial,
  });
}

export async function startHandshake(payload) {
  if (USE_MOCKS) {
    await mockDelay(300);
    return { status: 'INITIATED', ...payload };
  }
  return httpClient.post('/auth/machine/handshake', payload);
}
