'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
// import { db } from '@/lib/firebase'; // Unused
// import { doc, getDoc, setDoc } from 'firebase/firestore'; // Unused
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check, Loader2, SunIcon, MoonIcon, ImageIcon, RotateCcw, Save, Settings2, LinkIcon, Paintbrush, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
// import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Slider } from '@/components/ui/slider';
import { SocialLinksManager } from '@/components/admin/SocialLinksManager';
import { ThemeColorsSettings } from '@/components/admin/ThemeColorsSettings';
import { ColorPickerInput } from '@/components/ui/color-picker';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define theme options
const themeOptions = [
  { id: 'centralized', name: 'Centralized', description: 'Clean, professional look for payment services' },
  { id: 'chique', name: 'Chique', description: 'Elegant, upscale design for premium services' },
  { id: 'commerce', name: 'Commerce', description: 'Business-oriented theme for e-commerce' },
  { id: 'crimson', name: 'Crimson', description: 'Bold, dynamic style with warm accents' },
  { id: 'currency', name: 'Currency', description: 'Finance-focused design with monetary elements' },
  { id: 'elegant', name: 'Elegant', description: 'Minimalist, refined aesthetic' },
  { id: 'marketing', name: 'Marketing', description: 'Vibrant theme for promotional campaigns' },
  { id: 'nodes', name: 'Nodes', description: 'Tech-inspired theme with network motifs' },
  { id: 'custom', name: 'Custom', description: 'Your own custom theme (requires deployment)' },
];

// --- DEMO MODE: Define default settings structure and values --- 
const LOCAL_STORAGE_KEY = 'demoAdminSettings';

// Type Definitions
interface ThemeModeColors {
  background: string;
  card: string;
  primary: string;
  primaryForeground: string;
  secondaryForeground: string;
  mutedForeground: string;
}
interface ThemeColorSettingsState {
  light: ThemeModeColors;
  dark: ThemeModeColors;
}
interface ThemeSettingsState {
  selectedTheme: string;
  lightOverlayOpacity: number;
  darkOverlayOpacity: number;
  lightOverlayColor: string;
  darkOverlayColor: string;
  colors: ThemeColorSettingsState;
}
interface SocialLink {
  id: string;
  name: string;
  url: string;
  category?: 'social' | 'business' | 'other';
  isActive?: boolean;
}
interface DemoSettingsState {
  theme: ThemeSettingsState;
  socialLinks: SocialLink[];
  // Add payments section if needed in the future
  // payments?: { enableCoinbase: boolean }; 
}

const defaultSettings: DemoSettingsState = {
  theme: {
    selectedTheme: 'centralized',
    lightOverlayOpacity: 0.25,
    darkOverlayOpacity: 0.60,
    lightOverlayColor: "oklch(0.0 0.0 0.0)",
    darkOverlayColor: "oklch(0.0 0.0 0.0)",
    colors: {
      light: {
        background: "oklch(0.98 0.01 85)",
        card: "oklch(0.88 0.2286 89.65 / 35.55%)",
        primary: "oklch(0.65 0.25 280)",
        primaryForeground: "oklch(1 0 0)",
        secondaryForeground: "oklch(1 0 0)",
        mutedForeground: "oklch(0.66 0.3445 15.53)"
      },
      dark: {
        background: "oklch(0.08 0.02 270)",
        card: "oklch(0.13 0.088 270.71)",
        primary: "oklch(0.6 0.3 315)",
        primaryForeground: " oklch(0.85 0.1642 86.47)",
        secondaryForeground: "oklch(0.1 0.01 270)",
        mutedForeground: "oklch(0.85 0.1718 181.76)"
      }
    }
  },
  socialLinks: [],
};
// --- End DEMO DEFAULTS ---

