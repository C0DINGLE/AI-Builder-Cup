# 🌿 NourishLoop: From Food Waste to Food Access

> **A Closed-Loop AI Platform Connecting Households, Commercial Grocers, Mutual Aid Community Fridges, and Food Banks.**  
> *Built for the AI Builder Cup — Transforming avoidable food waste into immediate nutrition, tax deductions, and verifiable carbon reductions.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available%20on%20Cloud%20Run-1F7A4D?style=for-the-badge&logo=google-cloud)](https://food-rescue-fridge-to-plate-664725057512.asia-southeast1.run.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-C0DINGLE%2FAI--Builder--Cup-181717?style=for-the-badge&logo=github)](https://github.com/C0DINGLE/AI-Builder-Cup)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Framework: React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![AI Model: Gemini 2.5 Flash](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Firebase: Firestore & Auth](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

---

## 📌 Table of Contents

1. [Executive Summary & The Problem](#-executive-summary--the-problem)
2. [The 5-Stage Closed-Loop Architecture](#-the-5-stage-closed-loop-architecture)
3. [Deep-Dive Feature Breakdown](#-deep-dive-feature-breakdown)
   - [Portal 1: Kitchen (Fridge to Plate)](#1-kitchen-fridge-to-plate)
   - [Portal 2: 7-Day AI Meal Planner](#2-smart-7-day-zero-waste-meal-planner)
   - [Portal 3: Neighborhood Loop (Community Fridges)](#3-neighborhood-loop-community-fridges--pantries)
   - [Portal 4: Commercial Store Donor Portal](#4-commercial-store-donor-portal)
   - [Portal 5: Food Bank Intake Portal](#5-food-bank-intake-portal)
   - [Portal 6: Impact & Statutory Tax Audit Dashboard](#6-impact--statutory-tax-audit-dashboard)
   - [Portal 7: Admin RBAC Console](#7-admin-rbac-console)
4. [Multi-Region Statutory & Legal Framework](#-multi-region-statutory--legal-framework)
5. [Technology Stack](#-technology-stack)
6. [Getting Started (Local Development)](#-getting-started-local-development)
7. [Environment Variables](#-environment-variables)
8. [Deployment & Production Build](#-deployment--production-build)
9. [Security & Firestore Hardening](#-security--firestore-hardening)

---

## 🌍 Executive Summary & The Problem

Globally, **over one-third of all food produced is lost or wasted**, while **735 million people experience chronic hunger**. 

In the United States alone:
- **119 billion pounds** of food are discarded annually (~**$408 billion** in economic value).
- The average household throws away **$1,866 in groceries each year**, predominantly driven by "expiration anxiety" and confusing "Best By" labels.
- Landfilled food generates **massive methane emissions**, contributing to ~8% of total global greenhouse gas output (Scope 3 Category 1 & 5).
- Meanwhile, **44 million Americans face food insecurity**, including 13 million children.

### Why Existing Solutions Fail
1. **Disjointed Systems**: Recipe apps focus on cooking from scratch, inventory apps require tedious manual barcode typing, and surplus rescue platforms ignore the consumer kitchen.
2. **Cold-Chain Liability & Fear**: Grocers discard safe edible surplus out of liability fear, unaware of statutory Good Samaritan protections and tax incentives.
3. **Logistics Bottlenecks**: Food banks lack live visibility into incoming surplus, causing refrigerated capacity overruns or uncoordinated dry runs.

### The NourishLoop Innovation
**NourishLoop closes the loop** by unifying household consumer kitchens, neighborhood mutual aid fridges, retail supermarkets, and non-profit food banks into a single multimodal, legally grounded, AI-orchestrated ecosystem.

```
                    ┌───────────────────────────────┐
                    │      NOURISHLOOP ECOSYSTEM     │
                    └───────────────┬───────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
 ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
 │   HOUSEHOLDS  │          │ MUTUAL AID    │          │  COMMERCIAL   │
 │Fridge to Plate│          │Community Fridg│          │Donor Grocers  │
 └───────┬───────┘          └───────┬───────┘          └───────┬───────┘
         │                          │                          │
         │ Single Next Step         │ Anonymous Pickup         │ 24-48h Forecast
         │ FoodKeeper Shelf Life    │ Drop-off Pass & QR       │ Cold-Chain Gating
         │ 7-Day Urgency Planner    │ Safe Sharing Code        │ Radar Routing Map
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      NON-PROFIT FOOD BANKS    │
                    │   Concentric Cold Rings (88%) │
                    │   HACCP Sensor Verification   │
                    │   Nutritional Balance Matcher │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │    VERIFIABLE AUDIT ENGINE    │
                    │  IRS 8283 / 170(e)(3) Basis   │
                    │  Scope 3 Carbon Offset Hash   │
                    └───────────────────────────────┘
```

---

## 🔄 The 5-Stage Closed-Loop Architecture

NourishLoop was developed and refined across 5 comprehensive milestones:

1. **Stage 1 — Core Foundation & Empirical Intelligence**: Multimodal Gemini computer vision scanner, USDA FoodKeeper open safety dataset integration, dual consumer/commercial portals, and multi-region tax/legal frameworks.
2. **Stage 2 — Apple Human Interface System Overhaul**: Calm typography, concentric Apple Fitness-inspired capacity rings, Cupertino sheets, segmented controls, dark/light themes, and zero-pill discipline.
3. **Stage 3 — Real-Time Operations & IoT Telemetry**: Simulated cold-chain temperature stream (`37.0°F` with live jitter), GPS transit dispatch simulation, 12-digit UPC barcode lookup, and cryptographic SHA-256 tax audit certificates.
4. **Stage 4 — Neighborhood Loop & Smart 7-Day Meal Planner**: Hyperlocal mutual aid directory of 24/7 Community Fridges, expiration-urgency dinner scheduler, Web Audio API sound synthesizers, and PWA offline resilience.
5. **Stage 5 — Production Hardening & Global Release**: Full Cloud Run container deployment, Node 22 ESM type-stripping fixes, Firestore security rules enforcement, and GitHub synchronization.

---

## 🔎 Deep-Dive Feature Breakdown

### 1. Kitchen (Fridge to Plate)
Designed to eliminate household food waste with zero friction:
- **3 Multimodal Ingestion Modes**:
  - *Fridge Photo*: Computer vision detects multiple raw, packaged, or leftover items in a single refrigerator snapshot.
  - *Receipt OCR*: Parses supermarket store receipts into line items and assigns storage locations.
  - *UPC Barcode Quick-Scan*: Viewfinder with animated laser line, one-tap library presets (*Organic Milk, Baby Spinach, Chicken Breast, Greek Yogurt*), or manual 12-digit UPC lookup.
- **USDA FoodKeeper Science**: Grounds all shelf lives in open food science data. Automatically marks dates as verified estimates and provides safe storage tips.
- **Action Board with Single Next Steps**: Avoids decision fatigue by categorizing every item into exactly one status:
  - 🔴 **Use Today**: Critical items expiring within 24-48 hours.
  - 🟡 **Use Soon**: Items stable for 3-5 days.
  - 🟢 **Stable**: Long shelf-life pantry and frozen staples.
- **Zero-Waste Recipe Engine**: Prioritizes expiring ingredients and filters out declared household allergens through a deterministic post-AI safety gate.
- **Hands-Free Sous Chef Cooking Assistant**:
  - Web Speech API voice guidance (*"Next step"*, *"Repeat"*, *"Start an 8-minute timer"*).
  - Apple-style concentric timer rings with Web Audio synthesized gong and chime alarms.

---

### 2. Smart 7-Day Zero-Waste Meal Planner
Sequences an entire week's dinners (Monday through Saturday) to match ingredient shelf lives:
- **Urgency Sequencing**: Highly perishable proteins and delicate greens are placed on Monday/Tuesday; durable root vegetables and pantry grains are scheduled for Friday/Saturday.
- **Waste Prevention Scorecard**: Forecasts weekly dollar savings (e.g. `$44.60`), total ingredients rescued, and zero food discard days.
- **One-Tap Cooking**: Launch directly from the planned day into the voice-assisted Sous Chef.

---

### 3. Neighborhood Loop (Community Fridges & Pantries)
Enables immediate peer-to-peer surplus sharing without bureaucracy:
- **Hyperlocal Directory**: Displays nearby Free Little Pantries and Mutual Aid Fridges with street addresses and distances.
- **Live Telemetry & Safety**: Monitors internal temperatures (must stay $< 40^\circ\text{F}$ / $4^\circ\text{C}$ for food safety) and capacity gauges.
- **Surplus Drop-Off Pass**: Prompts donors with a Good Samaritan safety checklist and generates a unique, printable code (e.g. `DROP-4821-PRO`) to label the item.
- **Discreet 2-Hour Pickup Hold**: Neighbors in need can anonymously reserve items for 2 hours to ensure food is available before walking over.

---

### 4. Commercial Store Donor Portal
Built for grocery managers, bakers, and food producers:
- **30-Day Moving Baseline Surplus Chart**: Tracks actual waste versus baseline reduction over time.
- **24–48h Predictive Forecaster**: Anticipates surplus volumes before food reaches the shelf using historical waste and weather trends.
- **Vicinity Radar Map**: Visualizes nearby food banks within 5 to 25 mile radii with drive times, filtering by cold-chain capacity.
- **Live IoT Dispatch Manifest**:
  - Real-time temperature sensor telemetry (`37.0°F` with live jitter) verifying continuous cold-chain compliance.
  - Interactive GPS route runner showing vehicle transit from Dock Departure to Intake Arrival.
  - Official Bill of Lading with statutory Good Samaritan legal release.

---

### 5. Food Bank Intake Portal
Empowers non-profit coordinators to manage donations efficiently:
- **Concentric Cold-Chain Capacity Gauge**: Apple Fitness-inspired visualizer tracking Ambient, Refrigerated ($34\text{--}38^\circ\text{F}$), and Freezer ($< 0^\circ\text{F}$) volume limits.
- **4-Stage Claim Workflow**: Track donation lots from `Requested` $\rightarrow$ `Accepted` $\rightarrow$ `In Transit` $\rightarrow$ `Delivered`.
- **Nutritional Balance Matcher**: Analyzes incoming donations against regional health benchmarks (e.g. USDA MyPlate, Australia Healthy Eating Guidelines, Singapore My Healthy Plate) across Produce, Protein, Dairy, and Grains.

---

### 6. Impact & Statutory Tax Audit Dashboard
Delivers institutional-grade ESG and tax compliance reporting:
- **Real-Time Global Metrics**: Meals rescued, pounds diverted from landfills, household grocery dollars saved, and Scope 3 Category 1 & 5 carbon avoidance (landfill methane prevented).
- **Statutory Tax Certificate Generator**:
  - Automatically calculates enhanced tax deductions under statutory corporate tax codes (e.g., **IRC Section 170(e)(3)** in the US).
  - Issues cryptographic **SHA-256 verification hashes** for audit integrity.
  - One-click printable PDF certificate format for corporate accounting.

---

### 7. Admin RBAC Console
Full enterprise security controls:
- **Role-Based Access Control**:
  - `household`: Fridge to Plate, Meal Planner, Community Loop, Impact.
  - `donor_store`: Commercial Dispatch, Radar Routing, Forecaster, Tax/ESG Audit.
  - `foodbank_coordinator`: Food Bank Intake, Capacity Gauges, Nutritional Recommender.
  - `admin`: User account provisioning, role assignment, and audit logs.
- **Hardened Firestore Security Rules**: Enforces strict default-deny policies, document size limits, regex field validation, and bootstrap admin verification.

---

## 🏛 Multi-Region Statutory & Legal Framework

NourishLoop includes dedicated, localized compliance logic for 6 major global regions:

| Region | Metro Hub | Currency & Units | Food Safety Law | Statutory Tax Benefit |
| :--- | :--- | :--- | :--- | :--- |
| **United States 🇺🇸** | Seattle, WA | USD ($) · lbs · °F | Bill Emerson Good Samaritan Act (42 U.S. Code § 1791) | IRC Section 170(e)(3) Enhanced Deduction (Cost + 50% Mark-up) |
| **Japan 🇯🇵** | Greater Tokyo | JPY (¥) · kg · °C | Act on Promotion of Food Loss Reduction (Act No. 19 of 2019) | Corporate Tax Act Art. 37 (Full Fair-Market Value Deduction) |
| **Australia 🇦🇺** | Sydney & NSW | AUD ($) · kg · °C | Civil Liability Act 2002 (Part 8A Food Donor Immunity) | Income Tax Assessment Act 1997 (DGR Special Valuation Rules) |
| **Singapore 🇸🇬** | Central Area | SGD ($) · kg · °C | Good Samaritan Food Donation Act 2024 | IRAS 250% Enhanced Tax Deduction for IPC Food Rescuers |
| **India 🇮🇳** | Mumbai Hub | INR (₹) · kg · °C | FSSAI Food Recovery Regulations 2019 | Income Tax Act Section 80G (50% Deduction on Qualified Donations) |
| **South Korea 🇰🇷** | Seoul Metro | KRW (₩) · kg · °C | Food Waste Reduction & Food Bank Support Act | Corporate Tax Act Art. 24 (Statutory Designated Donation Deductions) |

*Switch regions anytime using the Settings icon in the navigation bar to see localized legal citations, currencies, metric conversions, and regional food safety guidelines update dynamically.*

---

## 🛠 Technology Stack

### Frontend
- **React 18** + **TypeScript** (Functional components, custom hooks, strict mode).
- **Tailwind CSS v4** (Modern utility styling, CSS variables, native dark/light theme switching).
- **Lucide React** (Consistent, high-clarity iconography).
- **Web Audio API** (Synthesized zero-asset UI audio feedback).
- **Progressive Web App (PWA)**: Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`), Apple touch icons.

### Backend & AI
- **Express.js on Node.js 22** (Native ESM, type-stripping resolution).
- **Vite SSR/Dev Middleware** (Unified dev & production container lifecycle).
- **Google Gemini 2.5 Flash** (`@google/genai` TypeScript SDK):
  - Multimodal Vision parsing for messy refrigerators and crumpled grocery receipts.
  - Zero-waste culinary chef engine for allergen-filtered, ingredient-maximizing recipes.
- **USDA FoodKeeper Open Data Engine**: Embedded empirical shelf-life calculation matrix.

### Database & Cloud
- **Firebase Firestore**: Real-time subscriptions for kitchen items, surplus lots, and claim requests.
- **Firebase Authentication**: User accounts, session persistence, and RBAC token claims.
- **Google Cloud Run**: Containerized deployment serving on port 3000.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20+ (Node.js 22 recommended)
- npm or bun

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/C0DINGLE/AI-Builder-Cup.git
cd AI-Builder-Cup

# 2. Install dependencies
npm install

# 3. Create your environment configuration
cp .env.example .env

# 4. Start the full-stack development server
npm run dev
```

The application will be live at `http://localhost:3000`.

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Server Port
PORT=3000

# Google Gemini API Key (Required for Vision & Recipe AI)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (Already pre-configured in firebase-applet-config.json)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## 📦 Deployment & Production Build

### Building the Project
```bash
# Run TypeScript type check
npm run lint

# Build Vite frontend assets
npm run build

# Start the full-stack server
npm run start
```

### Docker / Cloud Run
The container uses `node server.ts` as its entrypoint, serving both API proxy routes (`/api/*`) and static client bundles via Vite middleware on port 3000.

---

## 🛡 Security & Firestore Hardening

- **Default-Deny Access**: Any document path not explicitly authorized in `firestore.rules` is strictly blocked.
- **Granular Ownership**: Users can only read and write their own household inventory items (`/users/{userId}/inventory/{itemId}`).
- **Commercial Lot Protection**: Only verified store donors can create surplus lots; only food bank coordinators can update claim statuses.
- **Post-AI Deterministic Filtering**: All recipes generated by LLMs are processed through deterministic TypeScript allergy rules (`allergyFilter.ts`) to ensure safety.

---

## 👥 Contributors & Acknowledgments

- **Lead Engineer & Architect**: Mujtaba Khurram ([@C0DINGLE](https://github.com/C0DINGLE))
- **Event**: Built for the **AI Builder Cup**
- **Data Grounding**: USDA FoodKeeper Open Research & United States Department of Agriculture Food Safety and Inspection Service.

---

*“Food waste is not an inevitability — it is an uncoordinated logistics and informational challenge that intelligent software can solve.”*
