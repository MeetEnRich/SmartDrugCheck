# SmartDrugCheck — Implementation Instructions
## Aligning the Codebase with the Project Documentation

> **Context:** These instructions are for the `SmartDrugCheck-master` project — a Nigerian drug
> authentication web app. The stack is **React (Vite) frontend** on port 5173 and a
> **Django REST Framework backend** on port 8000, with a local **SQLite** fallback database
> of ~9,000 NAFDAC drug records. Read every existing file carefully before making changes.
> Do not break existing working features (NRN search, name search, directory page).

---

## CRITICAL FIX 1 — Correct the Django Version in `requirements.txt`

**File:** `requirements.txt` (root of project)

**Problem:** `Django==6.0.5` does not exist. This causes `pip install` to fail entirely,
meaning nobody can run the project.

**Action:** Replace the Django line:

```
# REPLACE THIS:
Django==6.0.5

# WITH THIS:
Django==5.0.6
```

Also update these outdated pinned packages in the same file to avoid dependency conflicts:

```
# REPLACE:
requests==2.25.1
chardet==4.0.0
idna==2.10
urllib3==1.26.20

# WITH:
requests==2.31.0
chardet==5.2.0
idna==3.6
urllib3==2.2.1
```

---

## CRITICAL FIX 2 — Fix the Scraper-to-Database Pipeline (Two-Table Mismatch)

**Problem:** `Scrape/scrape-greenbook.py` creates a `products` table in `nafdac_drugs.db`.
`Scrape/create-db.py` creates a separate `drugs` table (which Django reads from) by loading
`nafdac_raw.json`. The README does not tell users to run `create-db.py` after scraping.
Anyone running the scraper fresh ends up with only a `products` table, Django can't find
`drugs`, and the fallback database breaks.

**Action — update `README.md`:** Add a "Database Setup" section under "Getting Started":

```markdown
### 3. Database Setup (If Re-Scraping)

If you run the scraper to refresh data, you must also rebuild the Django-compatible
database table:

```bash
cd Scrape
python scrape-greenbook.py   # Downloads all records → nafdac_raw.json + nafdac_drugs.db (products table)
python create-db.py          # Reads nafdac_raw.json → builds the `drugs` table Django uses
cp nafdac_drugs.db ../db.sqlite3  # Copy the finished DB to the project root
```
```

**Action — update `Scrape/scrape-greenbook.py`:** At the very end of the `if __name__ == "__main__":` block, after saving the JSON, automatically call the `create-db.py` logic so users don't have to remember the second step. Import and call it inline:

```python
# Add at the bottom of scrape-greenbook.py, after the JSON save:
import subprocess, sys
print("Building Django-compatible drugs table...")
subprocess.run([sys.executable, "create-db.py"], check=True)
print("Done. Copy nafdac_drugs.db to the project root as db.sqlite3.")
```

---

## FEATURE 1 — Verification Logging (Surveillance Module)

**Documentation reference:** Chapter 1.3 Objective 3, Chapter 3.5.1, Chapter 3.5.2 ER Diagram.

The documentation defines a `Verification_Log` entity:
`(log_id, user_id, nrn_queried, status, timestamp, geolocation)`

And states: *"implement an automated reporting module that logs metadata from failed
authentications for regulatory surveillance."*

### Step 1 — Create the VerificationLog model

**File:** `backend/api/models.py`

Add this model below the existing `Drug` model:

```python
from django.utils import timezone

class VerificationLog(models.Model):
    """
    Logs every drug verification attempt for surveillance purposes.
    Aligns with the Verification_Log entity in the ER diagram (Chapter 3.5.2).
    """
    nrn_queried   = models.CharField(max_length=50, blank=True, null=True)
    name_queried  = models.CharField(max_length=200, blank=True, null=True)
    status        = models.CharField(max_length=30)   # 'found_live', 'found_local', 'not_found'
    source        = models.CharField(max_length=30, blank=True, null=True)  # 'live_api' or 'local_fallback'
    timestamp     = models.DateTimeField(default=timezone.now)
    geolocation   = models.CharField(max_length=100, blank=True, null=True)  # "lat,lng" string from frontend
    user_agent    = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'verification_log'
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.nrn_queried or self.name_queried} → {self.status}"
```

