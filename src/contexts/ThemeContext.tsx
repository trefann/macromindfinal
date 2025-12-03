import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { hexToHsl, CustomThemeColors, defaultCustomColors } from "@/components/CustomThemeEditor";

export type ThemeName = 
  | "light" 
  | "dark" 
  | "amoled" 
  | "orange" 
  | "blue" 
  | "neon" 
  | "high-contrast"
  | "custom"
  | "system";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => Promise<void>;
  actualTheme: Exclude<ThemeName, "system">;
  customColors: CustomThemeColors;
  setCustomColors: (colors: CustomThemeColors) => void;
  applyCustomTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeName>("system");
  const [actualTheme, setActualTheme] = useState<Exclude<ThemeName, "system">>("light");
  const [customColors, setCustomColorsState] = useState<CustomThemeColors>(defaultCustomColors);

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };

  // Resolve actual theme from preference
  const resolveTheme = (themePref: ThemeName): Exclude<ThemeName, "system"> => {
    if (themePref === "system") {
      return getSystemTheme();
    }
    return themePref;
  };

  // Apply custom theme CSS variables
  const applyCustomColors = (colors: CustomThemeColors) => {
    const root = document.documentElement;
    root.style.setProperty("--background", hexToHsl(colors.background));
    root.style.setProperty("--foreground", hexToHsl(colors.foreground));
    root.style.setProperty("--card", hexToHsl(colors.card));
    root.style.setProperty("--card-foreground", hexToHsl(colors.cardForeground));
    root.style.setProperty("--primary", hexToHsl(colors.primary));
    root.style.setProperty("--primary-foreground", hexToHsl(colors.primaryForeground));
    root.style.setProperty("--secondary", hexToHsl(colors.secondary));
    root.style.setProperty("--secondary-foreground", hexToHsl(colors.secondaryForeground));
    root.style.setProperty("--muted", hexToHsl(colors.muted));
    root.style.setProperty("--muted-foreground", hexToHsl(colors.mutedForeground));
    root.style.setProperty("--accent", hexToHsl(colors.accent));
    root.style.setProperty("--accent-foreground", hexToHsl(colors.accentForeground));
    root.style.setProperty("--border", hexToHsl(colors.border));
    root.style.setProperty("--input", hexToHsl(colors.border));
    root.style.setProperty("--ring", hexToHsl(colors.primary));
    root.style.setProperty("--popover", hexToHsl(colors.card));
    root.style.setProperty("--popover-foreground", hexToHsl(colors.cardForeground));
    root.style.setProperty("--destructive", "0 85% 60%");
    root.style.setProperty("--destructive-foreground", hexToHsl(colors.foreground));
  };

  // Clear custom CSS variables
  const clearCustomColors = () => {
    const root = document.documentElement;
    const customProps = [
      "--background", "--foreground", "--card", "--card-foreground",
      "--primary", "--primary-foreground", "--secondary", "--secondary-foreground",
      "--muted", "--muted-foreground", "--accent", "--accent-foreground",
      "--border", "--input", "--ring", "--popover", "--popover-foreground",
      "--destructive", "--destructive-foreground"
    ];
    customProps.forEach(prop => root.style.removeProperty(prop));
  };

  // Apply theme to DOM
  const applyTheme = (themeName: Exclude<ThemeName, "system">) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "amoled", "orange", "blue", "neon", "high-contrast", "custom");
    
    // Clear any custom CSS variables first
    if (themeName !== "custom") {
      clearCustomColors();
    }
    
    // Add new theme class
    root.classList.add(themeName);
    
    // Apply custom colors if custom theme
    if (themeName === "custom") {
      applyCustomColors(customColors);
    }
    
    // Special handling for high contrast mode
    if (themeName === "high-contrast") {
      root.style.fontSize = "110%";
    } else {
      root.style.fontSize = "";
    }
    
    setActualTheme(themeName);
  };

  // Load theme from database
  useEffect(() => {
    const loadTheme = async () => {
      if (!user) {
        const systemTheme = getSystemTheme();
        setThemeState("system");
        applyTheme(systemTheme);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("theme_preference, custom_theme_colors")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const savedTheme = (data?.theme_preference as ThemeName) || "system";
        
        // Load custom colors if available
        if (data?.custom_theme_colors) {
          setCustomColorsState(data.custom_theme_colors as unknown as CustomThemeColors);
        }
        
        setThemeState(savedTheme);
        
        // Apply theme after loading custom colors
        if (savedTheme === "custom" && data?.custom_theme_colors) {
          applyTheme("custom");
          applyCustomColors(data.custom_theme_colors as unknown as CustomThemeColors);
        } else {
          applyTheme(resolveTheme(savedTheme));
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        const systemTheme = getSystemTheme();
        setThemeState("system");
        applyTheme(systemTheme);
      }
    };

    loadTheme();
  }, [user]);

  // Listen to system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Set and save theme
  const setTheme = async (newTheme: ThemeName) => {
    setThemeState(newTheme);
    const resolved = resolveTheme(newTheme);
    applyTheme(resolved);

    if (user) {
      try {
        await supabase
          .from("profiles")
          .update({ theme_preference: newTheme })
          .eq("id", user.id);
      } catch (error) {
        console.error("Error saving theme:", error);
      }
    }
  };

  // Set custom colors (local state only)
  const setCustomColors = (colors: CustomThemeColors) => {
    setCustomColorsState(colors);
    // Live preview if custom theme is active
    if (theme === "custom") {
      applyCustomColors(colors);
    }
  };

  // Apply and save custom theme
  const applyCustomTheme = async () => {
    setThemeState("custom");
    applyTheme("custom");
    applyCustomColors(customColors);

    if (user) {
      try {
        await supabase
          .from("profiles")
          .update({ 
            theme_preference: "custom",
            custom_theme_colors: JSON.parse(JSON.stringify(customColors))
          })
          .eq("id", user.id);
      } catch (error) {
        console.error("Error saving custom theme:", error);
        throw error;
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      actualTheme, 
      customColors, 
      setCustomColors,
      applyCustomTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
