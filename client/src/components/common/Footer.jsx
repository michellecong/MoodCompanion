import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <p>Your emotional wellness guide to help build self-awareness and resilience.</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {currentYear} AI Mood Companion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;