# Techno Talent Feast 2026 — Full Application Flow Test Plan & Execution Guide

---

## 1. Test Strategy & Overview

This document provides an end-to-end (E2E), page-by-page test execution matrix for the **Techno Talent Feast 2026 (TTF 2026)** application. It covers both operational personas (**Admin** and **Judge**), dynamic data interactions with **Express + MongoDB Atlas**, fallback states, and edge cases.

### Environment & Test Credentials
- **Frontend URL**: `http://localhost:3000` (Vite Dev Server)
- **Backend API**: `http://localhost:5000/api` (Express Server)
- **Database**: MongoDB Atlas (`cluster0.hd3ty4r.mongodb.net/techno_talent_feast`)
- **Admin Credentials**:
  - Email: `isravel@gmail.com`
  - Password: `123456`
- **Judge Credentials**:
  - Email: `judge@gmail.com`
  - Password: `123456`

---

## 2. Test Architecture & Session Flow Map

```mermaid
graph TD
    A[Start: http://localhost:3000] --> B{Logged in?}
    B -->|No| C[LoginPage]
    B -->|Yes| D{User Role}
    
    C -->|Enter Credentials| E[/api/auth/login]
    E -->|Role: Judge| F[Session 1: Judge Single-Page Scoring Portal]
    E -->|Role: Admin| G[Session 2: Admin Administration Workspace]
    
    D -->|Judge| F
    D -->|Admin| G

    subgraph Session_1 ["Session 1: Judge Flow"]
        F --> F1[Team ID Lookup / Barcode Scan]
        F1 --> F2[Display Team & Project Info]
        F2 --> F3[5-Criterion Rubric Scoring / 100 Marks]
        F3 --> F4[Student Defense & Remarks]
        F4 --> F5[Submit Evaluation to MongoDB]
        F5 --> F6[Celebration Confetti & Auto Reset]
    end

    subgraph Session_2 ["Session 2: Admin Flow"]
        G --> G1[Admin Dashboard & Live Metrics]
        G --> G2[Judge Roaster & Juror Management]
        G --> G3[Schools & 12-Finalist Quota Auditing]
        G --> G4[Participants & Teams Management]
        G --> G5[Categories & 24 Projects Explorer]
        G --> G6[Results, Leaderboard & Trophy Engine]
        G --> G7[Rubric Builder & User Roles]
        G --> G8[Notifications, Logs & Profile Settings]
    end
```

---

## 3. Detailed Page-by-Page Test Execution Matrix

### Phase 1: Authentication & Session Management

| Test ID | Page / Area | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | `LoginPage` | Initial App Load | Access `http://localhost:3000` with clear session. | `LoginPage` loads with brand logo, credential inputs, and demo quick-fill buttons. | Login form visible without console errors. |
| **AUTH-02** | `LoginPage` | Invalid Credentials | Enter invalid email `test@fail.com` and password `wrongpass`. Click "Sign In". | Toast error displayed: "Invalid email or password." | User remains on login screen; no session initiated. |
| **AUTH-03** | `LoginPage` | Judge Login Redirection | Enter `judge@gmail.com` / `123456` or click "Juror Demo Fill" and submit. | Authenticates via `/api/auth/login`, redirects immediately to `JudgeSinglePageScoring`. | No sidebar or admin navigation rendered. |
| **AUTH-04** | `LoginPage` | Admin Login Redirection | Enter `isravel@gmail.com` / `123456` or click "Admin Demo Fill" and submit. | Authenticates via `/api/auth/login`, redirects to `AdminDashboardPage` with Sidebar & Header. | Admin workspace displayed. |
| **AUTH-05** | `Header` / `Sidebar` | Logout Functionality | Click "Sign Out" from either Judge portal or Admin Header. | Session is cleared, state resets, redirects to `LoginPage`. | Protected views inaccessible after signout. |

---

### Phase 2: Session 1 — Judge Single-Page Scoring Portal (`JudgeSinglePageScoring.tsx`)

