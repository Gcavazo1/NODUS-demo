"use client";

import { useEffect, useState, useCallback } from "react";
// Removed useSiteSettings import
// import { useSiteSettings } from "@/context/SiteSettingsContext"; 
import { useTheme } from "next-themes";

// Type Definitions (ensure these match AdminAppearance)
interface ThemeModeColors {
  background?: string; card?: string; primary?: string;
  primaryForeground?: string; secondaryForeground?: string; mutedForeground?: string;
  // Add other potential customizable colors from globals.css if needed
  foreground?: string; popover?: string; secondary?: string;
  accent?: string; accentForeground?: string; destructive?: string;
  border?: string; input?: string; ring?: string;
}
interface ThemeColorSettingsState { light: ThemeModeColors; dark: ThemeModeColors; }
interface DemoThemeSettings {
  selectedTheme: string;
  lightOverlayOpacity: number;
  darkOverlayOpacity: number;
  lightOverlayColor: string;
  darkOverlayColor: string;
  colors: ThemeColorSettingsState;
}

// Define SocialLink type consistently
interface SocialLink {
  id: string; 
  name: string;
  url: string;
  category?: 'social' | 'business' | 'other'; 
  isActive?: boolean;
}

interface DemoSettings {
  theme: DemoThemeSettings;
  socialLinks?: SocialLink[]; // Use defined SocialLink type
  payments?: { enableCoinbase: boolean };
}

const LOCAL_STORAGE_KEY = 'demoAdminSettings';

// Updated Helper to parse AND validate structure more carefully
const getSettingsFromLS = (): DemoSettings | null => {
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedSettings) return null;
    try {
        const parsed = JSON.parse(storedSettings);
        // Validate essential structure
        if (parsed && parsed.theme && 
            typeof parsed.theme.selectedTheme === 'string' &&
            typeof parsed.theme.lightOverlayOpacity === 'number' &&
            typeof parsed.theme.darkOverlayOpacity === 'number' &&
            typeof parsed.theme.lightOverlayColor === 'string' &&
            typeof parsed.theme.darkOverlayColor === 'string' &&
            parsed.theme.colors && typeof parsed.theme.colors.light === 'object' &&
            typeof parsed.theme.colors.dark === 'object') 
        {
            // We assume the structure is mostly correct if key parts exist
            return parsed as DemoSettings;
        } else {
            console.warn("[ThemeColorApplier] Parsed LS data missing key fields, returning null.");
            return null;
        }
    } catch (e) {
        console.error("[ThemeColorApplier] Error parsing settings from Local Storage:", e);
        return null;
    }
};

export function ThemeColorApplier() {
  const { resolvedTheme } = useTheme();
  const [settingsVersion, setSettingsVersion] = useState(0); // Used to trigger re-apply on storage change

  // Define applyColors WITHOUT calling getSettingsFromLS initially
  const applyColors = useCallback((currentSettings: DemoSettings | null) => {
    const themeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
    
    console.log(`[ThemeColorApplier Debug] Attempting to apply ${themeMode} colors. Settings:`, currentSettings);

    // Define *all* the variables we might potentially set based on globals.css
    const cssColorVariables = [
      'background', 'foreground', 'card', 'card-foreground', 
      'popover', 'popover-foreground', 'primary', 'primary-foreground', 
      'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
      'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
      'border', 'input', 'ring',
      'light-overlay', 'dark-overlay' 
    ];

    // Reset all potentially managed variables first
    cssColorVariables.forEach(varName => {
      document.documentElement.style.removeProperty(`--${varName}`);
    });
    console.log("[ThemeColorApplier Debug] Reset CSS variables.");

    if (!currentSettings?.theme) {
        console.log("[ThemeColorApplier] No valid theme settings found in provided settings.");
        return; 
    }

    // Apply custom theme colors from the 'colors' object
    const colorsForMode = currentSettings.theme.colors?.[themeMode];
    if (colorsForMode && typeof colorsForMode === 'object') {
       console.log(`[ThemeColorApplier Debug] Applying custom ${themeMode} colors:`, colorsForMode);
       Object.entries(colorsForMode).forEach(([key, value]) => {
           const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
           if (cssColorVariables.includes(cssVarName) && typeof value === 'string') {
               console.log(`[ThemeColorApplier Debug] Setting --${cssVarName} to ${value}`);
               document.documentElement.style.setProperty(`--${cssVarName}`, value);
                if (cssVarName === 'card') {
                     document.documentElement.style.setProperty('--popover', value);
                }
                 if (cssVarName === 'foreground') {
                     document.documentElement.style.setProperty('--card-foreground', value);
                     document.documentElement.style.setProperty('--popover-foreground', value);
                 }
           } else {
                 console.warn(`[ThemeColorApplier Debug] Skipping invalid/unmanaged key/value: ${key} / ${value}`);
           }
       });
    } else {
         console.log(`[ThemeColorApplier Debug] No specific colors object found for ${themeMode} mode.`);
    }
    
    // Apply overlay colors directly from theme root
    if (currentSettings.theme.lightOverlayColor) {
        console.log(`[ThemeColorApplier Debug] Setting --light-overlay to ${currentSettings.theme.lightOverlayColor}`);
        document.documentElement.style.setProperty('--light-overlay', currentSettings.theme.lightOverlayColor);
    }
    if (currentSettings.theme.darkOverlayColor) {
         console.log(`[ThemeColorApplier Debug] Setting --dark-overlay to ${currentSettings.theme.darkOverlayColor}`);
        document.documentElement.style.setProperty('--dark-overlay', currentSettings.theme.darkOverlayColor);
    }
    
    console.log("[ThemeColorApplier Debug] Finished applying styles.");

  }, [resolvedTheme]); // Only depends on resolvedTheme now

  // Function to fetch settings and apply colors (CLIENT-SIDE ONLY)
  const fetchAndApply = useCallback(() => {
      const settings = getSettingsFromLS(); // Call LS access here
      applyColors(settings);
  }, [applyColors]);

  // Apply on initial mount and theme change
  useEffect(() => {
      console.log("[ThemeColorApplier] Mount/theme change effect - Fetching and applying...");
      fetchAndApply();
  }, [resolvedTheme, fetchAndApply]); // Add fetchAndApply dependency

  // Apply on storage change
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY) {
        console.log("[ThemeColorApplier] Detected storage change, triggering re-apply...");
        setSettingsVersion(v => v + 1); // Trigger re-run of the settingsVersion effect
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); 

  // Re-apply if settingsVersion changes (triggered by storage listener)
  useEffect(() => {
      // Avoid running on initial mount if settingsVersion is 0
      if (settingsVersion > 0) { 
        console.log("[ThemeColorApplier] Re-applying due to settingsVersion change.");
        fetchAndApply();
      }
  }, [settingsVersion, fetchAndApply]); // Add fetchAndApply dependency
  
  return null; 
} 