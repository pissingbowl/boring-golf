import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin, Calendar, Moon, ChevronRight, AlertCircle, Briefcase } from "lucide-react";
import { http } from "@/lib/http";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

/**
 * ============================================================================
 * MY TRIPS PAGE - OPERATOR CONSOLE
 * ============================================================================
 * 
 * DESIGN PHILOSOPHY (from DESIGN_SYSTEM.md):
 * 
 * This is a "risk management surface" - the operator's command center.
 * Should feel like a "curated dashboard of upcoming experiences."
 * 
 * VISUAL RULES:
 * - Background: Warm off-white paper tone (#F6F3EE / bg-paper)
 * - Cards: Soft UI structure (white with low-opacity borders)
 * - Typography: Inter font stack
 *   - Trip titles: Level 1 Anchors (Bold, Clear)
 *   - Metadata: Level 4 (Quiet, gray)
 * 
 * INTERACTION:
 * - Create Trip button: Primary action, calm (no neon)
 * - Cards: Subtle elevation on hover
 * - Dense but scannable layout
 * 
 * EMOTIONAL ATMOSPHERE:
 * - "I know exactly what trips I have planned"
 * - "I trust this information"
 * - "I look organized"
 * 
 * ============================================================================
 */

type Trip = {
  id: string;
  name: string;
  destination: string;
  start_date: string | null;
  nights: number | null;
};

// Skeleton loader with design system styling
function SkeletonCard() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-border-soft rounded-card p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-6 w-2/5 rounded bg-paper" />
          <div className="space-y-2">
            <div className="h-4 w-3/5 rounded bg-paper" />
            <div className="h-4 w-2/5 rounded bg-paper" />
          </div>
        </div>
        <div className="h-9 w-24 rounded-input bg-paper" />
      </div>
    </div>
  );
}

// Trip Card - Flight Operations aesthetic with hover interactions
function TripCard({ trip }: { trip: Trip }) {
  const formattedStartDate = trip.start_date
    ? new Date(trip.start_date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";

  // Calculate trip status for visual indicator
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = trip.start_date ? new Date(trip.start_date) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);
  
  const isUpcoming = startDate && startDate > today;
  const isPast = startDate && startDate < today;
  const isActive = startDate && !isPast && !isUpcoming; // Today or within trip dates

  // Calculate days until trip for proximity countdown
  const daysUntilTrip = startDate 
    ? Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Show countdown for trips within 14 days
  const showCountdown = daysUntilTrip !== null && daysUntilTrip >= 0 && daysUntilTrip <= 14;
  const countdownText = daysUntilTrip === 0 
    ? "Today" 
    : daysUntilTrip === 1 
      ? "Tomorrow" 
      : `${daysUntilTrip} days away`;

  return (
    <Link
      to={`/trip/${trip.id}`}
      className="group block bg-white/80 backdrop-blur-sm border border-border-soft rounded-card p-6 shadow-card hover:border-border-default"
      style={{
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Trip Info */}
        <div className="flex-1 min-w-0">
          {/* Trip Name - Level 1 Anchor (Bold, Clear) */}
          <h3 className="font-sans text-lg font-semibold text-ink group-hover:text-action-primary transition-colors truncate">
            {trip.name}
          </h3>

          {/* Metadata - Level 4 (Quiet) */}
          <div className="mt-3 space-y-1.5">
            {/* Destination */}
            <div className="flex items-center gap-2 text-meta text-ink-muted">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </div>

            {/* Date + Duration Row */}
            <div className="flex items-center gap-4 text-meta text-ink-muted">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{formattedStartDate}</span>
              </div>
              {trip.nights !== null && trip.nights > 0 && (
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{trip.nights} night{trip.nights !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>

            {/* Countdown Proximity - shows for trips within 14 days */}
            {showCountdown && (
              <div className="text-micro text-action-primary font-medium mt-1">
                {countdownText}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status + Arrow */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status Indicator */}
          {isActive && (
            <span className="px-2.5 py-1 text-micro font-medium rounded-pill bg-success-bg text-success border border-success/20">
              Active
            </span>
          )}
          {isUpcoming && (
            <span className="px-2.5 py-1 text-micro font-medium rounded-pill bg-action-primary/10 text-action-primary border border-action-primary/20 animate-subtle-pulse">
              Upcoming
            </span>
          )}
          {isPast && (
            <span className="px-2.5 py-1 text-micro font-medium rounded-pill bg-paper text-ink-muted border border-border-soft opacity-60 saturate-[0.7]">
              Completed
            </span>
          )}

          {/* Arrow - animates right on card hover */}
          <ChevronRight 
            className="h-5 w-5 text-ink-muted group-hover:text-ink group-hover:translate-x-1 transition-all duration-200 ease-out"
          />
        </div>
      </div>
    </Link>
  );
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      try {
        const data = await http.get<Trip[]>("/api/trips");
        if (isMounted) {
          // Sort trips: upcoming first, then by date
          const sorted = [...data].sort((a, b) => {
            const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
            const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
            return dateA - dateB;
          });
          setTrips(sorted);
          setError(null);
        }
      } catch (fetchError: unknown) {
        if (isMounted) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load trips";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  // Count trips by status
  const upcomingCount = trips.filter((t) => {
    if (!t.start_date) return false;
    const d = new Date(t.start_date);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }).length;

  return (
    <AppShell maxWidth="4xl">
      {/* Page Container - Warm Paper Background */}
      <div className="min-h-screen bg-paper">
        {/* ================================================================
            HEADER - Operator Console Style
            ================================================================ */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Title + Subtitle */}
            <div>
              {/* Page Title - Level 1 Anchor */}
              <h1 className="font-sans text-display text-ink">My Trips</h1>
              {/* Subtitle - Level 4 Quiet */}
              <p className="text-meta text-ink-muted mt-1">
                {loading ? (
                  "Loading your trips..."
                ) : error ? (
                  "Unable to load trips"
                ) : trips.length === 0 ? (
                  "No trips planned yet"
                ) : (
                  <>
                    {trips.length} trip{trips.length !== 1 ? "s" : ""}
                    {upcomingCount > 0 && (
                      <span className="ml-1">
                        · {upcomingCount} upcoming
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Right: Create Trip Button - Primary action, calm */}
            <Button
              asChild
              className="bg-ink hover:bg-ink/90 text-ink-inverse font-medium shadow-card hover:shadow-card-hover transition-all duration-default"
            >
              <Link to="/create-trip" className="gap-2">
                <Plus className="h-4 w-4" />
                New Trip
              </Link>
            </Button>
          </div>
        </header>

        {/* ================================================================
            CONTENT
            ================================================================ */}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-error-bg border border-error/20 rounded-card p-6 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-error">Unable to load trips</p>
              <p className="text-meta text-error/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && trips.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-border-soft rounded-card p-12 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-paper flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-ink-muted" />
            </div>

            {/* Title */}
            <h3 className="font-sans text-section text-ink mb-2">
              No trips yet
            </h3>

            {/* Description */}
            <p className="text-meta text-ink-secondary mb-8 max-w-sm mx-auto">
              Create your first golf trip to start planning your next adventure with friends.
            </p>

            {/* CTA */}
            <Button
              asChild
              className="bg-ink hover:bg-ink/90 text-ink-inverse font-medium"
            >
              <Link to="/create-trip" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Trip
              </Link>
            </Button>
          </div>
        )}

        {/* Trip List - Flight Operations Density */}
        {!loading && !error && trips.length > 0 && (
          <div className="space-y-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {/* Bottom Padding */}
        <div className="h-16" />
      </div>
    </AppShell>
  );
}
