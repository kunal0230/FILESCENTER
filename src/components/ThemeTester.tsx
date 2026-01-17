"use client";

import { useState, useEffect } from "react";

// Comprehensive theme interface covering ALL CSS variables
interface ThemeColors {
    // Primary colors
    "--primary": string;
    "--primary-light": string;
    "--primary-dark": string;
    "--secondary": string;
    "--accent": string;

    // Backgrounds
    "--background": string;
    "--background-alt": string;
    "--surface": string;

    // Text colors (CRITICAL for readability)
    "--text": string;
    "--text-muted": string;
    "--text-light": string;
    "--text-heading": string;
    "--text-link": string;
    "--text-link-hover": string;

    // Borders
    "--border": string;
    "--border-light": string;
    "--border-focus": string;

    // Feedback colors
    "--success": string;
    "--success-bg": string;
    "--warning": string;
    "--warning-bg": string;
    "--error": string;
    "--error-bg": string;

    // Cards & Components
    "--card-bg": string;
    "--card-border": string;
    "--card-hover-border": string;
    "--card-shadow": string;

    // Buttons
    "--btn-primary-bg": string;
    "--btn-primary-text": string;
    "--btn-secondary-bg": string;
    "--btn-secondary-text": string;
    "--btn-secondary-border": string;

    // Input fields
    "--input-bg": string;
    "--input-border": string;
    "--input-text": string;
    "--input-placeholder": string;
}

interface Theme {
    name: string;
    category: string;
    colors: ThemeColors;
}

