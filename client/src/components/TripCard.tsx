import { Link } from "react-router-dom";
import { MapPin, Calendar, Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Trip = {
  id: string;
  name: string;
  destination: string;
  start_date: string | null;
  nights: number | null;
};

type TripCardProps = {
  trip: Trip;
};

export default function TripCard({ trip }: TripCardProps) {
  const formattedStartDate = trip.start_date
    ? new Date(trip.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            {/* Trip name */}
            <Link
              to={`/trip/${trip.id}`}
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              {trip.name}
            </Link>

            {/* Trip details */}
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedStartDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>{trip.nights ?? 0} nights</span>
              </div>
            </div>
          </div>

          {/* View button */}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/trip/${trip.id}`}>View Trip</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
