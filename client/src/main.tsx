// Boot markers
console.log("[BG] boot: main.tsx loaded", { ts: Date.now() });
window.addEventListener("error", (e) => console.error("[BG] window.error", e.error || e.message));
window.addEventListener("unhandledrejection", (e) => console.error("[BG] unhandledrejection", e.reason));

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VibeProvider } from "@/lib/vibe-provider";
import { initGlobalDebug } from "@/lib/debug";
import "./index.css";

// Pages
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import CreateTripPage from "@/pages/CreateTripPage";
// EditTripPage removed - now using EditTripModal in TripDetailPage
import MyTripsPage from "@/pages/MyTripsPage";
import TripDetailPage from "@/pages/TripDetailPage";
import ItineraryBuilderPage from "@/pages/ItineraryBuilderPage";
import JoinTripPage from "@/pages/JoinTripPage";
import DebugPage from "@/pages/DebugPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Initialize global debug object (dev-only)
initGlobalDebug(queryClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <VibeProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/create-trip" element={<CreateTripPage />} />
            <Route path="/trip-designer" element={<CreateTripPage />} />
            {/* Edit trip now handled via modal in TripDetailPage */}
            <Route path="/my-trips" element={<MyTripsPage />} />
            <Route path="/trip/:id" element={<TripDetailPage />} />
            <Route path="/trip/:id/itinerary-builder" element={<ItineraryBuilderPage />} />
            <Route path="/join" element={<JoinTripPage />} />
            <Route path="/join/:code" element={<JoinTripPage />} />
            {/* Dev-only debug route */}
            {import.meta.env.DEV && <Route path="/__debug" element={<DebugPage />} />}
          </Routes>
        </VibeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

setTimeout(() => console.log("[BG] boot: react rendered"), 0);
