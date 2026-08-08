# AharSetu - Smart Food Redistribution Platform 🌾✨

**AharSetu** ("Bridge of Nourishment") is a production-ready, zero-waste smart food redistribution system connecting Donors (Hotels, Banquets, Restaurants, Individuals), NGOs/Shelters, Requesters, and Express Volunteer Delivery Heroes.

---

## 🏛️ 1. High-Level System Architecture

AharSetu follows a decoupled 3-tier architecture:

```
[ Client Layer (Flutter Web & React Web SPA) ]
                       │
                       │ REST API Calls (JSON / Bearer JWT)
                       ▼
[ API Layer (Node.js + Express + TypeScript ES Modules) ]
                       │
                       │ Mongoose ORM / MongoDB Driver
                       ▼
[ Data Layer (MongoDB / Persistent Cloud Storage) ]
```

1. **Client Layer (Flutter & React Web):** Serves zero mock data interfaces for Donors, NGOs, Volunteers, and Requesters with explicit `ValueKey` and `Semantics` hooks for Selenium UI automation.
2. **API Layer (Node.js & Express ESM):** Features JWT authentication, role-based middleware (`/api/auth/set-role`), and donation lifecycle dispatch handlers (`AVAILABLE` ➔ `ACCEPTED` ➔ `IN_TRANSIT` ➔ `DELIVERED`).
3. **Data Layer (MongoDB):** Enforces data constraints with schemas for Users and Donations.

---

## 🔄 2. Core User Workflows

### Onboarding Flow
`Signup / Login` ➔ Default Role: `UNASSIGNED` ➔ Intercepted by `RoleSelectionModal` (`PUT /api/auth/set-role`) ➔ Routed to Role Dashboard.

### Donor Journey
Create Donation ➔ Status `AVAILABLE` ➔ Visible on NGO Dashboard ➔ Notification on Claim.

### NGO Journey
Browse Available Food ➔ Select Delivery Method (`SELF_PICKUP` or `VOLUNTEER_DELIVERY`) ➔ Claim Donation ➔ Status `ACCEPTED`.

### Volunteer Journey
Browse Pickup Requests ➔ Accept Route ➔ Status `IN_TRANSIT` ➔ Deliver & Mark Complete ➔ Status `DELIVERED`.

---

## 🛠️ Tech Stack & Requirements
- **Backend:** Node.js, Express, TypeScript, ES Modules (`NodeNext`).
- **Database:** MongoDB (Mongoose) with zero mock data policy.
- **Frontend:** Flutter Web (`flutter_app/`) & React Web (`src/`).
- **Testing:** Selenium Webdriver (`tests/selenium_test.py`).
- **CI/CD:** GitHub Actions (`.github/workflows/main.yml`).
