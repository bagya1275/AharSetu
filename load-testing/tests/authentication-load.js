import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('auth_errors');
export const registerDuration = new Trend('register_response_time');
export const loginDuration = new Trend('login_response_time');
export const getMeDuration = new Trend('get_me_response_time');
export const setRoleDuration = new Trend('set_role_response_time');

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Normal load
    { duration: '20s', target: 20 },  // Moderate load
    { duration: '30s', target: 40 },  // Higher safe load
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    auth_errors: ['rate<0.01'],                 // Error rate < 1%
    register_response_time: ['p(95)<600'],     // p95 < 600ms
    login_response_time: ['p(95)<500'],        // p95 < 500ms
    get_me_response_time: ['p(95)<300'],       // p95 < 300ms
    set_role_response_time: ['p(95)<400'],     // p95 < 400ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const testUser = {
    name: `Load Test User ${uniqueId}`,
    email: `load_user_${uniqueId}@aharsetu-test.org`,
    password: 'TestPassword123!',
    phone: '9876543210',
    address: '123 Smart Redistribution Way'
  };

  let token = null;

  group('1. User Registration API', function () {
    const payload = JSON.stringify(testUser);
    const params = { headers: { 'Content-Type': 'application/json' } };
    
    const res = http.post(`${BASE_URL}/api/auth/register`, payload, params);
    registerDuration.add(res.timings.duration);
    
    const success = check(res, {
      'register status is 201': (r) => r.status === 201,
      'returns JWT token': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (body.token) token = body.token;
          return body.success === true && !!body.token;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
  });

  sleep(1);

  group('2. User Login API', function () {
    const payload = JSON.stringify({
      email: testUser.email,
      password: testUser.password
    });
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
    loginDuration.add(res.timings.duration);

    const success = check(res, {
      'login status is 200': (r) => r.status === 200,
      'login returns success true': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (body.token) token = body.token;
          return body.success === true;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
  });

  sleep(1);

  if (token) {
    const authHeaders = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    group('3. Get Current User Profile API', function () {
      const res = http.get(`${BASE_URL}/api/auth/me`, authHeaders);
      getMeDuration.add(res.timings.duration);

      const success = check(res, {
        'getMe status is 200': (r) => r.status === 200,
        'profile matches email': (r) => {
          try {
            return JSON.parse(r.body).user.email === testUser.email;
          } catch {
            return false;
          }
        },
      });
      errorRate.add(!success);
    });

    sleep(1);

    group('4. Set User Role API', function () {
      const roles = ['DONOR', 'NGO', 'VOLUNTEER', 'REQUESTER'];
      const chosenRole = roles[Math.floor(Math.random() * roles.length)];
      const payload = JSON.stringify({ role: chosenRole });

      const res = http.put(`${BASE_URL}/api/auth/set-role`, payload, authHeaders);
      setRoleDuration.add(res.timings.duration);

      const success = check(res, {
        'setRole status is 200': (r) => r.status === 200,
        'role updated successfully': (r) => {
          try {
            return JSON.parse(r.body).user.role === chosenRole;
          } catch {
            return false;
          }
        },
      });
      errorRate.add(!success);
    });
  }

  sleep(1);
}
