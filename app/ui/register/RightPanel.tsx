"use client";

export default function RightPanel() {
  return (
    <div className="register-right-panel">
      {/* Background blobs */}
      <div className="rp-blob rp-blob-1" />
      <div className="rp-blob rp-blob-2" />

      {/* Logo Card */}
      <div className="rp-logo-card">
        <div className="rp-logo-inner">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path
              d="M26 6L42 16V36L26 46L10 36V16L26 6Z"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M26 14L36 20V32L26 38L16 32V20L26 14Z"
              fill="white"
              fillOpacity="0.15"
            />
            <path d="M26 14L36 20L26 26L16 20L26 14Z" fill="white" fillOpacity="0.6" />
            <path d="M16 20V32L26 38V26L16 20Z" fill="white" fillOpacity="0.3" />
            <path d="M36 20V32L26 38V26L36 20Z" fill="white" fillOpacity="0.45" />
          </svg>
        </div>
      </div>

      {/* Headline */}
      <div className="rp-headline">
        <h2>Build your future on</h2>
        <span className="rp-brand">KaamPay.</span>
      </div>

      <p className="rp-subtext">
        Access high-precision opportunities curated for<br />
        the top 1% of creative minds.
      </p>

      {/* Social Proof Card */}
      <div className="rp-proof-card">
        <div className="rp-avatars">
          {["AK", "SR", "MP", "VT"].map((initials, i) => (
            <div
              key={initials}
              className="rp-avatar"
              style={{ zIndex: 4 - i, marginLeft: i === 0 ? 0 : "-10px" }}
            >
              {initials}
            </div>
          ))}
          <div className="rp-avatar rp-avatar-count">+50k</div>
        </div>

        <div className="rp-proof-text">
          <p>Join 50k+ creators</p>
          <div className="rp-precision">
            <span>NETWORK PRECISION</span>
            <span className="rp-precision-value">98.4%</span>
          </div>
          <div className="rp-progress-bar">
            <div className="rp-progress-fill" style={{ width: "98.4%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
