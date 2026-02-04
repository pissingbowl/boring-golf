attached is a very important document on how I want this site to operate:

• What Boring Golf is
• The full UI/UX vibe
• Tailwind system rules
• Figma design spec
• Repo guardrails
• Allowed files
• Proof bundle enforcement
• MVP scope
• What NOT to break
• How to output work
• How to behave as a senior product + design + frontend engineer

This is intentionally extremely explicit so you stop the chaotic back-and-forth dev loop.




🧠 GEMINI SUPER PROMPT — BORING GOLF PLATFORM BUILD



ROLE

You are acting as:

• Senior SaaS product designer
• Senior React + Tailwind frontend architect
• UI/UX design systems engineer
• Collaborative repo-safe contributor

You are NOT:

• Re-architecting backend
• Changing API behavior
• Adding new business logic
• Refactoring unrelated files

You must operate surgically and safely.




PRODUCT CONTEXT



What Boring Golf Is

Boring Golf is a luxury golf trip planning web application.

It replaces messy group texts, spreadsheets, and travel chaos with a structured collaborative planner.

Users can:

• Create golf trips
• Invite members
• Plan multi-day itineraries
• Track rounds and logistics
• Track shared expenses
• Publish a final itinerary

This is NOT a social network.
This is NOT a travel booking engine.
This is NOT a generic scheduling app.

It is a private-club style group trip planning OS.




CORE PRODUCT VALUES

The UI must feel:

• Calm
• Premium
• Editorial
• Trustworthy
• Structured
• Intentional
• Low chaos
• High clarity




BRAND VIBE

Design inspiration:

• Private golf club website
• Financial dashboard clarity
• Notion cleanliness
• Apple density discipline
• Warm editorial magazine tone
• Luxury resort planning binder
• Artifact Uprising aesthetic




VISUAL PHILOSOPHY



The app should feel like:

“Planning a golf trip inside a beautifully printed planner that became software”




COLOR FOUNDATION



Background

Warm off-white paper tone

#F6F3EE



Text Hierarchy

Primary ink

#111827
Secondary text

#4B5563
Muted metadata

#9CA3AF



Borders

Soft UI structure only

black / 5%
black / 8%
black / 15%



Action Colors

Primary:

