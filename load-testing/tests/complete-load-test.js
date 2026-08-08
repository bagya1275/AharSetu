import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Master Metrics
export const masterErrorRate = new Rate('master_error_rate');
export const overallResponseTime = new Trend('overall_response_time');

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Stage 1: Ramp-up to 5 VUs (Normal Load)
    { duration: '20s', target: 20 },  // Stage 2: Ramp-up to 20 VUs (Moderate Load)
    { duration: '30s', target: 50 },  // Stage 3: Ramp-up to 50 VUs (Higher Safe Load)
    { duration: '10s', target: 0 },   // Stage 4: Ramp-down to 0 VUs
  ],
  thresholds: {
    master_error_rate: ['rate<0.01'],         // Less than 1% error rate
    overall_response_time: ['p(95)<500'],      // 95% of requests completed under 500ms
    http_req_failed: ['rate<0.01'],            // HTTP failures < 1%
    http_req_duration: ['p(95)<500'],          // Total req duration p95 < 500ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Homepage & Public APIs
  group('1. Public Infrastructure', function () {
    const res1 = http.get(`${BASE_URL}/`);
    overallResponseTime.add(res1.timings.duration);
    masterErrorRate.add(res1.status !== 200);

    const res2 = http.get(`${BASE_URL}/api/health`);
    overallResponseTime.add(res2.timings.duration);
    masterErrorRate.add(res2.status !== 200);

    const res3 = http.get(`${BASE_URL}/api/donations/impact-stats`);
    overallResponseTime.add(res3.timings.duration);
    masterErrorRate.add(res3.status !== 200);

    const res4 = http.get(`${BASE_URL}/api/donations/verified-ngos`);
    overallResponseTime.add(res4.timings.duration);
    masterErrorRate.add(res4.status !== 200);
  });

  sleep(1);

  // 2. Authentication Journey
  const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = {
    name: `Master User ${uniqueId}`,
    email: `master_${uniqueId}@aharsetu.org`,
    password: 'MasterPassword123!',
    phone: '9123456789',
    address: '456 Redistribution Hub'
  };

  let token = null;

  group('2. User Authentication Journey', function () {
    const regRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });
    overallResponseTime.add(regRes.timings.duration);
    const regOk = check(regRes, { 'register status 201': (r) => r.status === 201 });
    masterErrorRate.add(!regOk);

    if (regRes.status === 201) {
      token = JSON.parse(regRes.body).token;
    }

    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password
    }), { headers: { 'Content-Type': 'application/json' } });
    overallResponseTime.add(loginRes.timings.duration);
    const loginOk = check(loginRes, { 'login status 200': (r) => r.status === 200 });
    masterErrorRate.add(!loginOk);
  });

  sleep(1);

  // 3. Authenticated Roles & Donation Operations
  if (token) {
    const authHeaders = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    group('3. Authenticated Operations & Food Rescue', function () {
      // Set Donor Role
      const roleRes = http.put(`${BASE_URL}/api/auth/set-role`, JSON.stringify({ role: 'DONOR' }), authHeaders);
      overallResponseTime.add(roleRes.timings.duration);
      masterErrorRate.add(roleRes.status !== 200);

      // Post Food
      const donationRes = http.post(`${BASE_URL}/api/donations`, JSON.stringify({
        title: 'Master Load Surplus Meals',
        description: 'Packed meals for shelter delivery',
        category: 'Cooked Hot Meals',
        dietary: 'Pure Vegetarian',
        servings: 30,
        weightKg: 10,
        expiryHours: 6,
        pickupAddress: 'Central Kitchen',
        deliveryMethod: 'VOLUNTEER_DELIVERY'
      }), authHeaders);
      overallResponseTime.add(donationRes.timings.duration);
      masterErrorRate.add(donationRes.status !== 201);

      // Fetch Available
      const availableRes = http.get(`${BASE_URL}/api/donations`, authHeaders);
      overallResponseTime.add(availableRes.timings.duration);
      masterErrorRate.add(availableRes.status !== 200);

      // Fetch Donor History
      const myRes = http.get(`${BASE_URL}/api/donations/my`, authHeaders);
      overallResponseTime.add(myRes.timings.duration);
      masterErrorRate.add(myRes.status !== 200);
    });
  }

  sleep(1);
}
