import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Trip = {
  id: string;
  name: string;
  destination: string;
  start_date: string | null;
  nights: number | null;
};

type EditTripModalProps = {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function EditTripModal({ trip, isOpen, onClose, onSaved }: EditTripModalProps) {
  const [name, setName] = useState(trip.name);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState(
    trip.start_date ? new Date(trip.start_date).toISOString().split("T")[0] : ""
  );
  const [nights, setNights] = useState(String(trip.nights ?? 3));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when trip changes
  useEffect(() => {
    setName(trip.name);
    setDestination(trip.destination);
    setStartDate(
      trip.start_date ? new Date(trip.start_date).toISOString().split("T")[0] : ""
    );
    setNights(String(trip.nights ?? 3));
    setError(null);
  }, [trip]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError("Trip name is required");
      return;
    }
    if (!destination.trim()) {
      setError("Destination is required");
      return;
    }
    if (!startDate) {
      setError("Start date is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${trip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          destination: destination.trim(),
          start_date: startDate,
          nights: parseInt(nights, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed with ${response.status}`);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update trip");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
          <h2 className="font-serif text-xl text-ink">Edit Trip</h2>
          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink hover:bg-paper rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Trip Name */}
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1.5">
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pinehurst Invitational"
              className="w-full px-4 py-2.5 bg-paper border border-border-default rounded-lg text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1.5">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Pinehurst, NC"
              className="w-full px-4 py-2.5 bg-paper border border-border-default rounded-lg text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
              required
            />
          </div>

          {/* Start Date & Nights */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-paper border border-border-default rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                Nights
              </label>
              <select
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                className="w-full px-4 py-2.5 bg-paper border border-border-default rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                required
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} night{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-ink hover:bg-ink/90 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