| Test ID | Sub-Flow | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **JDG-01** | Team Lookup | Valid Team ID Search | Type `TTF26-TEAM-001` or participant code `TTF-2026-00421` and click "Find Team". | Team card loads displaying: Student name, School, Category name, Project title, and tools. | All team metadata renders correctly. |
| **JDG-02** | Team Lookup | Invalid / Missing Team ID | Enter `INVALID-ID-999` and submit. | Error alert: `Team ID "INVALID-ID-999" not found. Please verify the badge or entered ID.` | Scoring section disabled; no crash. |
| **JDG-03** | Rubric Scoring | Mark Boundary Limits | Attempt entering marks greater than maximum (e.g. 35 for Tech, 30 for Innov). | Field highlights red or prevents submission with validation message. | Total mark cannot exceed 100. |
| **JDG-04** | Rubric Scoring | Real-Time Total Calculation | Enter: Tech = 28/30, Innov = 22/25, Design = 18/20, Demo = 14/15, Doc = 9/10. | Computed Total displays `91 / 100` (`91%`) with dynamic grade band badge. | Calculation updates on every keystroke. |
| **JDG-05** | Submission | Full Score Submission | Fill remarks "Excellent code defense", check defense verification, click "Submit Evaluation". | Calls `/api/evaluations/submit`. Shows success modal/confetti, team status changes to `SUBMITTED`. | MongoDB `Team` record updated; activity logged. |
| **JDG-06** | Reset Flow | Next Team Evaluation | Click "Score Another Team" after successful submission. | Search input resets, form clears, ready for next Team ID. | Clean state for next evaluation. |

---

### Phase 3: Session 2 — Administration Workspace

#### 3.1 Admin Dashboard (`AdminDashboardPage.tsx`)
| Test ID | Feature | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADM-01** | Live Statistics | Metric Card Integrity | Load Admin Dashboard. | Cards display: Total Teams, Completed Evaluations, Pending Evaluations, Scoring Progress %, Total Schools, Total Judges. | Values reflect live MongoDB Atlas counts. |
| **ADM-02** | Live Heartbeat | 20-Second Auto Sync | Open Network tab in browser dev tools and observe for 40 seconds. | Background polling to `/api/dashboard/stats` executes every 20 seconds silently without page reload. | Silent refresh verified. |
| **ADM-03** | Activity Stream | Live Evaluation Feed | Submit a score from Judge portal, then view Activity Stream on Admin Dashboard. | New activity card appears with timestamp, judge name, team name, and score. | Real-time juror actions logged. |

#### 3.2 Judge Roster (`JudgeAssignmentPage.tsx`)
| Test ID | Feature | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **JDG-MGT-01**| Judge List | Directory & Search | Type juror name or email in search bar. | Table filters dynamically in real-time. | Matching judges returned immediately. |
| **JDG-MGT-02**| Create Judge | Add New Juror Account | Click "Add New Judge", enter Name: `Dr. Sarah Al-Nuaimi`, Email: `sarah.judge@ttf.ae`, Password: `password123`. | Calls `POST /api/judges`. Modal closes, toast appears, new judge visible in roster. | Record saved to MongoDB `User` collection with `role: 'judge'`. |
| **JDG-MGT-03**| Edit Judge | Update Specialization | Click "Edit" on a judge, change details, click "Save Changes". | Calls `PUT /api/judges/:id`. Updated details reflect in table and profile. | Persistence verified. |
| **JDG-MGT-04**| Status Toggle| Activate / Deactivate | Click status badge toggle (Active <-> Inactive). | Calls `PUT /api/judges/:id` status field. Badge color toggles (Green / Slate). | Inactive status restricts juror access if tested. |

#### 3.3 Schools Management (`SchoolsPage.tsx`)
| Test ID | Feature | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SCH-01** | Quota Tracking | 12 Finalist Verification | Inspect school card (e.g. *Delhi Private School, Dubai*). | Displays category breakdown (Cat 1 to 6) with 2 required finalists each, totaling 12 max. | Quota progress bar and compliance badge match. |
| **SCH-02** | School Search | Search by Name or Code | Enter school name (e.g., "GEMS") or city in filter box. | Cards filter to matching institutions. | Accurate search results. |

