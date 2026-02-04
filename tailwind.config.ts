import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ===========================================
      // BORING GOLF DESIGN SYSTEM TOKENS
      // ===========================================
      
      // Color Foundation (from DESIGN_SYSTEM.md)
      colors: {
        // Background Surfaces
        paper: "#F6F3EE",           // Warm off-white paper tone
        "paper-hover": "#F9F7F3",   // Hover state
        "card-frosted": "rgba(255, 255, 255, 0.80)",
        
        // Text Hierarchy  
        ink: "#111827",             // Primary ink
        "ink-secondary": "#4B5563", // Secondary text
        "ink-muted": "#9CA3AF",     // Muted metadata
        "ink-inverse": "#FFFFFF",   // Inverse text
        
        // Borders (soft UI structure)
        "border-soft": "rgba(0, 0, 0, 0.05)",    // 5% black
        "border-default": "rgba(0, 0, 0, 0.08)", // 8% black
        "border-strong": "rgba(0, 0, 0, 0.15)",  // 15% black
        
        // Action Colors
        action: {
          primary: "#2563EB",       // Blue 600
          "primary-hover": "#1D4ED8", // Blue 700
        },
        success: {
          DEFAULT: "#16A34A",
          bg: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          bg: "#FEF3C7",
        },
        error: {
          DEFAULT: "#DC2626",
          bg: "#FEE2E2",
        },
        
        // Status colors for pills
        status: {
          draft: "#D97706",       // Yellow/Amber for editable
          final: "#16A34A",       // Green for finalized
          locked: "#DC2626",      // Red for destructive/locked
          interactive: "#2563EB", // Blue for active/drag/link
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },

        // Existing design tokens (preserving compatibility)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
      },
      
      // Typography Scale (from DESIGN_SYSTEM.md)
      fontSize: {
        // Display - Trip Title
        "display": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        // Section Header - Section Title  
        "section": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        // Day Header - Day Anchor
        "day": ["1rem", { lineHeight: "1.4", fontWeight: "700" }],
        // Block Title - Event Anchor
        "block": ["0.9375rem", { lineHeight: "1.4", fontWeight: "500" }],
        // Meta Text
        "meta": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        // Microtext - Label
        "micro": ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
        // Departure Board - Large legible text for mobile
        "departure": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "departure-lg": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
      },
      
      // Border Radius Scale (from DESIGN_SYSTEM.md)
      borderRadius: {
        "card": "16px",       // Card Radius
        "input": "8px",       // Input Radius
        "pill": "9999px",     // Pill Radius (full round)
        lg: ".5625rem",       // 9px (existing)
        md: ".375rem",        // 6px (existing)
        sm: ".1875rem",       // 3px (existing)
      },
      
      // Shadow System (luxury subtle shadows from DESIGN_SYSTEM.md)
      boxShadow: {
        "card": "0 1px 3px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "elevated": "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
      
      // Spacing Scale (4px base grid from DESIGN_SYSTEM.md)
      spacing: {
        "card": "24px",       // Card padding
        "row": "8px",         // Row vertical
        "row-lg": "12px",     // Row vertical larger
        "section": "24px",    // Section spacing
        "section-lg": "32px", // Section spacing larger
      },
      
      // Font Family
      fontFamily: {
        sans: ["Inter", "var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["'Cormorant Garamond'", "var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)"],
      },
      
      // Transition Durations (Motion tokens from DESIGN_SYSTEM.md)
      transitionDuration: {
        "fast": "150ms",
        "default": "200ms",
        "slow": "300ms",
      },
      
      // Transition Timing
      transitionTimingFunction: {
        "smooth": "ease-in-out",
      },
      
      // Animations (existing)
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
