import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type FormState = {
  inviteCode: string;
  name: string;
};

export default function JoinTripPage() {
  const [searchParams] = useSearchParams();
  const [formState, setFormState] = useState<FormState>({
    inviteCode: "",
    name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setFormState((current) => ({ ...current, inviteCode: codeParam.toUpperCase() }));
    }
  }, [searchParams]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const finalValue = name === "inviteCode" ? value.toUpperCase() : value;
    setFormState((current) => ({ ...current, [name]: finalValue }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      invite_code: formState.inviteCode.toUpperCase().trim(),
      name: formState.name.trim(),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem("tripMemberId", data.member.id);
      localStorage.setItem("tripId", data.trip_id);
      localStorage.setItem("memberName", data.member.name);
      navigate(`/trips/${data.trip_id}?joined=true`);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to join trip";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Join Trip</h1>
      <p>Enter the invite code you received to join a trip.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>
            Invite Code
            <input
              name="inviteCode"
              value={formState.inviteCode}
              onChange={handleChange}
              placeholder="e.g., FUJYFJV7"
              maxLength={8}
              required
              style={{
                textTransform: "uppercase",
                fontFamily: "monospace",
                fontSize: "1.2em",
                padding: "8px 12px",
              }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            Your Name
            <input
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="e.g., John Smith"
              required
            />
          </label>
        </div>
        {error ? (
          <p style={{ color: "red", marginBottom: 16 }}>Error: {error}</p>
        ) : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining..." : "Join Trip"}
        </button>
      </form>
    </div>
  );
}