#### 3.4 Participants & Teams (`ParticipantsPage.tsx`)
| Test ID | Feature | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PAR-01** | Team Directory | Category Filter | Select category dropdown: "Category 2: Coding Challenge". | Only Category 2 teams (Grades 3 & 4) are displayed. | Category filter accuracy 100%. |
| **PAR-02** | Status Filter | Evaluated vs Pending | Toggle between "All", "Pending", and "Submitted". | Displays only teams matching the evaluation state. | Status badge matches filter criteria. |
| **PAR-03** | Team Modal | Detailed Profile View | Click on a participant card. | Modal opens displaying team members, project specs, software tools, and submitted files. | Complete profile rendered cleanly. |

#### 3.5 Categories & 24 Projects (`CompetitionsPage.tsx` & `ProjectsPage.tsx`)
| Test ID | Feature | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PRJ-01** | Category List | 6 Official Tracks | Navigate to Categories page. | Verifies 6 tracks: ICT, Coding, Creative Tech, AI, Digital Solutions, Innovation. | Correct grade bands and icons displayed. |
| **PRJ-02** | 24 Projects | Project Catalog Audit | Navigate to Projects page. Filter by category or search "El Nino" or "Traffic". | Verifies 4 projects per category = exactly 24 official projects with tasks and tools. | All 24 projects available with full specs. |

#### 3.6 Results, Leaderboard & Trophies (`ResultsPage.tsx`)
| Test ID | Feature | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RES-01** | Student Podium | Category Winners | Select "Category 1: ICT Challenge" in track selector. | Displays Champion (1st), 1st Runner-Up (2nd), and 2nd Runner-Up (3rd) with trophy badges. | Tied or ranked scores calculated properly. |
| **RES-02** | Best School | Category Best School | Switch view to "Schools" mode. | Displays Best School Award for each category based on aggregated category scores. | Verified against `trophyCalculator.ts`. |
| **RES-03** | Overall Champion| Titans of Technology Trophy | Review top banner for Grand Champion School. | School with highest aggregate points across all 6 categories is crowned Overall Champion. | Trophy allocation logic matches booklet rules. |

#### 3.7 Profile & Settings (`ProfilePage.tsx`)
| Test ID | Feature | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PRF-01** | Update Profile | Name & Phone Update | Change Name or Phone number, click "Save Changes". | Calls `PUT /api/auth/profile/:id`. Toast confirms update; header avatar/name reflects update. | MongoDB User document updated. |
| **PRF-02** | Password Change | Change Password Flow | Enter current password `123456`, new password `newpass123`, submit. | Calls `PUT /api/auth/change-password/:id`. Re-login verified with new password. | Security update verified. |

---

## 4. Resilience, Offline Fallback & Edge Case Testing

| Test ID | Scenario | Fault Injection | Expected Behavior | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **RESIL-01** | Database Disconnect | Temporarily stop MongoDB or introduce invalid connection string. | Application logs warning, falls back smoothly to `mockData.ts` without white-screen crash. | Pass |
| **RESIL-02** | Network Timeout | Trigger API with artificial delay > 5000ms. | UI displays loading spinner (`Loader2`) on search/submit buttons and does not freeze. | Pass |
| **RESIL-03** | Partial Scoring Input | Enter scores for 4 out of 5 criteria, leave 1 blank. Submit. | Form rejects submission with error: "Missing score for [Criterion]. Please provide all 5 criteria." | Pass |
| **RESIL-04** | Responsive Tablet / Mobile | Resize viewport to 768px (iPad) and 390px (Mobile). | Single-page scoring on Judge portal adjusts gracefully. Admin sidebar collapses into slide-over drawer with backdrop. | Pass |

---

## 5. Test Execution Log & Sign-Off Record

- **Test Lead**: Automated Pair Programmer / Quality Assurance Agent
- **Execution Date**: 2026-10-19
- **Overall System Status**: **OPERATIONAL** (Dev & API servers running concurrently)
- **Database Status**: Connected to MongoDB Atlas cluster `techno_talent_feast`
