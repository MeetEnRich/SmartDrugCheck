import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { 
  ShieldCheck, 
  Search, 
  Hash, 
  ScanLine, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  Activity, 
  BookOpen, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function App() {
  const location = useLocation();
  
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
  
  // Directory State
  const [directoryData, setDirectoryData] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [directorySearch, setDirectorySearch] = useState('');
  
  // Verification State
  const [activeTab, setActiveTab] = useState('nrn');
  const [nrnInput, setNrnInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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

  const fetchDirectory = async (page, search = directorySearch) => {
    setDirectoryLoading(true);
    setDirectoryError('');
    try {
      const response = await fetch(`${API_BASE}/api/drugs/?page=${page}&search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch directory data.');
      const data = await response.json();
      setDirectoryData(data.results);
      setTotalPages(Math.ceil(data.count / 10));
      setCurrentPage(page);
    } catch (err) {
      setDirectoryError('Could not load directory. Is the backend running?');
    } finally {
      setDirectoryLoading(false);
    }
  };

  const handleDirectorySearch = (e) => {
    const value = e.target.value;
    setDirectorySearch(value);
  };

  const executeDirectorySearch = (e) => {
    e.preventDefault();
    fetchDirectory(1, directorySearch);
  };

  useEffect(() => {
    if (location.pathname === '/directory' && directoryData.length === 0) {
      fetchDirectory(1);
    }
  }, [location.pathname]);

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

    try {
      const response = await fetch(
        `${API_BASE}/api/verify/?${type}=${encodeURIComponent(sanitized)}&geo=${encodeURIComponent(userGeo)}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch from backend');
      }
      
      const data = await response.json();
      
      if (data.found === false) {
        setResult({ error: true, query });
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Could not connect to the DrugCheck server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInspector = () => {
    if (isLoading) {
      return (
        <div className="inspector-placeholder">
          <Loader2 className="spinner" size={48} />
          <p style={{ marginTop: '24px' }}>Querying National Database...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="inspector-placeholder" style={{ color: 'var(--error)' }}>
          <AlertCircle size={48} className="inspector-placeholder-icon" style={{ color: 'var(--error)' }} />
          <p>{error}</p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="inspector-placeholder">
          <ShieldCheck size={64} className="inspector-placeholder-icon" />
          <p>Enter a NAFDAC Registration Number or scan a barcode to view the official product certificate.</p>
        </div>
      );
    }

    if (result.error) {
      return (
        <div className="certificate">
          <div className="cert-header invalid">
            <div className="cert-icon">
              <XCircle size={32} />
            </div>
            <div className="cert-title-area">
              <span className="cert-status-badge">Unverified</span>
              <h2 className="cert-title">Record Not Found</h2>
              <p className="cert-subtitle">The query "{result.query}" does not exist in the official registry.</p>
            </div>
          </div>
          <div className="cert-body">
             <div className="inspector-placeholder" style={{ flex: 1, margin: 0, background: 'none' }}>
                <p>Ensure the NRN is typed correctly (e.g., A4-1234 or 04-2345). If the product still cannot be found, it may be unregistered.</p>
             </div>
          </div>
        </div>
      );
    }

    const isActive = result.status === 'Active';
    
    // Simple expiry check (assuming YYYY-MM-DD format)
    const isExpired = result.expiry_date && new Date(result.expiry_date) < new Date();

    return (
      <div className="certificate">
        <div className={`cert-header ${!isActive ? 'warning' : isExpired ? 'danger' : 'valid'}`}>
          <div className="cert-icon">
            {isActive && !isExpired ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
          </div>
          <div className="cert-title-area">
            <span className="cert-status-badge">
              {!isActive ? 'Inactive Record' : isExpired ? 'Critical: Expired' : 'Verified Authentic'}
            </span>
            <h2 className="cert-title">{result.product_name || 'Unknown Product'}</h2>
            <p className="cert-subtitle">{result.applicant || 'Unknown Manufacturer'}</p>
          </div>
        </div>
        
        <div className="cert-body">
          <div className="data-row">
            <div className="data-label">NAFDAC Reg No</div>
            <div className="data-value mono">{result.nafdac_reg_no || '—'}</div>
          </div>
          <div className="data-row">
            <div className="data-label">Active Ingredient</div>
            <div className="data-value">{result.active_ingredient || '—'}</div>
          </div>
          <div className="data-row">
            <div className="data-label">Expiry Date</div>
            <div className="data-value" style={{ color: isExpired ? 'var(--error)' : 'inherit', fontWeight: isExpired ? 700 : 400 }}>
              {result.expiry_date || '—'} {isExpired && '⚠️'}
            </div>
          </div>
          
          <div className="data-row-vertical">
            <div className="data-label">Clinical Composition</div>
            <div className="data-value-box">
              {result.composition || 'Composition details not available in current record.'}
            </div>
          </div>

          <div className="cert-actions">
            {result.smpc_url && (
              <a 
                href={result.smpc_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-outline-small"
              >
                <BookOpen size={14} /> View Clinical SMPC Guidelines
              </a>
            )}
            {result.atc_code && (
              <span className="atc-badge">ATC: {result.atc_code}</span>
            )}
          </div>
        </div>

        <div className="cert-footer">
          <span>Source: {result._source === 'live_api' ? 'NAFDAC Real-time' : 'Local Archive'}</span>
          <div className="watermark">
            <ShieldCheck size={14} /> Official Record
          </div>
        </div>
      </div>
    );
  };

  const renderVerificationPage = () => (
    <>
      <header className="main-header">
        <h1>Product Verification</h1>
        <p>Check products against the NAFDAC registered database</p>
      </header>

      <div className="stage-container">
        {/* Left Panel: Verification Tools */}
        <div className="verification-tool">
          <div className="tool-card">
            <div className="segmented-control">
              <button 
                className={`segment-btn ${activeTab === 'nrn' ? 'active' : ''}`}
                onClick={() => { setActiveTab('nrn'); setResult(null); setError(''); stopScan(); }}
              >
                NRN Input
              </button>
              <button 
                className={`segment-btn ${activeTab === 'name' ? 'active' : ''}`}
                onClick={() => { setActiveTab('name'); setResult(null); setError(''); stopScan(); }}
              >
                Text Search
              </button>
              <button 
                className={`segment-btn ${activeTab === 'scan' ? 'active' : ''}`}
                onClick={() => { setActiveTab('scan'); setResult(null); setError(''); }}
              >
                Barcode Scan
              </button>
            </div>

            <div className="tool-body">
              {activeTab === 'nrn' && (
                <div>
                  <div className="large-input-wrapper">
                    <Hash className="large-input-icon" size={24} />
                    <input 
                      type="text" 
                      className="large-input"
                      placeholder="e.g. A4-1234 or 04-2345"
                      value={nrnInput}
                      onChange={(e) => setNrnInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(nrnInput, 'nrn')}
                      spellCheck="false"
                    />
                  </div>
                  <button className="btn-primary" onClick={() => handleSearch(nrnInput, 'nrn')} disabled={isLoading || !nrnInput.trim()}>
                    Verify Registration Number
                  </button>
                  <p className="help-text">Locate the NAFDAC Registration Number printed on the product packaging.</p>
                </div>
              )}

              {activeTab === 'name' && (
                <div>
                  <div className="large-input-wrapper">
                    <Search className="large-input-icon" size={24} />
                    <input 
                      type="text" 
                      className="large-input"
                      placeholder="e.g. Paracetamol, Amoxicillin..."
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(nameInput, 'name')}
                    />
                  </div>
                  <button className="btn-primary" onClick={() => handleSearch(nameInput, 'name')} disabled={isLoading || !nameInput.trim()}>
                    Search Database
                  </button>
                  <p className="help-text">Search by the product's brand name or generic active ingredient.</p>
                </div>
              )}

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
            </div>
          </div>
        </div>

        {/* Right Panel: Result Inspector */}
        <div className="inspector-panel">
          {renderInspector()}
        </div>
      </div>
    </>
  );

  const renderDirectoryPage = () => (
    <>
      <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Greenbook Directory</h1>
          <p>Browse the complete list of locally synchronized NAFDAC registered products</p>
        </div>
        <form onSubmit={executeDirectorySearch} className="directory-search-form">
          <div className="search-input-group">
            <Search size={18} className="search-icon-inline" />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={directorySearch}
              onChange={handleDirectorySearch}
              className="directory-search-input"
            />
            <button type="submit" className="directory-search-btn">Filter</button>
          </div>
        </form>
      </header>
      
      <div className="stage-container" style={{ display: 'block' }}>
        <div className="tool-card" style={{ padding: '0' }}>
          {directoryLoading ? (
            <div className="inspector-placeholder" style={{ padding: '64px' }}>
              <Loader2 className="spinner" size={48} />
              <p style={{ marginTop: '24px' }}>Loading Directory Data...</p>
            </div>
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
          ) : (
            <div className="directory-wrapper">
              <div className="table-responsive">
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>NAFDAC Reg No</th>
                      <th>Active Ingredient</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {directoryData.map((drug) => (
                      <tr key={drug.id || drug.nafdac_reg_no}>
                        <td className="fw-600">{drug.product_name}</td>
                        <td className="mono text-muted">{drug.nafdac_reg_no}</td>
                        <td>{drug.active_ingredient || '—'}</td>
                        <td>
                          <span className={`status-pill ${drug.status === 'Active' ? 'active' : 'warning'}`}>
                            {drug.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="pagination-controls">
                <button 
                  className="pagination-btn" 
                  onClick={() => fetchDirectory(currentPage - 1)}
                  disabled={currentPage === 1 || directoryLoading}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="page-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="pagination-btn" 
                  onClick={() => fetchDirectory(currentPage + 1)}
                  disabled={currentPage === totalPages || directoryLoading}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderNotFoundPage = () => (
    <div className="state-container" style={{ padding: '80px 20px', minHeight: '60vh', justifyContent: 'center' }}>
      <XCircle size={80} style={{ color: 'var(--error)', opacity: 0.2, marginBottom: '24px' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.6 }}>
        The page you are looking for doesn't exist or has been moved. Use the navigation above to return to the portal.
      </p>
      <Link to="/" className="btn-primary" style={{ maxWidth: '200px' }}>
        Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="top-bar">
        <div className="logo-container">
          <div className="logo-icon">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div className="logo-text">Smart<span>Drug</span>Check</div>
        </div>

        <div className="top-bar-actions">
          <nav className="nav-menu">
            <Link 
              to="/"
              className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => {
                // Quick reset for verification state if clicking home while already there
                if(location.pathname === '/') {
                  setResult(null); setError(''); stopScan();
                }
              }}
            >
              <ShieldCheck size={18} />
              Verification Portal
            </Link>
            <Link 
              to="/directory"
              className={`nav-item ${location.pathname === '/directory' ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              Greenbook Directory
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={renderVerificationPage()} />
          <Route path="/directory" element={renderDirectoryPage()} />
          <Route path="*" element={renderNotFoundPage()} />
        </Routes>
      </main>

      <footer className="app-footer">
        Disclaimer: The data provided in this application is for academic demonstration purposes. Official verification should always be confirmed through the official NAFDAC portal.
      </footer>
    </div>
  );
}

export default App;
