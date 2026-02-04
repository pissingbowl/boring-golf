import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Copy, Check, Pencil, Trash2, Users, Flag, ListTodo, DollarSign, Scale, Plus, Mail, UserPlus, Link2, Ghost, X, Home, Sun, Wind, Droplets, CloudRain, CalendarPlus } from "lucide-react";
import { http } from "@/lib/http";
import { AppShell } from "@/components/AppShell";
import { EditTripModal } from "@/components/EditTripModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Trip = {
  id: string;
  name: string;
  destination: string;
  start_date: string | null;
  nights: number | null;
  invite_code: string | null;
  itinerary_published?: boolean;
};

type RoundScore = {
  member_name: string;
  score: number | null;
};

type Round = {
  id: string;
  trip_id: string;
  course_name: string;
  date: string;
  format: 'stroke_play' | 'stableford' | 'skins';
  status: 'in_progress' | 'complete';
  scores: RoundScore[];
  notes: string | null;
  created_at: string;
};

type RoundFormState = {
  course_name: string;
  date: string;
  format: 'stroke_play' | 'stableford' | 'skins';
  scores: RoundScore[];
  notes: string;
};

type Leaderboard = {
  rounds_count: number;
  leaderboard: Array<{
    member_name: string;
    total_score: number;
    rounds_played: number;
    average: number;
  }>;
};

type ItineraryBlock = {
  id: string;
  trip_id: string;
  date: string;
  start_time: string | null;
  title: string;
  type: string;
  notes: string | null;
  round_id: string | null;
  created_at: string;
};

type ItineraryFormState = {
  date: string;
  start_time: string;
  title: string;
  type: string;
  notes: string;
  round_id: string;
};

type ExpenseSplit = {
  id: string;
  expense_id: string;
  member: string;
  amount_owed: number;
  is_paid: boolean;
  created_at: string;
};

type Expense = {
  id: string;
  trip_id: string;
  paid_by: string;
  amount: number;
  description: string;
  category: string;
  expense_date: string;
  created_at: string;
  splits: ExpenseSplit[];
};

type TripMember = {
  id: string;
  trip_id: string;
  name: string;
  email?: string | null;
  role?: string;
  rsvp_status?: string;
  is_ghost?: boolean;
  created_at: string;
};

type ExpenseFormState = {
  paid_by: string;
  amount: string;
  description: string;
  category: string;
  expense_date: string;
  selectedMembers: string[];
};

type MemberBalance = {
  member: string;
  paid: number;
  owed: number;
  net: number;
};

type Transfer = {
  from: string;
  to: string;
  amount: number;
};

type BalancesData = {
  members: MemberBalance[];
  transfers: Transfer[];
};