// Theme definitions with complete color specifications
const themes: Record<string, Theme> = {
    // ===== WARM & COZY LIGHT THEMES =====
    "warm-cream": {
        name: "Warm Cream",
        category: "Light",
        colors: {
            "--primary": "#4a7c7e",
            "--primary-light": "#6b9a9c",
            "--primary-dark": "#3a6163",
            "--secondary": "#8b9dc3",
            "--accent": "#d4a574",
            "--background": "#f9f7f4",
            "--background-alt": "#f5f2ee",
            "--surface": "#fffefa",
            "--text": "#2c3e50",
            "--text-muted": "#6b7c8a",
            "--text-light": "#8a9aaa",
            "--text-heading": "#1a2a3a",
            "--text-link": "#4a7c7e",
            "--text-link-hover": "#3a6163",
            "--border": "#e0ddd8",
            "--border-light": "#ebe8e3",
            "--border-focus": "#4a7c7e",
            "--success": "#5a9a72",
            "--success-bg": "#eef6f0",
            "--warning": "#c49a4a",
            "--warning-bg": "#faf5eb",
            "--error": "#c45a4a",
            "--error-bg": "#faf0ee",
            "--card-bg": "#ffffff",
            "--card-border": "#e8e5e0",
            "--card-hover-border": "#4a7c7e",
            "--card-shadow": "rgba(44, 62, 80, 0.06)",
            "--btn-primary-bg": "linear-gradient(135deg, #4a7c7e 0%, #3a6163 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#f5f2ee",
            "--btn-secondary-text": "#2c3e50",
            "--btn-secondary-border": "#e0ddd8",
            "--input-bg": "#ffffff",
            "--input-border": "#e0ddd8",
            "--input-text": "#2c3e50",
            "--input-placeholder": "#a8b4c0",
        }
    },

    "peach-blossom": {
        name: "Peach Blossom",
        category: "Light",
        colors: {
            "--primary": "#d97756",
            "--primary-light": "#e8947a",
            "--primary-dark": "#c45a3d",
            "--secondary": "#f2a892",
            "--accent": "#7aab8e",
            "--background": "#fdf8f6",
            "--background-alt": "#faf0ec",
            "--surface": "#fffbf9",
            "--text": "#4a3530",
            "--text-muted": "#7a625a",
            "--text-light": "#a08880",
            "--text-heading": "#3a2520",
            "--text-link": "#d97756",
            "--text-link-hover": "#c45a3d",
            "--border": "#f0ddd5",
            "--border-light": "#f5e8e2",
            "--border-focus": "#d97756",
            "--success": "#5a9a72",
            "--success-bg": "#eef6f0",
            "--warning": "#daa040",
            "--warning-bg": "#fdf8eb",
            "--error": "#c45a4a",
            "--error-bg": "#fdf0ee",
            "--card-bg": "#fffcfa",
            "--card-border": "#f0ddd5",
            "--card-hover-border": "#d97756",
            "--card-shadow": "rgba(74, 53, 48, 0.06)",
            "--btn-primary-bg": "linear-gradient(135deg, #d97756 0%, #c45a3d 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#faf0ec",
            "--btn-secondary-text": "#4a3530",
            "--btn-secondary-border": "#f0ddd5",
            "--input-bg": "#fffcfa",
            "--input-border": "#f0ddd5",
            "--input-text": "#4a3530",
            "--input-placeholder": "#b0988e",
        }
    },

    // ===== COOL & PROFESSIONAL LIGHT THEMES =====
    "cool-slate": {
        name: "Cool Slate",
        category: "Light",
        colors: {
            "--primary": "#5c6bc0",
            "--primary-light": "#7986cb",
            "--primary-dark": "#3f51b5",
            "--secondary": "#78909c",
            "--accent": "#26a69a",
            "--background": "#f8f9fb",
            "--background-alt": "#f1f3f6",
            "--surface": "#ffffff",
            "--text": "#37474f",
            "--text-muted": "#607d8b",
            "--text-light": "#90a4ae",
            "--text-heading": "#263238",
            "--text-link": "#5c6bc0",
            "--text-link-hover": "#3f51b5",
            "--border": "#e1e5ea",
            "--border-light": "#eceff1",
            "--border-focus": "#5c6bc0",
            "--success": "#4caf50",
            "--success-bg": "#e8f5e9",
            "--warning": "#ff9800",
            "--warning-bg": "#fff3e0",
            "--error": "#f44336",
            "--error-bg": "#ffebee",
            "--card-bg": "#ffffff",
            "--card-border": "#e1e5ea",
            "--card-hover-border": "#5c6bc0",
            "--card-shadow": "rgba(55, 71, 79, 0.05)",
            "--btn-primary-bg": "linear-gradient(135deg, #5c6bc0 0%, #3f51b5 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#f1f3f6",
            "--btn-secondary-text": "#37474f",
            "--btn-secondary-border": "#e1e5ea",
            "--input-bg": "#ffffff",
            "--input-border": "#e1e5ea",
            "--input-text": "#37474f",
            "--input-placeholder": "#90a4ae",
        }
    },

    "ocean-breeze": {
        name: "Ocean Breeze",
        category: "Light",
        colors: {
            "--primary": "#0288d1",
            "--primary-light": "#29b6f6",
            "--primary-dark": "#0277bd",
            "--secondary": "#4fc3f7",
            "--accent": "#00897b",
            "--background": "#f5f9fc",
            "--background-alt": "#eaf3f9",
            "--surface": "#ffffff",
            "--text": "#1a3a4f",
            "--text-muted": "#4a6a7f",
            "--text-light": "#7a9aaf",
            "--text-heading": "#0a2a3f",
            "--text-link": "#0288d1",
            "--text-link-hover": "#0277bd",
            "--border": "#d0e4f0",
            "--border-light": "#e0f0f8",
            "--border-focus": "#0288d1",
            "--success": "#00897b",
            "--success-bg": "#e0f2f1",
            "--warning": "#ffa000",
            "--warning-bg": "#fff8e1",
            "--error": "#e53935",
            "--error-bg": "#ffebee",
            "--card-bg": "#ffffff",
            "--card-border": "#d0e4f0",
            "--card-hover-border": "#0288d1",
            "--card-shadow": "rgba(26, 58, 79, 0.05)",
            "--btn-primary-bg": "linear-gradient(135deg, #0288d1 0%, #0277bd 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#eaf3f9",
            "--btn-secondary-text": "#1a3a4f",
            "--btn-secondary-border": "#d0e4f0",
            "--input-bg": "#ffffff",
            "--input-border": "#d0e4f0",
            "--input-text": "#1a3a4f",
            "--input-placeholder": "#7a9aaf",
        }
    },

    // ===== NATURE THEMES =====
    "forest-calm": {
        name: "Forest Calm",
        category: "Light",
        colors: {
            "--primary": "#2e7d52",
            "--primary-light": "#4a9a6e",
            "--primary-dark": "#1b5e3a",
            "--secondary": "#81c995",
            "--accent": "#8b6914",
            "--background": "#f6f9f4",
            "--background-alt": "#eef4ea",
            "--surface": "#fcfdf8",
            "--text": "#1a3023",
            "--text-muted": "#4a6050",
            "--text-light": "#7a907a",
            "--text-heading": "#0a2013",
            "--text-link": "#2e7d52",
            "--text-link-hover": "#1b5e3a",
            "--border": "#d8e5d4",
            "--border-light": "#e8f0e4",
            "--border-focus": "#2e7d52",
            "--success": "#43a047",
            "--success-bg": "#e8f5e9",
            "--warning": "#ff8f00",
            "--warning-bg": "#fff8e1",
            "--error": "#e53935",
            "--error-bg": "#ffebee",
            "--card-bg": "#fcfdf8",
            "--card-border": "#d8e5d4",
            "--card-hover-border": "#2e7d52",
            "--card-shadow": "rgba(26, 48, 35, 0.05)",
            "--btn-primary-bg": "linear-gradient(135deg, #2e7d52 0%, #1b5e3a 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#eef4ea",
            "--btn-secondary-text": "#1a3023",
            "--btn-secondary-border": "#d8e5d4",
            "--input-bg": "#fcfdf8",
            "--input-border": "#d8e5d4",
            "--input-text": "#1a3023",
            "--input-placeholder": "#7a907a",
        }
    },

    // ===== SOFT & PLEASING =====
    "lavender-mist": {
        name: "Lavender Mist",
        category: "Light",
        colors: {
            "--primary": "#7c4dff",
            "--primary-light": "#9e7fff",
            "--primary-dark": "#651fff",
            "--secondary": "#b39ddb",
            "--accent": "#ec407a",
            "--background": "#faf8fc",
            "--background-alt": "#f3eff8",
            "--surface": "#ffffff",
            "--text": "#3a3050",
            "--text-muted": "#6a5a80",
            "--text-light": "#9a8ab0",
            "--text-heading": "#2a2040",
            "--text-link": "#7c4dff",
            "--text-link-hover": "#651fff",
            "--border": "#e8e0f0",
            "--border-light": "#f0e8f8",
            "--border-focus": "#7c4dff",
            "--success": "#66bb6a",
            "--success-bg": "#e8f5e9",
            "--warning": "#ffa726",
            "--warning-bg": "#fff3e0",
            "--error": "#ef5350",
            "--error-bg": "#ffebee",
            "--card-bg": "#ffffff",
            "--card-border": "#e8e0f0",
            "--card-hover-border": "#7c4dff",
            "--card-shadow": "rgba(58, 48, 80, 0.05)",
            "--btn-primary-bg": "linear-gradient(135deg, #7c4dff 0%, #651fff 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#f3eff8",
            "--btn-secondary-text": "#3a3050",
            "--btn-secondary-border": "#e8e0f0",
            "--input-bg": "#ffffff",
            "--input-border": "#e8e0f0",
            "--input-text": "#3a3050",
            "--input-placeholder": "#9a8ab0",
        }
    },

    "rose-garden": {
        name: "Rose Garden",
        category: "Light",
        colors: {
            "--primary": "#e91e63",
            "--primary-light": "#f06292",
            "--primary-dark": "#c2185b",
            "--secondary": "#f8bbd0",
            "--accent": "#7b1fa2",
            "--background": "#fdf6f8",
            "--background-alt": "#fceef2",
            "--surface": "#ffffff",
            "--text": "#4a2030",
            "--text-muted": "#7a4a5a",
            "--text-light": "#aa7a8a",
            "--text-heading": "#3a1020",
            "--text-link": "#e91e63",
            "--text-link-hover": "#c2185b",
            "--border": "#f8d8e0",
            "--border-light": "#fce8ee",
            "--border-focus": "#e91e63",
            "--success": "#4caf50",
            "--success-bg": "#e8f5e9",
            "--warning": "#ff9800",
            "--warning-bg": "#fff3e0",
            "--error": "#f44336",
            "--error-bg": "#ffebee",
            "--card-bg": "#ffffff",
            "--card-border": "#f8d8e0",
            "--card-hover-border": "#e91e63",
            "--card-shadow": "rgba(74, 32, 48, 0.05)",
            "--btn-primary-bg": "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#fceef2",
            "--btn-secondary-text": "#4a2030",
            "--btn-secondary-border": "#f8d8e0",
            "--input-bg": "#ffffff",
            "--input-border": "#f8d8e0",
            "--input-text": "#4a2030",
            "--input-placeholder": "#aa7a8a",
        }
    },

    // ===== COLORFUL & VIBRANT =====
    "sunset-vibes": {
        name: "Sunset Vibes",
        category: "Colorful",
        colors: {
            "--primary": "#ff6b35",
            "--primary-light": "#ff8a5b",
            "--primary-dark": "#e55a2b",
            "--secondary": "#ffc857",
            "--accent": "#9c27b0",
            "--background": "#fef7f0",
            "--background-alt": "#fdf0e6",
            "--surface": "#ffffff",
            "--text": "#3a2010",
            "--text-muted": "#6a4a35",
            "--text-light": "#9a7a65",
            "--text-heading": "#2a1005",
            "--text-link": "#ff6b35",
            "--text-link-hover": "#e55a2b",
            "--border": "#fde3c8",
            "--border-light": "#feeeda",
            "--border-focus": "#ff6b35",
            "--success": "#4caf50",
            "--success-bg": "#e8f5e9",
            "--warning": "#ff9800",
            "--warning-bg": "#fff3e0",
            "--error": "#f44336",
            "--error-bg": "#ffebee",
            "--card-bg": "#ffffff",
            "--card-border": "#fde3c8",
            "--card-hover-border": "#ff6b35",
            "--card-shadow": "rgba(58, 32, 16, 0.06)",
            "--btn-primary-bg": "linear-gradient(135deg, #ff6b35 0%, #ffc857 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#fdf0e6",
            "--btn-secondary-text": "#3a2010",
            "--btn-secondary-border": "#fde3c8",
            "--input-bg": "#ffffff",
            "--input-border": "#fde3c8",
            "--input-text": "#3a2010",
            "--input-placeholder": "#9a7a65",
        }
    },

    "tropical-paradise": {
        name: "Tropical Paradise",
        category: "Colorful",
        colors: {
            "--primary": "#00bcd4",
            "--primary-light": "#4dd0e1",
            "--primary-dark": "#0097a7",
            "--secondary": "#ffeb3b",
            "--accent": "#ff4081",
            "--background": "#f0fdf4",
            "--background-alt": "#dcfce7",
            "--surface": "#ffffff",
            "--text": "#0a3020",
            "--text-muted": "#2a5540",
            "--text-light": "#5a8570",
            "--text-heading": "#002010",
            "--text-link": "#00bcd4",
            "--text-link-hover": "#0097a7",
            "--border": "#a7f3d0",
            "--border-light": "#d1fae5",
            "--border-focus": "#00bcd4",
            "--success": "#10b981",
            "--success-bg": "#d1fae5",
            "--warning": "#f59e0b",
            "--warning-bg": "#fef3c7",
            "--error": "#ef4444",
            "--error-bg": "#fee2e2",
            "--card-bg": "#ffffff",
            "--card-border": "#a7f3d0",
            "--card-hover-border": "#00bcd4",
            "--card-shadow": "rgba(10, 48, 32, 0.05)",
            "--btn-primary-bg": "linear-gradient(135deg, #00bcd4 0%, #10b981 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#dcfce7",
            "--btn-secondary-text": "#0a3020",
            "--btn-secondary-border": "#a7f3d0",
            "--input-bg": "#ffffff",
            "--input-border": "#a7f3d0",
            "--input-text": "#0a3020",
            "--input-placeholder": "#5a8570",
        }
    },

    // ===== DARK THEMES =====
    "midnight-blue": {
        name: "Midnight Blue",
        category: "Dark",
        colors: {
            "--primary": "#60a5fa",
            "--primary-light": "#93c5fd",
            "--primary-dark": "#3b82f6",
            "--secondary": "#a78bfa",
            "--accent": "#34d399",
            "--background": "#0f172a",
            "--background-alt": "#1e293b",
            "--surface": "#1e293b",
            "--text": "#e2e8f0",
            "--text-muted": "#94a3b8",
            "--text-light": "#64748b",
            "--text-heading": "#f1f5f9",
            "--text-link": "#60a5fa",
            "--text-link-hover": "#93c5fd",
            "--border": "#334155",
            "--border-light": "#475569",
            "--border-focus": "#60a5fa",
            "--success": "#34d399",
            "--success-bg": "#064e3b",
            "--warning": "#fbbf24",
            "--warning-bg": "#78350f",
            "--error": "#f87171",
            "--error-bg": "#7f1d1d",
            "--card-bg": "#1e293b",
            "--card-border": "#334155",
            "--card-hover-border": "#60a5fa",
            "--card-shadow": "rgba(0, 0, 0, 0.3)",
            "--btn-primary-bg": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#334155",
            "--btn-secondary-text": "#e2e8f0",
            "--btn-secondary-border": "#475569",
            "--input-bg": "#1e293b",
            "--input-border": "#334155",
            "--input-text": "#e2e8f0",
            "--input-placeholder": "#64748b",
        }
    },

    "deep-purple": {
        name: "Deep Purple",
        category: "Dark",
        colors: {
            "--primary": "#a78bfa",
            "--primary-light": "#c4b5fd",
            "--primary-dark": "#8b5cf6",
            "--secondary": "#f472b6",
            "--accent": "#22d3ee",
            "--background": "#13111c",
            "--background-alt": "#1c1a29",
            "--surface": "#1c1a29",
            "--text": "#e4e1ed",
            "--text-muted": "#9a8fc0",
            "--text-light": "#6a5f8f",
            "--text-heading": "#f4f1fd",
            "--text-link": "#a78bfa",
            "--text-link-hover": "#c4b5fd",
            "--border": "#2d2a40",
            "--border-light": "#3d3a55",
            "--border-focus": "#a78bfa",
            "--success": "#4ade80",
            "--success-bg": "#14532d",
            "--warning": "#fbbf24",
            "--warning-bg": "#78350f",
            "--error": "#f87171",
            "--error-bg": "#7f1d1d",
            "--card-bg": "#1c1a29",
            "--card-border": "#2d2a40",
            "--card-hover-border": "#a78bfa",
            "--card-shadow": "rgba(0, 0, 0, 0.4)",
            "--btn-primary-bg": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#2d2a40",
            "--btn-secondary-text": "#e4e1ed",
            "--btn-secondary-border": "#3d3a55",
            "--input-bg": "#1c1a29",
            "--input-border": "#2d2a40",
            "--input-text": "#e4e1ed",
            "--input-placeholder": "#6a5f8f",
        }
    },

    "charcoal-minimal": {
        name: "Charcoal Minimal",
        category: "Dark",
        colors: {
            "--primary": "#ffffff",
            "--primary-light": "#f5f5f5",
            "--primary-dark": "#e5e5e5",
            "--secondary": "#a3a3a3",
            "--accent": "#22d3ee",
            "--background": "#171717",
            "--background-alt": "#262626",
            "--surface": "#262626",
            "--text": "#f5f5f5",
            "--text-muted": "#a3a3a3",
            "--text-light": "#737373",
            "--text-heading": "#ffffff",
            "--text-link": "#ffffff",
            "--text-link-hover": "#d4d4d4",
            "--border": "#404040",
            "--border-light": "#525252",
            "--border-focus": "#ffffff",
            "--success": "#4ade80",
            "--success-bg": "#14532d",
            "--warning": "#fbbf24",
            "--warning-bg": "#78350f",
            "--error": "#f87171",
            "--error-bg": "#7f1d1d",
            "--card-bg": "#262626",
            "--card-border": "#404040",
            "--card-hover-border": "#a3a3a3",
            "--card-shadow": "rgba(0, 0, 0, 0.5)",
            "--btn-primary-bg": "#ffffff",
            "--btn-primary-text": "#171717",
            "--btn-secondary-bg": "#404040",
            "--btn-secondary-text": "#f5f5f5",
            "--btn-secondary-border": "#525252",
            "--input-bg": "#262626",
            "--input-border": "#404040",
            "--input-text": "#f5f5f5",
            "--input-placeholder": "#737373",
        }
    },

    "nord-night": {
        name: "Nord Night",
        category: "Dark",
        colors: {
            "--primary": "#88c0d0",
            "--primary-light": "#8fbcbb",
            "--primary-dark": "#5e81ac",
            "--secondary": "#81a1c1",
            "--accent": "#a3be8c",
            "--background": "#2e3440",
            "--background-alt": "#3b4252",
            "--surface": "#3b4252",
            "--text": "#eceff4",
            "--text-muted": "#d8dee9",
            "--text-light": "#a0aec0",
            "--text-heading": "#ffffff",
            "--text-link": "#88c0d0",
            "--text-link-hover": "#8fbcbb",
            "--border": "#4c566a",
            "--border-light": "#5a6578",
            "--border-focus": "#88c0d0",
            "--success": "#a3be8c",
            "--success-bg": "#3b4a3e",
            "--warning": "#ebcb8b",
            "--warning-bg": "#4a4535",
            "--error": "#bf616a",
            "--error-bg": "#4a3538",
            "--card-bg": "#3b4252",
            "--card-border": "#4c566a",
            "--card-hover-border": "#88c0d0",
            "--card-shadow": "rgba(0, 0, 0, 0.3)",
            "--btn-primary-bg": "linear-gradient(135deg, #5e81ac 0%, #81a1c1 100%)",
            "--btn-primary-text": "#eceff4",
            "--btn-secondary-bg": "#4c566a",
            "--btn-secondary-text": "#eceff4",
            "--btn-secondary-border": "#5a6578",
            "--input-bg": "#3b4252",
            "--input-border": "#4c566a",
            "--input-text": "#eceff4",
            "--input-placeholder": "#a0aec0",
        }
    },

    "dracula": {
        name: "Dracula",
        category: "Dark",
        colors: {
            "--primary": "#bd93f9",
            "--primary-light": "#d6bcfa",
            "--primary-dark": "#9d6ef0",
            "--secondary": "#ff79c6",
            "--accent": "#50fa7b",
            "--background": "#282a36",
            "--background-alt": "#44475a",
            "--surface": "#44475a",
            "--text": "#f8f8f2",
            "--text-muted": "#c0c0c0",
            "--text-light": "#6272a4",
            "--text-heading": "#ffffff",
            "--text-link": "#bd93f9",
            "--text-link-hover": "#d6bcfa",
            "--border": "#44475a",
            "--border-light": "#555970",
            "--border-focus": "#bd93f9",
            "--success": "#50fa7b",
            "--success-bg": "#2a4535",
            "--warning": "#f1fa8c",
            "--warning-bg": "#4a4a30",
            "--error": "#ff5555",
            "--error-bg": "#4a2a2a",
            "--card-bg": "#44475a",
            "--card-border": "#555970",
            "--card-hover-border": "#bd93f9",
            "--card-shadow": "rgba(0, 0, 0, 0.4)",
            "--btn-primary-bg": "linear-gradient(135deg, #bd93f9 0%, #ff79c6 100%)",
            "--btn-primary-text": "#282a36",
            "--btn-secondary-bg": "#555970",
            "--btn-secondary-text": "#f8f8f2",
            "--btn-secondary-border": "#666a80",
            "--input-bg": "#44475a",
            "--input-border": "#555970",
            "--input-text": "#f8f8f2",
            "--input-placeholder": "#6272a4",
        }
    },

    "amoled-black": {
        name: "Amoled Black",
        category: "Dark",
        colors: {
            "--primary": "#6366f1",
            "--primary-light": "#818cf8",
            "--primary-dark": "#4f46e5",
            "--secondary": "#ec4899",
            "--accent": "#22d3ee",
            "--background": "#000000",
            "--background-alt": "#0a0a0a",
            "--surface": "#0a0a0a",
            "--text": "#fafafa",
            "--text-muted": "#a1a1aa",
            "--text-light": "#71717a",
            "--text-heading": "#ffffff",
            "--text-link": "#818cf8",
            "--text-link-hover": "#a5b4fc",
            "--border": "#27272a",
            "--border-light": "#3f3f46",
            "--border-focus": "#6366f1",
            "--success": "#4ade80",
            "--success-bg": "#052e16",
            "--warning": "#fbbf24",
            "--warning-bg": "#451a03",
            "--error": "#f87171",
            "--error-bg": "#450a0a",
            "--card-bg": "#0a0a0a",
            "--card-border": "#27272a",
            "--card-hover-border": "#6366f1",
            "--card-shadow": "rgba(0, 0, 0, 0.8)",
            "--btn-primary-bg": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            "--btn-primary-text": "#ffffff",
            "--btn-secondary-bg": "#27272a",
            "--btn-secondary-text": "#fafafa",
            "--btn-secondary-border": "#3f3f46",
            "--input-bg": "#0a0a0a",
            "--input-border": "#27272a",
            "--input-text": "#fafafa",
            "--input-placeholder": "#71717a",
        }
    },
};

