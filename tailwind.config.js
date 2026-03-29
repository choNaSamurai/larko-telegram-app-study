/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Screen backgrounds (Scenario §12.1 Color Table) ──────────────────
        'bg-screen':   '#222226',  // dark/color/bg/primary
        'bg-card':     '#2d2d31',  // dark/color/bg/card
        'bg-input':    '#3e3e42',  // dark/color/bg/input
        'bg-button':   '#fafafa',  // light/color/bg/primary (CTA button)

        // ── Text ──────────────────────────────────────────────────────────────
        'text-primary':   '#ededed',  // dark/color/content/primary
        'text-secondary': '#9d9d9d',  // dark/color/content/secondary
        'text-muted':     '#878787',  // filter tab labels inactive
        'text-dark':      '#222226',  // button text on light bg
        'accent-primary': '#ffffff',  // "+ Додати" border + text

        // ── Status colors ─────────────────────────────────────────────────────
        'status-info':    '#60a5fa',  // New, Checking — border-left + badge
        'status-warning': '#fbbf24',  // In Progress + Tomorrow deadline
        'status-error':   '#f87171',  // Overdue — border-left + badge + deadline
        'status-success': '#34d399',  // Done
        'status-pending': '#fdba74',  // Dispute

        // ── W3 Balance-specific ───────────────────────────────────────────────
        'status-negative': '#ef4444', // Negative Remaining amount (OQ-W3-05 confirmed)
        'advances':        '#60a5fa', // Advances stat + advance history rows
      },
      borderRadius: {
        'card':  '20px',    // Task card
        'chip':  '16px',    // Notes chip
        'badge': '9999px',  // Status badge, filter pills, avatars
        'btn':   '32px',    // CTA buttons
      },
      boxShadow: {
        'card':       '0px 4px 24px 0px rgba(0,0,0,0.4)',
        'card-inner': 'inset 0px 1px 0px 0px rgba(255,255,255,0.05)',
        'btn-light':  '0px 5px 20px 0px rgba(255,255,255,0.2)',
        'btn-ghost':  '0px 5px 15px -3px rgba(255,255,255,0.2), 0px 4px 6px -4px rgba(255,255,255,0.2)',
        'avatar':     '0px 4px 24px 0px rgba(0,0,0,0.4)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono':  ['JetBrains Mono', 'Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