### Step 2 — Create and run the migration

```bash
cd backend
python manage.py makemigrations api
python manage.py migrate
```

### Step 3 — Register the model in Django Admin

**File:** `backend/api/admin.py`

Replace the entire file content with:

```python
from django.contrib import admin
from .models import VerificationLog

@admin.register(VerificationLog)
class VerificationLogAdmin(admin.ModelAdmin):
    list_display  = ('timestamp', 'nrn_queried', 'name_queried', 'status', 'source', 'geolocation')
    list_filter   = ('status', 'source')
    search_fields = ('nrn_queried', 'name_queried')
    readonly_fields = ('timestamp',)
    ordering      = ('-timestamp',)
```

### Step 4 — Update the serializer

**File:** `backend/api/serializers.py`

Replace the entire file with:

```python
from rest_framework import serializers
from .models import Drug, VerificationLog

class DrugSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Drug
        fields = '__all__'

class VerificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VerificationLog
        fields = '__all__'
        read_only_fields = ('timestamp',)
```

### Step 5 — Update `views.py` to log every verification attempt

**File:** `backend/api/views.py`

At the top of the file, add the import:

```python
from .models import Drug, VerificationLog
```

Inside the `VerifyDrugView.get()` method, update it so it saves a log entry after every
query result. Here is the complete replacement for `VerifyDrugView`:

```python
class VerifyDrugView(APIView):
    def get(self, request):
        nrn        = request.query_params.get('nrn')
        name       = request.query_params.get('name')
        geolocation = request.query_params.get('geo', None)   # "lat,lng" sent by frontend

        if not nrn and not name:
            return Response(
                {"error": "Provide 'nrn' or 'name' parameter"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # --- Attempt 1: Live NAFDAC API ---
        try:
            query      = nrn if nrn else name
            search_col = 5 if nrn else 0

            live_result = fetch_from_greenbook(query, search_col)

            if live_result:
                live_result['_source'] = 'live_api'

                # Log successful live lookup
                VerificationLog.objects.create(
                    nrn_queried  = nrn,
                    name_queried = name,
                    status       = 'found_live',
                    source       = 'live_api',
                    geolocation  = geolocation,
                    user_agent   = user_agent,
                )

                return Response(live_result, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Live API error: {e}")

        # --- Attempt 2: Local SQLite fallback ---
        if nrn:
            try:
                drug       = Drug.objects.get(nafdac_reg_no=nrn)
                serializer = DrugSerializer(drug)
                data       = serializer.data
                data['_source'] = 'local_fallback'

                VerificationLog.objects.create(
                    nrn_queried = nrn,
                    status      = 'found_local',
                    source      = 'local_fallback',
                    geolocation = geolocation,
                    user_agent  = user_agent,
                )

                return Response(data, status=status.HTTP_200_OK)

            except Drug.DoesNotExist:
                # Log failed lookup — this is the key surveillance event
                VerificationLog.objects.create(
                    nrn_queried = nrn,
                    status      = 'not_found',
                    source      = 'local_fallback',
                    geolocation = geolocation,
                    user_agent  = user_agent,
                )
                return Response(
                    {"error": "Drug not found", "found": False, "_source": "local_fallback"},
                    status=status.HTTP_200_OK
                )

        if name:
            drugs = (
                Drug.objects.filter(product_name__icontains=name) |
                Drug.objects.filter(active_ingredient__icontains=name)
            )
            if drugs.exists():
                serializer = DrugSerializer(drugs.first())
                data       = serializer.data
                data['_source'] = 'local_fallback'

                VerificationLog.objects.create(
                    name_queried = name,
                    status       = 'found_local',
                    source       = 'local_fallback',
                    geolocation  = geolocation,
                    user_agent   = user_agent,
                )

                return Response(data, status=status.HTTP_200_OK)

            # Log failed name search
            VerificationLog.objects.create(
                name_queried = name,
                status       = 'not_found',
                source       = 'local_fallback',
                geolocation  = geolocation,
                user_agent   = user_agent,
            )
            return Response(
                {"error": "Drug not found", "found": False, "_source": "local_fallback"},
                status=status.HTTP_200_OK
            )
```

### Step 6 — Add a log analytics API endpoint

**File:** `backend/api/views.py` — add this new view at the bottom:

