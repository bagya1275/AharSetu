import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('http_errors');
export const homepageDuration = new Trend('homepage_response_time');
export const apiHealthDuration = new Trend('api_health_response_time');
export const impactStatsDuration = new Trend('impact_stats_response_time');
export const verifiedNgosDuration = new Trend('verified_ngos_response_time');

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Stage 1: Normal load (5 VUs)
    { duration: '20s', target: 20 },  // Stage 2: Moderate load (20 VUs)
    { duration: '30s', target: 50 },  // Stage 3: Higher safe load (50 VUs)
    { duration: '10s', target: 0 },   // Stage 4: Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],            // HTTP error rate must be < 1%
    http_req_duration: ['p(95)<500'],          // 95% of requests must complete in < 500ms
    homepage_response_time: ['p(95)<800'],     // Homepage static asset < 800ms
    api_health_response_time: ['p(95)<200'],   // Health API < 200ms
    impact_stats_response_time: ['p(95)<400'], // Impact stats API < 400ms
    verified_ngos_response_time: ['p(95)<400'] // Verified NGOs API < 400ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  group('1. Homepage Landing Page', function () {
    const res = http.get(`${BASE_URL}/`);
    homepageDuration.add(res.timings.duration);
    const success = check(res, {
      'homepage status is 200': (r) => r.status === 200,
      'contains AharSetu html': (r) => r.body && r.body.includes('html'),
    });
    errorRate.add(!success);
  });

  sleep(1);

  group('2. API Health Endpoint', function () {
    const res = http.get(`${BASE_URL}/api/health`);
    apiHealthDuration.add(res.timings.duration);
    const success = check(res, {
      'health status is 200': (r) => r.status === 200,
      'health json ok': (r) => {
        try {
          return JSON.parse(r.body).status === 'ok';
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
  });

  sleep(1);

  group('3. Platform Impact Stats API', function () {
    const res = http.get(`${BASE_URL}/api/donations/impact-stats`);
    impactStatsDuration.add(res.timings.duration);
    const success = check(res, {
      'impact stats status is 200': (r) => r.status === 200,
      'returns success true': (r) => {
        try {
          return JSON.parse(r.body).success === true;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
  });

  sleep(1);

  group('4. Verified NGOs List API', function () {
    const res = http.get(`${BASE_URL}/api/donations/verified-ngos`);
    verifiedNgosDuration.add(res.timings.duration);
    const success = check(res, {
      'verified ngos status is 200': (r) => r.status === 200,
      'returns ngos array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true && Array.isArray(body.ngos);
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
  });

  sleep(1);
}
