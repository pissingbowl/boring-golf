import { useState, useEffect } from "react";
import "./triple-phone-demo.css";

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

const SunCloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="tpd-card-icon-svg">
    <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M18.66 18.66l1.41 1.41M20 12h2M18.66 5.34l1.41-1.41" opacity="0.3" />
    <circle cx="12" cy="12" r="4" opacity="0.5" />
    <path d="M15 14a4 4 0 0 1 2.5 6H6a5 5 0 0 1-.5-10 6 6 0 0 1 11.5 0Z" />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

const PlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tpd-card-icon-svg">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tpd-banner-icon-svg">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const UtensilsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tpd-activity-icon-svg">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tpd-activity-icon-svg">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tpd-activity-icon-svg">
    <path d="M6 22V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v20M2 22h20M10 6h4M10 10h4M10 14h4M10 18h4" />
  </svg>
);

const BeerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tpd-activity-icon-svg">
    <path d="M17 11h1a3 3 0 0 1 0 6h-1M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M6 7h12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tpd-activity-icon-svg">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2M7 17h10" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const liveCards = [
  {
    id: 1,
    badge: "Coming Up",
    badgeIcon: <ClockIcon />,
    value: "1h 23m",
    valueClass: "gold",
    sub: "until tee time",
    tip: "Pinehurst No. 2 \u2022 4:10 PM",
    status: { type: "confirmed", text: "Confirmed" },
  },
  {
    id: 2,
    badge: "Weather",
    badgeIcon: <CloudIcon />,
    iconComponent: <SunCloudIcon />,
    value: "72\u00B0F",
    sub: "Partly Cloudy",
    detail: "Wind 8mph NE",
  },
  {
    id: 3,
    badge: "On Course",
    badgeIcon: <TargetIcon />,
    value: "Hole 7",
    valueClass: "sm",
    sub: "Par 4 \u2022 438 yards",
    quote: '"Favor the left. Right bunker is a round-killer."',
    tip: "Handicap 3",
  },
  {
    id: 4,
    badge: "Crew Update",
    badgeIcon: <UsersIcon />,
    iconComponent: <PlaneIcon />,
    value: "Jake Landed",
    valueClass: "sm",
    sub: "RDU Airport \u2022 Just now",
    status: { type: "info", text: "En Route" },
  },
];

const leaderboardPlayers = [
  { pos: "1", initials: "MC", name: "Marcus Chen", score: "-2", scoreClass: "under", skins: 4, money: "$80", isLeader: true },
  { pos: "2", initials: "JM", name: "Jake Morrison", score: "-1", scoreClass: "under", skins: 2, money: "$40" },
  { pos: "3", initials: "DW", name: "Devon Williams", score: "E", scoreClass: "even", skins: 1, money: "$20" },
  { pos: "-", initials: "RO", name: "Ryan O'Connor", score: "+3", scoreClass: "over", skins: 0 },
  { pos: "-", initials: "TN", name: "Tommy Nguyen", score: "+5", scoreClass: "over", skins: 0 },
  { pos: "-", initials: "AH", name: "Alex Hartman", score: "+2", scoreClass: "over", skins: 0 },
];

const balances = [
  { initials: "MC", name: "Marcus Chen", detail: "Paid for dinner, golf cart", amount: "+$142", amountClass: "owed", status: "is owed" },
  { initials: "JM", name: "Jake Morrison", detail: "Paid for lodging deposit", amount: "+$89", amountClass: "owed", status: "is owed" },
  { initials: "DW", name: "Devon Williams", detail: "All settled up", amount: "$0", amountClass: "settled", status: "settled" },
  { initials: "RO", name: "Ryan O'Connor", detail: "Owes for dinner, drinks", amount: "-$67", amountClass: "owes", status: "owes" },
  { initials: "TN", name: "Tommy Nguyen", detail: "Owes for range balls", amount: "-$34", amountClass: "owes", status: "owes" },
];

