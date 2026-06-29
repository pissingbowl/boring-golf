import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, GripVertical, Edit2, Trash2, Plus, Undo2, Send, Clock, MapPin, CheckCircle, ChevronUp, ChevronDown, Calendar, Utensils, Flag, Plane, Car, Home, Sparkles, Coffee, Users } from "lucide-react";
import { http } from "@/lib/http";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import type { ItineraryBuilderBlock } from "@shared/domain";

// ============================================================================
// RESPONSIVE HOOK - Detect mobile vs desktop
// ============================================================================
function useIsMobile(breakpoint: number = 640): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * ============================================================================
 * ITINERARY BUILDER PAGE - BORING GOLF
 * ============================================================================
 * 
 * DESIGN PHILOSOPHY (from DESIGN_SYSTEM.md):
 * 
 * GUEST vs OPERATOR PHILOSOPHY:
 * - Mobile = Guest Command App (NOW/NEXT/LATER hierarchy, Departure Board typography)
 * - Desktop = Operator Console (Timeline Builder, Flight Operations density)
 * 
 * VISUAL RULES:
 * - Background: Warm off-white paper tone (#F6F3EE)
 * - Cards: bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl shadow-sm
 * - Day headers: Primary visual anchors (bold, bg accent)
 * - Status pills: Only show when NOT "open"
 * - Publish button: Consequential like a commit action
 * 
 * MOBILE (Guest Command App):
 * - Hide complex editing controls
 * - Large, legible "Departure Board" typography
 * - NOW / NEXT / LATER temporal hierarchy
 * 
 * DESKTOP (Operator Console):
 * - Full Timeline Builder interface
 * - Denser "Flight Operations" layout
 * - All editing controls visible on hover
 * 
 * ============================================================================
 */

// Category colors (subtle, editorial)
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  meal: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  golf: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  transport: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  lodging: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  activity: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  logistics: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
};

const CATEGORY_LABELS: Record<string, string> = {
  meal: "Meal",
  golf: "Golf",
  transport: "Transport",
  lodging: "Lodging",
  activity: "Activity",
  logistics: "Logistics",
};

// Category icons for the timeline
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  meal: Utensils,
  golf: Flag,
  transport: Plane,
  lodging: Home,
  activity: Sparkles,
  logistics: Users,
};

// Ghost events shown when itinerary is empty
const GHOST_EVENTS: ItineraryBuilderBlock[] = [
  {
    id: "ghost-1",
    tripId: "ghost",
    dayDate: new Date().toISOString().split("T")[0],
    sortOrder: 0,
    blockType: "travel",
    category: "transport",
    title: "Arrival",
    startTime: "14:00",
    duration: 60,
    location: "Airport",
    notes: "Group meets at baggage claim",
    status: "open",
  },
  {
    id: "ghost-2",
    tripId: "ghost",
    dayDate: new Date().toISOString().split("T")[0],
    sortOrder: 1,
    blockType: "tee_time",
    category: "golf",
    title: "Afternoon Tee Time",
    startTime: "16:00",
    duration: 240,
    location: "Pinehurst No. 2",
    notes: "First round - warm up round",
    status: "open",
  },
  {
    id: "ghost-3",
    tripId: "ghost",
    dayDate: new Date().toISOString().split("T")[0],
    sortOrder: 2,
    blockType: "dinner",
    category: "meal",
    title: "Welcome Dinner",
    startTime: "20:00",
    duration: 120,
    location: "The Carolina Dining Room",
    notes: "Dress code: Smart casual",
    status: "open",
  },
];

const BLOCK_TYPE_OPTIONS: { value: string; label: string; category: string }[] = [
  { value: "breakfast", label: "Breakfast", category: "meal" },
  { value: "lunch", label: "Lunch", category: "meal" },
  { value: "dinner", label: "Dinner", category: "meal" },
  { value: "drinks", label: "Drinks", category: "meal" },
  { value: "tee_time", label: "Tee Time", category: "golf" },
  { value: "range", label: "Range / Practice", category: "golf" },
  { value: "travel", label: "Travel", category: "transport" },
  { value: "shuttle", label: "Shuttle", category: "transport" },
  { value: "check_in", label: "Check In", category: "lodging" },
  { value: "check_out", label: "Check Out", category: "lodging" },
  { value: "spa", label: "Spa", category: "activity" },
  { value: "pool", label: "Pool", category: "activity" },
  { value: "group_meeting", label: "Group Meeting", category: "logistics" },
  { value: "free_time", label: "Free Time", category: "logistics" },
  { value: "custom", label: "Custom", category: "logistics" },
];

const ANCHOR_BLOCK_TYPES = ["tee_time", "travel", "check_in", "check_out"] as const;

// ============================================================================
// TIMELINE CONSTANTS - True Linear Time-Accurate Schedule
// ============================================================================
const HOUR_HEIGHT = 80; // pixels per hour
const DAY_START_HOUR = 6; // 6 AM
const DAY_END_HOUR = 23; // 11 PM
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR; // 17 hours
const TIMELINE_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT; // Total timeline height
const MIN_BLOCK_HEIGHT = 40; // Minimum height for very short events

