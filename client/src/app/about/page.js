export const metadata = {
  title: 'About | CrimeWatch',
  description: 'Learn more about CrimeWatch, the community-driven crime reporting system.',
};

export default function AboutPage() {
  return (
    <div className="page-container">
      <div className="hero" style={{ minHeight: '40vh', padding: '2rem' }}>
        <div className="hero-content">
          <h1>About <span>CrimeWatch</span></h1>
          <p>Empowering communities to stay safe through real-time awareness and anonymous reporting.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            CrimeWatch is a civic engagement platform designed to bridge the gap between citizens and local authorities. 
            We believe that safety is a collective responsibility, and by providing a modern, accessible, and secure way to report incidents, 
            we can foster stronger, more vigilant communities.
          </p>
        </div>

        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>Key Features</h2>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li><strong>Real-Time Live Map:</strong> View recent incidents in your area instantly.</li>
            <li><strong>Anonymous Reporting:</strong> Submit crucial evidence without fear of retaliation.</li>
            <li><strong>Multimedia Support:</strong> Upload photos and videos to aid investigations.</li>
            <li><strong>Transparent Status Updates:</strong> Track exactly where your report stands with authorities.</li>
          </ul>
        </div>
        
        <div className="glass-card" style={{ textAlign: 'center', background: 'var(--gradient-primary)', color: '#fff', border: 'none' }}>
          <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>Join the Movement</h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>Sign up today and help us build a safer tomorrow.</p>
          <a href="/register" className="btn btn-secondary" style={{ color: 'var(--text-primary)', border: 'none', fontWeight: 600 }}>Create an Account</a>
        </div>
      </div>
    </div>
  );
}
