import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="ocean-waves"></div>
          <div className="floating-elements">
            <div className="ship ship-1">🚢</div>
            <div className="ship ship-2">⛵</div>
            <div className="anchor anchor-1">⚓</div>
            <div className="anchor anchor-2">⚓</div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <h1 className="hero-title">
                Navigate the Future of
                <span className="gradient-text"> Maritime Intelligence</span>
              </h1>
              <p className="hero-subtitle">
                Real-time vessel tracking, port analytics, and safety monitoring 
                for the modern maritime industry. Experience the power of data-driven 
                maritime operations.
              </p>
              <div className="hero-buttons">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary btn-large">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-large">
                      Start Free Trial
                    </Link>
                    <Link to="/login" className="btn btn-outline btn-large">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Comprehensive Maritime Solutions</h2>
            <p>Everything you need to monitor and manage maritime operations</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Real-time Vessel Tracking</h3>
              <p>Monitor vessel positions, routes, and movements with interactive maps and live updates.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏗️</div>
              <h3>Port Analytics</h3>
              <p>Analyze port congestion, traffic patterns, and operational efficiency with detailed insights.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚠️</div>
              <h3>Safety Overlays</h3>
              <p>Stay informed about weather conditions, piracy zones, and maritime safety alerts.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Advanced Analytics</h3>
              <p>Historical data analysis, voyage optimization, and compliance tracking tools.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Role-based Access</h3>
              <p>Secure access control with different permission levels for operators, analysts, and admins.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Access your maritime data anywhere, anytime with our mobile-friendly interface.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Vessels Tracked</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Ports Monitored</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Real-time Updates</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Maritime Operations?</h2>
            <p>Join thousands of maritime professionals who trust our platform</p>
            {!user && (
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started Today
                </Link>
                <Link to="/contact" className="btn btn-outline btn-large">
                  Contact Sales
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-icon">⚓</span>
                <span className="logo-text">MaritimeTracker</span>
              </div>
              <p>Leading maritime intelligence platform for the modern shipping industry.</p>
            </div>
            
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#api">API</a></li>
                <li><a href="#integrations">Integrations</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#news">News</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#status">System Status</a></li>
                <li><a href="#security">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 MaritimeTracker. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;