// Convert 24h time string to minutes from midnight
function timeToMinutes(time: string | undefined): number {
  if (!time) return DAY_START_HOUR * 60;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Calculate block vertical position in pixels
function getBlockTop(startTime: string | undefined): number {
  const startMinutes = timeToMinutes(startTime);
  const dayStartMinutes = DAY_START_HOUR * 60;
  const offsetMinutes = Math.max(0, startMinutes - dayStartMinutes);
  return (offsetMinutes / 60) * HOUR_HEIGHT;
}

// Calculate block height in pixels based on duration
function getBlockHeight(duration: number | undefined): number {
  const durationMinutes = duration || 60; // Default 1 hour
  const height = (durationMinutes / 60) * HOUR_HEIGHT;
  return Math.max(MIN_BLOCK_HEIGHT, height);
}

// Detect overlapping blocks and assign column indices
type BlockWithLayout = ItineraryBuilderBlock & {
  column: number;
  totalColumns: number;
};

function calculateBlockLayouts(blocks: ItineraryBuilderBlock[]): BlockWithLayout[] {
  if (blocks.length === 0) return [];
  
  // Sort by start time
  const sorted = [...blocks].sort((a, b) => {
    const aStart = timeToMinutes(a.startTime);
    const bStart = timeToMinutes(b.startTime);
    return aStart - bStart;
  });

  // Group overlapping blocks
  const groups: ItineraryBuilderBlock[][] = [];
  let currentGroup: ItineraryBuilderBlock[] = [];
  let groupEndTime = 0;

  for (const block of sorted) {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = blockStart + (block.duration || 60);

    if (currentGroup.length === 0 || blockStart < groupEndTime) {
      // Overlaps with current group
      currentGroup.push(block);
      groupEndTime = Math.max(groupEndTime, blockEnd);
    } else {
      // New group
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [block];
      groupEndTime = blockEnd;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Assign columns within each group
  const result: BlockWithLayout[] = [];
  for (const group of groups) {
    const totalColumns = group.length;
    group.forEach((block, index) => {
      result.push({
        ...block,
        column: index,
        totalColumns,
      });
    });
  }

  return result;
}

// Generate hour labels for the timeline
function getHourLabels(): { hour: number; label: string }[] {
  const labels: { hour: number; label: string }[] = [];
  for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h >= 12 ? "PM" : "AM";
    labels.push({ hour: h, label: `${hour12} ${ampm}` });
  }
  return labels;
}

// Convert click position to time string
function getTimeFromClickPosition(offsetY: number): string {
  const minutesFromDayStart = (offsetY / HOUR_HEIGHT) * 60;
  // Round to nearest 30 minutes
  const roundedMinutes = Math.round(minutesFromDayStart / 30) * 30;
  const totalMinutes = (DAY_START_HOUR * 60) + roundedMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function formatTime(time: string | undefined): string {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Determine temporal context for mobile view
function getTemporalContext(dateStr: string): "past" | "today" | "tomorrow" | "future" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const blockDate = new Date(dateStr + "T00:00:00");
  const diffDays = Math.floor((blockDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "past";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  return "future";
}

// Undo entry types
type UndoEntry =
  | { type: "reorder"; dayDate: string; previousBlockIds: string[] }
  | { type: "move"; blockId: string; previousDayDate: string; previousSortOrder: number }
  | { type: "create"; blockId: string }
  | { type: "edit"; blockId: string; previousData: Partial<ItineraryBuilderBlock> }
  | { type: "delete"; deletedBlock: ItineraryBuilderBlock };

function getUndoDescription(entry: UndoEntry | null, blocks: ItineraryBuilderBlock[]): string | null {
  if (!entry) return null;
  switch (entry.type) {
    case "reorder": return `Reorder ${formatDate(entry.dayDate)}`;
    case "move": {
      const block = blocks.find((b) => b.id === entry.blockId);
      return `Move "${block?.title || 'block'}"`;
    }
    case "create": {
      const block = blocks.find((b) => b.id === entry.blockId);
      return `Create "${block?.title || 'block'}"`;
    }
    case "edit": return `Edit block`;
    case "delete": return `Delete "${entry.deletedBlock.title}"`;
    default: return null;
  }
}

export default function ItineraryBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile(640); // Switch at sm breakpoint (640px)
  
  const [blocks, setBlocks] = useState<ItineraryBuilderBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ItineraryBuilderBlock | null>(null);

  // Form state
  const [formDayDate, setFormDayDate] = useState(getTodayDate());
  const [formTitle, setFormTitle] = useState("");
  const [formBlockType, setFormBlockType] = useState("custom");
  const [formCategory, setFormCategory] = useState("logistics");
  // Time fields (dropdowns)
  const [formHour, setFormHour] = useState("8");
  const [formMinute, setFormMinute] = useState("00");
  const [formAmPm, setFormAmPm] = useState<"AM" | "PM">("AM");
  // Duration in 30-min intervals (e.g., "1", "1.5", "2")
  const [formDuration, setFormDuration] = useState("1");
  const [formLocation, setFormLocation] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<"open" | "soft" | "locked">("open");

  // Selected day (for sidebar navigation)
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Drag state (for cross-day moves)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedFromDay, setDraggedFromDay] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [justDroppedId, setJustDroppedId] = useState<string | null>(null);

  // Timeline drag state (for resizing and moving blocks within timeline)
  const [timelineDrag, setTimelineDrag] = useState<{
    blockId: string;
    type: 'move' | 'resize-top' | 'resize-bottom';
    startY: number;
    originalTop: number;
    originalHeight: number;
    originalStartTime: string;
    originalDuration: number;
  } | null>(null);

  // Delete state
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

  // Undo state
  const [lastUndo, setLastUndo] = useState<UndoEntry | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoMessage, setUndoMessage] = useState<string | null>(null);

  // Publish state
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  // Trip date range (for auto-generating days)
  const [tripStartDate, setTripStartDate] = useState<string | null>(null);
  const [tripNights, setTripNights] = useState<number>(0);

  // Fetch trip to get itinerary_published state AND date range
  useEffect(() => {
    if (!id) return;
    const loadTripData = async () => {
      try {
        const trip = await http.get<{ 
          itinerary_published?: boolean;
          start_date?: string;
          nights?: number;
          end_date?: string;
        }>(`/api/trips/${id}`);
        
        setIsPublished(trip.itinerary_published ?? false);
        
        // Extract date range from trip
        if (trip.start_date) {
          // Normalize the date format (handle ISO strings)
          const startDate = trip.start_date.split('T')[0];
          setTripStartDate(startDate);
          
          // Calculate nights from end_date if nights not provided
          if (trip.nights !== undefined && trip.nights !== null) {
            setTripNights(trip.nights);
          } else if (trip.end_date) {
            const start = new Date(startDate + 'T00:00:00');
            const end = new Date(trip.end_date.split('T')[0] + 'T00:00:00');
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setTripNights(Math.max(0, diffDays));
          } else {
            // Default to 3 nights if no end date
            setTripNights(3);
          }
        }
      } catch {
        const stored = localStorage.getItem(`itinerary-published-${id}`);
        setIsPublished(stored === "true");
      }
    };
    loadTripData();
  }, [id]);

  const handlePublishToggle = async () => {
    if (!id || isTogglingPublish) return;
    const newValue = !isPublished;
    setIsTogglingPublish(true);
    try {
      await http.patch(`/api/trips/${id}`, { itinerary_published: newValue });
      setIsPublished(newValue);
      localStorage.setItem(`itinerary-published-${id}`, String(newValue));
      if (newValue) {
        setLastUndo(null);
        setUndoMessage(null);
      }
    } catch (err) {
      console.error("[BG] Failed to toggle publish state:", err);
      setActionError("Failed to update publish state");
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const loadBlocks = async () => {
    if (!id) return;
    try {
      const data = await http.get<ItineraryBuilderBlock[]>(`/api/trips/${id}/itinerary/builder`);
      const sorted = [...data].sort((a, b) => {
        if (a.dayDate !== b.dayDate) return a.dayDate.localeCompare(b.dayDate);
        return a.sortOrder - b.sortOrder;
      });
      setBlocks(sorted);
      setError(null);
    } catch (err) {
      console.error("[BG] Failed to load itinerary blocks:", err);
      setError(err instanceof Error ? err.message : "Failed to load itinerary");
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadBlocks();
  }, [id]);

  // Group blocks by dayDate (memoized to prevent infinite loops)
  const blocksByDay = useMemo(() => {
    return blocks.reduce((acc, block) => {
      const day = block.dayDate;
      if (!acc[day]) acc[day] = [];
      acc[day].push(block);
      return acc;
    }, {} as Record<string, ItineraryBuilderBlock[]>);
  }, [blocks]);

  // Auto-generate days from trip's start_date and nights
  // This replaces manual "Add Day" - the schedule structure is defined by trip settings
  const tripDays = useMemo(() => {
    if (!tripStartDate) return [];
    
    const days: string[] = [];
    const startDate = new Date(tripStartDate + 'T00:00:00');
    
    // Generate days: arrival day + nights + checkout day
    // e.g., 3 nights = Day 1 (arrival), Day 2, Day 3, Day 4 (checkout)
    const totalDays = tripNights + 1; // +1 for checkout day
    
    for (let i = 0; i < totalDays; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      days.push(dayDate.toISOString().split('T')[0]);
    }
    
    return days;
  }, [tripStartDate, tripNights]);

  // Use tripDays if available, otherwise fall back to days that have blocks
  const sortedDays = useMemo(() => {
    if (tripDays.length > 0) return tripDays;
    // Fallback: show days that have existing blocks (for backwards compatibility)
    return Object.keys(blocksByDay).sort();
  }, [tripDays, blocksByDay]);

  // Auto-select first day when blocks load
  useEffect(() => {
    if (sortedDays.length > 0 && !selectedDay) {
      setSelectedDay(sortedDays[0]);
    }
  }, [sortedDays, selectedDay]);

  // Time conversion helpers
  const parseTimeToDropdowns = (time24: string | undefined) => {
    if (!time24) return { hour: "8", minute: "00", ampm: "AM" as const };
    const [h, m] = time24.split(":").map(Number);
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h >= 12 ? "PM" : "AM";
    const minute = m >= 30 ? "30" : "00";
    return { hour: String(hour12), minute, ampm: ampm as "AM" | "PM" };
  };

  const dropdownsToTime24 = (hour: string, minute: string, ampm: "AM" | "PM"): string => {
    let h = parseInt(hour, 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  const durationToMinutes = (dur: string): number => {
    return Math.round(parseFloat(dur) * 60);
  };

  const minutesToDuration = (min: number | undefined): string => {
    if (!min) return "1";
    const hours = min / 60;
    // Round to nearest 0.5
    return String(Math.round(hours * 2) / 2 || 1);
  };

  // Modal handlers
  const openCreateModal = (prefilledTime?: string, prefilledDay?: string) => {
    setEditingBlock(null);
    setFormDayDate(prefilledDay || selectedDay || sortedDays[0] || getTodayDate());
    setFormTitle("");
    setFormBlockType("custom");
    setFormCategory("logistics");
    
    // If prefilled time provided, parse it
    if (prefilledTime) {
      const timeVals = parseTimeToDropdowns(prefilledTime);
      setFormHour(timeVals.hour);
      setFormMinute(timeVals.minute);
      setFormAmPm(timeVals.ampm);
    } else {
      setFormHour("8");
      setFormMinute("00");
      setFormAmPm("AM");
    }
    
    setFormDuration("1");
    setFormLocation("");
    setFormNotes("");
    setFormStatus("open");
    setIsModalOpen(true);
  };

  const openEditModal = (block: ItineraryBuilderBlock) => {
    setEditingBlock(block);
    setFormDayDate(block.dayDate);
    setFormTitle(block.title);
    setFormBlockType(block.blockType);
    setFormCategory(block.category);
    const timeVals = parseTimeToDropdowns(block.startTime);
    setFormHour(timeVals.hour);
    setFormMinute(timeVals.minute);
    setFormAmPm(timeVals.ampm);
    setFormDuration(minutesToDuration(block.duration));
    setFormLocation(block.location || "");
    setFormNotes(block.notes || "");
    setFormStatus(block.status as "open" | "soft" | "locked");
    setIsModalOpen(true);
  };

  const handleBlockTypeChange = (value: string) => {
    setFormBlockType(value);
    const option = BLOCK_TYPE_OPTIONS.find((o) => o.value === value);
    if (option) setFormCategory(option.category);
  };

  const getSortOrderForDay = (dayDate: string): number => {
    const dayBlocks = blocksByDay[dayDate] || [];
    if (dayBlocks.length === 0) return 0;
    return Math.max(...dayBlocks.map((b) => b.sortOrder)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formTitle.trim()) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      if (editingBlock) {
        const previousData: Partial<ItineraryBuilderBlock> = {
          dayDate: editingBlock.dayDate,
          blockType: editingBlock.blockType,
          category: editingBlock.category,
          title: editingBlock.title,
          startTime: editingBlock.startTime,
          duration: editingBlock.duration,
          location: editingBlock.location,
          notes: editingBlock.notes,
          status: editingBlock.status,
        };

        await http.patch(`/api/itinerary/builder/${editingBlock.id}`, {
          dayDate: formDayDate,
          blockType: formBlockType,
          category: formCategory,
          title: formTitle.trim(),
          startTime: dropdownsToTime24(formHour, formMinute, formAmPm),
          duration: durationToMinutes(formDuration),
          location: formLocation || undefined,
          notes: formNotes || undefined,
          status: formStatus,
        });

        setLastUndo({ type: "edit", blockId: editingBlock.id, previousData });
        await loadBlocks();
      } else {
        const created = await http.post<ItineraryBuilderBlock>(`/api/trips/${id}/itinerary/builder`, {
          dayDate: formDayDate,
          sortOrder: getSortOrderForDay(formDayDate),
          blockType: formBlockType,
          category: formCategory,
          title: formTitle.trim(),
          startTime: dropdownsToTime24(formHour, formMinute, formAmPm),
          duration: durationToMinutes(formDuration),
          location: formLocation || undefined,
          notes: formNotes || undefined,
          status: "open" as const,
        });

        setLastUndo({ type: "create", blockId: created.id });
        await loadBlocks();
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setActionError(editingBlock ? `Failed to update: ${message}` : `Failed to create: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, blockId: string, dayDate: string) => {
    if (isModalOpen || isPublished) { e.preventDefault(); return; }
    setDraggedBlockId(blockId);
    setDraggedFromDay(dayDate);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, blockId?: string) => {
    if (isModalOpen || isPublished) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (blockId && dragOverBlockId !== blockId) {
      setDragOverBlockId(blockId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetBlockId: string | null, targetDayDate: string) => {
    e.preventDefault();
    setDragOverDay(null);
    if (isModalOpen || isPublished || !draggedBlockId || !draggedFromDay) {
      setDraggedBlockId(null);
      setDraggedFromDay(null);
      return;
    }

    if (draggedBlockId === targetBlockId) {
      setDraggedBlockId(null);
      setDraggedFromDay(null);
      return;
    }

    // Cross-day move
    if (draggedFromDay !== targetDayDate) {
      const targetDayBlocks = blocksByDay[targetDayDate] || [];
      let targetSortOrder: number;
      if (targetBlockId) {
        const targetIndex = targetDayBlocks.findIndex((b) => b.id === targetBlockId);
        targetSortOrder = targetIndex >= 0 ? targetIndex : targetDayBlocks.length;
      } else {
        targetSortOrder = targetDayBlocks.length;
      }

      const draggedBlock = blocks.find((b) => b.id === draggedBlockId);
      if (!draggedBlock) {
        setDraggedBlockId(null);
        setDraggedFromDay(null);
        return;
      }

      const previousBlocks = [...blocks];
      const updatedBlocks = blocks
        .map((block) => {
          if (block.id === draggedBlockId) {
            return { ...block, dayDate: targetDayDate, sortOrder: targetSortOrder };
          }
          if (block.dayDate === draggedFromDay && block.sortOrder > draggedBlock.sortOrder) {
            return { ...block, sortOrder: block.sortOrder - 1 };
          }
          if (block.dayDate === targetDayDate && block.sortOrder >= targetSortOrder) {
            return { ...block, sortOrder: block.sortOrder + 1 };
          }
          return block;
        })
        .sort((a, b) => {
          if (a.dayDate !== b.dayDate) return a.dayDate.localeCompare(b.dayDate);
          return a.sortOrder - b.sortOrder;
        });
      setBlocks(updatedBlocks);
      setDraggedBlockId(null);
      setDraggedFromDay(null);

      const previousDayDate = draggedBlock.dayDate;
      const previousSortOrder = draggedBlock.sortOrder;

      try {
        await http.post(`/api/itinerary/builder/${draggedBlockId}/move`, {
          newDayDate: targetDayDate,
          newSortOrder: targetSortOrder,
        });
        setLastUndo({ type: "move", blockId: draggedBlockId, previousDayDate, previousSortOrder });
        await loadBlocks();
      } catch (err) {
        setActionError(`Failed to move block: ${err instanceof Error ? err.message : "Unknown error"}`);
        setBlocks(previousBlocks);
      }
      return;
    }

    // Same-day reorder
    if (!targetBlockId) {
      setDraggedBlockId(null);
      setDraggedFromDay(null);
      return;
    }

    const dayBlocks = blocksByDay[targetDayDate] || [];
    const draggedIndex = dayBlocks.findIndex((b) => b.id === draggedBlockId);
    const targetIndex = dayBlocks.findIndex((b) => b.id === targetBlockId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedBlockId(null);
      setDraggedFromDay(null);
      return;
    }

    const reordered = [...dayBlocks];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    const blockIds = reordered.map((b) => b.id);
    const previousBlockIds = dayBlocks.map((b) => b.id);

    const updatedBlocks = blocks.map((block) => {
      if (block.dayDate !== targetDayDate) return block;
      const newIndex = blockIds.indexOf(block.id);
      return { ...block, sortOrder: newIndex };
    });
    setBlocks(updatedBlocks.sort((a, b) => {
      if (a.dayDate !== b.dayDate) return a.dayDate.localeCompare(b.dayDate);
      return a.sortOrder - b.sortOrder;
    }));
    setDraggedBlockId(null);
    setDraggedFromDay(null);

    try {
      await http.post(`/api/trips/${id}/itinerary/builder/reorder`, { dayDate: targetDayDate, blockIds });
      setLastUndo({ type: "reorder", dayDate: targetDayDate, previousBlockIds });
      await loadBlocks();
    } catch (err) {
      setActionError(`Failed to reorder: ${err instanceof Error ? err.message : "Unknown error"}`);
      await loadBlocks();
    }
  };

  const handleDragEnd = () => {
    // Trigger the "just dropped" animation
    if (draggedBlockId) {
      setJustDroppedId(draggedBlockId);
      // Clear after animation completes (300ms)
      setTimeout(() => setJustDroppedId(null), 300);
    }
    setDraggedBlockId(null);
    setDraggedFromDay(null);
    setDragOverDay(null);
    setDragOverBlockId(null);
  };

  // ============================================================================
  // TIMELINE DRAG HANDLERS - Move and Resize Blocks
  // ============================================================================
  
  // Convert minutes from midnight to 24h time string
  const minutesToTimeString = (totalMinutes: number): string => {
    const clampedMinutes = Math.max(DAY_START_HOUR * 60, Math.min(DAY_END_HOUR * 60, totalMinutes));
    // Round to nearest 15 minutes
    const rounded = Math.round(clampedMinutes / 15) * 15;
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const handleTimelineMouseDown = (
    e: React.MouseEvent,
    block: ItineraryBuilderBlock,
    type: 'move' | 'resize-top' | 'resize-bottom'
  ) => {
    if (isPublished || isModalOpen) return;
    e.preventDefault();
    e.stopPropagation();

    const top = getBlockTop(block.startTime);
    const height = getBlockHeight(block.duration);

    setTimelineDrag({
      blockId: block.id,
      type,
      startY: e.clientY,
      originalTop: top,
      originalHeight: height,
      originalStartTime: block.startTime || "08:00",
      originalDuration: block.duration || 60,
    });
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!timelineDrag) return;

    const deltaY = e.clientY - timelineDrag.startY;
    const block = blocks.find(b => b.id === timelineDrag.blockId);
    if (!block) return;

    // Calculate new values based on drag type
    if (timelineDrag.type === 'move') {
      // Move the entire block
      const newTop = Math.max(0, Math.min(TIMELINE_HEIGHT - timelineDrag.originalHeight, timelineDrag.originalTop + deltaY));
      const newStartMinutes = (newTop / HOUR_HEIGHT) * 60 + DAY_START_HOUR * 60;
      const newStartTime = minutesToTimeString(newStartMinutes);

      // Optimistic update
      setBlocks(prev => prev.map(b => 
        b.id === timelineDrag.blockId 
          ? { ...b, startTime: newStartTime }
          : b
      ));
    } else if (timelineDrag.type === 'resize-top') {
      // Resize from top - changes start time and duration
      const newTop = Math.max(0, timelineDrag.originalTop + deltaY);
      const maxTop = timelineDrag.originalTop + timelineDrag.originalHeight - MIN_BLOCK_HEIGHT;
      const clampedTop = Math.min(newTop, maxTop);
      
      const topDelta = clampedTop - timelineDrag.originalTop;
      const newHeight = timelineDrag.originalHeight - topDelta;
      
      const newStartMinutes = (clampedTop / HOUR_HEIGHT) * 60 + DAY_START_HOUR * 60;
      const newDuration = Math.max(30, (newHeight / HOUR_HEIGHT) * 60);

      setBlocks(prev => prev.map(b => 
        b.id === timelineDrag.blockId 
          ? { ...b, startTime: minutesToTimeString(newStartMinutes), duration: Math.round(newDuration / 15) * 15 }
          : b
      ));
    } else if (timelineDrag.type === 'resize-bottom') {
      // Resize from bottom - only changes duration
      const newHeight = Math.max(MIN_BLOCK_HEIGHT, timelineDrag.originalHeight + deltaY);
      const maxHeight = TIMELINE_HEIGHT - timelineDrag.originalTop;
      const clampedHeight = Math.min(newHeight, maxHeight);
      
      const newDuration = Math.max(30, (clampedHeight / HOUR_HEIGHT) * 60);

      setBlocks(prev => prev.map(b => 
        b.id === timelineDrag.blockId 
          ? { ...b, duration: Math.round(newDuration / 15) * 15 }
          : b
      ));
    }
  };

  const handleTimelineMouseUp = async () => {
    if (!timelineDrag) return;

    const block = blocks.find(b => b.id === timelineDrag.blockId);
    if (!block) {
      setTimelineDrag(null);
      return;
    }

    // Check if anything actually changed
    const startTimeChanged = block.startTime !== timelineDrag.originalStartTime;
    const durationChanged = block.duration !== timelineDrag.originalDuration;

    if (startTimeChanged || durationChanged) {
      // Save to server
      try {
        await http.patch(`/api/itinerary/builder/${block.id}`, {
          startTime: block.startTime,
          duration: block.duration,
        });
        
        // Set undo entry
        setLastUndo({
          type: "edit",
          blockId: block.id,
          previousData: {
            startTime: timelineDrag.originalStartTime,
            duration: timelineDrag.originalDuration,
          },
        });

        // Trigger visual feedback
        setJustDroppedId(block.id);
        setTimeout(() => setJustDroppedId(null), 300);
      } catch (err) {
        // Revert on error
        setBlocks(prev => prev.map(b => 
          b.id === timelineDrag.blockId 
            ? { ...b, startTime: timelineDrag.originalStartTime, duration: timelineDrag.originalDuration }
            : b
        ));
        setActionError(`Failed to update: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    setTimelineDrag(null);
  };

  const handleDayDragOver = (e: React.DragEvent, dayDate: string) => {
    if (isModalOpen || isPublished || !draggedBlockId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverDay !== dayDate) setDragOverDay(dayDate);
  };

  const handleDayDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) setDragOverDay(null);
  };

  const handleDayDrop = (e: React.DragEvent, dayDate: string) => {
    handleDrop(e, null, dayDate);
  };

  const handleDelete = async (block: ItineraryBuilderBlock) => {
    const confirmed = window.confirm(`Delete "${block.title}"?\n\nYou can undo this action.`);
    if (!confirmed) return;

    setDeletingBlockId(block.id);
    setActionError(null);

    const previousBlocks = [...blocks];
    const updatedBlocks = blocks
      .filter((b) => b.id !== block.id)
      .map((b) => {
        if (b.dayDate === block.dayDate && b.sortOrder > block.sortOrder) {
          return { ...b, sortOrder: b.sortOrder - 1 };
        }
        return b;
      });
    setBlocks(updatedBlocks);

    try {
      await http.delete(`/api/itinerary/builder/${block.id}`);
      setLastUndo({ type: "delete", deletedBlock: block });
    } catch (err) {
      setActionError(`Failed to delete: ${err instanceof Error ? err.message : "Unknown error"}`);
      setBlocks(previousBlocks);
    } finally {
      setDeletingBlockId(null);
    }
  };

  // Up/Down reorder (fallback for drag-drop)
  const handleMoveUp = async (block: ItineraryBuilderBlock) => {
    const dayBlocks = blocksByDay[block.dayDate] || [];
    const currentIndex = dayBlocks.findIndex((b) => b.id === block.id);
    if (currentIndex <= 0) return; // Already at top

    const previousBlockIds = dayBlocks.map((b) => b.id);
    const reordered = [...dayBlocks];
    [reordered[currentIndex - 1], reordered[currentIndex]] = [reordered[currentIndex], reordered[currentIndex - 1]];
    const blockIds = reordered.map((b) => b.id);

    // Optimistic update
    const updatedBlocks = blocks.map((b) => {
      if (b.dayDate !== block.dayDate) return b;
      const newIndex = blockIds.indexOf(b.id);
      return { ...b, sortOrder: newIndex };
    });
    setBlocks(updatedBlocks.sort((a, b) => {
      if (a.dayDate !== b.dayDate) return a.dayDate.localeCompare(b.dayDate);
      return a.sortOrder - b.sortOrder;
    }));

    try {
      await http.post(`/api/trips/${id}/itinerary/builder/reorder`, { dayDate: block.dayDate, blockIds });
      setLastUndo({ type: "reorder", dayDate: block.dayDate, previousBlockIds });
    } catch (err) {
      setActionError(`Failed to reorder: ${err instanceof Error ? err.message : "Unknown error"}`);
      await loadBlocks();
    }
  };

  const handleMoveDown = async (block: ItineraryBuilderBlock) => {
    const dayBlocks = blocksByDay[block.dayDate] || [];
    const currentIndex = dayBlocks.findIndex((b) => b.id === block.id);
    if (currentIndex >= dayBlocks.length - 1) return; // Already at bottom

    const previousBlockIds = dayBlocks.map((b) => b.id);
    const reordered = [...dayBlocks];
    [reordered[currentIndex], reordered[currentIndex + 1]] = [reordered[currentIndex + 1], reordered[currentIndex]];
    const blockIds = reordered.map((b) => b.id);

    // Optimistic update
    const updatedBlocks = blocks.map((b) => {
      if (b.dayDate !== block.dayDate) return b;
      const newIndex = blockIds.indexOf(b.id);
      return { ...b, sortOrder: newIndex };
    });
    setBlocks(updatedBlocks.sort((a, b) => {
      if (a.dayDate !== b.dayDate) return a.dayDate.localeCompare(b.dayDate);
      return a.sortOrder - b.sortOrder;
    }));

    try {
      await http.post(`/api/trips/${id}/itinerary/builder/reorder`, { dayDate: block.dayDate, blockIds });
      setLastUndo({ type: "reorder", dayDate: block.dayDate, previousBlockIds });
    } catch (err) {
      setActionError(`Failed to reorder: ${err instanceof Error ? err.message : "Unknown error"}`);
      await loadBlocks();
    }
  };

  const handleUndo = async () => {
    if (!lastUndo || isUndoing || isModalOpen) return;
    setIsUndoing(true);
    setActionError(null);

    try {
      switch (lastUndo.type) {
        case "reorder":
          await http.post(`/api/trips/${id}/itinerary/builder/reorder`, {
            dayDate: lastUndo.dayDate,
            blockIds: lastUndo.previousBlockIds,
          });
          break;
        case "move":
          await http.post(`/api/itinerary/builder/${lastUndo.blockId}/move`, {
            newDayDate: lastUndo.previousDayDate,
            newSortOrder: lastUndo.previousSortOrder,
          });
          break;
        case "create":
          await http.delete(`/api/itinerary/builder/${lastUndo.blockId}`);
          break;
        case "edit":
          await http.patch(`/api/itinerary/builder/${lastUndo.blockId}`, lastUndo.previousData);
          break;
        case "delete":
          await http.post(`/api/trips/${id}/itinerary/builder`, {
            dayDate: lastUndo.deletedBlock.dayDate,
            sortOrder: lastUndo.deletedBlock.sortOrder,
            blockType: lastUndo.deletedBlock.blockType,
            category: lastUndo.deletedBlock.category,
            title: lastUndo.deletedBlock.title,
            startTime: lastUndo.deletedBlock.startTime || undefined,
            duration: lastUndo.deletedBlock.duration || undefined,
            location: lastUndo.deletedBlock.location || undefined,
            notes: lastUndo.deletedBlock.notes || undefined,
            status: lastUndo.deletedBlock.status,
          });
          break;
      }

      await loadBlocks();
      setLastUndo(null);
      setUndoMessage("Changes undone");
      setTimeout(() => setUndoMessage(null), 2000);
    } catch (err) {
      setActionError(`Failed to undo: ${err instanceof Error ? err.message : "Unknown error"}`);
      await loadBlocks();
    } finally {
      setIsUndoing(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AppShell maxWidth="5xl">
      {/* Page Container - Warm paper background */}
      <div className="min-h-screen bg-paper">
        {/* Back Link */}
        <Link
          to={`/trip/${id}`}
          className="inline-flex items-center gap-2 text-meta text-ink-secondary hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to trip
        </Link>

        {/* ================================================================
            HEADER - Desktop: Dense Operator Console / Mobile: Simple Guest View
            ================================================================ */}
        <header className="mb-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="font-serif text-display text-ink">Itinerary</h1>
              {/* Status Pill */}
              <span className={`px-3 py-1 text-micro font-medium rounded-pill ${
                isPublished 
                  ? "bg-success-bg text-success border border-success/20" 
                  : "bg-warning-bg text-warning border border-warning/20"
              }`}>
                {isPublished ? "Published" : "Draft"}
              </span>
              <span className="text-meta text-ink-muted">
                {blocks.length} block{blocks.length !== 1 ? "s" : ""} · {sortedDays.length} day{sortedDays.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Desktop Actions - Operator Console */}
            <div className="flex items-center gap-3">
              {/* Undo Button */}
              {!isPublished && lastUndo && (
                <button
                  onClick={handleUndo}
                  disabled={isUndoing}
                  className="flex items-center gap-2 px-3 py-2 text-meta text-ink-secondary hover:text-ink border border-border-default rounded-input hover:bg-white/50 transition-all disabled:opacity-50"
                >
                  <Undo2 className="w-4 h-4" />
                  <span className="hidden lg:inline">{getUndoDescription(lastUndo, blocks)}</span>
                </button>
              )}

              {/* Add Block Button */}
              {!isPublished && (
                <Button onClick={openCreateModal} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Block
                </Button>
              )}

              {/* PUBLISH BUTTON - Consequential like a commit action */}
              <Button
                onClick={handlePublishToggle}
                disabled={isTogglingPublish}
                className={`gap-2 font-medium transition-all ${
                  isPublished
                    ? "bg-white hover:bg-paper border-2 border-warning text-warning"
                    : "bg-ink hover:bg-ink/90 text-ink-inverse shadow-lg hover:shadow-xl"
                }`}
              >
                {isPublished ? (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Itinerary
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Header - Guest Command App Style */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-serif text-departure-lg text-ink">Itinerary</h1>
              <span className={`px-3 py-1 text-micro font-medium rounded-pill ${
                isPublished 
                  ? "bg-success-bg text-success" 
                  : "bg-warning-bg text-warning"
              }`}>
                {isPublished ? "Final" : "Draft"}
              </span>
            </div>
            
            {/* Mobile: Simple action buttons */}
            {!isPublished && (
              <div className="flex gap-2">
                <Button onClick={openCreateModal} size="sm" className="flex-1 gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
                <Button 
                  onClick={handlePublishToggle} 
                  variant="outline" 
                  size="sm"
                  className="flex-1 gap-2 border-2 border-ink"
                >
                  <Send className="w-4 h-4" />
                  Publish
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Published Banner */}
        {isPublished && (
          <div className="mb-6 bg-success-bg border border-success/20 rounded-card p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <div>
              <span className="font-medium text-success">Itinerary is published</span>
              <span className="text-meta text-success/80 ml-2">Tap Unpublish to make changes.</span>
            </div>
          </div>
        )}

        {/* Action Error Banner */}
        {actionError && (
          <div className="mb-6 bg-error-bg border border-error/20 rounded-card p-4 flex items-center justify-between">
            <span className="text-error">{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-error/70 hover:text-error text-meta font-medium">
              Dismiss
            </button>
          </div>
        )}

        {/* Undo Success Banner */}
        {undoMessage && (
          <div className="mb-6 bg-success-bg border border-success/20 rounded-card p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-success">{undoMessage}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-action-primary border-t-transparent mb-4" />
            <p className="text-ink-secondary">Loading itinerary...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-error-bg border border-error/20 rounded-card p-6 text-error text-center">
            {error}
          </div>
        )}

        {/* Empty State with Ghost Events */}
        {!loading && !error && blocks.length === 0 && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-white/80 backdrop-blur-sm rounded-card border border-border-soft p-6 text-center">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-serif text-section text-ink mb-2">Preview Mode</h3>
              <p className="text-ink-secondary mb-4">Here's what your itinerary could look like. Click "Add Block" to start building!</p>
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Block
              </Button>
            </div>

            {/* Ghost Events - Time-Accurate Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-border-soft bg-paper/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-ink-muted" />
                    <h2 className="text-day text-ink">Day 1: Sample Schedule</h2>
                  </div>
                  <span className="text-micro text-ink-muted">Click timeline to add</span>
                </div>
              </div>

              {/* Time-Accurate Preview (scaled down) */}
              <div className="relative overflow-auto" style={{ maxHeight: '400px' }}>
                <div className="relative" style={{ height: '560px' }}> {/* 7 hours: 2PM to 9PM */}
                  {/* Hour lines for preview (2PM to 9PM) */}
                  {[14, 15, 16, 17, 18, 19, 20, 21].map((hour) => {
                    const top = (hour - 14) * 80;
                    const hour12 = hour > 12 ? hour - 12 : hour;
                    const label = `${hour12} ${hour >= 12 ? 'PM' : 'AM'}`;
                    return (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 flex items-start opacity-60"
                        style={{ top: `${top}px` }}
                      >
                        <div className="w-16 flex-shrink-0 pr-2 text-right">
                          <span className="text-xs text-ink-muted font-medium">{label}</span>
                        </div>
                        <div className="flex-1 border-t border-border-soft" />
                      </div>
                    );
                  })}

                  {/* Ghost blocks positioned by time */}
                  {GHOST_EVENTS.map((block) => {
                    const CategoryIcon = CATEGORY_ICONS[block.category] || Users;
                    const category = CATEGORY_COLORS[block.category] || CATEGORY_COLORS.logistics;
                    const startMinutes = timeToMinutes(block.startTime);
                    const top = ((startMinutes - 14 * 60) / 60) * 80; // Offset from 2PM
                    const height = ((block.duration || 60) / 60) * 80;

                    return (
                      <div
                        key={block.id}
                        className="absolute opacity-60"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(40, height)}px`,
                          left: '72px',
                          right: '8px',
                        }}
                      >
                        <div className={`h-full rounded-lg p-3 ${category.bg} border ${category.border}`}>
                          <div className="flex items-start gap-2">
                            <div className={`p-1 rounded ${category.text}`}>
                              <CategoryIcon className="w-3 h-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${category.text} truncate`}>
                                {block.title}
                              </div>
                              <div className="text-xs text-ink-muted">
                                {formatTime(block.startTime)} · {Math.round((block.duration || 60) / 60)}h
                              </div>
                              {block.location && (
                                <div className="flex items-center gap-1 text-xs text-ink-muted mt-1 truncate">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  {block.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            FLIGHT OPERATIONS LAYOUT - Sidebar + Main Stage
            ================================================================ */}
        {!loading && !error && sortedDays.length > 0 && (
          <div className="flex gap-6">
            {/* ============================================
                LEFT SIDEBAR - Day Selector
                ============================================ */}
            <aside className="hidden md:block w-48 flex-shrink-0">
              <div className="sticky top-6 space-y-2">
                <h3 className="text-micro font-semibold text-ink-muted uppercase tracking-wider px-3 mb-3">
                  Days
                </h3>
                {sortedDays.map((dayDate, index) => {
                  const dayBlocks = blocksByDay[dayDate] || [];
                  const isSelected = selectedDay === dayDate;
                  const temporalContext = getTemporalContext(dayDate);
                  const isToday = temporalContext === "today";
                  const isCheckoutDay = index === sortedDays.length - 1 && tripNights > 0;
                  const dayLabel = isCheckoutDay ? "Checkout" : `Day ${index + 1}`;

                  return (
                    <button
                      key={dayDate}
                      onClick={() => setSelectedDay(dayDate)}
                      className={`w-full text-left px-3 py-2.5 rounded-input transition-all ${
                        isSelected
                          ? "bg-ink text-ink-inverse shadow-sm"
                          : "bg-white/60 hover:bg-white text-ink border border-border-soft hover:border-border-default"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-meta font-medium ${isSelected ? "text-ink-inverse" : "text-ink"}`}>
                            {dayLabel}
                          </div>
                          <div className={`text-micro ${isSelected ? "text-ink-inverse/70" : "text-ink-muted"}`}>
                            {formatDate(dayDate)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-micro ${isSelected ? "text-ink-inverse/70" : "text-ink-muted"}`}>
                            {dayBlocks.length}
                          </span>
                          {isToday && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? "bg-ink-inverse/20 text-ink-inverse" : "bg-action-primary text-white"
                            }`}>
                              TODAY
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Trip duration note */}
                {tripNights > 0 && (
                  <div className="px-3 pt-3 mt-3 border-t border-border-soft">
                    <p className="text-micro text-ink-muted text-center">
                      {tripNights} night{tripNights !== 1 ? 's' : ''} · {sortedDays.length} days
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* ============================================
                MAIN STAGE - Selected Day Timeline
                ============================================ */}
            <main className="flex-1 min-w-0">
              {/* Mobile: Horizontal Day Tabs */}
              <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4">
                {sortedDays.map((dayDate, index) => {
                  const isSelected = selectedDay === dayDate;
                  const isCheckoutDay = index === sortedDays.length - 1 && tripNights > 0;
                  return (
                    <button
                      key={dayDate}
                      onClick={() => setSelectedDay(dayDate)}
                      className={`flex-shrink-0 px-4 py-2 rounded-pill text-meta font-medium transition-all ${
                        isSelected
                          ? "bg-ink text-ink-inverse"
                          : "bg-white/80 text-ink border border-border-soft"
                      }`}
                    >
                      {isCheckoutDay ? "Checkout" : `Day ${index + 1}`}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Content - TRUE LINEAR TIMELINE */}
              {selectedDay && (() => {
                const dayBlocks = blocksByDay[selectedDay] || [];
                const isDragOver = dragOverDay === selectedDay && draggedFromDay !== selectedDay;
                const temporalContext = getTemporalContext(selectedDay);
                const isToday = temporalContext === "today";
                const dayIndex = sortedDays.indexOf(selectedDay);
                
                // Calculate layouts with overlap handling
                const blocksWithLayout = calculateBlockLayouts(dayBlocks);
                const hourLabels = getHourLabels();

                // Handle click on empty timeline slot
                const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
                  if (isPublished) return;
                  const target = e.target as HTMLElement;
                  // Only trigger if clicking on the grid background, not on a block
                  if (target.closest('[data-block-id]')) return;
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetY = e.clientY - rect.top;
                  const clickedTime = getTimeFromClickPosition(offsetY);
                  openCreateModal(clickedTime, selectedDay);
                };

                return (
                  <div
                    id={`day-${selectedDay}`}
                    className={`bg-white/80 backdrop-blur-sm rounded-card border shadow-card overflow-hidden transition-all duration-default ${
                      isDragOver ? "border-action-primary ring-2 ring-action-primary/20" : "border-border-soft"
                    }`}
                    onDragOver={(e) => handleDayDragOver(e, selectedDay)}
                    onDragLeave={handleDayDragLeave}
                    onDrop={(e) => handleDayDrop(e, selectedDay)}
                  >
                    {/* Day Header */}
                    <div className={`px-6 py-4 border-b transition-colors ${
                      isDragOver 
                        ? "bg-action-primary/5 border-action-primary/20" 
                        : isToday 
                          ? "bg-action-primary/5 border-action-primary/10" 
                          : "bg-paper/50 border-border-soft"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-ink-muted" />
                          <div>
                            <h2 className="text-day text-ink">
                              {dayIndex === sortedDays.length - 1 && tripNights > 0 
                                ? `Checkout: ${formatDayLabel(selectedDay)}`
                                : `Day ${dayIndex + 1}: ${formatDayLabel(selectedDay)}`
                              }
                            </h2>
                            {isToday && (
                              <span className="text-micro font-semibold text-action-primary">
                                TODAY
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-meta text-ink-muted">
                            {dayBlocks.length} event{dayBlocks.length !== 1 ? "s" : ""}
                          </span>
                          {!isPublished && (
                            <span className="text-micro text-ink-muted hidden md:inline">
                              Click timeline to add event
                            </span>
                          )}
                        </div>
                      </div>
                      {isDragOver && (
                        <p className="text-meta text-action-primary mt-1">Drop here to add</p>
                      )}
                    </div>

                    {/* ============================================================
                        MOBILE STREAM VIEW (< 640px)
                        Simple vertical card stack for consuming the plan
                        ============================================================ */}
                    {isMobile && (
                      <div className="space-y-3 pb-20">
                        {dayBlocks.length === 0 ? (
                          <div className="text-center py-8 text-ink-muted">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-body">No events yet</p>
                            {!isPublished && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => openCreateModal("08:00", selectedDay || undefined)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Event
                              </Button>
                            )}
                          </div>
                        ) : (
                          dayBlocks
                            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
                            .map((block, idx) => {
                              const category = CATEGORY_COLORS[block.category] || CATEGORY_COLORS.logistics;
                              const CategoryIcon = CATEGORY_ICONS[block.category] || Users;
                              const isJustDropped = justDroppedId === block.id;
                              
                              // Calculate end time
                              const startMins = timeToMinutes(block.startTime);
                              const endMins = startMins + (block.duration || 60);
                              const endHour = Math.floor(endMins / 60);
                              const endMinute = endMins % 60;
                              const endTimeStr = `${endHour > 12 ? endHour - 12 : endHour}:${endMinute.toString().padStart(2, '0')} ${endHour >= 12 ? 'PM' : 'AM'}`;

                              return (
                                <div
                                  key={block.id}
                                  className={`rounded-xl p-4 ${category.bg} border ${category.border} ${
                                    isJustDropped ? 'ring-2 ring-action-primary/30 shadow-lg' : 'shadow-sm'
                                  }`}
                                  onClick={() => !isPublished && openEditModal(block)}
                                  style={{
                                    transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
                                    transform: isJustDropped ? 'scale(1.01)' : 'scale(1)',
                                  }}
                                >
                                  {/* Large Time Display - Departure Board Style */}
                                  <div className="flex items-baseline gap-2 mb-2">
                                    <span className="font-mono text-2xl font-bold text-ink tracking-tight">
                                      {formatTime(block.startTime)}
                                    </span>
                                    <span className="text-sm text-ink-muted">
                                      → {endTimeStr}
                                    </span>
                                    {block.status !== "open" && (
                                      <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                                        block.status === "locked" 
                                          ? "bg-error text-white" 
                                          : "bg-warning text-white"
                                      }`}>
                                        {block.status === "locked" ? "🔒 Locked" : "~ Soft"}
                                      </span>
                                    )}
                                  </div>

                                  {/* Title & Category */}
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${category.bg} ${category.text}`}>
                                      <CategoryIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`text-lg font-semibold ${category.text} truncate`}>
                                        {block.title}
                                      </h4>
                                      {block.location && (
                                        <div className="flex items-center gap-1 text-sm text-ink-muted mt-0.5">
                                          <MapPin className="w-3.5 h-3.5" />
                                          <span className="truncate">{block.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Notes */}
                                  {block.notes && (
                                    <p className="text-sm text-ink-muted mt-2 line-clamp-2 italic">
                                      {block.notes}
                                    </p>
                                  )}

                                  {/* Duration badge */}
                                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-black/5">
                                    <Clock className="w-3.5 h-3.5 text-ink-muted" />
                                    <span className="text-xs text-ink-muted">
                                      {block.duration && block.duration >= 60 
                                        ? `${Math.floor(block.duration / 60)}h ${block.duration % 60 > 0 ? `${block.duration % 60}m` : ''}`
                                        : `${block.duration || 60}m`
                                      }
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                        )}

                        {/* Floating Add Button (Mobile) */}
                        {!isPublished && dayBlocks.length > 0 && (
                          <div className="fixed bottom-6 right-6 z-40">
                            <Button
                              onClick={() => openCreateModal("08:00", selectedDay || undefined)}
                              className="w-14 h-14 rounded-full shadow-xl bg-action-primary hover:bg-action-primary/90"
                            >
                              <Plus className="w-6 h-6" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ============================================================
                        DESKTOP TIME-ACCURATE TIMELINE (>= 640px)
                        Full 'Flight Operations' editing interface
                        ============================================================ */}
                    {!isMobile && (
                    <div 
                      className="relative overflow-auto"
                      style={{ maxHeight: '70vh' }}
                    >
                      <div 
                        className="relative select-none"
                        style={{ 
                          height: `${TIMELINE_HEIGHT}px`,
                          minWidth: '100%',
                          cursor: timelineDrag ? (timelineDrag.type === 'move' ? 'grabbing' : 'ns-resize') : 'default',
                        }}
                        onClick={handleTimelineClick}
                        onMouseMove={handleTimelineMouseMove}
                        onMouseUp={handleTimelineMouseUp}
                        onMouseLeave={handleTimelineMouseUp}
                      >
                        {/* Hour Grid Lines */}
                        {hourLabels.map(({ hour, label }) => {
                          const top = (hour - DAY_START_HOUR) * HOUR_HEIGHT;
                          return (
                            <div
                              key={hour}
                              className="absolute left-0 right-0 flex items-start"
                              style={{ top: `${top}px` }}
                            >
                              {/* Hour Label */}
                              <div className="w-16 md:w-20 flex-shrink-0 pr-2 text-right">
                                <span className="text-xs text-ink-muted font-medium">
                                  {label}
                                </span>
                              </div>
                              {/* Grid Line */}
                              <div className="flex-1 border-t border-border-soft" />
                            </div>
                          );
                        })}

                        {/* Half-hour guide lines (subtle) */}
                        {hourLabels.slice(0, -1).map(({ hour }) => {
                          const top = (hour - DAY_START_HOUR) * HOUR_HEIGHT + (HOUR_HEIGHT / 2);
                          return (
                            <div
                              key={`${hour}-half`}
                              className="absolute left-16 md:left-20 right-0"
                              style={{ top: `${top}px` }}
                            >
                              <div className="border-t border-border-soft/50 border-dashed" />
                            </div>
                          );
                        })}

                        {/* Event Blocks - Absolutely Positioned */}
                        {blocksWithLayout.map((block) => {
                          const category = CATEGORY_COLORS[block.category] || CATEGORY_COLORS.logistics;
                          const categoryLabel = CATEGORY_LABELS[block.category] || block.category;
                          const CategoryIcon = CATEGORY_ICONS[block.category] || Users;
                          const isAnchor = (ANCHOR_BLOCK_TYPES as readonly string[]).includes(block.blockType);
                          const isLocked = block.status === "locked";
                          const isDragging = draggedBlockId === block.id;
                          const isJustDropped = justDroppedId === block.id;
                          const isTimelineDragging = timelineDrag?.blockId === block.id;

                          const top = getBlockTop(block.startTime);
                          const height = getBlockHeight(block.duration);
                          
                          // Calculate width and left offset for overlapping blocks
                          const columnWidth = 100 / block.totalColumns;
                          const leftPercent = block.column * columnWidth;
                          // Leave 16px for hour labels + small gap
                          const leftOffset = 72; // md:80

                          return (
                            <div
                              key={block.id}
                              data-block-id={block.id}
                              className="absolute group"
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                left: `${leftOffset}px`,
                                right: '8px',
                                width: block.totalColumns > 1 
                                  ? `calc((100% - ${leftOffset + 8}px) * ${columnWidth / 100})` 
                                  : `calc(100% - ${leftOffset + 8}px)`,
                                marginLeft: block.totalColumns > 1 
                                  ? `calc((100% - ${leftOffset + 8}px) * ${leftPercent / 100})` 
                                  : 0,
                                zIndex: isDragging || isTimelineDragging ? 50 : 10 + block.column,
                                transition: isTimelineDragging ? 'none' : 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1), opacity 200ms ease-out',
                                transform: isDragging || isTimelineDragging ? 'scale(1.02)' : isJustDropped ? 'scale(1.01)' : 'scale(1)',
                                opacity: isDragging ? 0.8 : 1,
                              }}
                            >
                              {/* TOP RESIZE HANDLE */}
                              {!isPublished && (
                                <div
                                  className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-20 group/resize"
                                  onMouseDown={(e) => handleTimelineMouseDown(e, block, 'resize-top')}
                                >
                                  <div className="absolute inset-x-4 top-0 h-1 rounded-full bg-transparent group-hover/resize:bg-action-primary/50 transition-colors" />
                                </div>
                              )}

                              {/* MAIN CARD BODY - Grabbable to move */}
                              <div 
                                className={`h-full rounded-lg p-2 md:p-3 flex flex-col overflow-hidden ${
                                  isDragging || isTimelineDragging
                                    ? "shadow-xl ring-2 ring-action-primary/30" 
                                    : isJustDropped
                                      ? "shadow-lg ring-1 ring-action-primary/20"
                                      : "shadow-sm hover:shadow-md"
                                } ${category.bg} border ${category.border}`}
                                style={{
                                  transition: isTimelineDragging ? 'box-shadow 100ms ease-out' : 'box-shadow 250ms cubic-bezier(0.25, 1, 0.5, 1)',
                                  cursor: isPublished ? 'default' : (isTimelineDragging && timelineDrag?.type === 'move' ? 'grabbing' : 'grab'),
                                }}
                                onMouseDown={(e) => {
                                  // Only trigger move if not clicking on resize handles or buttons
                                  const target = e.target as HTMLElement;
                                  if (target.closest('button') || target.closest('[data-resize-handle]')) return;
                                  handleTimelineMouseDown(e, block, 'move');
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  if (!isPublished) openEditModal(block);
                                }}
                              >
                                {/* Block Header */}
                                <div className="flex items-start gap-2 min-h-0">
                                  {/* Icon */}
                                  <div className={`p-1 rounded ${category.text} flex-shrink-0`}>
                                    <CategoryIcon className="w-3 h-3" />
                                  </div>

                                  {/* Title & Time */}
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${category.text} truncate`}>
                                      {block.title}
                                    </div>
                                    <div className="text-xs text-ink-muted">
                                      {formatTime(block.startTime)}
                                      {block.duration && ` · ${Math.round(block.duration / 60)}h`}
                                    </div>
                                  </div>

                                  {/* Status Pill (if not open) */}
                                  {block.status !== "open" && (
                                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${
                                      block.status === "locked" 
                                        ? "bg-error text-white" 
                                        : "bg-warning text-white"
                                    }`}>
                                      {block.status === "locked" ? "🔒" : "~"}
                                    </span>
                                  )}

                                  {/* Edit & Delete buttons (on hover) */}
                                  {!isPublished && (
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditModal(block);
                                        }}
                                        className="p-1 text-ink-muted hover:text-action-primary hover:bg-white/50 rounded transition-all"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(block);
                                        }}
                                        className="p-1 text-ink-muted hover:text-error hover:bg-white/50 rounded transition-all"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Location (if space allows) */}
                                {height > 60 && block.location && (
                                  <div className="flex items-center gap-1 text-xs text-ink-muted mt-1 truncate">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{block.location}</span>
                                  </div>
                                )}

                                {/* Notes (if tall enough) */}
                                {height > 90 && block.notes && (
                                  <div className="text-xs text-ink-muted mt-1 italic truncate">
                                    {block.notes}
                                  </div>
                                )}

                                {/* Overlap indicator */}
                                {block.totalColumns > 1 && (
                                  <div className="absolute bottom-1 right-1">
                                    <span className="text-[10px] text-ink-muted/60">
                                      ⚠️
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* BOTTOM RESIZE HANDLE */}
                              {!isPublished && (
                                <div
                                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-20 group/resize"
                                  onMouseDown={(e) => handleTimelineMouseDown(e, block, 'resize-bottom')}
                                >
                                  <div className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-transparent group-hover/resize:bg-action-primary/50 transition-colors" />
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Current time indicator (if today) */}
                        {isToday && (() => {
                          const now = new Date();
                          const currentHour = now.getHours();
                          const currentMinute = now.getMinutes();
                          if (currentHour >= DAY_START_HOUR && currentHour <= DAY_END_HOUR) {
                            const top = ((currentHour - DAY_START_HOUR) * 60 + currentMinute) / 60 * HOUR_HEIGHT;
                            return (
                              <div 
                                className="absolute left-16 md:left-20 right-0 flex items-center z-30 pointer-events-none"
                                style={{ top: `${top}px` }}
                              >
                                <div className="w-2 h-2 rounded-full bg-error -ml-1" />
                                <div className="flex-1 border-t-2 border-error" />
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    )}
                  </div>
                );
              })()}
            </main>
          </div>
        )}

        {/* ================================================================
            CREATE/EDIT MODAL
            ================================================================ */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

            {/* Modal */}
            <div className="relative bg-paper rounded-card shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="font-serif text-section text-ink mb-6">
                  {editingBlock ? "Edit Block" : "Add Block"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Day */}
                  <div>
                    <label className="block text-meta font-medium text-ink mb-1.5">Day</label>
                    <input
                      type="date"
                      value={formDayDate}
                      onChange={(e) => setFormDayDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-border-default rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                      required
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-meta font-medium text-ink mb-1.5">Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g., Morning Tee Time"
                      className="w-full px-4 py-2.5 bg-white border border-border-default rounded-input text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                      required
                    />
                  </div>

                  {/* Block Type */}
                  <div>
                    <label className="block text-meta font-medium text-ink mb-1.5">Type</label>
                    <select
                      value={formBlockType}
                      onChange={(e) => handleBlockTypeChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-border-default rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                    >
                      {BLOCK_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category - allows override of auto-set category */}
                  <div>
                    <label className="block text-meta font-medium text-ink mb-1.5">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-border-default rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <p className="text-micro text-ink-muted mt-1">
                      Auto-set by type, but you can override
                    </p>
                  </div>

                  {/* Start Time Dropdowns */}
                  <div>
                    <label className="block text-meta font-medium text-ink mb-1.5">
                      Start Time
                    </label>
                    <div className="flex gap-2">
                      {/* Hour */}
                      <select
                        value={formHour}
                        onChange={(e) => setFormHour(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-white border border-border-default rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                      >
                        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                          <option key={h} value={String(h)}>{h}</option>
                        ))}
                      </select>
                      
                      <span className="flex items-center text-ink-muted font-medium">:</span>
                      
                      {/* Minute */}
                      <select
                        value={formMinute}
                        onChange={(e) => setFormMinute(e.target.value)}
                        className="w-20 px-3 py-2.5 bg-white border border-border-default rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                      >
                        <option value="00">00</option>
                        <option value="30">30</option>
                      </select>
                      
                      {/* AM/PM */}
                      <select
                        value={formAmPm}
                        onChange={(e) => setFormAmPm(e.target.value as "AM" | "PM")}
                        className="w-20 px-3 py-2.5 bg-white border border-border-default rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Duration Dropdown (hours in 30-min intervals) */}
                  <div>
                    <label className="block text-meta font-medium text-ink mb-1.5">
                      Duration <span className="text-ink-muted">(hours)</span>
                    </label>
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-border-default rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                    >
                      <option value="0.5">30 min</option>
                      <option value="1">1 hour</option>
                      <option value="1.5">1.5 hours</option>
                      <option value="2">2 hours</option>
                      <option value="2.5">2.5 hours</option>
                      <option value="3">3 hours</option>
                      <option value="3.5">3.5 hours</option>
                      <option value="4">4 hours</option>
                      <option value="4.5">4.5 hours</option>
                      <option value="5">5 hours</option>
                      <option value="6">6 hours</option>
                      <option value="8">8 hours</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-meta font-medium text-ink mb-1.5">
                      Location <span className="text-ink-muted">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g., Pinehurst Resort"
                      className="w-full px-4 py-2.5 bg-white border border-border-default rounded-input text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-meta font-medium text-ink mb-1.5">
                      Notes <span className="text-ink-muted">(optional)</span>
                    </label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Additional details..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-white border border-border-default rounded-input text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all resize-none"
                    />
                  </div>

                  {/* Status - Edit only */}
                  {editingBlock && (
                    <div>
                      <label className="block text-meta font-medium text-ink mb-1.5">Status</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as "open" | "soft" | "locked")}
                        className="w-full px-4 py-2.5 bg-white border border-border-default rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-action-primary/20 focus:border-action-primary transition-all"
                      >
                        <option value="open">Open</option>
                        <option value="soft">Soft</option>
                        <option value="locked">Locked</option>
                      </select>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? "Saving..." : editingBlock ? "Save Changes" : "Create Block"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
