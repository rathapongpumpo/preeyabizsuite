# -*- coding: utf-8 -*-
with open('public/assets/app.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add font-mono fallback if not already present
if '.audit-certificate-box' not in css:
    fallback_css = """
/* Priority 1.1: Font fallback for Monospace, Receipt and Audit Certificate */
.font-mono,
pre,
code,
.receipt-slip,
.audit-certificate-box {
  font-family: 'JetBrains Mono', 'IBM Plex Sans Thai', 'Sarabun', monospace !important;
}
"""
    css = fallback_css + css

new_styles = """
/* ==========================================================================
   Preeya Business Suite — Fix Spec Additions (P0, P1, P2)
   ========================================================================== */

/* Business Impact Badges */
.business-impact-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--blue-light);
  color: var(--primary-hover);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.4;
  margin: 8px 0 12px;
}
html[data-theme="dark"] .business-impact-badge {
  background: rgba(22, 119, 255, 0.12);
  color: #91CAFF;
  border-color: rgba(22, 119, 255, 0.28);
}

/* Topbar Status Badge & CTA Group */
.topbar-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #065F46;
  background: #D1FAE5;
  border: 1px solid #A7F3D0;
  padding: 5px 12px;
  border-radius: 9999px;
  white-space: nowrap;
}
html[data-theme="dark"] .topbar-status-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #6EE7B7;
  border-color: rgba(16, 185, 129, 0.35);
}
.topbar-cta-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.topbar-cta-btn {
  white-space: nowrap;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.25);
}

/* Loading Skeleton */
.demo-loading-skeleton {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 1;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.demo-loading-skeleton.hidden {
  opacity: 0;
  pointer-events: none;
}
.demo-skeleton-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid var(--line-strong);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: demoSpin 0.75s linear infinite;
}
@keyframes demoSpin {
  to { transform: rotate(360deg); }
}
.demo-skeleton-text {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--muted);
}
.demo-skeleton-shimmer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 80%;
  max-width: 440px;
}
.demo-skeleton-bar {
  height: 12px;
  background: linear-gradient(90deg, var(--line-subtle) 25%, var(--line) 50%, var(--line-subtle) 75%);
  background-size: 200% 100%;
  animation: demoShimmer 1.5s infinite;
  border-radius: 6px;
}
@keyframes demoShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Demo Floating Conversion Bar */
.demo-conversion-bar {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  background: var(--panel);
  border: 1px solid var(--primary-border);
  box-shadow: 0 12px 36px -4px rgba(22, 119, 255, 0.2), 0 4px 12px rgba(15, 23, 42, 0.08);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  max-width: 420px;
  width: calc(100vw - 48px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(8px);
}
.demo-conversion-bar.minimized {
  max-width: 280px;
  padding: 8px 12px;
}
.demo-conversion-bar.minimized .conversion-bar-body,
.demo-conversion-bar.minimized .conversion-bar-actions {
  display: none;
}
.conversion-bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.conversion-bar-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  line-height: 1.3;
}
.conversion-bar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
}
.conversion-bar-toggle:hover {
  background: var(--line-subtle);
  color: var(--text);
}
.conversion-bar-subtext {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
  margin: 0;
}
.conversion-bar-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.conversion-bar-actions .btn {
  flex: 1;
  text-align: center;
  font-size: 12px;
  padding: 8px 12px;
  justify-content: center;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .demo-conversion-bar {
    right: 12px;
    left: 12px;
    bottom: 12px;
    width: auto;
    max-width: none;
  }
}

/* Pricing Grid */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 32px;
}
.pricing-card {
  position: relative;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 32px 26px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}
.pricing-card:hover {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
.pricing-card.popular {
  border-color: var(--primary);
  box-shadow: 0 10px 32px -4px rgba(22, 119, 255, 0.18);
}
.popular-badge {
  position: absolute;
  top: -12px;
  right: 24px;
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.pricing-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 8px;
}
.pricing-desc {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0 0 16px;
}
.pricing-price {
  font-size: 26px;
  font-weight: 900;
  color: var(--primary);
  margin-bottom: 6px;
}
.pricing-timeline {
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pricing-features li {
  font-size: 13px;
  color: var(--text);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.4;
}
.pricing-features li span {
  color: var(--green);
  font-weight: bold;
}
.pricing-card .btn {
  width: 100%;
  justify-content: center;
  padding: 10px 16px;
  font-weight: 700;
}

/* SLA Guarantees Grid */
.guarantees-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 28px;
}
.guarantee-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.guarantee-card:hover {
  border-color: var(--primary-border);
}
.guarantee-num {
  font-size: 11px;
  font-weight: 800;
  color: var(--primary);
  background: var(--primary-light);
  width: fit-content;
  padding: 2px 8px;
  border-radius: 4px;
}
.guarantee-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}
.guarantee-desc {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

/* About Architect Section */
.architect-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 36px;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 32px;
  align-items: start;
}
.architect-avatar-box {
  text-align: center;
}
.architect-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, #0958D9 100%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  font-weight: 900;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.25);
  margin-bottom: 12px;
}
.architect-role-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 4px 10px;
  border-radius: 9999px;
}
.architect-bio h3 {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 12px;
}
.architect-bio p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
  margin-bottom: 18px;
}
.tech-stack-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}
.tech-stack-group-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}
.tech-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tech-pill {
  font-size: 11.5px;
  font-weight: 600;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 3px 9px;
  color: var(--text);
}
.architect-action-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

/* Estimator Form Section */
.estimator-section {
  padding: 64px 0 40px;
  background: var(--panel);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.estimator-card {
  max-width: 900px;
  margin: 0 auto;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 32px;
  box-shadow: var(--shadow-md);
}
.estimator-step {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px dashed var(--line-strong);
}
.estimator-step:last-of-type {
  border-bottom: none;
}
.estimator-step-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.estimator-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}
.estimator-grid-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}
.estimator-option-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}
.estimator-option-box:hover {
  border-color: var(--primary);
  background: var(--panel-2);
}
.estimator-option-box input {
  margin-top: 3px;
  accent-color: var(--primary);
}
.estimator-option-box.checked {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 0 0 1px var(--primary);
}
html[data-theme="dark"] .estimator-option-box.checked {
  background: rgba(22, 119, 255, 0.12);
  border-color: var(--primary);
}
.option-content small {
  display: block;
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}
.estimator-calc-box {
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(9, 88, 217, 0.04) 100%);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-sm);
  padding: 18px 22px;
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.calc-metric-item small {
  display: block;
  font-size: 12px;
  color: var(--muted);
}
.calc-metric-item strong {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
}
.estimator-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}
.estimator-actions .btn {
  flex: 1;
  min-width: 240px;
  padding: 12px 20px;
  font-size: 13.5px;
  font-weight: 700;
  justify-content: center;
}

/* Modals & Previews */
.barcode-sticker-box {
  background: #fff;
  color: #111;
  padding: 20px;
  border: 2px dashed #333;
  border-radius: 8px;
  max-width: 380px;
  margin: 0 auto;
  text-align: center;
  font-family: 'JetBrains Mono', 'IBM Plex Sans Thai', 'Sarabun', monospace;
}
.barcode-lines-sim {
  height: 48px;
  background: repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 7px, transparent 7px, transparent 9px);
  margin: 12px 0;
}

.line-phone-frame {
  max-width: 360px;
  margin: 0 auto;
  background: #2D3748;
  border-radius: 28px;
  padding: 10px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.3);
  border: 3px solid #1A202C;
}
.line-chat-screen {
  background: #7994AA;
  border-radius: 20px;
  overflow: hidden;
  padding: 14px 10px;
}
.line-flex-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  color: #111;
}
.line-flex-header {
  background: #06C755;
  color: #fff;
  padding: 12px 14px;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.line-flex-body {
  padding: 14px;
  font-size: 12px;
  line-height: 1.5;
}
.line-flex-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px 14px;
  border-top: 1px solid #eee;
}
.line-flex-btn {
  background: #06C755;
  color: #fff !important;
  text-align: center;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
}
.line-flex-btn.secondary {
  background: #f0f0f0;
  color: #333 !important;
}

/* Tilt Signal Native Bar & Admin Desk */
.tilt-switch-bar {
  display: flex;
  background: #0D0F17;
  border-bottom: 1px solid #1E2333;
  padding: 10px 16px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 100;
}
.tilt-switch-tabs {
  display: flex;
  gap: 8px;
}
.tilt-tab-btn {
  background: #1A1F2C;
  color: #A0AEC0;
  border: 1px solid #2D3748;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tilt-tab-btn.active {
  background: #00F0FF;
  color: #000;
  border-color: #00F0FF;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
}
.tilt-booking-ticket {
  background: #0F131D;
  border: 1px solid #00F0FF;
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  text-align: center;
  box-shadow: 0 0 24px rgba(0, 240, 255, 0.2);
  max-width: 360px;
  margin: 0 auto;
}

/* Storefront Native Bar */
.storefront-native-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #111;
  color: #fff;
  padding: 10px 16px;
  border-bottom: 1px solid #333;
}
"""

if '.pricing-grid' not in css:
    css = css + "\n" + new_styles

with open('public/assets/app.css', 'w', encoding='utf-8', newline='\n') as f:
    f.write(css)

print("Updated public/assets/app.css successfully")
