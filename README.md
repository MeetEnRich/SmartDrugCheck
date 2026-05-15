# SmartDrugCheck

**SmartDrugCheck** is a professional, clinical-grade surveillance and authentication system designed to verify drug registration status against the live **NAFDAC Greenbook Database** in Nigeria.

Built for high-stakes clinical environments, the system provides real-time verification, deep pharmacological data integration, and automated surveillance logging to detect potential counterfeit hotspots.

## 🚀 Key Features

### 1. Smart Surveillance & Logging

- **Automated Surveillance**: Every verification attempt is logged with geolocation data, timestamps, and device metadata to identify suspicious querying patterns.
- **Administrative Intelligence**: A dedicated surveillance dashboard (via Django Admin) allows regulators to monitor failed verification attempts and geographic clusters of unverified products.

### 2. Clinical Intelligence

- **Real-time Verification**: Proxies directly into the official NAFDAC Greenbook API for 100% authoritative data.
- **Deep Pharmacological Data**: Automatically extracts **Chemical Composition**, **ATC Classification Codes**, and manufacturer details.
- **Automated Expiry Detection**: The system parses registration dates and automatically flags products with expired or lapsed registration status with high-visibility alerts.
- **Clinical Guidelines (SMPC)**: Direct integration with official **Summary of Product Characteristics** PDF guidelines hosted by NAFDAC.

### 3. Modernized UX & Tooling

- **Integrated Barcode Scanner**: Browser-based scanning using `@zxing/browser`—point your device camera at a product barcode for instant identification.
- **React Router Navigation**: Persistent deep-linking between the **Verification Portal** and the **Greenbook Directory**.
- **Paginated Local Archive**: Seamless access to a localized fallback database of ~9,000+ records for offline browsing or server-down scenarios.

### 4. Security & Robustness

- **Input Sanitization**: Regex-based sanitization on both frontend and backend to prevent SQL injection and cross-site scripting (XSS).
- **Fault-Tolerant Architecture**: Intelligent "Live-First, Local-Second" fallback logic ensures the application stays functional even if the national servers are unreachable.

---

## 🛠️ Architecture

- **Frontend**: React 18 (Vite)
  - `react-router-dom` for application state persistence.
  - `lucide-react` for clinical iconography.
  - Custom refined CSS architecture for medical-density data display.
- **Backend**: Django 6.0.5 (DRF)
  - Authoritative API Proxy and input validation engine.
  - SQLite3 relational engine for surveillance logging and local archiving.
- **Deployment**: Automated batch scripts for environment initialization and dual-server orchestration.

---

## ⚙️ Getting Started

### 1. First Time Setup

Double-click **`setup_project.bat`**. This script:

- Builds a Python virtual environment (`venv`).
- Installs pinned, secure dependencies from `requirements.txt`.
- Installs frontend packages via `npm`.

### 2. Launch the System

Double-click **`start_system.bat`**. This launches:

- The **Django API Server** (Port 8000).
- The **Vite Frontend** (Port 5173).
- Your browser will open the portal automatically.

### 3. Administrative Surveillance

To access the surveillance log dashboard at `http://localhost:8000/admin/`, you first need to create a superuser account:

1. Open a terminal in the `backend` folder.
2. Activate the virtual environment: `..\venv\Scripts\activate`
3. Run: `python manage.py createsuperuser`
4. Follow the prompts to set a username and password.

Once created, visit `http://localhost:8000/admin`, log in, and use the **Verification Logs** section to audit drug verification attempts.

---

## 📜 Disclaimer

This system is an academic implementation designed for clinical demonstration. Official verification should always be confirmed through official NAFDAC communication channels.
