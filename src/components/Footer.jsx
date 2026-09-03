import './Footer.css';

const footerLinks = {
  Support: ['Help Centre', 'AirCover', 'Anti-discrimination', 'Disability support', 'Cancellation options', 'Report neighbourhood concern'],
  Hosting: ['Airbnb your home', 'AirCover for Hosts', 'Hosting resources', 'Community forum', 'Hosting responsibly', 'Airbnb-friendly apartments'],
  Airbnb: ['Newsroom', 'New features', 'Careers', 'Investors', 'Gift cards', 'Airbnb.org emergency stays'],
  Community: ['Airbnb.org', 'Combating discrimination', 'Support Afghan refugees', 'Celebrating diversity', 'Nomad life'],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__links">
        <div className="footer__grid">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="footer__column">
              <h3 className="footer__heading">{category}</h3>
              <ul className="footer__list">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="footer__link">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer__copyright">
        <div className="footer__copyright-inner">
          <span>© {new Date().getFullYear()} Airbnb, Inc.</span>
          <div className="footer__copyright-links">
            <a href="#" className="footer__link">Privacy</a>
            <span>·</span>
            <a href="#" className="footer__link">Terms</a>
            <span>·</span>
            <a href="#" className="footer__link">Sitemap</a>
          </div>
          <div className="footer__selectors">
            <button className="footer__selector-btn">🌐 English (US)</button>
            <button className="footer__selector-btn">$ USD</button>
          </div>
          <div className="footer__social">
            <a href="#" aria-label="Facebook" className="footer__social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="footer__social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="footer__social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