// Set to false before deployment
const ENABLE_THEME_TESTER = true;

export default function ThemeTester() {
    const [currentTheme, setCurrentTheme] = useState("warm-cream");
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<string | null>(null);

    if (!ENABLE_THEME_TESTER) return null;

    const applyTheme = (themeKey: string) => {
        const theme = themes[themeKey];
        if (!theme) return;

        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
        setCurrentTheme(themeKey);
        localStorage.setItem("dev-theme", themeKey);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("dev-theme");
        if (savedTheme && themes[savedTheme]) {
            applyTheme(savedTheme);
        }
    }, []);

    const categories = ["Light", "Colorful", "Dark"];
    const filteredThemes = filter
        ? Object.entries(themes).filter(([_, t]) => t.category === filter)
        : Object.entries(themes);

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                {isOpen ? "Close" : "Theme"}
            </button>

            {isOpen && (
                <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80 max-h-[75vh] overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm">Themes</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">DEV</span>
                    </div>

                    <div className="flex gap-1 mb-3">
                        <button
                            onClick={() => setFilter(null)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${!filter ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            All ({Object.keys(themes).length})
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${filter === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-1 overflow-y-auto flex-1 pr-1">
                        {filteredThemes.map(([key, theme]) => (
                            <button
                                key={key}
                                onClick={() => applyTheme(key)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${currentTheme === key
                                    ? "bg-indigo-50 text-indigo-700 font-medium ring-2 ring-indigo-200"
                                    : "hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                {/* Color preview stack */}
                                <div className="flex -space-x-1">
                                    <div
                                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                        style={{ background: theme.colors["--background"] }}
                                    />
                                    <div
                                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                        style={{ background: theme.colors["--primary"] }}
                                    />
                                    <div
                                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                        style={{ background: theme.colors["--text"] }}
                                    />
                                </div>
                                <span>{theme.name}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 pt-3 border-t text-center">
                        Includes text, borders, cards, buttons & input colors
                    </p>
                </div>
            )}
        </div>
    );
}