const activities = [
  { iconComponent: <UtensilsIcon />, iconClass: "food", title: "Dinner at The Deuce", meta: "Marcus paid \u2022 Yesterday", amount: "$847", split: "\u00F7 8 people" },
  { iconComponent: <FlagIcon />, iconClass: "golf", title: "Golf Cart Rental", meta: "Marcus paid \u2022 Yesterday", amount: "$320", split: "\u00F7 4 carts" },
  { iconComponent: <BuildingIcon />, iconClass: "lodging", title: "Lodging Deposit", meta: "Jake paid \u2022 Dec 15", amount: "$2,400", split: "\u00F7 8 people" },
  { iconComponent: <BeerIcon />, iconClass: "food", title: "Bar Tab \u2014 Day 1", meta: "Devon paid \u2022 Yesterday", amount: "$286", split: "\u00F7 8 people" },
  { iconComponent: <CarIcon />, iconClass: "transport", title: "Airport Shuttle", meta: "Jake paid \u2022 Dec 27", amount: "$180", split: "\u00F7 6 people" },
];

export function TriplePhoneDemo() {
  const [currentLiveCard, setCurrentLiveCard] = useState(0);
  const [exitingLiveCard, setExitingLiveCard] = useState<number | null>(null);
  const [currentLedgerTab, setCurrentLedgerTab] = useState(0);
  const [exitingLedgerTab, setExitingLedgerTab] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const liveInterval = setInterval(() => {
      setExitingLiveCard(currentLiveCard);
      setTimeout(() => {
        setCurrentLiveCard((prev) => (prev + 1) % liveCards.length);
        setExitingLiveCard(null);
      }, 300);
    }, 4500);
    return () => clearInterval(liveInterval);
  }, [currentLiveCard]);

  useEffect(() => {
    const ledgerInterval = setInterval(() => {
      setExitingLedgerTab(currentLedgerTab);
      setTimeout(() => {
        setCurrentLedgerTab((prev) => (prev + 1) % 3);
        setExitingLedgerTab(null);
      }, 300);
    }, 4000);
    return () => clearInterval(ledgerInterval);
  }, [currentLedgerTab]);

  useEffect(() => {
    const bannerTimeout = setTimeout(() => setShowBanner(true), 3000);
    const hideBannerTimeout = setTimeout(() => setShowBanner(false), 6000);
    const showAgainInterval = setInterval(() => {
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    }, 8000);
    return () => {
      clearTimeout(bannerTimeout);
      clearTimeout(hideBannerTimeout);
      clearInterval(showAgainInterval);
    };
  }, []);

  return (
    <div className="triple-phone-demo" data-testid="triple-phone-demo">
      <div className="tpd-phones-container">
        {/* PHONE 1: LIVE FEED */}
        <div className="tpd-phone-wrapper" data-testid="phone-live-feed">
          <span className="tpd-phone-label">Live Feed</span>
          <div className="tpd-phone-frame">
            <div className="tpd-phone-btn-left silent" />
            <div className="tpd-phone-btn-left vol1" />
            <div className="tpd-phone-btn-left vol2" />
            <div className="tpd-phone-screen">
              <div className="tpd-dynamic-island" />
              <div className="tpd-screen-content">
                <div className="tpd-live-header">
                  <div className="tpd-live-header-left">
                    <div className="tpd-live-dot-wrap">
                      <span className="tpd-live-dot" />
                      <span className="tpd-live-ring" />
                    </div>
                    <span className="tpd-live-text">Live</span>
                  </div>
                  <span className="tpd-header-time">2:47 PM</span>
                </div>
                <div className="tpd-trip-bar">
                  <span className="tpd-trip-name">Pinehurst Invitational</span>
                  <span className="tpd-trip-status">Day 2 of 4</span>
                </div>
                <div className="tpd-cards-container">
                  {liveCards.map((card, index) => (
                    <div
                      key={card.id}
                      className={`tpd-live-card ${index === currentLiveCard ? "active" : ""} ${index === exitingLiveCard ? "exiting" : ""}`}
                    >
                      <div className="tpd-card-badge">
                        {card.badgeIcon}
                        {card.badge}
                      </div>
                      {card.iconComponent && <div className="tpd-card-icon">{card.iconComponent}</div>}
                      <div className={`tpd-card-value ${card.valueClass || ""}`}>{card.value}</div>
                      <div className="tpd-card-sub">{card.sub}</div>
                      {card.quote && <div className="tpd-card-quote">{card.quote}</div>}
                      {card.tip && <div className="tpd-card-tip">{card.tip}</div>}
                      {card.detail && <div className="tpd-card-detail">{card.detail}</div>}
                      {card.status && (
                        <div className={`tpd-card-status ${card.status.type}`}>
                          {card.status.type === "confirmed" && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          {card.status.type === "info" && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          )}
                          {card.status.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="tpd-dots">
                  {liveCards.map((_, index) => (
                    <span key={index} className={`tpd-dot ${index === currentLiveCard ? "active" : ""}`} />
                  ))}
                </div>
                <div className="tpd-home-indicator" />
              </div>
            </div>
          </div>
        </div>

        {/* PHONE 2: LEADERBOARD */}
        <div className="tpd-phone-wrapper" data-testid="phone-leaderboard">
          <span className="tpd-phone-label">Leaderboard</span>
          <div className="tpd-phone-frame">
            <div className="tpd-phone-btn-left silent" />
            <div className="tpd-phone-btn-left vol1" />
            <div className="tpd-phone-btn-left vol2" />
            <div className="tpd-phone-screen dark">
              <div className="tpd-dynamic-island" />
              <div className="tpd-screen-content">
                <div className="tpd-lb-header">
                  <div className="tpd-lb-header-left">
                    <span className="tpd-lb-title">Day 1 Skins</span>
                    <span className="tpd-lb-badge">$20/hole</span>
                  </div>
                  <div className="tpd-lb-live">
                    <span className="tpd-live-dot" />
                    Live
                  </div>
                </div>
                <div className="tpd-lb-progress">
                  <div className="tpd-lb-progress-top">
                    <span>Hole 12 of 18</span>
                    <span>7 skins won</span>
                  </div>
                  <div className="tpd-lb-progress-bar">
                    <div className="tpd-lb-progress-fill" />
                  </div>
                </div>
                <div className="tpd-lb-table">
                  <div className="tpd-lb-table-head">
                    <span>#</span>
                    <span>Player</span>
                    <span style={{ textAlign: "center" }}>Today</span>
                    <span style={{ textAlign: "right" }}>Skins</span>
                  </div>
                  <div className="tpd-lb-table-body">
                    {leaderboardPlayers.map((player, index) => (
                      <div key={index} className={`tpd-lb-row ${player.isLeader ? "leader" : ""}`}>
                        <span className="tpd-lb-pos">{player.pos}</span>
                        <div className="tpd-lb-player">
                          <div className="tpd-lb-avatar">{player.initials}</div>
                          <span className="tpd-lb-name">{player.name}</span>
                        </div>
                        <span className={`tpd-lb-score ${player.scoreClass}`}>{player.score}</span>
                        <div className="tpd-lb-skins">
                          <div className="tpd-lb-skins-count">{player.skins}</div>
                          {player.money && <div className="tpd-lb-skins-money">{player.money}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="tpd-lb-footer">
                  <div className="tpd-lb-stat">
                    <div className="tpd-lb-stat-val gold">$40</div>
                    <div className="tpd-lb-stat-label">Carryover</div>
                  </div>
                  <div className="tpd-lb-stat">
                    <div className="tpd-lb-stat-val">7</div>
                    <div className="tpd-lb-stat-label">Skins Won</div>
                  </div>
                  <div className="tpd-lb-stat">
                    <div className="tpd-lb-stat-val">$100</div>
                    <div className="tpd-lb-stat-label">Pot Left</div>
                  </div>
                </div>
                <div className={`tpd-lb-banner ${showBanner ? "visible" : ""}`} data-testid="leaderboard-banner">
                  <span className="tpd-lb-banner-icon"><FlameIcon /></span>
                  <div className="tpd-lb-banner-content">
                    <div className="tpd-lb-banner-title">Skin Won \u2014 Hole 12</div>
                    <div className="tpd-lb-banner-msg">Marcus wins $40</div>
                  </div>
                </div>
                <div className="tpd-home-indicator" style={{ background: "rgba(255, 255, 255, 0.12)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* PHONE 3: LEDGER */}
        <div className="tpd-phone-wrapper" data-testid="phone-ledger">
          <span className="tpd-phone-label">Ledger</span>
          <div className="tpd-phone-frame">
            <div className="tpd-phone-btn-left silent" />
            <div className="tpd-phone-btn-left vol1" />
            <div className="tpd-phone-btn-left vol2" />
            <div className="tpd-phone-screen">
              <div className="tpd-dynamic-island" />
              <div className="tpd-screen-content">
                <div className="tpd-ledger-header">
                  <div className="tpd-ledger-header-left">
                    <div className="tpd-ledger-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="2" y1="7" x2="22" y2="7" />
                      </svg>
                    </div>
                    <span className="tpd-ledger-title">Trip Ledger</span>
                  </div>
                  <span className="tpd-ledger-badge">3 unsettled</span>
                </div>
                <div className="tpd-ledger-summary">
                  <div className="tpd-ledger-total-label">Total Trip Expenses</div>
                  <div className="tpd-ledger-total">$3,247</div>
                  <div className="tpd-ledger-total-sub">Across 8 people \u2022 23 transactions</div>
                </div>
                <div className="tpd-ledger-tabs">
                  {["Balances", "Activity", "Settle"].map((tab, index) => (
                    <div
                      key={tab}
                      className={`tpd-ledger-tab ${index === currentLedgerTab ? "active" : ""}`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                <div className="tpd-ledger-pages">
                  {/* Balances Page */}
                  <div className={`tpd-ledger-page ${currentLedgerTab === 0 ? "active" : ""} ${exitingLedgerTab === 0 ? "exiting" : ""}`}>
                    <div className="tpd-ledger-list">
                      {balances.map((balance, index) => (
                        <div key={index} className="tpd-ledger-row">
                          <div className="tpd-ledger-row-avatar">{balance.initials}</div>
                          <div className="tpd-ledger-row-info">
                            <div className="tpd-ledger-row-name">{balance.name}</div>
                            <div className="tpd-ledger-row-detail">{balance.detail}</div>
                          </div>
                          <div>
                            <div className={`tpd-ledger-row-amount ${balance.amountClass}`}>{balance.amount}</div>
                            <div className="tpd-ledger-row-status">{balance.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Page */}
                  <div className={`tpd-ledger-page ${currentLedgerTab === 1 ? "active" : ""} ${exitingLedgerTab === 1 ? "exiting" : ""}`}>
                    <div className="tpd-ledger-list">
                      {activities.map((activity, index) => (
                        <div key={index} className="tpd-activity-row">
                          <div className={`tpd-activity-icon ${activity.iconClass}`}>{activity.iconComponent}</div>
                          <div className="tpd-activity-info">
                            <div className="tpd-activity-title">{activity.title}</div>
                            <div className="tpd-activity-meta">{activity.meta}</div>
                          </div>
                          <div>
                            <div className="tpd-activity-amount">{activity.amount}</div>
                            <div className="tpd-activity-split">{activity.split}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settle Page */}
                  <div className={`tpd-ledger-page ${currentLedgerTab === 2 ? "active" : ""} ${exitingLedgerTab === 2 ? "exiting" : ""}`}>
                    <div className="tpd-settle-card" data-testid="settle-card-1">
                      <div className="tpd-settle-header">
                        <div className="tpd-settle-avatars">
                          <div className="tpd-ledger-row-avatar">RO</div>
                          <div className="tpd-settle-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="tpd-ledger-row-avatar">MC</div>
                        </div>
                        <div className="tpd-settle-info">
                          <div className="tpd-settle-title">Ryan to Marcus</div>
                          <div className="tpd-settle-desc">For dinner, drinks</div>
                        </div>
                        <div className="tpd-settle-amount">$67</div>
                      </div>
                      <div className="tpd-settle-methods">
                        <div className="tpd-settle-method primary">Venmo</div>
                        <div className="tpd-settle-method">Cash</div>
                      </div>
                    </div>
                    <div className="tpd-settle-card" data-testid="settle-card-2">
                      <div className="tpd-settle-header">
                        <div className="tpd-settle-avatars">
                          <div className="tpd-ledger-row-avatar">TN</div>
                          <div className="tpd-settle-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="tpd-ledger-row-avatar">JM</div>
                        </div>
                        <div className="tpd-settle-info">
                          <div className="tpd-settle-title">Tommy to Jake</div>
                          <div className="tpd-settle-desc">For range balls</div>
                        </div>
                        <div className="tpd-settle-amount">$34</div>
                      </div>
                      <div className="tpd-settle-methods">
                        <div className="tpd-settle-method primary" data-testid="settle-method-venmo">Venmo</div>
                        <div className="tpd-settle-method" data-testid="settle-method-cash">Cash</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tpd-home-indicator" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TriplePhoneDemo;