type BuilderBlock = {
  id: string;
  tripId: string;
  dayDate: string;
  sortOrder: number;
  blockType: string;
  category: string;
  title: string;
  startTime?: string;
  duration?: number;
  location?: string;
  notes?: string;
  status: string;
};

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundsLoading, setRoundsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [roundForm, setRoundForm] = useState<RoundFormState>({
    course_name: "",
    date: "",
    format: "stroke_play",
    scores: [],
    notes: "",
  });
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [isSubmittingRound, setIsSubmittingRound] = useState(false);
  const [itineraryBlocks, setItineraryBlocks] = useState<ItineraryBlock[]>([]);
  const [itineraryLoading, setItineraryLoading] = useState(true);
  const [itineraryForm, setItineraryForm] = useState<ItineraryFormState>({
    date: "",
    start_time: "",
    title: "",
    type: "misc",
    notes: "",
    round_id: "",
  });
  const [isSubmittingItinerary, setIsSubmittingItinerary] = useState(false);
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>({
    paid_by: "",
    amount: "",
    description: "",
    category: "misc",
    expense_date: "",
    selectedMembers: [],
  });
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [balances, setBalances] = useState<BalancesData | null>(null);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [joinUrlCopied, setJoinUrlCopied] = useState(false);
  const [showJoinedBanner, setShowJoinedBanner] = useState(false);
  const [builderBlocks, setBuilderBlocks] = useState<BuilderBlock[]>([]);
  const [builderLoading, setBuilderLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isItineraryPublished = trip?.itinerary_published ?? false;
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  
  // Ledger tab state
  const [ledgerView, setLedgerView] = useState<"balances" | "transactions">("balances");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseSplitType, setExpenseSplitType] = useState<"equal" | "select">("equal");
  
  // Tab navigation state - Home is default
  const [activeTab, setActiveTab] = useState<"home" | "itinerary" | "members" | "rounds" | "ledger">("home");
  const [prevTab, setPrevTab] = useState<string | null>(null);
  
  // Scroll state for header shadow
  const [scrolled, setScrolled] = useState(false);
  
  // Calculate total outstanding balance for ledger badge
  const totalOutstandingBalance = balances?.members
    .reduce((sum, m) => sum + Math.abs(m.balance), 0) || 0;

  // Scroll listener for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Refresh trip data (called after edit)
  const refreshTrip = async () => {
    try {
      const data = await http.get<Trip>(`/api/trips/${id}`);
      setTrip(data);
      setError(null);
    } catch (fetchError: unknown) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load trip";
      setError(message);
    }
  };

  // All useEffects preserved exactly as before
  useEffect(() => {
    let isMounted = true;
    const loadTrip = async () => {
      try {
        const data = await http.get<Trip>(`/api/trips/${id}`);
        if (isMounted) { setTrip(data); setError(null); }
      } catch (fetchError: unknown) {
        if (isMounted) {
          const message = fetchError instanceof Error ? fetchError.message : "Failed to load trip";
          setError(message);
        }
      } finally { if (isMounted) setLoading(false); }
    };
    loadTrip();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const loadRounds = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/rounds`);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const data = (await response.json()) as Round[];
        if (isMounted) setRounds(data);
      } catch { if (isMounted) setRounds([]); }
      finally { if (isMounted) setRoundsLoading(false); }
    };
    if (id) loadRounds();
    return () => { isMounted = false; };
  }, [id]);

  // Load leaderboard
  useEffect(() => {
    let isMounted = true;
    const loadLeaderboard = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/leaderboard`);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const data = (await response.json()) as Leaderboard;
        if (isMounted) setLeaderboard(data);
      } catch { if (isMounted) setLeaderboard(null); }
      finally { if (isMounted) setLeaderboardLoading(false); }
    };
    if (id) loadLeaderboard();
    return () => { isMounted = false; };
  }, [id, rounds]); // Re-fetch when rounds change

  useEffect(() => {
    let isMounted = true;
    const loadItinerary = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/itinerary`);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const data = (await response.json()) as ItineraryBlock[];
        if (isMounted) setItineraryBlocks(data);
      } catch { if (isMounted) setItineraryBlocks([]); }
      finally { if (isMounted) setItineraryLoading(false); }
    };
    if (id) loadItinerary();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const loadBuilderBlocks = async () => {
      try {
        const data = await http.get<BuilderBlock[]>(`/api/trips/${id}/itinerary/builder`);
        if (isMounted) {
          const sorted = [...data].sort((a, b) => {
            if (a.dayDate !== b.dayDate) return a.dayDate.localeCompare(b.dayDate);
            return a.sortOrder - b.sortOrder;
          });
          setBuilderBlocks(sorted);
        }
      } catch { if (isMounted) setBuilderBlocks([]); }
      finally { if (isMounted) setBuilderLoading(false); }
    };
    if (id) loadBuilderBlocks();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const loadExpenses = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/expenses`);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const data = (await response.json()) as Expense[];
        if (isMounted) setExpenses(data);
      } catch { if (isMounted) setExpenses([]); }
      finally { if (isMounted) setExpensesLoading(false); }
    };
    if (id) loadExpenses();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const loadMembers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/members`);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const data = (await response.json()) as TripMember[];
        if (isMounted) setTripMembers(data);
      } catch { if (isMounted) setTripMembers([]); }
      finally { if (isMounted) setMembersLoading(false); }
    };
    if (id) loadMembers();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    const storedMemberId = localStorage.getItem("tripMemberId");
    if (storedMemberId && tripMembers.length > 0) {
      const currentMember = tripMembers.find(m => m.id === storedMemberId);
      if (currentMember) {
        const updates: Partial<ExpenseFormState> = {};
        if (!expenseForm.paid_by) updates.paid_by = currentMember.name;
        if (expenseForm.selectedMembers.length === 0) updates.selectedMembers = [currentMember.name];
        if (Object.keys(updates).length > 0) setExpenseForm(current => ({ ...current, ...updates }));
      }
    }
  }, [tripMembers, expenseForm.paid_by, expenseForm.selectedMembers.length]);

  useEffect(() => {
    let isMounted = true;
    const loadBalances = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/balances`);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const data = (await response.json()) as BalancesData;
        if (isMounted) setBalances(data);
      } catch { if (isMounted) setBalances({ members: [], transfers: [] }); }
      finally { if (isMounted) setBalancesLoading(false); }
    };
    if (id) loadBalances();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (searchParams.get("joined") === "true") {
      setShowJoinedBanner(true);
      searchParams.delete("joined");
      setSearchParams(searchParams, { replace: true });
      setTimeout(() => setShowJoinedBanner(false), 2000);
    }
  }, [searchParams, setSearchParams]);

  // Helper functions
  const getDateRange = (startDate: string | null, nights: number | null): string => {
    if (!startDate || !nights) return "TBD";
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + nights);
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', formatOptions)} – ${end.toLocaleDateString('en-US', formatOptions)}`;
  };

  const refetchBalances = async () => {
    if (!id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/balances`);
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      const data = (await response.json()) as BalancesData;
      setBalances(data);
    } catch { setBalances({ members: [], transfers: [] }); }
  };

  // All handlers preserved exactly as before
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("Are you sure you want to delete this trip? This action cannot be undone.");
    if (!confirmed) return;
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      navigate("/my-trips");
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete trip";
      setError(message);
      setIsDeleting(false);
    }
  };

  const handleRoundFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setRoundForm((current) => ({ ...current, [name]: value }));
  };

  const handleScoreChange = (memberName: string, score: string) => {
    setRoundForm((current) => {
      const newScores = [...current.scores];
      const idx = newScores.findIndex(s => s.member_name === memberName);
      const parsedScore = score === "" ? null : parseInt(score, 10);
      if (idx >= 0) {
        newScores[idx] = { member_name: memberName, score: parsedScore };
      } else {
        newScores.push({ member_name: memberName, score: parsedScore });
      }
      return { ...current, scores: newScores };
    });
  };

  const openRoundModal = (round?: Round) => {
    if (round) {
      setEditingRound(round);
      setRoundForm({
        course_name: round.course_name,
        date: round.date.split("T")[0],
        format: round.format || "stroke_play",
        scores: round.scores || [],
        notes: round.notes || "",
      });
    } else {
      setEditingRound(null);
      // Initialize scores for all trip members
      const initialScores = tripMembers.map(m => ({ member_name: m.name, score: null }));
      setRoundForm({
        course_name: "",
        date: new Date().toISOString().split("T")[0],
        format: "stroke_play",
        scores: initialScores,
        notes: "",
      });
    }
    setIsRoundModalOpen(true);
  };

  const closeRoundModal = () => {
    setIsRoundModalOpen(false);
    setEditingRound(null);
    setRoundForm({
      course_name: "",
      date: "",
      format: "stroke_play",
      scores: [],
      notes: "",
    });
  };

  const handleRoundSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    setIsSubmittingRound(true);
    try {
      if (editingRound) {
        // Update existing round
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rounds/${editingRound.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scores: roundForm.scores, notes: roundForm.notes }),
        });
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const updatedRound = (await response.json()) as Round;
        setRounds((current) => current.map(r => r.id === updatedRound.id ? updatedRound : r));
      } else {
        // Create new round
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/rounds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roundForm),
        });
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const newRound = (await response.json()) as Round;
        setRounds((current) => [...current, newRound]);
      }
      closeRoundModal();
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save round";
      setError(message);
    } finally { setIsSubmittingRound(false); }
  };

  const handleRoundDelete = async (roundId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this round?");
    if (!confirmed) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rounds/${roundId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      setRounds((current) => current.filter((r) => r.id !== roundId));
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete round";
      setError(message);
    }
  };

  const handleItineraryFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setItineraryForm((current) => ({ ...current, [name]: value }));
  };

  const handleItinerarySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    setIsSubmittingItinerary(true);
    try {
      const payload = { ...itineraryForm, round_id: itineraryForm.round_id || undefined };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      const newBlock = (await response.json()) as ItineraryBlock;
      setItineraryBlocks((current) => [...current, newBlock]);
      setItineraryForm({ date: "", start_time: "", title: "", type: "misc", notes: "", round_id: "" });
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "Failed to create itinerary block";
      setError(message);
    } finally { setIsSubmittingItinerary(false); }
  };

  const handleItineraryDelete = async (blockId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this itinerary block?");
    if (!confirmed) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/itinerary/${blockId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      setItineraryBlocks((current) => current.filter((b) => b.id !== blockId));
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete itinerary block";
      setError(message);
    }
  };

  const handleMemberSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !memberName.trim()) return;
    setIsSubmittingMember(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: memberName.trim(),
          email: memberEmail.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      const newMember = (await response.json()) as TripMember;
      setTripMembers((current) => [...current, newMember]);
      setMemberName("");
      setMemberEmail("");
      setIsMemberModalOpen(false);
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "Failed to add member";
      setError(message);
    } finally { setIsSubmittingMember(false); }
  };

  const handleMemberDelete = async (memberId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this member?");
    if (!confirmed) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trip-members/${memberId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      setTripMembers((current) => current.filter((m) => m.id !== memberId));
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete member";
      setError(message);
    }
  };

  const handleExpenseFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setExpenseForm((current) => ({ ...current, [name]: value }));
  };

  const handleMemberCheckboxChange = (mName: string, checked: boolean) => {
    setExpenseForm((current) => {
      const newSelected = checked
        ? [...current.selectedMembers, mName]
        : current.selectedMembers.filter((m) => m !== mName);
      return { ...current, selectedMembers: newSelected };
    });
  };

  const handleExpenseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    setIsSubmittingExpense(true);
    try {
      if (expenseForm.selectedMembers.length === 0) {
        setError("Please select at least one member to split with");
        setIsSubmittingExpense(false);
        return;
      }
      const payload = {
        paid_by: expenseForm.paid_by,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        category: expenseForm.category,
        expense_date: expenseForm.expense_date,
        split_method: "equal" as const,
        members: expenseForm.selectedMembers,
      };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      const { expense, splits } = (await response.json()) as { expense: Expense; splits: ExpenseSplit[] };
      const newExpense = { ...expense, splits };
      setExpenses((current) => [newExpense, ...current]);
      setExpenseForm({ paid_by: "", amount: "", description: "", category: "misc", expense_date: "", selectedMembers: [] });
      await refetchBalances();
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "Failed to create expense";
      setError(message);
    } finally { setIsSubmittingExpense(false); }
  };

  const handleExpenseDelete = async (expenseId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmed) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/expenses/${expenseId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      setExpenses((current) => current.filter((e) => e.id !== expenseId));
      await refetchBalances();
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete expense";
      setError(message);
    }
  };

  // Render
  return (
    <div className="pageShell min-h-screen">
      {/* Textured background layers */}
      <div className="paperGrain" />
      <div className="topoLayer" />
      <div className="lightWash" style={{ '--light-wash-opacity': 0.35 } as React.CSSProperties} />
      
      {/* Content layer */}
      <div className="relative z-10">
        <AppShell>
          {/* Back link */}
          <Link
            to="/my-trips"
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors mb-6"
          >
        <ArrowLeft className="h-4 w-4" />
        Back to trips
      </Link>

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-1/3 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-4 w-1/4 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main content */}
      {!loading && !error && trip && (
        <div className="space-y-6">
          {/* Joined banner */}
          {showJoinedBanner && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 font-medium">
              You've joined this trip!
            </div>
          )}

          {/* Trip Header Card */}
          <Card className={`premium-card premium-header premium-section ${scrolled ? 'scrolled' : ''}`}>
            <CardHeader className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--text-primary)' }}>
                    {trip.name}
                  </CardTitle>
                  <CardDescription className="mt-4 space-y-2">
                    <div className="premium-trip-row">
                      <MapPin className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{trip.destination}</span>
                    </div>
                    <div className="premium-trip-row date">
                      <Calendar className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{getDateRange(trip.start_date, trip.nights)}</span>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Invite code section */}
            {trip.invite_code && (
              <CardContent className="pt-0 px-6 pb-6">
                <Separator className="mb-6" style={{ backgroundColor: 'var(--cream-border)' }} />
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Invite Code */}
                  <div className="space-y-3 premium-invite-field">
                    <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                      Invite Code
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 premium-invite-value">
                        {trip.invite_code}
                      </div>
                      <button
                        className={`premium-copy-btn ${inviteCodeCopied ? 'copied' : ''}`}
                        onClick={() => {
                          navigator.clipboard.writeText(trip.invite_code!);
                          setInviteCodeCopied(true);
                          setTimeout(() => setInviteCodeCopied(false), 2000);
                        }}
                      >
                        {inviteCodeCopied ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Join Link */}
                  <div className="space-y-3 premium-invite-field">
                    <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                      Join Link
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 premium-invite-value link overflow-hidden">
                        <span className="truncate block">boringgolf.com/join/{trip.invite_code}</span>
                      </div>
                      <button
                        className={`premium-copy-btn ${joinUrlCopied ? 'copied' : ''}`}
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/join?code=${trip.invite_code}`);
                          setJoinUrlCopied(true);
                          setTimeout(() => setJoinUrlCopied(false), 2000);
                        }}
                      >
                        {joinUrlCopied ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Tabs for different sections */}
          <Tabs 
            value={activeTab} 
            onValueChange={(val) => {
              setPrevTab(activeTab);
              setActiveTab(val as typeof activeTab);
            }} 
            className="space-y-6 premium-section"
          >
            {/* Custom TabsList with sliding indicator - 5 tabs */}
            <div className="premium-tab-nav relative" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {/* Background pill - 5 tabs */}
              <div 
                className="premium-tab-bg"
                style={{
                  width: 'calc(20% - 4px)',
                  transform: `translateX(calc(${
                    activeTab === 'home' ? 0 :
                    activeTab === 'itinerary' ? 100 :
                    activeTab === 'members' ? 200 :
                    activeTab === 'rounds' ? 300 : 400
                  }% + 2px))`,
                }}
              />
              {/* Gradient underline indicator - 5 tabs */}
              <div 
                className="premium-tab-indicator"
                style={{
                  width: 'calc(20% - 32px)',
                  left: `calc(${
                    activeTab === 'home' ? 0 :
                    activeTab === 'itinerary' ? 20 :
                    activeTab === 'members' ? 40 :
                    activeTab === 'rounds' ? 60 : 80
                  }% + 16px)`,
                }}
              />
              
              <button 
                onClick={() => { setPrevTab(activeTab); setActiveTab('home'); }}
                className={`premium-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
              >
                <Home className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Home</span>
              </button>
              
              <button 
                onClick={() => { setPrevTab(activeTab); setActiveTab('itinerary'); }}
                className={`premium-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
              >
                <ListTodo className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Itinerary</span>
              </button>
              
              <button 
                onClick={() => { setPrevTab(activeTab); setActiveTab('members'); }}
                className={`premium-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              >
                <Users className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Members</span>
                {tripMembers.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full" style={{ background: 'var(--green-subtle)', color: 'var(--green-dark)' }}>
                    {tripMembers.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => { setPrevTab(activeTab); setActiveTab('rounds'); }}
                className={`premium-tab-btn ${activeTab === 'rounds' ? 'active' : ''}`}
              >
                <Flag className={`h-[18px] w-[18px] ${activeTab === 'rounds' ? 'premium-flag-icon' : ''}`} />
                <span className="hidden sm:inline">Rounds</span>
                {rounds.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full" style={{ background: 'var(--green-subtle)', color: 'var(--green-dark)' }}>
                    {rounds.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => { setPrevTab(activeTab); setActiveTab('ledger'); }}
                className={`premium-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
              >
                <DollarSign className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Ledger</span>
                {totalOutstandingBalance > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                    ${Math.round(totalOutstandingBalance / 2)}
                  </span>
                )}
              </button>
            </div>

            {/* Home Dashboard Tab */}
            <TabsContent value="home" className="tab-panel-animated">
              {(() => {
                // Calculate days until trip
                const daysUntil = trip.start_date 
                  ? Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : 0;
                const formattedDate = trip.start_date 
                  ? new Date(trip.start_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Date TBD';
                
                // Get upcoming events from itinerary
                const upcomingEvents = builderBlocks
                  .filter(block => {
                    const blockDate = new Date(block.dayDate);
                    return blockDate >= new Date();
                  })
                  .sort((a, b) => {
                    const dateA = new Date(a.dayDate + 'T' + (a.startTime || '00:00'));
                    const dateB = new Date(b.dayDate + 'T' + (b.startTime || '00:00'));
                    return dateA.getTime() - dateB.getTime();
                  })
                  .slice(0, 3);
                
                // Calculate stats
                const roundsPlanned = rounds.length;
                const nights = trip.nights || 0;
                const golfers = tripMembers.length;
                const estimatedCostPerPerson = balances?.members[0]?.net ? Math.abs(balances.members[0].net) : 0;
                
                // Format time helper
                const formatTime = (time: string) => {
                  if (!time) return { time: '--', period: '' };
                  const [hours, minutes] = time.split(':').map(Number);
                  const period = hours >= 12 ? 'PM' : 'AM';
                  const displayHours = hours % 12 || 12;
                  return { time: `${displayHours}:${minutes.toString().padStart(2, '0')}`, period };
                };
                
                // Get initials helper
                const getInitials = (name: string) => {
                  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                };

                return (
                  <div className="dashboard">
                    {/* Row 1: Countdown + Weather */}
                    
                    {/* Countdown Card */}
                    <div className="dashboard-card countdown-card">
                      <div className="dashboard-card-header">
                        <span className="dashboard-card-title">Trip Starts In</span>
                      </div>
                      <div className="countdown-content">
                        <span className="countdown-number">{daysUntil > 0 ? daysUntil : 0}</span>
                        <span className="countdown-label">{daysUntil === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="countdown-date">{formattedDate}</div>
                    </div>
                    
                    {/* Weather Card */}
                    <div className="dashboard-card">
                      <div className="dashboard-card-header">
                        <span className="dashboard-card-title">{trip.destination} Weather</span>
                        <span className="dashboard-card-action">5-day forecast →</span>
                      </div>
                      <div className="dashboard-card-body">
                        <div className="weather-main">
                          <Sun className="weather-icon sun" />
                          <div>
                            <div className="weather-temp">72<span>°F</span></div>
                            <div className="weather-desc">Sunny, light breeze</div>
                          </div>
                        </div>
                        <div className="weather-details">
                          <div className="weather-detail">
                            <div className="weather-detail-value">8 mph</div>
                            <div className="weather-detail-label">Wind</div>
                          </div>
                          <div className="weather-detail">
                            <div className="weather-detail-value">45%</div>
                            <div className="weather-detail-label">Humidity</div>
                          </div>
                          <div className="weather-detail">
                            <div className="weather-detail-value">0%</div>
                            <div className="weather-detail-label">Rain</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Row 2: Up Next + Crew */}
                    
                    {/* Up Next Card */}
                    <div className="dashboard-card">
                      <div className="dashboard-card-header">
                        <span className="dashboard-card-title">Up Next</span>
                        <span 
                          className="dashboard-card-action"
                          onClick={() => setActiveTab('itinerary')}
                        >
                          Full itinerary →
                        </span>
                      </div>
                      <div className="dashboard-card-body">
                        {upcomingEvents.length === 0 ? (
                          <div className="text-center py-6">
                            <Calendar className="w-10 h-10 mx-auto mb-3 premium-empty-icon" style={{ color: 'var(--text-faint)' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No upcoming events</p>
                            <p style={{ color: 'var(--text-faint)', fontSize: '12px' }}>Add events to your itinerary</p>
                          </div>
                        ) : (
                          upcomingEvents.map((event) => {
                            const { time, period } = formatTime(event.startTime || '');
                            const eventType = event.category === 'golf' ? 'golf' : 
                                             event.category === 'food' || event.category === 'dining' ? 'food' :
                                             event.category === 'travel' || event.category === 'transport' ? 'travel' : 'other';
                            return (
                              <div key={event.id} className="up-next-item">
                                <div className="up-next-time">
                                  <div className="up-next-time-value">{time}</div>
                                  <div className="up-next-time-period">{period}</div>
                                </div>
                                <div className="up-next-content">
                                  <div className="up-next-title">{event.title}</div>
                                  {event.location && (
                                    <div className="up-next-location">
                                      <MapPin className="w-3 h-3" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                                <span className={`up-next-badge ${eventType}`}>
                                  {eventType}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                    
                    {/* Crew Card */}
                    <div className="dashboard-card">
                      <div className="dashboard-card-header">
                        <span className="dashboard-card-title">The Crew</span>
                        <span 
                          className="dashboard-card-action"
                          onClick={() => setActiveTab('members')}
                        >
                          Manage →
                        </span>
                      </div>
                      <div className="dashboard-card-body">
                        {tripMembers.length === 0 ? (
                          <div className="text-center py-6">
                            <Users className="w-10 h-10 mx-auto mb-3 premium-empty-icon" style={{ color: 'var(--text-faint)' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No members yet</p>
                            <p style={{ color: 'var(--text-faint)', fontSize: '12px' }}>Invite your crew</p>
                          </div>
                        ) : (
                          <div className="crew-grid">
                            {tripMembers.slice(0, 8).map((member, idx) => (
                              <div key={member.id} className="crew-member">
                                <div className={`crew-avatar ${idx < 2 ? 'online' : ''}`}>
                                  {getInitials(member.name)}
                                </div>
                                <div className="crew-name">{member.name.split(' ')[0]}</div>
                                <div className="crew-role">{member.role === 'captain' ? 'Captain' : 'Member'}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Row 3: Stats (full width) */}
                    <div className="dashboard-card dashboard-full">
                      <div className="dashboard-card-header">
                        <span className="dashboard-card-title">Trip Stats</span>
                      </div>
                      <div className="dashboard-card-body">
                        <div className="stats-grid">
                          <div className="stat-item">
                            <div className="stat-value">{roundsPlanned}</div>
                            <div className="stat-label">Rounds Played</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">{nights}</div>
                            <div className="stat-label">Nights</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">{golfers}</div>
                            <div className="stat-label">Golfers</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">
                              ${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                            </div>
                            <div className="stat-label">Total Spent</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Row 4: Quick Actions (full width) */}
                    <div className="dashboard-card dashboard-full">
                      <div className="dashboard-card-header">
                        <span className="dashboard-card-title">Quick Actions</span>
                      </div>
                      <div className="dashboard-card-body">
                        <div className="quick-actions">
                          <div 
                            className="quick-action"
                            onClick={() => { setActiveTab('rounds'); openRoundModal(); }}
                          >
                            <div className="quick-action-icon">
                              <Flag className="w-5 h-5" />
                            </div>
                            <span className="quick-action-label">Log a Round</span>
                          </div>
                          <div 
                            className="quick-action"
                            onClick={() => { setActiveTab('ledger'); setIsExpenseModalOpen(true); }}
                          >
                            <div className="quick-action-icon">
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="quick-action-label">Add Expense</span>
                          </div>
                          <div 
                            className="quick-action"
                            onClick={() => { setActiveTab('members'); setIsMemberModalOpen(true); }}
                          >
                            <div className="quick-action-icon">
                              <UserPlus className="w-5 h-5" />
                            </div>
                            <span className="quick-action-label">Invite Member</span>
                          </div>
                          <Link 
                            to={`/trip/${id}/itinerary-builder`}
                            className="quick-action"
                          >
                            <div className="quick-action-icon">
                              <CalendarPlus className="w-5 h-5" />
                            </div>
                            <span className="quick-action-label">Add Event</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </TabsContent>

            {/* Itinerary Tab */}
            <TabsContent value="itinerary" className="tab-panel-animated">
              <Card className="tab-content-animated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>Itinerary</CardTitle>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        isItineraryPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {isItineraryPublished ? "Final" : "Draft"}
                      </span>
                    </div>
                    <Button asChild>
                      <Link to={`/trip/${id}/itinerary-builder`}>
                        {isItineraryPublished ? "View Itinerary" : "Edit Itinerary"}
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>
                    {isItineraryPublished ? "Final itinerary" : "Still being planned"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {builderLoading ? (
                    <p className="text-muted-foreground">Loading preview...</p>
                  ) : builderBlocks.length === 0 ? (
                    <p className="text-muted-foreground italic">
                      Nothing scheduled yet. Use the Itinerary Builder to add events.
                    </p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      {builderBlocks.slice(0, 6).map((block, idx) => (
                        <div
                          key={block.id}
                          className={`px-4 py-3 flex gap-4 items-start ${
                            idx < Math.min(builderBlocks.length, 6) - 1 ? "border-b" : ""
                          }`}
                        >
                          <div className="min-w-[80px] text-muted-foreground text-sm">
                            {new Date(block.dayDate + "T12:00:00").toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                            {block.startTime && <div className="font-medium">{block.startTime}</div>}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{block.title}</div>
                            {block.location && <div className="text-muted-foreground text-sm">{block.location}</div>}
                          </div>
                        </div>
                      ))}
                      {builderBlocks.length > 6 && (
                        <div className="px-4 py-2 bg-muted/50 text-center">
                          <Link to={`/trip/${id}/itinerary-builder`} className="text-primary text-sm hover:underline">
                            +{builderBlocks.length - 6} more in builder
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy form toggle */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowLegacyForm(!showLegacyForm)}
                      className="text-muted-foreground text-sm hover:text-foreground"
                    >
                      {showLegacyForm ? "▼" : "▶"} Legacy: Add Item (advanced)
                    </button>
                  </div>

                  {showLegacyForm && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                      <h4 className="font-medium">Add Itinerary Item</h4>
                      <form onSubmit={handleItinerarySubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="itin-date">Date</Label>
                            <Input type="date" id="itin-date" name="date" value={itineraryForm.date} onChange={handleItineraryFormChange} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="itin-time">Start Time</Label>
                            <Input type="time" id="itin-time" name="start_time" value={itineraryForm.start_time} onChange={handleItineraryFormChange} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="itin-title">Title</Label>
                          <Input id="itin-title" name="title" value={itineraryForm.title} onChange={handleItineraryFormChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="itin-type">Type</Label>
                          <select
                            id="itin-type"
                            name="type"
                            value={itineraryForm.type}
                            onChange={handleItineraryFormChange}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                          >
                            <option value="golf">Golf</option>
                            <option value="meal">Meal</option>
                            <option value="travel">Travel</option>
                            <option value="lodging">Lodging</option>
                            <option value="misc">Misc</option>
                          </select>
                        </div>
                        <Button type="submit" disabled={isSubmittingItinerary}>
                          {isSubmittingItinerary ? "Adding..." : "Add Item"}
                        </Button>
                      </form>

                      {!itineraryLoading && itineraryBlocks.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Legacy Blocks</h5>
                          <ul className="space-y-1 text-sm">
                            {itineraryBlocks.map((block) => (
                              <li key={block.id} className="flex items-center justify-between">
                                <span><strong>{block.title}</strong> ({block.type})</span>
                                <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => handleItineraryDelete(block.id)}>Delete</Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="tab-panel-animated">
              <div className="space-y-6 tab-content-animated">
                {/* Invite Link Card */}
                {trip?.invite_code && (
                  <Card className="bg-gradient-to-r from-action-primary/5 to-action-primary/10 border-action-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-action-primary/10 rounded-lg">
                            <Link2 className="w-5 h-5 text-action-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-ink">Trip Join Link</p>
                            <p className="text-sm text-ink-muted">Share with your group to let them join</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            const joinUrl = `${window.location.origin}/join/${trip.invite_code}`;
                            navigator.clipboard.writeText(joinUrl);
                            setInviteCodeCopied(true);
                            setTimeout(() => setInviteCodeCopied(false), 2000);
                          }}
                        >
                          {inviteCodeCopied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Members Header + Add Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-ink">Roster</h2>
                    <p className="text-sm text-ink-muted">
                      {tripMembers.length} member{tripMembers.length !== 1 ? "s" : ""}
                      {tripMembers.filter(m => m.is_ghost).length > 0 && (
                        <span className="ml-1">
                          · {tripMembers.filter(m => m.is_ghost).length} placeholder{tripMembers.filter(m => m.is_ghost).length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setMemberName("");
                      setMemberEmail("");
                      setIsMemberModalOpen(true);
                    }}
                    className="gap-2 bg-ink hover:bg-ink/90 text-white"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </Button>
                </div>

                {/* Members Grid */}
                {membersLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/80 rounded-xl p-4 border border-gray-100 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="h-3 w-16 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tripMembers.length === 0 ? (
                  <Card className="bg-white/80">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-ink mb-2">No members yet</h3>
                      <p className="text-ink-muted text-sm mb-4">
                        Add members to start building your trip roster
                      </p>
                      <Button 
                        onClick={() => setIsMemberModalOpen(true)}
                        className="gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add First Member
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tripMembers.map((member) => {
                      // Determine status
                      const isOrganizer = member.role === 'organizer' || member.role === 'captain';
                      const isGhost = member.is_ghost;
                      const isInvited = !isGhost && member.rsvp_status === 'pending';
                      const isJoined = !isGhost && member.rsvp_status === 'confirmed';
                      
                      // Get initials
                      const initials = member.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      // Avatar colors based on status
                      const avatarBg = isOrganizer 
                        ? "bg-action-primary text-white"
                        : isGhost 
                          ? "bg-gray-100 text-gray-500 border-2 border-dashed border-gray-300"
                          : isJoined
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700";

                      return (
                        <div 
                          key={member.id} 
                          className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${avatarBg}`}>
                                {isGhost ? (
                                  <Ghost className="w-5 h-5" />
                                ) : (
                                  initials
                                )}
                              </div>
                              
                              {/* Name & Details */}
                              <div className="min-w-0">
                                <h4 className="font-medium text-ink truncate">{member.name}</h4>
                                {member.email && (
                                  <p className="text-xs text-ink-muted truncate flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {member.email}
                                  </p>
                                )}
                                {isGhost && !member.email && (
                                  <p className="text-xs text-ink-muted italic">No email - placeholder</p>
                                )}
                              </div>
                            </div>

                            {/* Delete Button (on hover) */}
                            <button
                              onClick={() => handleMemberDelete(member.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Status Badge */}
                          <div className="mt-3 pt-3 border-t border-gray-50">
                            {isOrganizer && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-action-primary/10 text-action-primary text-xs font-medium rounded-full">
                                👑 Organizer
                              </span>
                            )}
                            {!isOrganizer && isJoined && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                                <Check className="w-3 h-3" /> Joined
                              </span>
                            )}
                            {!isOrganizer && isInvited && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                                <Mail className="w-3 h-3" /> Invited
                              </span>
                            )}
                            {!isOrganizer && isGhost && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                                <Ghost className="w-3 h-3" /> Placeholder
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Add Member Modal */}
            {isMemberModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                  onClick={() => setIsMemberModalOpen(false)} 
                />

                {/* Modal */}
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-ink">Add Member</h2>
                      <button 
                        onClick={() => setIsMemberModalOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleMemberSubmit} className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <Label htmlFor="member-name" className="text-sm font-medium text-ink">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="member-name"
                          placeholder="e.g., Mike Johnson"
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          required
                          className="mt-1.5"
                        />
                      </div>

                      {/* Email Field */}
                      <div>
                        <Label htmlFor="member-email" className="text-sm font-medium text-ink">
                          Email <span className="text-gray-400 font-normal">(optional)</span>
                        </Label>
                        <Input
                          id="member-email"
                          type="email"
                          placeholder="mike@example.com"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          className="mt-1.5"
                        />
                        <p className="text-xs text-ink-muted mt-1.5">
                          {memberEmail 
                            ? "An invite will be staged for this email" 
                            : "Leave blank to create a placeholder (Ghost Member) for planning"
                          }
                        </p>
                      </div>

                      {/* Ghost Member Info */}
                      {!memberEmail && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Ghost className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-ink">Creating a Placeholder</p>
                            <p className="text-ink-muted text-xs mt-0.5">
                              This person can be assigned expenses in the Ledger immediately, 
                              even before they join with their email.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsMemberModalOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmittingMember || !memberName.trim()}
                          className="flex-1 bg-ink hover:bg-ink/90 text-white"
                        >
                          {isSubmittingMember ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Adding...
                            </>
                          ) : memberEmail ? (
                            "Add & Invite"
                          ) : (
                            "Add Placeholder"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Rounds Tab */}
            <TabsContent value="rounds" className="tab-panel-animated">
              <div className="space-y-6 tab-content-animated">
                {/* Trip Leaderboard - Premium Dark Green */}
                <div className="premium-leaderboard premium-section">
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="premium-leaderboard-title">Trip Leaderboard</h3>
                    <span className="premium-rounds-badge">
                      {leaderboard?.rounds_count || 0} round{(leaderboard?.rounds_count || 0) !== 1 ? 's' : ''} played
                    </span>
                  </div>

                  {leaderboardLoading ? (
                    <div className="flex items-center justify-center py-8 relative z-10">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : !leaderboard?.leaderboard.length ? (
                    <div className="text-center py-8 relative z-10">
                      <Flag className="w-12 h-12 mx-auto mb-3 premium-empty-flag" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <p style={{ color: 'rgba(255,255,255,0.6)' }}>No scores logged yet</p>
                      <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Log a round to see the leaderboard</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10 relative z-10">
                      {leaderboard.leaderboard.map((entry, idx) => (
                        <div
                          key={entry.member_name}
                          className={`flex items-center justify-between py-4 premium-leaderboard-entry ${
                            idx === 0 ? 'premium-leader-row' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                              idx === 0 
                                ? 'bg-[#d4af37] text-[#1a3d2e]' 
                                : 'bg-white/10 text-white/70'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className={`font-medium text-lg ${idx === 0 ? 'text-[#d4af37]' : 'text-white'}`}>
                              {entry.member_name}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 relative z-10">
                            <span className={`text-3xl font-light ${idx === 0 ? 'text-[#d4af37]' : 'text-white'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {entry.average}
                            </span>
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>avg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rounds Section */}
                <Card className="premium-card premium-section overflow-hidden">
                  <CardHeader className="p-6 pb-5" style={{ borderBottom: '1px solid var(--cream-border)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: 'var(--text-primary)' }}>Rounds</CardTitle>
                        <CardDescription className="mt-1" style={{ color: 'var(--text-muted)' }}>Log scores for each round</CardDescription>
                      </div>
                      <button 
                        onClick={() => openRoundModal()}
                        className="premium-log-btn"
                      >
                        <Plus className="h-4 w-4 plus-icon" />
                        Log a Round
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {roundsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 rounded-full animate-spin" style={{ borderWidth: '2px', borderColor: 'var(--cream-border)', borderTopColor: 'var(--green-medium)' }} />
                      </div>
                    ) : rounds.length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <Flag className="w-12 h-12 mx-auto mb-4 premium-empty-icon" style={{ color: 'var(--text-faint)' }} />
                        <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No rounds played yet</h4>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                          Log your first round to start tracking scores
                        </p>
                        <button onClick={() => openRoundModal()} className="premium-log-btn" style={{ margin: '0 auto' }}>
                          <Plus className="h-4 w-4 plus-icon" />
                          Log a Round
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        {rounds.map((round, idx) => {
                          // Calculate best score and par difference
                          const scores = round.scores?.filter(s => s.score !== null) || [];
                          const bestScore = scores.length > 0 
                            ? Math.min(...scores.map(s => s.score!))
                            : null;
                          const parDiff = bestScore ? bestScore - 72 : null; // Assume par 72
                          
                          return (
                            <div 
                              key={round.id} 
                              className="premium-round-card"
                              onClick={() => openRoundModal(round)}
                              style={{ animationDelay: `${idx * 60}ms` }}
                            >
                              {/* Left side - Course info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-lg truncate" style={{ color: 'var(--text-primary)' }}>
                                  {round.course_name}
                                </h4>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                  {new Date(round.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>

                              {/* Right side - Score display */}
                              <div className="flex items-center gap-3 ml-4">
                                {bestScore !== null ? (
                                  <>
                                    <span className="premium-round-score">
                                      {bestScore}
                                    </span>
                                    {parDiff !== null && (
                                      <span className={`premium-score-badge ${
                                        parDiff < 0 
                                          ? 'under' 
                                          : parDiff > 0 
                                            ? 'over' 
                                            : 'even'
                                      }`}>
                                        {parDiff > 0 ? '+' : ''}{parDiff}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No scores</span>
                                )}
                                <svg 
                                  className="w-5 h-5 premium-round-chevron" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Log Round Modal */}
            {isRoundModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
                  onClick={closeRoundModal} 
                />

                {/* Modal */}
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
                    <h2 className="font-serif text-xl text-ink">
                      {editingRound ? 'Edit Round Scores' : 'Log a Round'}
                    </h2>
                    <button
                      onClick={closeRoundModal}
                      className="p-2 text-ink-muted hover:text-ink hover:bg-paper rounded-full transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleRoundSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">
                      {/* Course & Date - only for new rounds */}
                      {!editingRound && (
                        <>
                          <div>
                            <Label htmlFor="modal-course" className="text-sm font-medium text-ink-secondary mb-1.5 block">
                              Course Name
                            </Label>
                            <Input
                              id="modal-course"
                              name="course_name"
                              value={roundForm.course_name}
                              onChange={handleRoundFormChange}
                              placeholder="e.g., Pinehurst No. 2"
                              required
                              className="bg-paper"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="modal-date" className="text-sm font-medium text-ink-secondary mb-1.5 block">
                                Date
                              </Label>
                              <Input
                                type="date"
                                id="modal-date"
                                name="date"
                                value={roundForm.date}
                                onChange={handleRoundFormChange}
                                required
                                className="bg-paper"
                              />
                            </div>
                            <div>
                              <Label htmlFor="modal-format" className="text-sm font-medium text-ink-secondary mb-1.5 block">
                                Format
                              </Label>
                              <select
                                id="modal-format"
                                name="format"
                                value={roundForm.format}
                                onChange={handleRoundFormChange}
                                className="w-full px-3 py-2 bg-paper border border-border-default rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-action-primary/20"
                              >
                                <option value="stroke_play">Stroke Play</option>
                                <option value="stableford">Stableford</option>
                                <option value="skins">Skins</option>
                              </select>
                            </div>
                          </div>

                          <Separator />
                        </>
                      )}

                      {/* Scores Grid */}
                      <div>
                        <Label className="text-sm font-medium text-ink-secondary mb-3 block">
                          Total Gross Scores
                        </Label>
                        
                        {tripMembers.length === 0 ? (
                          <div className="text-center py-6 bg-muted/30 rounded-lg">
                            <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Add members to the trip first
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tripMembers.map((member) => {
                              const existingScore = roundForm.scores.find(s => s.member_name === member.name);
                              return (
                                <div key={member.id} className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-medium text-ink">
                                      {member.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="flex-1 font-medium text-ink">{member.name}</span>
                                  <Input
                                    type="number"
                                    min="50"
                                    max="200"
                                    placeholder="—"
                                    value={existingScore?.score ?? ''}
                                    onChange={(e) => handleScoreChange(member.name, e.target.value)}
                                    className="w-20 text-center bg-paper font-mono"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <Label htmlFor="modal-notes" className="text-sm font-medium text-ink-secondary mb-1.5 block">
                          Notes (optional)
                        </Label>
                        <textarea
                          id="modal-notes"
                          name="notes"
                          value={roundForm.notes}
                          onChange={handleRoundFormChange}
                          rows={2}
                          placeholder="Weather conditions, memorable moments..."
                          className="w-full px-3 py-2 bg-paper border border-border-default rounded-lg text-ink text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-action-primary/20 resize-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 border-t bg-muted/30 flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeRoundModal}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingRound || (!editingRound && !roundForm.course_name)}
                        className="flex-1 bg-ink hover:bg-ink/90 text-white"
                      >
                        {isSubmittingRound ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : editingRound ? (
                          'Save Scores'
                        ) : (
                          'Log Round'
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Ledger Tab - Combined Expenses & Balances */}
            <TabsContent value="ledger" className="tab-panel-animated">
              <Card className="overflow-hidden tab-content-animated">
                <CardHeader className="border-b bg-paper/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif">Trip Ledger</CardTitle>
                      <CardDescription>Track expenses and settle up</CardDescription>
                    </div>
                    <Button 
                      onClick={() => {
                        // Reset form and auto-select all members for equal split
                        setExpenseForm({
                          paid_by: tripMembers[0]?.name || "",
                          amount: "",
                          description: "",
                          category: "misc",
                          expense_date: new Date().toISOString().split("T")[0],
                          selectedMembers: tripMembers.map(m => m.name),
                        });
                        setExpenseSplitType("equal");
                        setIsExpenseModalOpen(true);
                      }}
                      className="gap-2 bg-ink hover:bg-ink/90 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Expense
                    </Button>
                  </div>

                  {/* Pill Toggle */}
                  <div className="flex gap-1 mt-4 p-1 bg-muted rounded-full w-fit">
                    <button
                      onClick={() => setLedgerView("balances")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                        ledgerView === "balances"
                          ? "bg-white text-ink shadow-sm"
                          : "text-muted-foreground hover:text-ink"
                      }`}
                    >
                      Balances
                    </button>
                    <button
                      onClick={() => setLedgerView("transactions")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                        ledgerView === "transactions"
                          ? "bg-white text-ink shadow-sm"
                          : "text-muted-foreground hover:text-ink"
                      }`}
                    >
                      Transactions
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* BALANCES VIEW */}
                  {ledgerView === "balances" && (
                    <div className="p-6">
                      {balancesLoading || expensesLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-ink border-t-transparent mb-2" />
                          <p className="text-muted-foreground text-sm">Calculating balances...</p>
                        </div>
                      ) : (!balances || balances.members.length === 0) && expenses.length === 0 ? (
                        /* Mock data preview when no expenses */
                        <div className="space-y-6">
                          <div className="text-center py-4 px-6 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-amber-700 text-sm">
                              Preview mode — Add your first expense to start tracking
                            </p>
                          </div>
                          
                          {/* Mock balances */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm opacity-60">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <span className="text-emerald-700 font-medium">C</span>
                                </div>
                                <span className="font-medium text-ink">Charlie</span>
                              </div>
                              <span className="text-emerald-600 font-semibold">is owed $250</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm opacity-60">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                                  <span className="text-rose-700 font-medium">M</span>
                                </div>
                                <span className="font-medium text-ink">Mike</span>
                              </div>
                              <span className="text-rose-600 font-semibold">owes $125</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm opacity-60">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                                  <span className="text-rose-700 font-medium">J</span>
                                </div>
                                <span className="font-medium text-ink">John</span>
                              </div>
                              <span className="text-rose-600 font-semibold">owes $125</span>
                            </div>
                          </div>

                          {/* Mock settlement */}
                          <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">To Settle Up</h4>
                            <div className="space-y-2 opacity-60">
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                <span className="font-medium">Mike</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">Charlie</span>
                                <span className="ml-auto font-semibold text-ink">$125.00</span>
                              </div>
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                <span className="font-medium">John</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">Charlie</span>
                                <span className="ml-auto font-semibold text-ink">$125.00</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Real balances */
                        <div className="space-y-6">
                          {/* Member balance cards */}
                          <div className="space-y-3">
                            {balances?.members.map((m) => (
                              <div key={m.member} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    m.net > 0 ? "bg-emerald-100" : m.net < 0 ? "bg-rose-100" : "bg-gray-100"
                                  }`}>
                                    <span className={`font-medium ${
                                      m.net > 0 ? "text-emerald-700" : m.net < 0 ? "text-rose-700" : "text-gray-700"
                                    }`}>
                                      {m.member.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-medium text-ink">{m.member}</span>
                                </div>
                                <span className={`font-semibold ${
                                  m.net > 0 ? "text-emerald-600" : m.net < 0 ? "text-rose-600" : "text-gray-500"
                                }`}>
                                  {m.net > 0 
                                    ? `is owed $${m.net.toFixed(2)}` 
                                    : m.net < 0 
                                      ? `owes $${Math.abs(m.net).toFixed(2)}`
                                      : "settled up"}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Settlement suggestions */}
                          {balances && balances.transfers.length > 0 && (
                            <div className="pt-4 border-t">
                              <h4 className="text-sm font-medium text-muted-foreground mb-3">To Settle Up</h4>
                              <div className="space-y-2">
                                {balances.transfers.map((t, i) => (
                                  <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                    <span className="font-medium">{t.from}</span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="font-medium">{t.to}</span>
                                    <span className="ml-auto font-semibold text-ink">${t.amount.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {balances && balances.transfers.length === 0 && (
                            <div className="pt-4 border-t text-center">
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                                <Scale className="w-4 h-4" />
                                All settled up!
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TRANSACTIONS VIEW */}
                  {ledgerView === "transactions" && (
                    <div>
                      {expensesLoading ? (
                        <div className="text-center py-12">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-ink border-t-transparent mb-2" />
                          <p className="text-muted-foreground text-sm">Loading transactions...</p>
                        </div>
                      ) : expenses.length === 0 ? (
                        /* Mock transaction when empty */
                        <div className="divide-y">
                          <div className="text-center py-4 px-6 bg-amber-50 border-b border-amber-200">
                            <p className="text-amber-700 text-sm">
                              Preview mode — Add your first expense to start tracking
                            </p>
                          </div>
                          <div className="p-4 flex items-center gap-4 opacity-60">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-700">🏠</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-ink">Airbnb Deposit</div>
                              <div className="text-sm text-muted-foreground">
                                Paid by Charlie • Lodging
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-ink">$500.00</div>
                              <div className="text-xs text-muted-foreground">Split 3 ways</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Real transactions */
                        <div className="divide-y">
                          {expenses.map((expense) => {
                            const categoryEmoji: Record<string, string> = {
                              lodging: "🏠",
                              meals: "🍽️",
                              golf: "⛳",
                              travel: "✈️",
                              misc: "📦",
                            };
                            return (
                              <div key={expense.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  expense.category === "lodging" ? "bg-purple-100" :
                                  expense.category === "meals" ? "bg-orange-100" :
                                  expense.category === "golf" ? "bg-emerald-100" :
                                  expense.category === "travel" ? "bg-blue-100" :
                                  "bg-gray-100"
                                }`}>
                                  <span>{categoryEmoji[expense.category] || "📦"}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-ink">{expense.description}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Paid by {expense.paid_by} • {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-ink">${expense.amount.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Split {expense.splits?.length || 1} way{(expense.splits?.length || 1) !== 1 ? "s" : ""}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                                  onClick={() => handleExpenseDelete(expense.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Edit Trip Modal */}
      {trip && (
        <EditTripModal
          trip={trip}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={refreshTrip}
        />
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsExpenseModalOpen(false)} 
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-serif text-xl text-ink">Add Expense</h2>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-ink hover:bg-muted rounded-full transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                await handleExpenseSubmit(e);
                if (!error) setIsExpenseModalOpen(false);
              }} 
              className="p-6 space-y-5"
            >
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                  What was it?
                </label>
                <Input 
                  name="description"
                  value={expenseForm.description} 
                  onChange={handleExpenseFormChange}
                  placeholder="e.g., Dinner at The Deuce"
                  className="w-full"
                  required 
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                  How much?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    name="amount"
                    value={expenseForm.amount} 
                    onChange={handleExpenseFormChange}
                    placeholder="0.00"
                    className="pl-7"
                    required 
                  />
                </div>
              </div>

              {/* Payer */}
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                  Who paid?
                </label>
                <Select 
                  value={expenseForm.paid_by} 
                  onValueChange={(value: string) => setExpenseForm(c => ({ ...c, paid_by: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {tripMembers.map((m) => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Split Type */}
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                  How to split?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExpenseSplitType("equal");
                      // Auto-select all members
                      setExpenseForm(c => ({ ...c, selectedMembers: tripMembers.map(m => m.name) }));
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                      expenseSplitType === "equal"
                        ? "bg-ink text-white border-ink"
                        : "bg-white text-ink border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Split Equally
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseSplitType("select")}
                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                      expenseSplitType === "select"
                        ? "bg-ink text-white border-ink"
                        : "bg-white text-ink border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Select People
                  </button>
                </div>
              </div>

              {/* Member Selection (only if "Select People") */}
              {expenseSplitType === "select" && (
                <div>
                  <label className="block text-sm font-medium text-ink-secondary mb-2">
                    Who's splitting this?
                  </label>
                  {tripMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Add members first</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tripMembers.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleMemberCheckboxChange(m.name, !expenseForm.selectedMembers.includes(m.name))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            expenseForm.selectedMembers.includes(m.name)
                              ? "bg-ink text-white"
                              : "bg-gray-100 text-ink hover:bg-gray-200"
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category (collapsed) */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                    Category
                  </label>
                  <Select 
                    value={expenseForm.category} 
                    onValueChange={(value: string) => setExpenseForm(c => ({ ...c, category: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="misc">Misc</SelectItem>
                      <SelectItem value="lodging">Lodging</SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="golf">Golf</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                    Date
                  </label>
                  <Input 
                    type="date" 
                    name="expense_date"
                    value={expenseForm.expense_date} 
                    onChange={handleExpenseFormChange}
                    required 
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsExpenseModalOpen(false)}
                  disabled={isSubmittingExpense}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingExpense || !expenseForm.paid_by || expenseForm.selectedMembers.length === 0}
                  className="flex-1 bg-ink hover:bg-ink/90 text-white"
                >
                  {isSubmittingExpense ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
        </AppShell>
      </div>
    </div>
  );
}
