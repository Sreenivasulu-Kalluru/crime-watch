export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">🛡️ CrimeWatch</div>
      <p>Real-Time Crime Reporting System — Making communities safer together.</p>
      <p style={{marginTop: '0.5rem', fontSize: '0.75rem'}}>© {new Date().getFullYear()} CrimeWatch. All rights reserved.</p>
    </footer>
  );
}
