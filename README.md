# 🚨 SafeSignal — Real-Time Emergency SOS & Safety Response Platform

> **An intelligent emergency SOS and incident command system providing instant panic triggers, dynamic QR-code guest onboarding, real-time GPS tracking, automated SMS alert broadcasts, and live dispatch dashboards.**

SafeSignal is a mission-critical safety platform built for venues, campuses, corporate environments, and events. It bridges individuals in distress with security staff and emergency response teams with zero onboarding friction — allowing guests to trigger geo-located distress alerts instantly via dynamic QR scanning or browser access, with live tracking on interactive OpenStreetMap layers.

---

## ✨ Features

- 🆘 **One-Tap Emergency SOS Trigger** — Rapid distress activation capturing high-precision GPS coordinates from device hardware with live status telemetry.
- 📱 **Frictionless QR Code Onboarding** — Instant guest check-in and SOS access via dynamic QR generation (`qrcode.react`) and in-app camera scanning (`html5-qrcode`).
- 🗺️ **Live Incident Response GIS Map** — Real-time emergency visualization powered by Leaflet and OpenStreetMap showing active alerts, responder locations, and distress vectors.
- 💬 **Automated Emergency SMS Dispatch** — Integrates Fast2SMS gateway to broadcast immediate SMS alerts with live tracking links to pre-configured emergency contacts.
- 🔄 **Real-Time Data Sync** — WebSocket-backed live state synchronization via Firebase Firestore `onSnapshot` listeners with sub-second incident updates.
- 👥 **Multi-Role Security Architecture** — Segmented roles for Event Administrators, On-Ground Security Staff, and Anonymous/Guest Distress Callers.
- 🎨 **Deep Dark Glassmorphism UI** — High-contrast, mobile-first design system crafted with Tailwind CSS and Lucide React icons for high-stress visibility.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite |
| **Styling & Design** | Tailwind CSS v3, Glassmorphism UI, Lucide React |
| **Notifications** | React Hot Toast |
| **Mapping & Geolocation** | Leaflet.js, React-Leaflet, OpenStreetMap, HTML5 Geolocation API |
| **QR Code Engine** | HTML5-QRCode (Scanner), QRCode.react (Generator) |
| **Backend & Real-Time Sync** | Firebase Firestore (Real-time NoSQL) + Firebase Auth |
| **SMS Gateway** | Fast2SMS REST API |

---

## 📁 Folder Structure

```
SafeSignal/
├── src/
│   ├── assets/                 # Branding, logos, and graphics
│   ├── components/             # Reusable UI elements, SOS buttons, maps, headers
│   ├── context/                # Authentication & active alert state providers
│   ├── hooks/                  # Geolocation, camera, and network hooks
│   ├── pages/                  # Views (LandingPage, Home, GuestLogin, StaffAuth, CompanyAuth)
│   ├── utils/                  # SMS dispatch, formatting, and coordinate helpers
│   ├── firebase.js             # Firebase service initialization & configuration
│   ├── App.jsx                 # Routing and main application controller
│   └── main.jsx                # Application bootstrap
├── public/                     # Public static icons and assets
├── Architecture_Diagram.png    # System architecture diagram
├── Application_Flowchart.png   # Full application user flow diagram
├── SafeSignal_Architecture_Docs.md # Technical presentation specifications
├── firebase.json               # Firebase deployment configuration
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.js          # Tailwind CSS design system configuration
└── vite.config.js              # Vite bundler configuration
```

---

## 🚀 How to Install and Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) & `npm`
- A Firebase project with Firestore and Authentication enabled

### 1. Clone the Repository
```bash
git clone https://github.com/karthiban3333-maker/SafeSignal.git
cd SafeSignal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FAST2SMS_API_KEY=your_fast2sms_api_key
```

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 📸 Screenshots

> _Add screenshots here._

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👨‍💻 Author

**Karthiban A** — [Kode Prime](https://github.com/karthiban3333-maker)
