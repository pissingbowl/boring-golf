# Golf Trip Operator System - Design Guidelines

## Core Design Philosophy

**Mental Model**: This is a live coordination surface between a complex, moving schedule and people who don't want to think about it. Your job is to disappear.

**North Star Rule**: The interface should answer questions faster than a human could ask them. Everything either removes a question or creates one. Only the first is allowed.

## Two Distinct Interfaces

### 1. Guest Command App (Mobile-First PWA)

**Context**: Distracted, outdoors, possibly drinking, phone in one hand, sunlight glare.

**Screen Hierarchy (Absolute Priority)**:
- NOW (dominant)
- NEXT (secondary)
- LATER (whisper)

**NOW Screen Design**:
- One vertical column, no scrolling
- Time is the largest text element
- Location secondary
- Action obvious (map link)
- Feels like a departure board or cockpit callout, not an app

**Typography**:
- Fewer weights, bigger text
- Must be readable at arm's length in sunlight
- Neutral typefaces only
- No clever fonts

**Color Usage**:
- Functional only: change, warning, confirmation
- Most interface feels monochrome
- Red is rare, yellow is thoughtful, green is implied

**Interactions**:
- One tap = one thing
- Massive tap targets
- No hidden gestures, long presses, or tooltips
- No tutorials needed

**Live Scoring**:
- Design like paper scorecard + buttons
- Clear "saved" vs "synced" states
- No animations on submit
- Offline-first with sync indicators

**Messaging/Announcements**:
- Bulletin board feel, not chat
- Chronological, no avatars, no reactions
- No reply affordances

**Help Button**:
- Feels like calling front desk
- Calm, neutral, non-performative
- Just status and resolution

### 2. Operator Console (Desktop)

**Context**: Focused, accountable, managing risk, moving pieces.

**Overall Feel**: Flight operations system or show run-of-show board. Not a CRM or project management tool.

**Dashboard**:
- Risk surface, not homepage
- Nothing urgent unless it is
- Issues surface quietly
- Absence of alerts feels reassuring

**Timeline Builder**:
- Blocks feel physical
- Dependencies visible
- Editing shows consequences before commit
- Impact preview required before publish

**Impact Preview UX**:
- Shows exactly which guests affected
- Shows how NOW/NEXT/LATER changes
- Requires explicit publish

**Tournament Admin**:
- Rules sheet + scoreboard
- Transparency beats delight

**Issues/Incident Command**:
- Boring in the best way
- Lists, states, ownership, resolution
- No urgency theater, calm resolution

## Universal Visual Language

**Shapes**: Rectangles > rounded pills, straight lines > playful curves

**Shadows**: Very light, hierarchy only, not decoration

**Motion**: State transitions only, never celebrate

**Spacing**: Use Tailwind units of 2, 4, 8, 12, 16 for consistency

## What to Actively Avoid
- Personality, friendliness, jokes
- "Delight moments"
- Microcopy flair
- Clever interactions
- Decorative elements

## Success Metric
If the trip ends and no one says "That app was cool" but instead says "That trip just worked" — you nailed it.

## Images
No hero images needed. This is operational software. Any images should be functional (course maps, vendor logos, team photos) not decorative.