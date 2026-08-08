import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('donation_errors');
export const getAvailableDuration = new Trend('get_available_donations_response_time');
export const createDonationDuration = new Trend('create_donation_response_time');
export const claimDonationDuration = new Trend('claim_donation_response_time');
export const updateStatusDuration = new Trend('update_status_response_time');

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Normal load
    { duration: '20s', target: 20 },  // Moderate load
    { duration: '30s', target: 40 },  // Higher safe load
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    donation_errors: ['rate<0.01'],                          // Error rate < 1%
    get_available_donations_response_time: ['p(95)<300'],    // p95 < 300ms
    create_donation_response_time: ['p(95)<500'],           // p95 < 500ms
    claim_donation_response_time: ['p(95)<500'],            // p95 < 500ms
    update_status_response_time: ['p(95)<400'],             // p95 < 400ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function getAuthToken(role) {
  const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = {
    name: `Load Test ${role} ${uniqueId}`,
    email: `load_${role.toLowerCase()}_${uniqueId}@aharsetu.org`,
    password: 'TestPassword123!',
  };
  const regRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' }
  });
  if (regRes.status === 201) {
    const regData = JSON.parse(regRes.body);
    const token = regData.token;
    // Set Role
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
  const donorToken = getAuthToken('DONOR');
  let createdDonationId = null;

  if (donorToken) {
    const donorHeaders = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donorToken}`
      }
    };

    group('1. Create Food Donation API', function () {
      const donationPayload = JSON.stringify({
        title: 'Surplus Fresh Rice & Curry',
        description: 'Freshly prepared meals ready for immediate shelter distribution',
        category: 'Cooked Hot Meals',
        dietary: 'Pure Vegetarian',
        servings: 45,
        weightKg: 15,
        expiryHours: 4,
        pickupAddress: 'Radisson Blu Banquet Hall',
        deliveryMethod: 'VOLUNTEER_DELIVERY'
      });

      const res = http.post(`${BASE_URL}/api/donations`, donationPayload, donorHeaders);
      createDonationDuration.add(res.timings.duration);

      const success = check(res, {
        'create donation status is 201': (r) => r.status === 201,
        'donation created with id': (r) => {
          try {
            const body = JSON.parse(r.body);
            if (body.donation && (body.donation.id || body.donation._id)) {
              createdDonationId = body.donation.id || body.donation._id;
            }
            return body.success === true;
          } catch {
            return false;
          }
        },
      });
      errorRate.add(!success);
    });
  }

  sleep(1);

  group('2. Get Available Donations List & Search API', function () {
    const res = http.get(`${BASE_URL}/api/donations`, {
      headers: donorToken ? { 'Authorization': `Bearer ${donorToken}` } : {}
    });
    getAvailableDuration.add(res.timings.duration);

    const success = check(res, {
      'get available status is 200': (r) => r.status === 200,
      'returns donations array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body).donations);
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
  });

  sleep(1);

  if (createdDonationId) {
    const ngoToken = getAuthToken('NGO');
    if (ngoToken) {
      const ngoHeaders = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ngoToken}`
        }
      };

      group('3. Claim Donation API (NGO)', function () {
        const payload = JSON.stringify({ deliveryMethod: 'VOLUNTEER_DELIVERY' });
        const res = http.put(`${BASE_URL}/api/donations/${createdDonationId}/accept`, payload, ngoHeaders);
        claimDonationDuration.add(res.timings.duration);

        const success = check(res, {
          'claim status is 200': (r) => r.status === 200,
          'status updated to ACCEPTED': (r) => {
            try {
              return JSON.parse(r.body).donation.status === 'ACCEPTED';
            } catch {
              return false;
            }
          },
        });
        errorRate.add(!success);
      });

      sleep(1);

      const volunteerToken = getAuthToken('VOLUNTEER');
      if (volunteerToken) {
        const volunteerHeaders = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${volunteerToken}`
          }
        };

        group('4. Update Status to IN_TRANSIT & DELIVERED (Volunteer)', function () {
          const transitPayload = JSON.stringify({ status: 'IN_TRANSIT' });
          const res1 = http.put(`${BASE_URL}/api/donations/${createdDonationId}/status`, transitPayload, volunteerHeaders);
          updateStatusDuration.add(res1.timings.duration);

          const success1 = check(res1, {
            'transit status is 200': (r) => r.status === 200,
          });
          errorRate.add(!success1);

          sleep(1);

          const deliveredPayload = JSON.stringify({ status: 'DELIVERED' });
          const res2 = http.put(`${BASE_URL}/api/donations/${createdDonationId}/status`, deliveredPayload, volunteerHeaders);
          updateStatusDuration.add(res2.timings.duration);

          const success2 = check(res2, {
            'delivered status is 200': (r) => r.status === 200,
          });
          errorRate.add(!success2);
        });
      }
    }
  }

  sleep(1);
}
