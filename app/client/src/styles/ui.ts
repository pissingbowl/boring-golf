/**
 * Design tokens for consistent UI styling across the app.
 * Use these className strings with cn() for composability.
 */

// =============================================================================
// LAYOUT
// =============================================================================

export const layout = {
  /** Page container with max width and padding */
  page: "mx-auto max-w-5xl px-6 py-8",
  /** Narrower page for forms */
  pageNarrow: "mx-auto max-w-2xl px-6 py-8",
  /** Section spacing */
  section: "space-y-6",
  /** Stack items vertically with small gap */
  stack: "flex flex-col gap-4",
  /** Stack items vertically with larger gap */
  stackLg: "flex flex-col gap-6",
  /** Inline items horizontally */
  inline: "flex items-center gap-4",
  /** Inline items with space between */
  inlineBetween: "flex items-center justify-between",
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  /** Page title (h1) */
  pageTitle: "text-3xl font-bold tracking-tight",
  /** Section title (h2) */
  sectionTitle: "text-xl font-semibold tracking-tight",
  /** Card title */
  cardTitle: "text-lg font-semibold",
  /** Subsection title (h3) */
  subtitle: "text-base font-medium",
  /** Body text */
  body: "text-sm text-foreground",
  /** Muted/secondary text */
  muted: "text-sm text-muted-foreground",
  /** Small helper text */
  caption: "text-xs text-muted-foreground",
  /** Error text */
  error: "text-sm text-destructive",
  /** Success text */
  success: "text-sm text-green-600",
} as const;

// =============================================================================
// CARDS
// =============================================================================

export const card = {
  /** Standard card */
  base: "rounded-xl border bg-card text-card-foreground shadow-sm",
  /** Card with hover effect */
  interactive: "rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
  /** Card header area */
  header: "flex flex-col space-y-1.5 p-6",
  /** Card content area */
  content: "p-6 pt-0",
  /** Card footer area */
  footer: "flex items-center p-6 pt-0",
  /** Card with padding all around */
  padded: "rounded-xl border bg-card p-6 shadow-sm",
} as const;

// =============================================================================
// BUTTONS
// =============================================================================

export const button = {
  /** Primary action button */
  primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  /** Secondary/outline button */
  secondary: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  /** Ghost/subtle button */
  ghost: "hover:bg-accent hover:text-accent-foreground",
  /** Destructive/danger button */
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  /** Link style button */
  link: "text-primary underline-offset-4 hover:underline",
  /** Button base styles */
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  /** Small button size */
  sm: "h-8 rounded-md px-3 text-xs",
  /** Default button size */
  md: "h-9 px-4 py-2",
  /** Large button size */
  lg: "h-10 rounded-md px-8",
} as const;

// =============================================================================
// FORMS
// =============================================================================

export const form = {
  /** Form field wrapper */
  field: "space-y-2",
  /** Form label */
  label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  /** Form input */
  input: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  /** Form textarea */
  textarea: "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  /** Form helper/description text */
  helper: "text-xs text-muted-foreground",
  /** Form error message */
  error: "text-xs text-destructive",
  /** Horizontal form layout */
  horizontal: "grid gap-4 sm:grid-cols-2",
} as const;

// =============================================================================
// STATUS & FEEDBACK
// =============================================================================

export const status = {
  /** Success banner */
  success: "rounded-lg bg-green-50 border border-green-200 p-4 text-green-700",
  /** Error banner */
  error: "rounded-lg bg-red-50 border border-red-200 p-4 text-red-700",
  /** Warning banner */
  warning: "rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-yellow-700",
  /** Info banner */
  info: "rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-700",
  /** Status pill base */
  pill: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  /** Draft status pill */
  draft: "bg-yellow-100 text-yellow-700",
  /** Published/Active status pill */
  active: "bg-green-100 text-green-700",
  /** Pending status pill */
  pending: "bg-gray-100 text-gray-700",
} as const;

// =============================================================================
// LISTS & TABLES
// =============================================================================

export const list = {
  /** List container */
  container: "divide-y divide-border rounded-lg border",
  /** List item */
  item: "flex items-center justify-between p-4",
  /** List item with hover */
  itemHover: "flex items-center justify-between p-4 transition-colors hover:bg-muted/50",
  /** Empty state */
  empty: "flex flex-col items-center justify-center py-12 text-center",
} as const;

// =============================================================================
// MISC
// =============================================================================

export const misc = {
  /** Divider line */
  divider: "h-px bg-border",
  /** Badge/tag */
  badge: "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  /** Avatar placeholder */
  avatar: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted",
  /** Code/monospace text */
  code: "rounded bg-muted px-1.5 py-0.5 font-mono text-sm",
} as const;
