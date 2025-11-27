import { useState } from "react";
import { useTheme, ThemeName } from "@/contexts/ThemeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Monitor, Sun, Moon, Zap, Droplet, Sparkles, Accessibility } from "lucide-react";
import { toast } from "sonner";

interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
  icon: React.ReactNode;
  preview: {
    background: string;
    card: string;
    text: string;
    accent: string;
  };
}

const themes: ThemeOption[] = [
  {
    name: "system",
    label: "System Default",
    description: "Follow device settings",
    icon: <Monitor className="h-5 w-5" />,
    preview: {
      background: "bg-gradient-to-br from-slate-100 to-slate-200",
      card: "bg-white",
      text: "text-slate-900",
      accent: "bg-slate-600",
    },
  },
  {
    name: "light",
    label: "Light Mode",
    description: "Clean and bright interface",
    icon: <Sun className="h-5 w-5" />,
    preview: {
      background: "bg-gradient-to-br from-gray-50 to-gray-100",
      card: "bg-white",
      text: "text-gray-900",
      accent: "bg-blue-500",
    },
  },
  {
    name: "dark",
    label: "Dark Mode",
    description: "Easy on the eyes at night",
    icon: <Moon className="h-5 w-5" />,
    preview: {
      background: "bg-gradient-to-br from-gray-900 to-gray-800",
      card: "bg-gray-800",
      text: "text-gray-100",
      accent: "bg-blue-400",
    },
  },
  {
    name: "amoled",
    label: "AMOLED Black",
    description: "Pure black for battery saving",
    icon: <Moon className="h-5 w-5 fill-current" />,
    preview: {
      background: "bg-black",
      card: "bg-zinc-950",
      text: "text-white",
      accent: "bg-white",
    },
  },
  {
    name: "orange",
    label: "Energetic Orange",
    description: "Motivational orange theme",
    icon: <Zap className="h-5 w-5" />,
    preview: {
      background: "bg-gradient-to-br from-orange-50 to-amber-100",
      card: "bg-white",
      text: "text-gray-900",
      accent: "bg-orange-500",
    },
  },
  {
    name: "blue",
    label: "Calm Blue",
    description: "Peaceful wellness aesthetic",
    icon: <Droplet className="h-5 w-5" />,
    preview: {
      background: "bg-gradient-to-br from-blue-50 to-cyan-50",
      card: "bg-white",
      text: "text-gray-900",
      accent: "bg-blue-400",
    },
  },
  {
    name: "neon",
    label: "Fitness Neon",
    description: "Neon green energy theme",
    icon: <Sparkles className="h-5 w-5" />,
    preview: {
      background: "bg-black",
      card: "bg-zinc-900",
      text: "text-white",
      accent: "bg-green-500",
    },
  },
  {
    name: "high-contrast",
    label: "High Contrast",
    description: "Enhanced accessibility mode",
    icon: <Accessibility className="h-5 w-5" />,
    preview: {
      background: "bg-white",
      card: "bg-gray-100",
      text: "text-black",
      accent: "bg-black",
    },
  },
];

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleThemeChange = async (newTheme: ThemeName) => {
    setIsUpdating(true);
    try {
      await setTheme(newTheme);
      toast.success("Theme updated successfully!");
    } catch (error) {
      toast.error("Failed to update theme");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme. Changes apply instantly across the entire app.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themes.map((themeOption) => {
          const isActive = theme === themeOption.name;
          
          return (
            <Card
              key={themeOption.name}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isActive ? "ring-2 ring-primary shadow-lg" : ""
              }`}
              onClick={() => handleThemeChange(themeOption.name)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Preview */}
                  <div className={`h-24 rounded-lg ${themeOption.preview.background} p-3 space-y-2`}>
                    <div className={`h-8 rounded ${themeOption.preview.card} ${themeOption.preview.text} flex items-center px-2 text-xs font-medium`}>
                      Nav Bar
                    </div>
                    <div className="flex gap-2">
                      <div className={`flex-1 h-3 rounded ${themeOption.preview.card}`} />
                      <div className={`w-12 h-3 rounded ${themeOption.preview.accent}`} />
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {themeOption.icon}
                        <span className="font-medium text-sm">{themeOption.label}</span>
                      </div>
                      {isActive && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </p>
                  </div>

                  {/* Apply Button */}
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    disabled={isUpdating}
                  >
                    {isActive ? "Active" : "Apply"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
