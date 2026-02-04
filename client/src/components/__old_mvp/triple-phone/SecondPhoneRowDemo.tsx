import { useState, useEffect } from "react";
import "./triple-phone-demo.css";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '10px', height: '10px' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
    <path d="M12 3l1.39 4.39L18 9l-4.61 1.39L12 15l-1.39-4.61L6 9l4.61-1.39L12 3z" />
    <path d="M19 15l.53 1.53L21 17l-1.47.53L19 19l-.53-1.47L17 17l1.47-.53L19 15z" opacity="0.5" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
  </svg>
);

const CoffeeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

const UtensilsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const setupItems = [
  { label: "Trip Details", sublabel: "Name, dates, destination", status: "done" },
  { label: "Invite Crew", sublabel: "8 of 8 confirmed", status: "done" },
  { label: "Book Courses", sublabel: "No. 2, No. 4, No. 8", status: "done" },
  { label: "Lodging", sublabel: "The Carolina Hotel", status: "done" },
  { label: "Dining", sublabel: "2 of 4 reservations", status: "active" },
  { label: "Transportation", sublabel: "Shuttles & rentals", status: "pending" },
];

const itineraryItems = [
  { time: "7:00", period: "AM", icon: <CoffeeIcon />, iconClass: "food", title: "Breakfast", subtitle: "Carolina Dining Room", badge: null, isNow: false },
  { time: "9:30", period: "AM", icon: <FlagIcon />, iconClass: "golf", title: "Tee Time — No. 2", subtitle: "Pinehurst Resort", badge: "Now", isNow: true },
  { time: "2:30", period: "PM", icon: <UtensilsIcon />, iconClass: "food", title: "Lunch", subtitle: "The Deuce", badge: "Confirmed", isNow: false },
  { time: "4:30", period: "PM", icon: <FlagIcon />, iconClass: "golf", title: "Tee Time — No. 4", subtitle: "Groups A & B", badge: "Confirmed", isNow: false },
  { time: "7:30", period: "PM", icon: <UtensilsIcon />, iconClass: "food", title: "Dinner", subtitle: "1895 Grille", badge: "Confirmed", isNow: false },
];

const rosterPlayers = [
  { initials: "MC", name: "Marcus Chen", location: "Chicago, IL", handicap: "6.2", trips: "5 trips", color: "gold", isOnline: true, isOrganizer: true },
  { initials: "JM", name: "Jake Morrison", location: "Austin, TX", handicap: "9.1", trips: "3 trips", color: "blue", isOnline: true, team: "Team Red" },
  { initials: "DW", name: "Devon Williams", location: "Denver, CO", handicap: "4.8", trips: "5 trips", color: "green", isOnline: true },
  { initials: "RO", name: "Ryan O'Connor", location: "Boston, MA", handicap: "11.3", trips: "2 trips", color: "purple", isOnline: true },
  { initials: "TN", name: "Tommy Nguyen", location: "Seattle, WA", handicap: "14.7", trips: null, color: "orange", isOnline: false, isPending: true },
];

