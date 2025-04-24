'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPickerInput } from '@/components/ui/color-picker';

// Default colors to reset to
const defaultColors = {
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
};

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

// --- New Props Interface ---
interface ThemeColorsSettingsProps {
    initialColors: ThemeColorSettingsState; // Receive initial state from parent
    onColorsChange: (newColors: ThemeColorSettingsState) => void; // Callback to parent
    disabled?: boolean; // To disable inputs while parent is saving
}

export function ThemeColorsSettings({ 
    initialColors, 
    onColorsChange, 
    disabled = false 
}: ThemeColorsSettingsProps) {
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light");
  const [settings, setSettings] = useState<ThemeColorSettingsState>(initialColors);

  // Sync local state if initialColors prop changes (e.g., after parent resets)
  useEffect(() => {
    setSettings(initialColors);
  }, [initialColors]);

  // Update local state and notify parent via callback
  const updateThemeColor = useCallback((mode: "light" | "dark", property: keyof ThemeModeColors, value: string) => {
    const newSettings = {
      ...settings,
      [mode]: {
        ...settings[mode],
        [property]: value
      }
    };
    setSettings(newSettings);
    onColorsChange(newSettings); // Notify parent of the change
  }, [settings, onColorsChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Colors</CardTitle>
        <CardDescription>
          Customize the colors for light and dark themes (Changes saved with main 'Save Changes' button).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="light" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "light" | "dark")}
        >
          <TabsList>
            <TabsTrigger value="light">Light Theme</TabsTrigger>
            <TabsTrigger value="dark">Dark Theme</TabsTrigger>
          </TabsList>
          <TabsContent value="light" className="space-y-4 py-4" key="light-content">
            <h3 className="text-lg font-medium mb-2">Background Colors</h3>
            <ColorPickerInput
              label="Background Color"
              value={settings.light.background}
              onChange={(value) => updateThemeColor("light", "background", value)}
              disabled={disabled}
            />
            <ColorPickerInput
              label="Card Color"
              value={settings.light.card}
              onChange={(value) => updateThemeColor("light", "card", value)}
              disabled={disabled}
            />
            <ColorPickerInput
              label="Primary Color"
              value={settings.light.primary}
              onChange={(value) => updateThemeColor("light", "primary", value)}
              disabled={disabled}
            />
            
            <h3 className="text-lg font-medium mb-2 mt-6">Text Colors</h3>
            <ColorPickerInput
              label="Primary Text Color"
              value={settings.light.primaryForeground}
              onChange={(value) => updateThemeColor("light", "primaryForeground", value)}
              disabled={disabled}
            />
            <ColorPickerInput
              label="Secondary Text Color"
              value={settings.light.secondaryForeground}
              onChange={(value) => updateThemeColor("light", "secondaryForeground", value)}
              disabled={disabled}
            />
            <ColorPickerInput
              label="Muted Text Color"
              value={settings.light.mutedForeground}
              onChange={(value) => updateThemeColor("light", "mutedForeground", value)}
              disabled={disabled}
            />
          </TabsContent>
          <TabsContent value="dark" className="space-y-4 py-4" key="dark-content">
            <h3 className="text-lg font-medium mb-2">Background Colors</h3>
            <ColorPickerInput
              label="Background Color"
              value={settings.dark.background}
              onChange={(value) => updateThemeColor("dark", "background", value)}
              disabled={disabled}
            />
            <ColorPickerInput
              label="Card Color"
              value={settings.dark.card}
              onChange={(value) => updateThemeColor("dark", "card", value)}
              disabled={disabled}
            />
            <ColorPickerInput
              label="Primary Color"
              value={settings.dark.primary}
              onChange={(value) => updateThemeColor("dark", "primary", value)}
              disabled={disabled}
            />
            
            <h3 className="text-lg font-medium mb-2 mt-6">Text Colors</h3>
            <ColorPickerInput
              label="Primary Text Color"
              value={settings.dark.primaryForeground}
              onChange={(value) => updateThemeColor("dark", "primaryForeground", value)}
              disabled={disabled}
            />
            <ColorPickerInput
              label="Secondary Text Color"
              value={settings.dark.secondaryForeground}
              onChange={(value) => updateThemeColor("dark", "secondaryForeground", value)}
              disabled={disabled}
            />
            <ColorPickerInput
              label="Muted Text Color"
              value={settings.dark.mutedForeground}
              onChange={(value) => updateThemeColor("dark", "mutedForeground", value)}
              disabled={disabled}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 