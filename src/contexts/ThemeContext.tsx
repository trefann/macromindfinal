import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ThemeName = 
  | "light" 
  | "dark" 
  | "amoled" 
  | "orange" 
  | "blue" 
  | "neon" 
  | "high-contrast"
  | "system";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => Promise<void>;
  actualTheme: Exclude<ThemeName, "system">; // The resolved theme (without "system")
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

  // Apply theme to DOM
  const applyTheme = (themeName: Exclude<ThemeName, "system">) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "amoled", "orange", "blue", "neon", "high-contrast");
    
    // Add new theme class
    root.classList.add(themeName);
    
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
        // Not logged in, use system default
        const systemTheme = getSystemTheme();
        setThemeState("system");
        applyTheme(systemTheme);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("theme_preference")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const savedTheme = (data?.theme_preference as ThemeName) || "system";
        setThemeState(savedTheme);
        applyTheme(resolveTheme(savedTheme));
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

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
