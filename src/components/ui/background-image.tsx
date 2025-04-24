"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
// import { useThemeSettings } from "@/context/ThemeSettingsContext"; // Old import
// import { useSiteSettings } from "@/context/SiteSettingsContext"; // New import
// Removed Image import as we are using CSS background
// import Image from 'next/image'; 

// --- DEMO MODE: Local Storage Key and Settings Structure ---
const LOCAL_STORAGE_KEY = 'demoAdminSettings';

// Define structure for settings expected from Local Storage
interface DemoThemeSettings {
  selectedTheme: string;
  lightOverlayOpacity: number;
  darkOverlayOpacity: number;
  // other fields like lightOverlayColor, darkOverlayColor, colors exist but are not directly used here
}
interface DemoSettings {
  theme: DemoThemeSettings;
  // other top-level keys like socialLinks, payments exist but are not directly used here
}

// Helper to safely parse JSON and get theme settings
const getThemeSettingsFromLS = (): DemoThemeSettings | null => {
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedSettings) return null;
    try {
        const parsed = JSON.parse(storedSettings);
        // Basic validation
        if (parsed && parsed.theme && typeof parsed.theme.selectedTheme === 'string') {
            return parsed.theme as DemoThemeSettings;
        }
        return null;
    } catch (e) {
        console.error("[BackgroundImage] Error parsing settings from Local Storage:", e);
        return null;
    }
};

// --- End DEMO MODE definitions ---

/**
 * BackgroundImage component props
 */
interface BackgroundImageProps {
  /**
   * Additional CSS classes to apply to the component
   */
  className?: string;
  /**
   * URL for the dark theme background image (fallback)
   */
  darkImageUrl?: string;
  /**
   * URL for the light theme background image (fallback)
   */
  lightImageUrl?: string;
  /**
   * Preload the alternate theme image for faster theme switching
   */
  preloadAlternateTheme?: boolean;
  /**
   * Blur amount for background image
   */
  blurAmount?: string;
}

/**
 * BackgroundImage Component (Demo Mode: Reads from Local Storage)
 */
export function BackgroundImage({
  className,
  // Fallback URLs are still useful if LS fails
  darkImageUrl = "/images/centralized-dark-background.jpg", // Default fallback
  lightImageUrl = "/images/centralized-light-background.jpg", // Default fallback
  preloadAlternateTheme = true,
  blurAmount,
}: BackgroundImageProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  // State to hold theme settings read from Local Storage
  const [currentThemeSettings, setCurrentThemeSettings] = useState<DemoThemeSettings | null>(null);

  // Function to load settings from LS and update state
  const loadAndApplySettings = useCallback(() => {
      const settings = getThemeSettingsFromLS();
      setCurrentThemeSettings(settings);
      console.log("[BackgroundImage] Loaded settings from LS:", settings);

      // Apply opacities from loaded settings
      const lightOpacity = settings?.lightOverlayOpacity ?? 0.25; // Default fallback
      const darkOpacity = settings?.darkOverlayOpacity ?? 0.72; // Default fallback
      
      document.documentElement.style.setProperty('--light-overlay-opacity', lightOpacity.toString());
      document.documentElement.style.setProperty('--dark-overlay-opacity', darkOpacity.toString());
      console.log(`[BackgroundImage] Applied opacities - Light: ${lightOpacity}, Dark: ${darkOpacity}`);

  }, []);

  // Load initial settings on mount
  useEffect(() => {
    setMounted(true);
    loadAndApplySettings();
  }, [loadAndApplySettings]);

  // Add listener for storage changes
  useEffect(() => {
     const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY) {
        console.log("[BackgroundImage] Detected storage change, reloading settings...");
        loadAndApplySettings();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAndApplySettings]);

  // Determine the correct theme mode (light/dark)
  const resolvedTheme = useMemo(() => {
    if (!mounted) return "light"; // Default during SSR
    return theme === "system" ? systemTheme : theme;
  }, [mounted, theme, systemTheme]);

  const isLightMode = resolvedTheme === "light";
  
  // Determine selected theme name from state (read from LS), fallback to 'centralized'
  const selectedThemeName = currentThemeSettings?.selectedTheme || 'centralized';
  
  // Calculate image paths using selectedThemeName
  const themePath = `/images/${selectedThemeName}`;
  const mainImageUrl = isLightMode 
    ? `${themePath}-light-background.jpg` 
    : `${themePath}-dark-background.jpg`;
  
  // Use fallback URLs if LS load failed or image error occurred
  const displayUrl = imageError
    ? (isLightMode ? lightImageUrl : darkImageUrl) 
    : mainImageUrl;
  
  // Determine alternate theme image for preloading
  const alternateImageUrl = isLightMode
    ? `${themePath}-dark-background.jpg`
    : `${themePath}-light-background.jpg`;
  
  const themeBgClass = isLightMode ? "theme-light-bg" : "theme-dark-bg";

  // Avoid rendering on server or before mount
  if (!mounted) {
    return <div className={cn("fixed inset-0 -z-10", className)} />;
  }

  return (
    <div className={cn(
        "fixed inset-0 -z-10 overflow-hidden", 
        themeBgClass, 
        className
      )}>
      {/* Background image div */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000",
          blurAmount && `backdrop-blur-${blurAmount}`
        )}
        style={{ backgroundImage: `url(${displayUrl})` }}
        key={displayUrl} // Re-render if URL changes
        onError={() => setImageError(true)} // Set error state on image load fail
      />
      
      {/* Preload link */}
      {preloadAlternateTheme && (
        <link
          rel="preload"
          as="image"
          href={alternateImageUrl}
          key={alternateImageUrl}
        />
      )}
    </div>
  );
} 