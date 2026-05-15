# SmartDrugCheck

**SmartDrugCheck** is a professional, enterprise-grade web application designed to authenticate and verify drug registration status directly against the live **NAFDAC Greenbook Database** in Nigeria.

This project was built to demonstrate a full-stack, fault-tolerant web architecture as part of a final year Computer Science presentation.

## Key Features

- **Live NAFDAC Verification**: The system acts as a secure backend proxy to query the official NAFDAC Greenbook API in real-time, retrieving live data.
- **Fault-Tolerant Fallback**: In the event that the NAFDAC servers are offline or unreachable, the system automatically seamlessly fails over to an internal SQLite database (containing ~9,000 scraped records) ensuring the application never crashes during a presentation or critical lookup.
- **Offline Greenbook Directory**: A dedicated, paginated interface allowing users to natively browse all 9,000+ local records seamlessly when offline.
- **Advanced Directory Search**: Native search functionality to filter the local registry by drug name, NAFDAC number, or active ingredient.
- **Clinical Dashboard UI**: A highly professional, split-screen React (Vite) interface tailored for rapid pharmacist data entry.
- **Barcode Scanning Integration**: Connects to the device camera to read product barcodes (infrastructure ready).
- **Digital Certificate Generation**: Search results are formatted and presented beautifully as official digital data sheets.

## Architecture

This is a modern 3-Tier application:

1. **Frontend**: React.js (via Vite)
   - Uses `react-router-dom` for robust, shareable URL routing.
   - Built on modern CSS Grid/Flexbox architecture.
   - `lucide-react` for premium SVG iconography.
   - Zero external UI libraries (Custom Clinical Light Mode CSS).
2. **Backend / Proxy**: Django REST Framework (Python)
   - Serves as an API proxy to bypass browser CORS restrictions when hitting the live NAFDAC portal.
   - Uses the `requests` library to intercept, format, and return JSON data.
3. **Database (Fallback)**: SQLite3
   - A localized database of records to guarantee 100% uptime in demo scenarios.

## Getting Started

The project includes automation scripts to make setup and execution effortless for presentations.

### 1. First Time Setup

If you are running the project for the first time, simply double-click the **`setup_project.bat`** file in the root directory.

- This will automatically create your Python virtual environment.
- It will install all backend dependencies from `requirements.txt`.
- It will install all frontend dependencies via `npm install`.

### 2. Starting the System

Once setup is complete, double-click **`start_system.bat`**.

- This will launch both the **Django Backend** and the **Vite Frontend** in two separate, labeled terminal windows automatically.
- Your browser should automatically open (or you can go to `http://localhost:5173`).

---

### Manual Commands (Fallback)

If you prefer to run things manually:

- **Backend**: `cd backend && ..\venv\Scripts\activate && python manage.py runserver`
- **Frontend**: `cd frontend && npm run dev`

## Usage Flow

1. Enter a NAFDAC Registration Number (e.g., `A4-1234`) or a drug name (e.g., `Paracetamol`) in the Main Stage input.
2. Click **Verify**.
3. The Django Backend intercepts the request.
4. **Attempt 1**: The backend securely calls `https://greenbook.nafdac.gov.ng/` in real-time.
5. **Attempt 2 (Fallback)**: If the live NAFDAC server is down or returns a connection error, the backend instantly queries the localized `db.sqlite3` database instead.
6. The data is returned and beautifully rendered in the right-hand **Result Inspector** panel as a digital certificate.

## Disclaimer

This project was developed strictly for academic demonstration purposes. Official drug verification should always be cross-referenced with the official NAFDAC portal.
