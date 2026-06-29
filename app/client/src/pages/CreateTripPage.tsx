import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { http } from "@/lib/http";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormState = {
  name: string;
  destination: string;
  startDate: string;
  nights: string;
};

type Template = "custom" | "pinehurst" | "bandon" | "scottsdale" | "staycation";

type TemplateData = {
  destination: string;
  nights: string;
  rounds?: Array<{ course: string; date_offset: number }>;
  itinerary?: Array<{ title: string; description: string; day: number }>;
};

const TEMPLATES: Record<Template, TemplateData | null> = {
  custom: null,
  pinehurst: {
    destination: "Pinehurst, NC",
    nights: "3",
    rounds: [
      { course: "Pinehurst No. 2", date_offset: 0 },
      { course: "Pinehurst No. 4", date_offset: 1 },
      { course: "Pinehurst No. 8", date_offset: 2 },
    ],
    itinerary: [
      { title: "Arrival & Check-in", description: "Check into Pinehurst Resort", day: 0 },
      { title: "Welcome Dinner", description: "Dinner at The Deuce", day: 0 },
      { title: "Breakfast Buffet", description: "Morning meal before round", day: 1 },
      { title: "Departure", description: "Checkout and head home", day: 3 },
    ],
  },
  bandon: {
    destination: "Bandon, OR",
    nights: "4",
    rounds: [
      { course: "Bandon Dunes", date_offset: 0 },
      { course: "Pacific Dunes", date_offset: 1 },
      { course: "Old Macdonald", date_offset: 2 },
      { course: "Bandon Trails", date_offset: 3 },
    ],
    itinerary: [
      { title: "Arrival", description: "Check into Bandon Dunes Resort", day: 0 },
      { title: "Sunset at Punchbowl", description: "Practice facility round", day: 0 },
      { title: "Breakfast at Gallery", description: "Start the day right", day: 1 },
      { title: "Farewell Dinner", description: "Final night celebration", day: 3 },
    ],
  },
  scottsdale: {
    destination: "Scottsdale, AZ",
    nights: "3",
    rounds: [
      { course: "TPC Scottsdale", date_offset: 0 },
      { course: "Troon North", date_offset: 1 },
    ],
    itinerary: [
      { title: "Airport Pickup", description: "Arrive at PHX", day: 0 },
      { title: "Pool Party", description: "Resort pool hangout", day: 1 },
      { title: "Old Town Nightlife", description: "Scottsdale bars & clubs", day: 2 },
    ],
  },
  staycation: {
    destination: "Local",
    nights: "2",
    rounds: [
      { course: "Municipal Course", date_offset: 0 },
      { course: "Country Club", date_offset: 1 },
    ],
    itinerary: [
      { title: "Friday Evening Arrival", description: "Meetup at course", day: 0 },
      { title: "Saturday Cookout", description: "BBQ after round", day: 1 },
    ],
  },
};

const TEMPLATE_OPTIONS = [
  { value: "custom", label: "Custom Trip" },
  { value: "pinehurst", label: "Pinehurst Weekend" },
  { value: "bandon", label: "Bandon Dunes Long Weekend" },
  { value: "scottsdale", label: "Scottsdale Bachelor" },
  { value: "staycation", label: "Local Staycation" },
];

const NIGHTS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "10", "14"];

export default function CreateTripPage() {
  const [template, setTemplate] = useState<Template>("custom");
  const [formState, setFormState] = useState<FormState>({
    name: "",
    destination: "",
    startDate: "",
    nights: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const templateData = TEMPLATES[template];
    if (templateData) {
      setFormState((current) => ({
        ...current,
        destination: templateData.destination,
        nights: templateData.nights,
      }));
    }
  }, [template]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      name: formState.name,
      destination: formState.destination,
      start_date: formState.startDate,
      nights: formState.nights ? Number(formState.nights) : null,
    };

    try {
      const tripData = await http.post<{
        id: string;
        name: string;
        destination: string;
        start_date: string;
        nights: number;
        invite_code: string;
      }>("/api/trips", payload);

      console.log("[BG] Trip created:", tripData.id, "invite_code:", tripData.invite_code);

      // Add creator as member if memberName is stored
      const storedName = localStorage.getItem("memberName");
      if (storedName && tripData.id) {
        try {
          const memberData = await http.post<{ id: string }>(
            `/api/trips/${tripData.id}/members`,
            { name: storedName }
          );
          localStorage.setItem("tripMemberId", memberData.id);
          localStorage.setItem("tripId", tripData.id);
        } catch {
          // Continue even if adding member fails
        }
      }

      // Seed template data if selected
      const templateData = TEMPLATES[template];
      if (templateData && tripData.id) {
        if (templateData.rounds) {
          for (const round of templateData.rounds) {
            try {
              const roundDate = new Date(formState.startDate);
              roundDate.setDate(roundDate.getDate() + round.date_offset);
              await http.post(`/api/trips/${tripData.id}/rounds`, {
                course_name: round.course,
                date: roundDate.toISOString().split("T")[0],
              });
            } catch {
              // Continue even if seeding round fails
            }
          }
        }

        if (templateData.itinerary) {
          for (const item of templateData.itinerary) {
            try {
              const blockDate = new Date(formState.startDate);
              blockDate.setDate(blockDate.getDate() + item.day);
              await http.post(`/api/trips/${tripData.id}/itinerary`, {
                title: item.title,
                type: "misc",
                date: blockDate.toISOString().split("T")[0],
                notes: item.description,
              });
            } catch {
              // Continue even if seeding itinerary fails
            }
          }
        }
      }

      setSuccessMessage(`Trip created! Invite code: ${tripData.invite_code}`);
      setTimeout(() => navigate("/my-trips"), 1000);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to create trip";
      console.error("[BG] create-trip failed:", message);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell maxWidth="2xl">
      {/* Back link */}
      <Link
        to="/my-trips"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to trips
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Trip</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new golf trip for you and your group
        </p>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
          <CardDescription>
            Fill in the basic info to get started. You can add courses and itinerary later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template selector */}
            <div className="space-y-2">
              <Label>Template (optional)</Label>
              <Select
                value={template}
                onValueChange={(value: string) => setTemplate(value as Template)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Templates pre-fill destination and add sample rounds & itinerary
              </p>
            </div>

            {/* Trip name */}
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="e.g., Annual Guys Trip 2024"
                required
              />
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                name="destination"
                value={formState.destination}
                onChange={handleChange}
                placeholder="e.g., Pinehurst, NC"
                required
              />
            </div>

            {/* Start date and nights in a row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formState.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nights</Label>
                <Select
                  value={formState.nights}
                  onValueChange={(value: string) =>
                    setFormState((current) => ({ ...current, nights: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nights" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGHTS_OPTIONS.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n} night{n === "1" ? "" : "s"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                <p className="text-sm text-destructive">Error: {error}</p>
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link to="/my-trips">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || !!successMessage}>
                {isSubmitting
                  ? "Creating..."
                  : successMessage
                  ? "Redirecting..."
                  : "Create Trip"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
