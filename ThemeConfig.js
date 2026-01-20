// ThemeConfig.js
export const COLORS = {
  navy: '#0A2540',        // Page Background (Auth) / Header / Sidebar
  seaBlue: '#00B4D8',     // Primary Buttons / Active States
  lightGrey: '#F4F6F8',   // Dashboard Main Background
  white: '#FFFFFF',       // Cards / Auth Card
  darkGrey: '#1F2937',    // Primary Text
  textGrey: '#6B7280',    // Secondary Text
  success: '#16A34A',     // Green Alerts
  warning: '#F59E0B',     // Orange Alerts
  danger: '#DC2626',      // Red Alerts
};

export const SHARED_STYLES = {
  card: {
    background: COLORS.white,
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '20px',
  },
  authBg: {
    height: '100vh',
    background: COLORS.navy,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardBg: {
    minHeight: '100vh',
    background: COLORS.lightGrey,
  }
};