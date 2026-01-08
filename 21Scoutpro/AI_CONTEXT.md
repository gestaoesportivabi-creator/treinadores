# 🧠 AI Context & Developer Guide - Scout 21 Pro

> **Purpose:** This document serves as the "Master Source of Truth" for any AI agent or developer joining the project. It consolidates architecture, workflows, and implementation details.

---

## 1. Project Overview
**Name:** SCOUT 21 PRO
**Description:** A complete sports management system for coaches and teams. It supports multi-tenancy (multiple coaches), where each coach has their own isolated data environment.
**Key Features:**
- Scout (Collective & Individual)
- Athlete Management
- Physical Assessments
- Video Scout
- Match Schedules & Championships

## 2. Tech Stack & Architecture

### Frontend
- **Framework:** React + Vite
- **Language:** JavaScript/TypeScript
- **Styling:** CSS Modules / Vanilla CSS (Modern UI)
- **State Management:** Local State + API fetching

### Backend / Database (Serverless & Free)
- **Database:** Google Sheets (One spreadsheet per coach).
- **API/Backend:** Google Apps Script deployed as a "Web App".
- **Auth:** Local authentication logic using `config.json` files stored in `data/coaches/`.

### Architecture Diagram
```mermaid
graph TD
    A[Frontend (React/Vite)] -->|HTTP Request| B(Google Apps Script - Web App)
    B -->|Read/Write| C(Google Sheets)
    D[CLI Scripts (Node.js)] -->|Create/Setup| E[Local Data (data/coaches)]
    D -->|Create| C
```

---

## 3. Directory Structure

- **`/src`**: Frontend source code.
  - `config.ts`: Contains the API URL logic.
  - `pages/`: React components for each page/route.
  - `services/`: API integration services.
  - `utils/`: Helper functions.
  
- **`/scripts`**: Node.js maintenance scripts.
  - `create-coach-drive.js`: Automates creating a coach + Google Drive folder + Sheet.
  - `list-coaches.js`: Lists registered coaches.
  - `delete-coach.js`: Removes a coach.
  - `google-drive-setup.js`: Helper functions for Drive API.

- **`/data`**: Local persistence (Simulated Backend).
  - `coaches/[email]/`: Stores coach specific config (`config.json`, `spreadsheet-id.txt`).
  - **Note:** This folder simulates a database for user accounts.

---

## 4. Key Workflows

### Authentication
- Users login with Email/Password.
- The system validates against `data/coaches/[email]/config.json`.
- On success, it retrieves the `SPREADSHEET_ID` from `spreadsheet-id.txt` to know which database (Sheet) to query.
- **Note:** This means the frontend adapts to *which* coach is logged in.

### API Integration (No API Key)
- The system relies on the Google Apps Script Web App URL mechanism, as detailed in the API Integration section.
- **Mechanism:** Google Apps Script Web App URL.
- **Security:** The unique URL acts as the secret key.
- **Endpoints:** The Apps Script accepts `GET` and `POST` requests with parameters like `?path=players` to route to correct sheet tabs.

### Creating a New Coach
1. Run `node scripts/create-coach-drive.js`.
2. Script creates a folder in Google Drive.
3. Script creates a Google Sheet with required tabs (players, matches, etc.).
4. Script saves `spreadsheet-id.txt` locally.
5. **Manual Step:** User copies the Apps Script code to the new Sheet and deploys as Web App.

---

## 5. Development Setup

### Prerequisites
- Node.js
- Google Account (for Drive/Sheets integration)

### Running Locally
```bash
npm install
npm run dev
```
Access: `http://localhost:5173`

### Default Login (if using test data)
- **Email:** `treinador@clube.com`
- **Password:** `afc25`

---

## 6. Critical Files & Meaning
- `PROXIMOS_PASSOS.md`: Often contains immediate to-do lists.
- `apps-script.js`: The backend code that MUST be running on Google Apps Script.
- `scripts/*.js`: Tooling for managing the application data.

## 7. Known Issues / Notes
- **LocalStorage:** Some settings might persist in browser storage.
- **Security:** "Production" usage implies trusting the local `data/` folder or moving auth to a real backend.
- **Permissions:** Google Apps Script must be deployed as "Anyone" (or specific user logic added) to work without complex OAuth flows in the frontend.

---

## 8. What to keep? (Cleanup Guide)
*Keep these files as they are core documentation:*
- `README.md`
- `AI_CONTEXT.md` (This file)
- `GUIA_TREINADORES.md`
- `DEPLOY.md`

*You may safely archive/delete:*
- `ATUALIZAR_*.md`
- `CORRECAO_*.md`
- `SOLUCAO_*.md`
- `INSTRUCOES_*.md`
(These are usually temporary logs of past fixes).

## 9. Data Schema (Google Sheets)

The following headers MUST be present in the first row of each tab for the API to function correctly.

### **1. players**
`id | name | nickname | position | photoUrl | jerseyNumber | dominantFoot | age | height | lastClub | isTransferred | transferDate | salary | salaryStartDate | salaryEndDate`

### **2. matches**
`id | competition | opponent | location | date | result | videoUrl | team_minutesPlayed | team_goals | team_goalsConceded | team_assists | team_yellowCards | team_redCards | team_passesCorrect | team_passesWrong | team_wrongPassesTransition | team_tacklesWithBall | team_tacklesCounterAttack | team_tacklesWithoutBall | team_shotsOnTarget | team_shotsOffTarget | team_rpeMatch | team_goalsScoredOpenPlay | team_goalsScoredSetPiece | team_goalsConcededOpenPlay | team_goalsConcededSetPiece`

### **3. match_player_stats**
`id | matchId | playerId | minutesPlayed | goals | goalsConceded | assists | yellowCards | redCards | passesCorrect | passesWrong | wrongPassesTransition | tacklesWithBall | tacklesCounterAttack | tacklesWithoutBall | shotsOnTarget | shotsOffTarget | rpeMatch | goalsScoredOpenPlay | goalsScoredSetPiece | goalsConcededOpenPlay | goalsConcededSetPiece`

### **4. injuries**
`id | playerId | date | endDate | type | location | severity | daysOut`

### **5. assessments**
`id | playerId | date | chest | axilla | subscapular | triceps | abdominal | suprailiac | thigh | bodyFatPercent | actionPlan`

### **6. schedules**
`id | startDate | endDate | title | createdAt | isActive`

### **7. schedule_days**
`id | scheduleId | date | weekday | activity | time | location | notes`

### **8. budget_entries**
`id | type | expectedDate | value | status | receivedDate | category | startDate | endDate`

### **9. budget_expenses**
`id | type | date | value | status | paidDate | category | startDate | endDate`

### **10. competitions**
`name`

### **11. stat_targets**
`id | goals | assists | passesCorrect | passesWrong | shotsOn | shotsOff | tacklesPossession | tacklesNoPossession | tacklesCounter | transitionError`

### **12. users** (optional)
`id | name | email | role | linkedPlayerId | photoUrl`