export function SecondPhoneRowDemo() {
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDay((prev) => (prev % 4) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="triple-phone-demo" data-testid="second-phone-row-demo">
      <div className="tpd-phones-container">
        {/* PHONE 1: TRIP DESIGNER */}
        <div className="tpd-phone-wrapper" data-testid="phone-trip-designer">
          <span className="tpd-phone-label">Trip Designer</span>
          <div className="tpd-phone-frame">
            <div className="tpd-phone-btn-left silent" />
            <div className="tpd-phone-btn-left vol1" />
            <div className="tpd-phone-btn-left vol2" />
            <div className="tpd-phone-screen dark">
              <div className="tpd-dynamic-island" />
              <div className="tpd-screen-content">
                <div className="tpd2-header">
                  <div className="tpd2-header-icon"><SparklesIcon /></div>
                  <div className="tpd2-header-text">
                    <div className="tpd2-header-title">Trip Designer</div>
                    <div className="tpd2-header-subtitle">Build your trip</div>
                  </div>
                  <span className="tpd2-header-badge">4 of 6</span>
                </div>

                <div className="tpd2-trip-card">
                  <div className="tpd2-trip-name">Pinehurst Invitational</div>
                  <div className="tpd2-trip-meta">
                    <span className="tpd2-meta-item"><MapPinIcon /> Pinehurst, NC</span>
                    <span className="tpd2-meta-item"><CalendarIcon /> Dec 27–30</span>
                  </div>
                </div>

                <div className="tpd2-progress">
                  <div className="tpd2-progress-header">
                    <span className="tpd2-progress-label">Setup Progress</span>
                    <span className="tpd2-progress-value">66%</span>
                  </div>
                  <div className="tpd2-progress-bar">
                    <div className="tpd2-progress-fill" style={{ width: '66%' }} />
                  </div>
                </div>

                <div className="tpd2-checklist">
                  <div className="tpd2-checklist-header">Trip Setup</div>
                  {setupItems.map((item, index) => (
                    <div key={index} className="tpd2-check-item" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className={`tpd2-check-icon ${item.status}`}>
                        {item.status === "done" && <CheckIcon />}
                      </div>
                      <div className="tpd2-check-content">
                        <div className={`tpd2-check-label ${item.status === "pending" ? "dim" : ""}`}>{item.label}</div>
                        <div className="tpd2-check-sublabel">{item.sublabel}</div>
                      </div>
                      <span className={`tpd2-check-status ${item.status}`}>
                        {item.status === "done" ? "Done" : item.status === "active" ? "In Progress" : "To Do"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="tpd2-cta">
                  <div className="tpd2-cta-button">
                    <span>Continue Setup</span>
                    <ArrowRightIcon />
                  </div>
                </div>

                <div className="tpd-home-indicator" style={{ background: "rgba(255, 255, 255, 0.12)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* PHONE 2: ITINERARY */}
        <div className="tpd-phone-wrapper" data-testid="phone-itinerary">
          <span className="tpd-phone-label">Itinerary</span>
          <div className="tpd-phone-frame">
            <div className="tpd-phone-btn-left silent" />
            <div className="tpd-phone-btn-left vol1" />
            <div className="tpd-phone-btn-left vol2" />
            <div className="tpd-phone-screen light">
              <div className="tpd-dynamic-island" />
              <div className="tpd-screen-content">
                <div className="tpd2-itin-header">
                  <div className="tpd2-itin-icon"><FlagIcon /></div>
                  <div className="tpd2-header-text">
                    <div className="tpd2-itin-title">Pinehurst Invitational</div>
                    <div className="tpd2-itin-subtitle">Dec 27–30, 2026</div>
                  </div>
                </div>

                <div className="tpd2-day-tabs">
                  {[1, 2, 3, 4].map((day) => (
                    <div key={day} className={`tpd2-day-tab ${activeDay === day ? "active" : ""}`}>
                      <div className="tpd2-day-name">{["Fri", "Sat", "Sun", "Mon"][day - 1]}</div>
                      <div className="tpd2-day-num">{26 + day}</div>
                      <div className="tpd2-day-label">{day === 1 ? "Arrival" : day === 4 ? "Depart" : `Day ${day}`}</div>
                    </div>
                  ))}
                </div>

                <div className="tpd2-timeline">
                  {itineraryItems.map((item, index) => (
                    <div key={index} className="tpd2-timeline-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="tpd2-timeline-time">
                        <div className="tpd2-time-hour">{item.time}</div>
                        <div className="tpd2-time-period">{item.period}</div>
                      </div>
                      <div className={`tpd2-timeline-dot ${item.iconClass} ${item.isNow ? "now" : ""}`}>
                        {item.icon}
                      </div>
                      <div className={`tpd2-timeline-content ${item.isNow ? "now-card" : ""}`}>
                        {item.badge && (
                          <span className={`tpd2-event-badge ${item.isNow ? "now" : ""}`}>{item.badge}</span>
                        )}
                        <div className="tpd2-event-title">{item.title}</div>
                        <div className="tpd2-event-subtitle">{item.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="tpd2-itin-footer">
                  <div className="tpd2-live-dot" />
                  <span className="tpd2-live-text">On the course</span>
                  <span className="tpd2-live-time">10:47 AM</span>
                </div>

                <div className="tpd-home-indicator" />
              </div>
            </div>
          </div>
        </div>

        {/* PHONE 3: ROSTER */}
        <div className="tpd-phone-wrapper" data-testid="phone-roster">
          <span className="tpd-phone-label">Roster</span>
          <div className="tpd-phone-frame">
            <div className="tpd-phone-btn-left silent" />
            <div className="tpd-phone-btn-left vol1" />
            <div className="tpd-phone-btn-left vol2" />
            <div className="tpd-phone-screen dark">
              <div className="tpd-dynamic-island" />
              <div className="tpd-screen-content">
                <div className="tpd2-roster-header">
                  <div className="tpd2-roster-icon"><UsersIcon /></div>
                  <div className="tpd2-header-text">
                    <div className="tpd2-header-title">Roster</div>
                    <div className="tpd2-header-subtitle">Pinehurst Invitational</div>
                  </div>
                  <span className="tpd2-roster-badge">8 Players</span>
                </div>

                <div className="tpd2-stats-strip">
                  <div className="tpd2-stat-block">
                    <div className="tpd2-stat-value green">6</div>
                    <div className="tpd2-stat-label">Confirmed</div>
                  </div>
                  <div className="tpd2-stat-block">
                    <div className="tpd2-stat-value orange">2</div>
                    <div className="tpd2-stat-label">Pending</div>
                  </div>
                  <div className="tpd2-stat-block">
                    <div className="tpd2-stat-value gold">8.4</div>
                    <div className="tpd2-stat-label">Avg HCP</div>
                  </div>
                  <div className="tpd2-stat-block">
                    <div className="tpd2-stat-value">3</div>
                    <div className="tpd2-stat-label">Trips</div>
                  </div>
                </div>

                <div className="tpd2-player-list">
                  {rosterPlayers.map((player, index) => (
                    <div
                      key={index}
                      className={`tpd2-player-card ${player.isOrganizer ? "organizer" : ""}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className={`tpd2-player-avatar ${player.color}`}>
                        {player.initials}
                        <div className={`tpd2-status-dot ${player.isOnline ? "online" : "pending"}`} />
                      </div>
                      <div className="tpd2-player-info">
                        <div className="tpd2-player-name-row">
                          <span className="tpd2-player-name">{player.name}</span>
                          {player.isOrganizer && <span className="tpd2-player-badge organizer">Organizer</span>}
                          {player.team && <span className="tpd2-player-badge team">{player.team}</span>}
                        </div>
                        <div className="tpd2-player-location">
                          <MapPinIcon /> {player.location}
                        </div>
                        <div className="tpd2-player-tags">
                          <span className="tpd2-player-tag handicap">
                            <FlagIcon /> {player.handicap}
                          </span>
                          {player.trips && <span className="tpd2-player-tag trips">{player.trips}</span>}
                          {player.isPending && <span className="tpd2-player-tag pending">Awaiting</span>}
                        </div>
                      </div>
                      <span className="tpd2-player-arrow">&rsaquo;</span>
                    </div>
                  ))}
                </div>

                <div className="tpd2-roster-footer">
                  <div className="tpd2-roster-live-dot" />
                  <span className="tpd2-roster-live-text">4 online now</span>
                  <div className="tpd2-live-avatars">
                    <div className="tpd2-live-avatar gold">MC</div>
                    <div className="tpd2-live-avatar blue">JM</div>
                    <div className="tpd2-live-avatar green">DW</div>
                    <div className="tpd2-live-avatar more">+1</div>
                  </div>
                </div>

                <div className="tpd-home-indicator" style={{ background: "rgba(255, 255, 255, 0.12)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecondPhoneRowDemo;
