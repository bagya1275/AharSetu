import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('dashboard_errors');
export const donorDashboardDuration = new Trend('donor_dashboard_response_time');
export const ngoDashboardDuration = new Trend('ngo_dashboard_response_time');
export const volunteerDashboardDuration = new Trend('volunteer_dashboard_response_time');
export const impactStatsDuration = new Trend('impact_stats_dashboard_response_time');

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Normal load
    { duration: '20s', target: 20 },  // Moderate load
    { duration: '30s', target: 40 },  // Higher safe load
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    dashboard_errors: ['rate<0.01'],                     // Error rate < 1%
    donor_dashboard_response_time: ['p(95)<300'],        // p95 < 300ms
    ngo_dashboard_response_time: ['p(95)<300'],          // p95 < 300ms
    volunteer_dashboard_response_time: ['p(95)<300'],    // p95 < 300ms
    impact_stats_dashboard_response_time: ['p(95)<300'], // p95 < 300ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function getAuthToken(role) {
  const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = {
    name: `Dash User ${role} ${uniqueId}`,
    email: `dash_${role.toLowerCase()}_${uniqueId}@aharsetu.org`,
    password: 'TestPassword123!',
  };
  const regRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  });
  if (regRes.status === 201) {
    const regData = JSON.parse(regRes.body);
    const token = regData.token;
    http.put(`${BASE_URL}/api/auth/set-role`, JSON.stringify({ role }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return token;
  }
  return null;
}

export default function () {
  group('1. Donor Dashboard API (GET /api/donations/my)', function () {
    const token = getAuthToken('DONOR');
    if (token) {
      const res = http.get(`${BASE_URL}/api/donations/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      donorDashboardDuration.add(res.timings.duration);

      const success = check(res, {
        'donor dashboard status is 200': (r) => r.status === 200,
        'returns count and donations array': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.success === true && Array.isArray(body.donations);
          } catch {
            return false;
          }
        },
      });
      errorRate.add(!success);
    }
  });

  sleep(1);

  group('2. NGO Dashboard API (GET /api/donations/ngo-claims)', function () {
    const token = getAuthToken('NGO');
    if (token) {
      const res = http.get(`${BASE_URL}/api/donations/ngo-claims`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      ngoDashboardDuration.add(res.timings.duration);

      const success = check(res, {
        'ngo dashboard status is 200': (r) => r.status === 200,
        'returns claims array': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.success === true && Array.isArray(body.donations);
          } catch {
            return false;
          }
        },
      });
      errorRate.add(!success);
    }
  });

  sleep(1);

  group('3. Volunteer Dashboard API (GET /api/donations/volunteer-tasks)', function () {
    const token = getAuthToken('VOLUNTEER');
    if (token) {
      const res = http.get(`${BASE_URL}/api/donations/volunteer-tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      volunteerDashboardDuration.add(res.timings.duration);

      const success = check(res, {
        'volunteer dashboard status is 200': (r) => r.status === 200,
        'returns availableForPickup and myTasks': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.success === true && Array.isArray(body.availableForPickup) && Array.isArray(body.myTasks);
          } catch {
            return false;
          }
        },
      });
      errorRate.add(!success);
    }
  });

  sleep(1);

  group('4. Platform Impact Stats API (GET /api/donations/impact-stats)', function () {
    const res = http.get(`${BASE_URL}/api/donations/impact-stats`);
    impactStatsDuration.add(res.timings.duration);

    const success = check(res, {
      'impact stats status is 200': (r) => r.status === 200,
      'stats object contains totalMealsRescued': (r) => {
        try {
          return JSON.parse(r.body).stats.totalMealsRescued !== undefined;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
  });

  sleep(1);
}