```python
class VerificationLogView(generics.ListAPIView):
    """
    Admin endpoint: returns all verification logs with optional filtering.
    Supports: ?status=not_found  ?limit=100
    Used by the Admin Analytics dashboard (Chapter 3.4.3).
    """
    serializer_class   = VerificationLogSerializer
    pagination_class   = StandardResultsSetPagination

    def get_queryset(self):
        queryset = VerificationLog.objects.all()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset
```

### Step 7 — Register the new URL

**File:** `backend/urls.py` — replace the entire file with:

```python
from django.contrib import admin
from django.urls import path
from api.views import VerifyDrugView, DrugListView, VerificationLogView

urlpatterns = [
    path('admin/',        admin.site.urls),
    path('api/verify/',   VerifyDrugView.as_view(),        name='verify-drug'),
    path('api/drugs/',    DrugListView.as_view(),           name='drug-list'),
    path('api/logs/',     VerificationLogView.as_view(),    name='verification-logs'),
]
```

### Step 8 — Send geolocation from the frontend

**File:** `frontend/src/App.jsx`

Add a geolocation helper function near the top of the `App()` component, after the state
declarations:

```javascript
// Get device geolocation once and store it
const [userGeo, setUserGeo] = useState('');

useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserGeo(`${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`),
      () => setUserGeo('unavailable')
    );
  }
}, []);
```

Then update the `handleSearch` function to append `&geo=` to the verify API call:

```javascript
const response = await fetch(
  `http://127.0.0.1:8000/api/verify/?${type}=${encodeURIComponent(query)}&geo=${encodeURIComponent(userGeo)}`
);
```

---

## FEATURE 2 — Complete Barcode Scanning

**Documentation reference:** Chapter 1.3 Objective 1, Chapter 3.4.3 Use Case "Scan Barcode",
Chapter 3.5.1 "Image Processing Module."

The camera UI is already built. What is missing is barcode decoding. Use the `@zxing/browser`
library which works entirely in the browser with no backend needed.

### Step 1 — Install the barcode library

```bash
cd frontend
npm install @zxing/browser @zxing/library
```

### Step 2 — Replace the scanner section in `App.jsx`

At the top of `App.jsx`, add the import:

```javascript
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser';
```

Replace the existing scanner state and functions with:

```javascript
// Scanner State
const videoRef      = useRef(null);
const [isScanning, setIsScanning]   = useState(false);
const [scanStatus, setScanStatus]   = useState('');   // feedback message
const streamRef     = useRef(null);
const codeReaderRef = useRef(null);

const startScan = async () => {
  setIsScanning(true);
  setScanStatus('Activating camera...');
  setResult(null);
  setError('');

  try {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    setScanStatus('Point camera at the barcode on the drug packaging...');

    // Continuously decode frames from the video element
    codeReader.decodeFromVideoElement(videoRef.current, (result, err) => {
      if (result) {
        const scannedText = result.getText();
        setScanStatus(`Barcode detected: ${scannedText}`);
        stopScan();
        // Feed the scanned value into the NRN search
        setNrnInput(scannedText);
        setActiveTab('nrn');
        handleSearch(scannedText, 'nrn');
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error('Scan error:', err);
      }
    });

  } catch (err) {
    console.error(err);
    setError('Camera access denied or unavailable.');
    setScanStatus('');
    setIsScanning(false);
  }
};

const stopScan = () => {
  if (codeReaderRef.current) {
    codeReaderRef.current.reset?.();
    codeReaderRef.current = null;
  }
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }
  setIsScanning(false);
};
```

In the JSX for the scan tab, add the `scanStatus` message below the video:

```jsx
{activeTab === 'scan' && (
  <div>
    {!isScanning ? (
      <div className="scanner-frame" onClick={startScan}>
        <div className="scanner-frame-icon">
          <ScanLine size={64} strokeWidth={1} />
        </div>
        <h3>Activate Camera</h3>
        <p>Click to start the barcode scanner</p>
      </div>
    ) : (
      <div>
        <div className="active-scanner-container">
          <video ref={videoRef} autoPlay playsInline muted></video>
          <div className="scan-line"></div>
        </div>
        {scanStatus && (
          <p className="help-text" style={{ marginTop: '12px', textAlign: 'center' }}>
            {scanStatus}
          </p>
        )}
        <button className="btn-secondary" onClick={stopScan}>
          Stop Camera
        </button>
      </div>
    )}
  </div>
)}
```

---

## FEATURE 3 — Input Sanitization

**Documentation reference:** Chapter 3.5.5 Pseudocode: `SANITIZE input_nrn (REMOVE SPECIAL_CHARS)`,
Chapter 3.5.6 Security Evaluation.

### Step 1 — Backend sanitization

**File:** `backend/api/views.py`

Add this helper function near the top of the file (below the imports, before the view classes):

```python
import re