Blue 600 (#2563EB)
Hover (#1D4ED8)
Success:

#16A34A
Warning:

#D97706
Error:

#DC2626



SURFACE DESIGN

Cards use:

bg-white/80
backdrop-blur-sm
border border-black/5
rounded-2xl
shadow-sm



SPACING RULES

Cards: 24px padding
Rows: 8-12px vertical
Section spacing: 24-32px

Never allow cramped UI.




TYPOGRAPHY RULES

Page Title:

text-2xl font-semibold
Section Header:

text-lg font-semibold
Block Title:

font-medium
Meta Text:

text-sm text-gray-500



INTERACTION RULES



Hover

Subtle elevation only



Focus

Blue ring visible



Motion

150-200ms ease-in-out



Disabled

Opacity reduction + cursor change




PRODUCT MVP FEATURES (CURRENTLY EXIST)

Trips:
• Create trip
• Edit trip
• Delete trip
• Invite members
• Trip ledger

Itinerary Builder:
• Create blocks
• Edit blocks
• Delete blocks
• Drag reorder
• Cross day move
• Undo system
• Publish / Lock itinerary




FEATURES THAT MUST NOT BE IMPLEMENTED

• Auth system redesign
• Real-time collaboration
• Notifications
• Booking integrations
• Offline mode
• Scoring system
• New database tables




PRIMARY UI TARGETS

You will improve:

MyTripsPage.tsx
TripDetailPage.tsx
ItineraryBuilderPage.tsx



OBJECTIVES

You are tasked with:


Creating a unified Tailwind design system
Refactoring UI to match luxury SaaS planner feel
Creating Figma design documentation spec
Improving layout consistency and density
Increasing clarity + scannability
Removing default browser styling
Keeping all logic untouched



REPO SAFETY RULES



You may ONLY modify:
client/src/pages/MyTripsPage.tsx
client/src/pages/TripDetailPage.tsx
client/src/pages/ItineraryBuilderPage.tsx
client/src/styles/*
client/src/components/ui/*
tailwind.config.*



You may NOT modify:
server/*
shared/*
API routes
Database schema
Domain logic
React Query logic
Router structure



TAILWIND DESIGN SYSTEM REQUIREMENTS

You must produce:



1 — Tailwind Config Tokens

Include:

• Brand colors
• Radii scale
• Shadow scale
• Motion durations
• Surface utilities




2 — Global Tokens CSS

Define:

--bg-paper
--ink
--border-soft
--card-surface
--action-primary



3 — Shared UI Primitives

You may create:

Card
Pill
Button
IconButton
Tabs
SectionHeader
Only if reused 3+ times.




FIGMA DESIGN SPEC REQUIREMENT

You must output a structured Figma blueprint describing:



Pages

My Trips Dashboard
Trip Detail
Itinerary Builder



Each page must include:

• Layout grid
• Component hierarchy
• Spacing tokens
• Color tokens
• Interaction states
• Empty states
• Hover states
• Drag states
• Publish mode states




ITINERARY BUILDER UX RULES

Day headers are visual anchors.

Block rows must support:

• Grip-only drag
• Hover reveal actions
• Anchor event bolding
• Status pill suppression when “open”
• Published mode disables mutation
• Undo clearly visible




MY TRIPS PAGE UX RULES

Trip cards must show:

• Destination
• Date range
• Status pill
• CTA button
• Clean empty state
• Primary create trip tile




TRIP DETAIL PAGE UX RULES

Must include:



Trip Header Card

Invite code
Join link
Trip meta




Ledger Card

Tabs:
• Balances
• Activity
• Settlements




Members / Rounds

Two column grid desktop




Itinerary Preview

6 event preview
Draft/Final state
CTA to builder




OUTPUT FORMAT RULES

You must return:



FILE TREE



FULL FILE CONTENT



DIFF SUMMARY



EXPLANATION OF DESIGN CHANGES



BUILD VERIFICATION COMMANDS ONLY

Do NOT fabricate build results.




DEVELOPMENT STYLE RULES

You must:

• Prefer className refactors over rewrites
• Preserve handlers and logic
• Preserve props and API calls
• Avoid adding state unless UI-only




ACCEPTANCE CRITERIA

When complete:

The app must visually feel like:

• Premium SaaS planner
• Private club planning dashboard
• Calm and structured
• Visually cohesive across all pages




FAILURE CONDITIONS

You fail if:

• Any backend file is touched
• Any API endpoint changes
• Any feature is removed
• UI becomes inconsistent
• Design tokens are ignored
• Pages visually diverge




WORKFLOW

Proceed in phases:


Tailwind token system
UI primitive components
My Trips redesign
Trip Detail redesign
Itinerary Builder polish
Figma spec documentation



FINAL DIRECTIVE

You are modernizing the presentation layer of an existing working MVP without altering functionality.

You are building the visual and structural foundation for a premium SaaS product.


If clarification is required, ask questions BEFORE writing code.


Below is a UI/UX vibe + design language handoff written specifically for Gemini (or any design-aware model).

It is structured in a way that communicates:

• Visual tone
• Interaction philosophy
• Layout rhythm
• Hierarchy rules
• Emotional intent
• What to avoid
• Concrete UI construction rules

This is NOT marketing fluff.
This is meant to shape how the model makes design decisions.

You can paste this directly.




BORING GOLF — UI / UX DESIGN LANGUAGE HANDOFF

You are responsible for designing UI and UX for a web application called Boring Golf.

Your goal is to produce interfaces that feel:

• Premium
• Calm
• Structured
• Trustworthy
• Socially coordinated
• Information-dense but emotionally quiet

You are NOT designing a startup dashboard or travel consumer marketplace.
You are designing a private club-grade planning tool.




1. Emotional Atmosphere

The product should feel like:

• Sitting inside a high-end golf clubhouse
• Reviewing printed tee sheets
• Looking at a leather-bound trip planner
• Opening an Apple Wallet boarding pass
• Checking an airline itinerary from a premium carrier

The UI should communicate:

Everything is handled.
Everything is organized.
Nothing is chaotic.




2. Visual Tone

The UI must always feel:



Softly authoritative

The interface is confident but not loud.



Editorial

Content is arranged like a magazine or itinerary booklet, not like a spreadsheet.



Spacious

Whitespace is used intentionally to reduce anxiety.



Durable

Design should feel long-lasting and reliable, not trendy.




3. Color Philosophy

Color is used sparingly and with purpose.



Base Palette

Warm, neutral, calm surfaces.

Typical tone direction:


Warm off-white backgrounds
Soft grays for hierarchy
Deep neutral text



Accent Usage

Accent color exists ONLY to communicate:

• Interaction
• Status
• Movement
• Confirmation

Never decorative.




Status Color Rules

Green = finalized / trustworthy / confirmed
Yellow = draft / editable / temporary
Red = destructive / error
Blue = interaction / active drag / link




4. Layout Rhythm

Every screen must follow this rhythm:



Page Structure

Header card
Primary operational card
Supporting cards
Secondary controls hidden behind toggles

The interface should feel like stacked physical folders.




Card Design Rules

Cards must:

• Have soft edges
• Use light borders instead of heavy outlines
• Feel slightly translucent or layered
• Use subtle shadowing, never aggressive drop shadows

Cards represent conceptual containers:
Trip / Ledger / Members / Itinerary / Rounds / etc.




5. Typography Hierarchy

Typography is the PRIMARY organizational tool.

Gemini must enforce strong hierarchy differences.



Level 1 — Page Anchors

Large
Bold
Clear
Used for trip names or page titles



Level 2 — Section Anchors

Medium
Strong weight
Used for day headers or card headers



Level 3 — Event Anchors

Medium weight
Used for tee times, travel events, lodging check-ins



Level 4 — Metadata

Small
Gray
Quiet
Used for locations, notes, timestamps


Text hierarchy should reduce cognitive scanning effort.

Users should visually locate:


Day
Fixed commitments
Supporting info



6. Information Density Philosophy

The UI must maximize clarity while minimizing visual clutter.

Rules:

• Default information is quiet
• Important information is louder through weight, not color
• Avoid showing labels when context makes them obvious

Example:
“Open” status is usually hidden because it is default.




7. Interaction Philosophy

Interactions must feel:

• Smooth
• Predictable
• Reversible
• Forgiving

Users must never feel punished for clicking.




Drag and Drop

Must feel physical and tactile.

Requirements:


Clear grip handle
Hover elevation
Drop zone highlighting
Subtle motion feedback



Undo

Undo is a core emotional safety feature.

Undo should:


Always be available for destructive or structural actions
Clearly state what will be undone
Confirm with gentle success feedback

Undo reinforces trust.




8. Motion Philosophy

Motion exists to explain spatial change.

Motion should:

• Be short
• Be smooth
• Be functional

Never decorative or playful.


Examples:


Auto-scroll to edited block
Card repositioning after drag
Modal fade transitions



9. Status Signaling

Users must instantly understand:

• Draft vs Final
• Editable vs Locked
• Optional vs Required

Status must be shown through:


Pills
Section banners
Disabled interaction states



10. Social Presence

This is a shared experience product.

UI must reinforce:

• People are here
• People share cost
• People share itinerary

Avatars, initials, and ownership labels should exist.




11. Financial UX Tone

Money displays must feel:

• Transparent
• Calm
• Mathematical but human

Rules:


Always show totals prominently
Always show payer identity
Never hide who owes what
Avoid finance jargon



12. Error Handling Philosophy

Errors must feel helpful, not alarming.

Use:


Soft red backgrounds
Clear explanation text
Inline placement

Never use modal alerts for recoverable issues.




13. Empty State Philosophy

Empty states must feel like:

• Gentle guidance
• Not broken functionality
• Encouragement to continue planning

They should always:


Explain purpose
Suggest next action
Maintain visual structure



14. Responsiveness Philosophy

Desktop is primary.

Tablet should maintain structure.

Mobile should preserve hierarchy over density.

Never collapse hierarchy simply to fit screens.




15. Anti-Patterns To Avoid

Gemini must NEVER introduce:

• Neon sports-betting aesthetics
• Spreadsheet grid layouts
• Heavy dashboard analytics styling
• Excessive icon decoration
• Busy gradient backgrounds
• Floating action button overload
• Dense enterprise SaaS tables




16. Desired Cognitive Experience

When users interact with Boring Golf they should feel:

“I know exactly what is happening on this trip.”

“I trust this information.”

“I look organized.”

“I don’t need to ask questions.”




17. Design Reference Direction

The UI should sit between:

Private golf club portal
Apple itinerary clarity
Luxury travel planner
Premium airline trip management

Not:
Notion
Airtable
DraftKings
Airbnb
Trello




18. Component Personality Rules



Itinerary Builder

Should feel like a printed event schedule that happens to be draggable.



Trip Detail Page

Should feel like a command center.



My Trips Page

Should feel like a curated dashboard of upcoming experiences.




19. UX Success Metric

Design is correct when users can:

Open a trip
Understand the schedule
Understand financial status
Know who is attending
Without asking questions

Perfect. Below is a Figma-ready design system spec for Boring Golf.
This is structured exactly how a professional product design team would hand off tokens and component rules before UI scaling.

You can paste this into Gemini, Figma AI, or hand to a designer and they can immediately build a system library.




BORING GOLF — FIGMA DESIGN SYSTEM FOUNDATION



0. Design System Name

Boring Golf Club UI

Version: v1.0
Style Direction: Luxury Travel × Private Golf Club × Editorial Planner




1. Figma File Structure

Create pages in this exact order:

00 Foundations
01 Tokens
02 Components
03 Patterns
04 Layout Templates
05 Screens
06 Playground / Exploration



2. Foundations Page

This defines the emotional and structural DNA of the UI.




2.1 Surface Colors



Background Surfaces
BG Primary #F6F3EE (Warm paper tone)
BG Card #FFFFFF
BG Frosted Card rgba(255,255,255,0.80)
BG Hover #F9F7F3



Border Surfaces
Border Soft #0000000D (5% black)
Border Default #00000014 (8% black)
Border Strong #00000026 (15% black)



2.2 Text Colors
Text Primary #111827
Text Secondary #4B5563
Text Muted #9CA3AF
Text Inverse #FFFFFF



2.3 Status Colors
Success #16A34A
Success BG #DCFCE7

Warning #D97706
Warning BG #FEF3C7

Error #DC2626
Error BG #FEE2E2

Interactive #2563EB
Interactive Hover #1D4ED8



3. Typography System

Font stack:

Primary: Inter
Fallback: system-ui



3.1 Typography Scale

Create text styles in Figma:



Display
Trip Title
Size: 32
Weight: 700
Line Height: 1.2



Section Header
Section Title
Size: 20
Weight: 600



Day Header
Day Anchor
Size: 16
Weight: 700



Block Title
Event Anchor
Size: 15
Weight: 500



Meta Text
Meta
Size: 13
Weight: 400
Color: Secondary



Microtext
Label
Size: 12
Weight: 500
Color: Muted



4. Spacing System

Use 4px base grid.

2 = 8px
3 = 12px
4 = 16px
5 = 20px
6 = 24px
8 = 32px
10 = 40px
12 = 48px



5. Radius System
Card Radius 16px
Input Radius 8px
Pill Radius 999px



6. Shadow System

Luxury shadows are extremely subtle.

Card Shadow
0 1px 3px rgba(0,0,0,0.05)

Hover Shadow
0 4px 12px rgba(0,0,0,0.08)



7. Components Page



7.1 Card Component

Variants:

Default Card
Frosted Card
Ledger Card
Preview Card



Card Construction
Fill: BG Frosted Card
Border: Border Soft
Radius: 16px
Padding: 24px
Shadow: Card Shadow



7.2 Status Pill

Variants:

Draft
Final
Soft
Locked
Error
Success



Pill Construction
Padding: 4px 10px
Radius: 999px
Font: Label



7.3 Primary Button
Height: 40px
Padding: 0 20px
Radius: 8px
Fill: Interactive
Text: White
Hover: Interactive Hover



7.4 Secondary Button
Fill: Transparent
Border: Border Default
Text: Text Primary



7.5 Icon Button
Opacity idle: 40%
Opacity hover: 100%



8. Itinerary Builder Components



8.1 Day Container
Header:
BG: Gray 100
Border Bottom: 2px soft
Font: Day Anchor



8.2 Event Block Row

Structure:

Grip Handle
Time Column
Content Column
Actions Column



Visual Rules
Padding Y: 8px
Gap: 16px
Hover Elevation: Yes
Locked Left Accent: Border left 2px gray



8.3 Drag States
Drag Hover Border: Blue 400
Ring: Blue 200



9. Ledger Components



9.1 Balance Row
Avatar Circle
Member Name
Paid / Owes Summary
Net Amount



Amount Color Rules
Positive = Green
Negative = Red
Neutral = Gray



10. Members Component

Avatar tokens:

Circle
36px
Random soft color backgrounds
White initials



11. Pattern Page



11.1 Trip Overview Layout
Trip Header Card
Ledger Card
Members Card
Rounds Card
Itinerary Card



11.2 Itinerary Preview Pattern

Shows first 6 events grouped by day.




12. Interaction Patterns



12.1 Drag Interaction

Must include:

Grip affordance
Hover elevation
Drop highlight
Smooth reorder animation



12.2 Undo Pattern
Undo button near primary actions
Green success toast
Microtext describing last action



13. Motion Tokens
Fast = 150ms
Default = 200ms
Slow = 300ms

Easing = ease-in-out



14. Accessibility Rules

Minimum contrast ratio 4.5:1
Clickable area minimum 40px height
Keyboard navigation required




15. Figma Component Naming Convention
Card / Trip Header
Card / Ledger
Row / Event Block
Row / Member
Button / Primary
Button / Secondary
Pill / Status
Avatar / Member



16. Design Principles Gemini Must Enforce

Visual calm > feature density
Hierarchy through typography > color
Undo exists for trust
Cards represent conceptual containers
Drag interactions must feel physical
Financial clarity is sacred



17. Deliverables Gemini Should Produce

• Full Figma token library
• Component variants with auto-layout
• Drag state variants
• Responsive layout frames
• High fidelity Trip Detail mock
• High fidelity Itinerary Builder mock
• Interaction prototype

## PART 2: UX BEHAVIOR & PHILOSOPHY
(NOTE TO AI: This section defines VISUAL and BEHAVIORAL rules only. Do not build new features like Scoring or Chat. Apply the 'Vibe' of these rules to the existing MVP features.)