import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Analyze() {
  const { getToken } = useAuth();
  const router = useRouter();

  // Always use same origin so /api/* goes to this app (Next.js proxy → Python backend)
  const BACKEND_URL = 'https://api-backend-uqc4.onrender.com';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/python-api/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;
      const data = await response.json();
      setUsage(data);
    } catch (err: any) {
      console.error('Usage fetch error:', err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Not signed in. Please sign in and try again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      const url = `${BACKEND_URL}/python-api/analyze`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Server error');
      }

      const data = await response.json();

      if (!response.ok) {
        const msg =
          (typeof data.detail === 'string' ? data.detail : null) ||
          data.detail?.message ||
          data.detail?.error ||
          'Analysis failed';
        throw new Error(msg);
      }

      setResult(data);
      setUsage(data.usage ?? data);
    } catch (err: any) {
      const message =
        err.message === 'Failed to fetch'
          ? 'Could not reach the server. If you set NEXT_PUBLIC_BACKEND_URL, check that it’s correct and the API is running.'
          : err.message || 'Failed to analyze image';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title} onClick={() => router.push('/')}>
          🔍 AI Vision Analyzer
        </h1>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <SignedOut>
        <div style={styles.signedOut}>
          <h2>Please sign in to use this service</h2>
          <button style={styles.button} onClick={() => router.push('/sign-in')}>
            Sign In
          </button>
        </div>
      </SignedOut>

      <SignedIn>
        <main style={styles.main}>

          {usage && (
            <div style={styles.card}>
              <h3>Your Usage</h3>
              <p>Tier: <strong>{usage.tier === 'premium' ? '⭐ Premium' : '🆓 Free'}</strong></p>
              <p>Analyses used: <strong>{usage.analyses_used} / {usage.limit}</strong></p>
              {usage.remaining !== 'unlimited' && (
                <p>Remaining: <strong>{usage.remaining}</strong></p>
              )}
            </div>
          )}

          <div style={styles.card}>
            <h2>Upload Image for Analysis</h2>
            <p style={styles.subtitle}>Supported: JPG, JPEG, PNG, WEBP (max 5MB)</p>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              style={styles.fileInput}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={styles.fileLabel}>
              📁 Choose Image
            </label>

            {selectedFile && <p style={styles.fileName}>Selected: {selectedFile.name}</p>}

            {preview && (
              <div style={styles.previewContainer}>
                <img src={preview} alt="Preview" style={styles.preview} />
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              style={{
                ...styles.analyzeButton,
                ...((!selectedFile || loading) && styles.buttonDisabled)
              }}
            >
              {loading ? '🔄 Analyzing...' : '🤖 Analyze Image'}
            </button>
          </div>

          {error && (
            <div style={styles.errorCard}>
              <h3>❌ Error</h3>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div style={styles.resultCard}>
              <h3>✅ Analysis Complete</h3>
              <div style={styles.analysis}>
                <h4>AI Description:</h4>
                <p>{result.analysis}</p>
              </div>
            </div>
          )}

        </main>
      </SignedIn>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    padding: '1.5rem 3rem',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    cursor: 'pointer',
  },
  signedOut: {
    textAlign: 'center' as const,
    padding: '5rem 2rem',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    marginBottom: '2rem',
    border: '1px solid #e5e7eb',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    backgroundColor: '#f3f4f6',
    border: '2px dashed #d1d5db',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  fileName: {
    marginTop: '1rem',
    color: '#6b7280',
  },
  previewContainer: {
    marginTop: '1.5rem',
  },
  preview: {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '0.5rem',
  },
  analyzeButton: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    marginTop: '1.5rem',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    border: '2px solid #fecaca',
    padding: '1.5rem',
    borderRadius: '1rem',
    color: '#991b1b',
  },
  resultCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    borderRadius: '1rem',
  },
  analysis: {
    marginTop: '1rem',
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    lineHeight: '1.7',
  },
};
