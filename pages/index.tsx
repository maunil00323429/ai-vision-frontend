import React from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      {/* HEADER / NAVIGATION */}
      <header style={styles.header}>
        <h1 style={styles.logo}>🔍 AI Vision Analyzer</h1>
        
        {/* Show when user is signed OUT */}
        <SignedOut>
          <button
            style={styles.signInButton}
            onClick={() => router.push('/sign-in')}
          >
            Sign In
          </button>
        </SignedOut>

        {/* Show when user is signed IN */}
        <SignedIn>
          <div style={styles.headerRight}>
            <button
              style={styles.analyzeButton}
              onClick={() => router.push('/analyze')}
            >
              Go to Analyzer
            </button>
            <UserButton />
          </div>
        </SignedIn>
      </header>

      {/* HERO SECTION */}
      <main style={styles.main}>
        <div style={styles.hero}>
          <h2 style={styles.heroTitle}>Analyze Images with AI</h2>
          <p style={styles.heroTagline}>
            Upload any image and get detailed AI-powered analysis including objects, 
            colors, mood, and notable features. Powered by GPT-4 Vision.
          </p>

          <SignedOut>
            <button
              style={styles.ctaButton}
              onClick={() => router.push('/sign-up')}
            >
              Get Started - It's Free!
            </button>
          </SignedOut>

          <SignedIn>
            <button
              style={styles.ctaButton}
              onClick={() => router.push('/analyze')}
            >
              Start Analyzing Now
            </button>
          </SignedIn>
        </div>

        {/* FEATURES SECTION */}
        <div style={styles.featuresSection}>
          <h3 style={styles.sectionTitle}>Key Features</h3>
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>🤖</div>
              <h4 style={styles.featureTitle}>AI-Powered Analysis</h4>
              <p style={styles.featureText}>
                Uses advanced GPT-4 Vision model to provide detailed, accurate 
                image descriptions and insights.
              </p>
            </div>

            <div style={styles.feature}>
              <div style={styles.featureIcon}>⚡</div>
              <h4 style={styles.featureTitle}>Fast & Easy</h4>
              <p style={styles.featureText}>
                Simply upload an image and get results in seconds. No technical 
                knowledge required.
              </p>
            </div>

            <div style={styles.feature}>
              <div style={styles.featureIcon}>🔒</div>
              <h4 style={styles.featureTitle}>Secure & Private</h4>
              <p style={styles.featureText}>
                Your images are processed securely and never stored. Complete 
                privacy guaranteed.
              </p>
            </div>
          </div>
        </div>

        {/* PRICING SECTION */}
        <div style={styles.pricingSection}>
          <h3 style={styles.sectionTitle}>Simple Pricing</h3>
          <div style={styles.pricingCards}>
            
            {/* FREE TIER */}
            <div style={styles.pricingCard}>
              <h4 style={styles.tierName}>Free Tier</h4>
              <div style={styles.price}>
                <span style={styles.priceAmount}>$0</span>
                <span style={styles.pricePeriod}>/month</span>
              </div>
              <ul style={styles.featureList}>
                <li style={styles.featureItem}>✓ 1 image analysis per session</li>
                <li style={styles.featureItem}>✓ Basic AI analysis</li>
                <li style={styles.featureItem}>✓ All image formats supported</li>
                <li style={styles.featureItem}>✓ Community support</li>
              </ul>
              <button
                style={styles.tierButton}
                onClick={() => router.push('/sign-up')}
              >
                Get Started
              </button>
            </div>

            {/* PREMIUM TIER */}
            <div style={{...styles.pricingCard, ...styles.premiumCard}}>
              <div style={styles.badge}>POPULAR</div>
              <h4 style={styles.tierName}>Premium Tier</h4>
              <div style={styles.price}>
                <span style={styles.priceAmount}>$5</span>
                <span style={styles.pricePeriod}>/month</span>
              </div>
              <ul style={styles.featureList}>
                <li style={styles.featureItem}>✓ Unlimited analyses</li>
                <li style={styles.featureItem}>✓ Advanced descriptions</li>
                <li style={styles.featureItem}>✓ Priority processing</li>
                <li style={styles.featureItem}>✓ Premium support</li>
                <li style={styles.featureItem}>✓ No ads</li>
              </ul>
              <button
                style={{...styles.tierButton, ...styles.premiumButton}}
                onClick={() => router.push('/sign-up')}
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>&copy; 2024 AI Vision Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
}

// STYLES
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: '1.5rem 3rem',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  signInButton: {
    padding: '0.5rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: 'white',
    border: '2px solid #3b82f6',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  headerRight: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  analyzeButton: {
    padding: '0.5rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  main: {
    flex: 1,
    padding: '3rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  hero: {
    textAlign: 'center' as const,
    padding: '4rem 0',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#1f2937',
    lineHeight: '1.2',
  },
  heroTagline: {
    fontSize: '1.25rem',
    color: '#6b7280',
    marginBottom: '2.5rem',
    maxWidth: '700px',
    margin: '0 auto 2.5rem',
    lineHeight: '1.6',
  },
  ctaButton: {
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s',
  },
  featuresSection: {
    marginTop: '5rem',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '3rem',
    color: '#1f2937',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  feature: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    textAlign: 'center' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
    color: '#1f2937',
  },
  featureText: {
    color: '#6b7280',
    lineHeight: '1.6',
  },
  pricingSection: {
    marginTop: '5rem',
  },
  pricingCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  pricingCard: {
    padding: '2.5rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    border: '2px solid #e5e7eb',
    position: 'relative' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  premiumCard: {
    borderColor: '#3b82f6',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
  },
  badge: {
    position: 'absolute' as const,
    top: '-12px',
    right: '20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.25rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  tierName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#1f2937',
  },
  price: {
    marginBottom: '2rem',
  },
  priceAmount: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pricePeriod: {
    fontSize: '1.25rem',
    color: '#6b7280',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '2rem',
    textAlign: 'left' as const,
  },
  featureItem: {
    padding: '0.5rem 0',
    color: '#4b5563',
    fontSize: '1rem',
  },
  tierButton: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: 'white',
    border: '2px solid #3b82f6',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  premiumButton: {
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
  },
  footer: {
    padding: '2rem',
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center' as const,
    color: '#6b7280',
  },
};