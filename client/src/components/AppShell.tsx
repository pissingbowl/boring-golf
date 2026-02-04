import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  /** Hide the header (for landing page) */
  hideHeader?: boolean;
  /** Max width variant */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "full";
  /** Custom className for main content */
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-full",
};

export function AppShell({
  children,
  hideHeader = false,
  maxWidth = "5xl",
  className,
}: AppShellProps) {
  const location = useLocation();

  const navItems = [
    { href: "/my-trips", label: "My Trips" },
    { href: "/create-trip", label: "New Trip" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className={cn("mx-auto flex h-14 items-center px-6", maxWidthClasses[maxWidth])}>
            {/* Logo */}
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">Boring Golf</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-6 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    location.pathname === item.href
                      ? "text-foreground font-medium"
                      : "text-foreground/60"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side spacer for future actions */}
            <div className="ml-auto flex items-center gap-2" />
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={cn("mx-auto px-6 py-8", maxWidthClasses[maxWidth], className)}>
        {children}
      </main>
    </div>
  );
}

export default AppShell;