def sanitize_input(value: str) -> str:
    """
    Removes characters that are not alphanumeric, spaces, or common NRN separators.
    Aligns with the pseudocode in Chapter 3.5.5 and the security evaluation in 3.5.6.
    Protects against SQL injection and path traversal — although Django ORM already uses
    parameterized queries, this adds an explicit validation layer as documented.
    """
    if not value:
        return value
    # Allow: letters, digits, hyphens, forward-slash (common in NRNs like A4-1234)
    sanitized = re.sub(r'[^\w\s\-/]', '', value)
    return sanitized.strip()[:100]   # hard cap at 100 chars
```

Then in `VerifyDrugView.get()`, sanitize inputs immediately after reading them:

```python
nrn  = sanitize_input(request.query_params.get('nrn', '')) or None
name = sanitize_input(request.query_params.get('name', '')) or None
```

### Step 2 — Frontend validation

**File:** `frontend/src/App.jsx`

Update the `handleSearch` function to validate the NRN format before sending:

```javascript
const handleSearch = async (query, type) => {
  if (!query.trim()) return;

  // Sanitize: strip characters that don't belong in an NRN or drug name
  const sanitized = query.replace(/[^\w\s\-/]/g, '').trim();
  if (!sanitized) {
    setError('Invalid input. Please enter a valid NRN or drug name.');
    return;
  }

  // NRN format hint validation (e.g. A4-1234 or 04-2345)
  if (type === 'nrn' && sanitized.length < 3) {
    setError('NRN is too short. Example format: A4-1234 or 04-2345');
    return;
  }

  setIsLoading(true);
  setError('');
  setResult(null);

  // ... rest of the existing fetch logic, using `sanitized` instead of `query`
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/verify/?${type}=${encodeURIComponent(sanitized)}&geo=${encodeURIComponent(userGeo)}`
    );
    // ... existing response handling unchanged
  }
  // ... existing catch/finally unchanged
};
```

---

## FEATURE 4 — Fix the Data Dictionary (status field type)

**Documentation reference:** Chapter 3.5.4 Data Dictionary defines `status` as `BOOLEAN`.
The implementation stores `"Active"` / `"Inactive"` as TEXT. The documentation must match
the implementation.

**Action — update the Data Dictionary table in the docx (Chapter 3.5.4):**

Change the `status` row from:

| status | BOOLEAN | Indicates if the drug is currently approved. |

To:

| status | VARCHAR(20) | Registration status of the drug. Values: "Active" or "Inactive". |

---

## FEATURE 5 — Add a Retry Button to the Directory Error State

**Documentation reference:** Chapter 3.5.3 Input/Output Design — the system should always
give the user a path forward.

**File:** `frontend/src/App.jsx`

In the `renderDirectoryPage()` function, find the `directoryError` block and replace it:

```jsx
) : directoryError ? (
  <div className="inspector-placeholder" style={{ padding: '64px', color: 'var(--error)' }}>
    <AlertCircle size={48} className="inspector-placeholder-icon" style={{ color: 'var(--error)' }} />
    <p>{directoryError}</p>
    <button
      className="btn-secondary"
      style={{ marginTop: '24px' }}
      onClick={() => fetchDirectory(currentPage)}
    >
      Retry
    </button>
  </div>
```

---

## FEATURE 6 — Move the API Base URL to an Environment Variable

**Documentation reference:** Chapter 3.4.2 Architecture — the system should be deployable
beyond localhost. Chapters 4 and 5 will discuss deployment.

### Step 1 — Create the env file

**New file:** `frontend/.env`

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**New file:** `frontend/.env.production`

```
VITE_API_BASE_URL=https://your-production-domain.com
```

Add `.env` to `frontend/.gitignore` (it is already listed there, but confirm).

### Step 2 — Use the env variable in `App.jsx`

At the very top of `App.jsx`, add:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
```

Then replace every occurrence of `http://127.0.0.1:8000` in the file with `${API_BASE}`.

There are two occurrences:
- In `fetchDirectory`: `` `${API_BASE}/api/drugs/?page=...` ``
- In `handleSearch`: `` `${API_BASE}/api/verify/?...` ``

---

## FEATURE 7 — Create a Django Superuser for Admin Access

**Documentation reference:** Chapter 3.4.3 — Admin Actor with "Manage User Accounts",
"View Failed Scan Analytics."

The Django admin panel (`/admin/`) is already wired up. After running migrations (FEATURE 1,
Step 2), create the admin user:

```bash
cd backend
python manage.py createsuperuser
# Follow the prompts: enter username, email, password
```

The admin will then be able to:
- View all `VerificationLog` entries at `http://127.0.0.1:8000/admin/`
- Filter by `status=not_found` to see failed/suspicious lookups (geographic hotspots)
- Search by NRN or drug name

---

## FEATURE 8 — Update `setup_project.bat` to Run Migrations Automatically

**File:** `setup_project.bat` (root of project)

Find the section that runs backend setup (after `pip install`) and add migration commands:

```bat
echo Running database migrations...
cd backend
..\venv\Scripts\activate && python manage.py makemigrations api && python manage.py migrate
cd ..
echo Migrations complete.
```

This ensures the `verification_log` table is created automatically on first setup so
users don't have to run migrations manually.

---

## VERIFICATION CHECKLIST

After implementing all of the above, verify the following:

**Backend:**
- [ ] `pip install -r requirements.txt` completes without errors
- [ ] `python manage.py migrate` creates a `verification_log` table in `db.sqlite3`
- [ ] `GET /api/verify/?nrn=A4-0001` returns a result AND creates a row in `verification_log`
- [ ] `GET /api/verify/?nrn=FAKE-9999` returns `not_found` AND creates a log row with `status=not_found`
- [ ] `GET /api/logs/` returns paginated log entries
- [ ] `GET /api/logs/?status=not_found` returns only failed lookups
- [ ] Django admin at `/admin/` shows the VerificationLog table with all entries
- [ ] Inputs containing `'; DROP TABLE drugs; --` are sanitized to `DROP TABLE drugs`

**Frontend:**
- [ ] Barcode scanner tab opens the camera and decodes a barcode (test with any QR/barcode)
- [ ] A successful scan auto-populates the NRN field and triggers a search
- [ ] Geolocation permission prompt appears on first load
- [ ] Directory error state shows a Retry button
- [ ] No hardcoded `127.0.0.1:8000` strings remain in `App.jsx`

**Documentation alignment:**
- [ ] `status` field in Data Dictionary updated from BOOLEAN to VARCHAR(20)
- [ ] README includes the three-step database setup instructions
- [ ] Chapter 4 (when written) mentions `_source` flag and the logging module

---

## FILE CHANGE SUMMARY

| File | Change Type | Feature |
|---|---|---|
| `requirements.txt` | Fix | Critical Fix 1 — Django version |
| `Scrape/scrape-greenbook.py` | Update | Critical Fix 2 — Auto-run create-db |
| `README.md` | Update | Critical Fix 2 — Document DB setup |
| `backend/api/models.py` | Add model | Feature 1 — VerificationLog |
| `backend/api/admin.py` | Replace | Feature 1 — Register log in admin |
| `backend/api/serializers.py` | Add serializer | Feature 1 — LogSerializer |
| `backend/api/views.py` | Update + Add | Features 1 & 3 — Logging + Sanitization |
| `backend/urls.py` | Add URL | Feature 1 — `/api/logs/` endpoint |
| `frontend/src/App.jsx` | Update | Features 1,2,3,5,6 — All frontend work |
| `frontend/package.json` | Add dependency | Feature 2 — `@zxing/browser` |
| `frontend/.env` | New file | Feature 6 — API base URL |
| `frontend/.env.production` | New file | Feature 6 — Production URL |
| `setup_project.bat` | Update | Feature 8 — Auto-migrate on setup |