// Add demoMode prop to component signature
export default function AdminAppearance({ demoMode = true }: { demoMode?: boolean }) {
  // Removed context usage: const { siteSettings, updateSiteSettings, ... } = useSiteSettings();
  
  // State for current edits
  const [allSettings, setAllSettings] = useState<DemoSettingsState>(defaultSettings); 
  // State for last saved/loaded settings (used for change detection)
  const [initialSettings, setInitialSettings] = useState<DemoSettingsState>(defaultSettings);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Used for any apply/save/reset operation
  const [error, setError] = useState<string | null>(null);

  // State to track changes in each section
  const [hasChanges, setHasChanges] = useState({
      themeSelection: false,
      overlay: false,
      colors: false,
      links: false
  });

  // Load initial settings from Local Storage on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = safeJsonParse(storedSettings);
      const loadedSettings = parsed || defaultSettings;
      
      setAllSettings(loadedSettings);
      setInitialSettings(loadedSettings); // Set initial state for comparison
      console.log("[Demo] Loaded initial settings:", loadedSettings);

      if (!parsed && !storedSettings) { // If LS was empty, save defaults
           localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSettings));
      }
    } catch (err) {
      console.error("[Demo] Error loading settings:", err);
      setError('Failed to load settings from browser storage. Using defaults.');
      setAllSettings(defaultSettings);
      setInitialSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Change Detection Effect --- 
  useEffect(() => {
    if (isLoading) return; // Don't compare until loaded

    setHasChanges({
        themeSelection: allSettings.theme.selectedTheme !== initialSettings.theme.selectedTheme,
        overlay: 
            allSettings.theme.lightOverlayOpacity !== initialSettings.theme.lightOverlayOpacity ||
            allSettings.theme.darkOverlayOpacity !== initialSettings.theme.darkOverlayOpacity ||
            allSettings.theme.lightOverlayColor !== initialSettings.theme.lightOverlayColor ||
            allSettings.theme.darkOverlayColor !== initialSettings.theme.darkOverlayColor,
        colors: JSON.stringify(allSettings.theme.colors) !== JSON.stringify(initialSettings.theme.colors),
        links: JSON.stringify(allSettings.socialLinks) !== JSON.stringify(initialSettings.socialLinks)
    });

  }, [allSettings, initialSettings, isLoading]);

  // --- Update Handlers (Update `allSettings` state) --- 
  const updateThemeField = useCallback((field: keyof ThemeSettingsState, value: ThemeSettingsState[keyof ThemeSettingsState]) => {
      setAllSettings(prev => ({ ...prev, theme: { ...prev.theme, [field]: value } }));
  }, []);

  const updateThemeColors = useCallback((newColors: ThemeColorSettingsState) => {
      setAllSettings(prev => ({ ...prev, theme: { ...prev.theme, colors: newColors } }));
  }, []);

  const updateSocialLinks = useCallback((newLinks: SocialLink[]) => {
      setAllSettings(prev => ({ ...prev, socialLinks: newLinks }));
  }, []);

  // --- Generic Apply Function --- 
  const applySectionChanges = async <K extends keyof DemoSettingsState>(
    sectionKey: K, 
    sectionData: DemoSettingsState[K],
    changeFlagKey: keyof typeof hasChanges
  ) => {
    setIsSaving(true);
    setError(null);
    console.log(`[Demo] Applying ${changeFlagKey} changes...`, sectionData);
    
    try {
      // 1. Read current full settings
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      const currentFullSettings = safeJsonParse(storedSettings) || defaultSettings;
      
      // 2. Create updated settings object
      const updatedFullSettings = { 
          ...currentFullSettings, 
          [sectionKey]: sectionData 
      };
      
      // 3. Write back to Local Storage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFullSettings));
      
      // 4. Update initialSettings for the applied section
      setInitialSettings(prev => ({ ...prev, [sectionKey]: sectionData }));

      toast.success(`${changeFlagKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} applied successfully!`);

    } catch (err) {
      console.error(`[Demo] Error applying ${changeFlagKey} settings:`, err);
      const errorMessage = err instanceof Error ? err.message : `Failed to apply ${changeFlagKey} settings.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Save All Function --- 
  const saveAllSettings = async () => {
    setIsSaving(true);
    setError(null);
    console.log("[Demo] Saving all changes...", allSettings);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allSettings));
      setInitialSettings(allSettings); // Update initial state to current state
      toast.success('All appearance settings saved successfully!');
    } catch (err) {
      console.error('[Demo] Error saving all settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings.';
      setError(errorMessage);
      toast.error('Failed to save settings to browser storage');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Reset All Function --- 
  const resetAllToDefaults = async () => {
    if (confirm("Are you sure you want to reset ALL appearance settings (Theme, Overlay, Colors, Links) to defaults?")) {
      setIsSaving(true);
      setError(null);
      console.log("[Demo] Resetting all settings to defaults...");
      try {
        setAllSettings(defaultSettings); // Reset edit state
        setInitialSettings(defaultSettings); // Reset base state
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSettings)); // Save defaults
        toast.success('All appearance settings have been reset to defaults.');
      } catch (err) {
        console.error('[Demo] Error resetting settings:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings.';
        setError(errorMessage);
        toast.error('Failed to reset settings');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Memoize derived state for UI
  const selectedTheme = useMemo(() => allSettings.theme.selectedTheme, [allSettings.theme.selectedTheme]);
  const lightOpacity = useMemo(() => allSettings.theme.lightOverlayOpacity, [allSettings.theme.lightOverlayOpacity]);
  const darkOpacity = useMemo(() => allSettings.theme.darkOverlayOpacity, [allSettings.theme.darkOverlayOpacity]);
  const lightOverlayColor = useMemo(() => allSettings.theme.lightOverlayColor, [allSettings.theme.lightOverlayColor]);
  const darkOverlayColor = useMemo(() => allSettings.theme.darkOverlayColor, [allSettings.theme.darkOverlayColor]);

  const formatOpacity = (value: number) => `${Math.round(value * 100)}%`;
  const hasAnyChanges = Object.values(hasChanges).some(change => change);

  if (isLoading) {
     return (
        <div className="flex items-center justify-center p-10">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading appearance settings...</span>
        </div>
     );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center sticky top-0 py-4 bg-background/95 backdrop-blur z-10 border-b mb-6">
        <h1 className="text-2xl font-semibold">Appearance Settings (Demo)</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={resetAllToDefaults} 
            disabled={isSaving}
            variant="outline"
            className="gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All
          </Button>
          <Button 
            onClick={saveAllSettings} 
            disabled={isSaving || !hasAnyChanges}
            className="gap-1.5"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Changes
          </Button>
        </div>
      </div>

      <Alert variant="default" className="border-blue-500/50 text-blue-700 dark:border-blue-500/30 dark:text-blue-300 [&>svg]:text-blue-500 dark:[&>svg]:text-blue-400">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Demo Mode Info</AlertTitle>
          <AlertDescription>
             Changes made here are saved to your browser&apos;s storage. Applying changes might require a page refresh to see them fully reflected across the site (like background images or global colors).
          </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Theme Selection</CardTitle>
          <CardDescription>Choose a base theme. Custom requires deployment changes.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {themeOptions.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedTheme === theme.id}
                  onSelect={() => updateThemeField('selectedTheme', theme.id)}
                />
              ))}
            </div>
        </CardContent>
        <CardFooter className="justify-end">
            <Button
                variant="secondary"
                size="sm"
                disabled={!hasChanges.themeSelection || isSaving}
                onClick={() => applySectionChanges('theme', { ...initialSettings.theme, selectedTheme: allSettings.theme.selectedTheme }, 'themeSelection')}
                className="gap-1.5"
            >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paintbrush className="h-4 w-4" />}
                Apply Theme
            </Button>
        </CardFooter>
      </Card>

      <Card>
         <CardHeader>
           <CardTitle>Background Overlay</CardTitle>
           <CardDescription>Adjust the color and opacity of the overlay applied over the background image.</CardDescription>
         </CardHeader>
         <CardContent>
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center"><SunIcon className="mr-2 h-5 w-5"/> Light Mode Overlay</h3>
                    <div className="space-y-2">
                        <Label>Overlay Opacity: {formatOpacity(lightOpacity)}</Label>
                        <Slider 
                            value={[lightOpacity]} 
                            onValueChange={(value) => updateThemeField('lightOverlayOpacity', value[0])}
                            max={1} 
                            step={0.01} 
                        />
                    </div>
                    <div className="space-y-2">
                         <Label>Overlay Color</Label>
                         <ColorPickerInput 
                            label="Light Overlay Color"
                            value={lightOverlayColor}
                            onChange={(color) => updateThemeField('lightOverlayColor', color)}
                         />
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center"><MoonIcon className="mr-2 h-5 w-5"/> Dark Mode Overlay</h3>
                     <div className="space-y-2">
                        <Label>Overlay Opacity: {formatOpacity(darkOpacity)}</Label>
                         <Slider 
                            value={[darkOpacity]} 
                            onValueChange={(value) => updateThemeField('darkOverlayOpacity', value[0])}
                            max={1} 
                            step={0.01} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Overlay Color</Label>
                         <ColorPickerInput 
                            label="Dark Overlay Color"
                            value={darkOverlayColor}
                            onChange={(color) => updateThemeField('darkOverlayColor', color)}
                         />
                    </div>
                </div>
             </div>
         </CardContent>
         <CardFooter className="justify-end">
             <Button
                variant="secondary"
                size="sm"
                disabled={!hasChanges.overlay || isSaving}
                onClick={() => applySectionChanges('theme', { 
                    ...initialSettings.theme,
                    lightOverlayOpacity: allSettings.theme.lightOverlayOpacity,
                    darkOverlayOpacity: allSettings.theme.darkOverlayOpacity,
                    lightOverlayColor: allSettings.theme.lightOverlayColor,
                    darkOverlayColor: allSettings.theme.darkOverlayColor,
                 }, 'overlay')}
                 className="gap-1.5"
             >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" />}
                 Apply Overlay
             </Button>
         </CardFooter>
      </Card>

      <div>
         <h2 className="text-xl font-medium mb-4">Background Overlay Preview</h2>
         <div className="bg-muted p-4 rounded-lg">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <h3 className="text-sm font-medium mb-2">Light Mode</h3>
               <div className="aspect-video bg-card rounded-md border overflow-hidden shadow-sm relative">
                 <div 
                   className="absolute inset-0 bg-cover bg-center"
                   style={{
                     backgroundImage: selectedTheme === 'custom' 
                        ? 'url(/images/custom-light-background.jpg)' 
                        : `url(/images/${selectedTheme}-light-background.jpg)`,
                   }}
                 />
                 <div 
                   className="absolute inset-0" 
                   style={{ 
                     backgroundColor: lightOverlayColor,
                     opacity: lightOpacity 
                   }} 
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <p className="text-foreground font-medium bg-background/50 px-2 py-1 rounded">Preview</p> 
                 </div>
               </div>
             </div>
             
             <div>
               <h3 className="text-sm font-medium mb-2">Dark Mode</h3>
               <div className="aspect-video bg-card rounded-md border overflow-hidden shadow-sm relative dark">
                 <div 
                   className="absolute inset-0 bg-cover bg-center"
                   style={{
                     backgroundImage: selectedTheme === 'custom' 
                        ? 'url(/images/custom-dark-background.jpg)' 
                        : `url(/images/${selectedTheme}-dark-background.jpg)`,
                   }}
                 />
                 <div 
                   className="absolute inset-0" 
                   style={{ 
                     backgroundColor: darkOverlayColor,
                     opacity: darkOpacity 
                   }} 
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <p className="text-foreground font-medium bg-background/50 px-2 py-1 rounded">Preview</p> 
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>

      <Card>
        <CardHeader>
             <CardTitle>Theme Colors</CardTitle>
             <CardDescription>Customize the colors for light and dark themes.</CardDescription>
        </CardHeader>
        <CardContent>
            <ThemeColorsSettings 
                initialColors={allSettings.theme.colors}
                onColorsChange={updateThemeColors}
                disabled={isSaving}
            />
        </CardContent>
         <CardFooter className="justify-end">
             <Button
                variant="secondary"
                size="sm"
                disabled={!hasChanges.colors || isSaving}
                onClick={() => applySectionChanges('theme', { ...initialSettings.theme, colors: allSettings.theme.colors }, 'colors')}
                 className="gap-1.5"
             >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Palette className="h-4 w-4" />}
                 Apply Colors
             </Button>
         </CardFooter>
      </Card>

      <Card>
          <CardHeader>
             <CardTitle>Social Links</CardTitle>
             <CardDescription>Manage social media and other links displayed in the site footer or menu.</CardDescription>
         </CardHeader>
         <CardContent>
             <SocialLinksManager 
                initialLinks={allSettings.socialLinks}
                onLinksChange={updateSocialLinks}
                disabled={isSaving}
            />
         </CardContent>
          <CardFooter className="justify-end">
             <Button
                variant="secondary"
                size="sm"
                disabled={!hasChanges.links || isSaving}
                onClick={() => applySectionChanges('socialLinks', allSettings.socialLinks, 'links')}
                 className="gap-1.5"
             >
                 {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                 Apply Links
             </Button>
         </CardFooter>
      </Card>

    </div>
  );
}

// Theme card component
interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    description: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard = ({ theme, isSelected, onSelect }: ThemeCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer transition-all border-2",
        isSelected ? "border-primary" : "border-transparent hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <div className="aspect-video w-full bg-muted relative">
        {!imageError ? (
          <img 
            src={`/images/${theme.id}-light-background.jpg`} 
            alt={`${theme.name} theme`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <Check className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center justify-between">
          {theme.name}
          {isSelected && <Palette className="h-4 w-4 text-primary" />}
        </CardTitle>
        <CardDescription>{theme.description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

// Helper to safely parse JSON
const safeJsonParse = (str: string | null): DemoSettingsState | null => {
    if (!str) return null;
    try {
        const parsed = JSON.parse(str);
        // Add more robust validation if needed
        if (parsed && parsed.theme && parsed.theme.colors && Array.isArray(parsed.socialLinks)) {
            // Merge with defaults to ensure all keys exist
            return {
                theme: { ...defaultSettings.theme, ...parsed.theme, colors: { ...defaultSettings.theme.colors, ...parsed.theme.colors } },
                socialLinks: parsed.socialLinks,
            };
        }
        return null;
    } catch (e) {
        console.error("[Demo] Error parsing settings from Local Storage:", e);
        return null;
    }
}; 