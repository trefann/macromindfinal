import { useState } from "react";
import { useTheme, ThemeName } from "@/contexts/ThemeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Monitor, Sun, Moon, Zap, Droplet, Sparkles, Accessibility, Palette } from "lucide-react";
import { toast } from "sonner";
import { CustomThemeEditor, defaultCustomColors } from "./CustomThemeEditor";

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
  const { theme, setTheme, customColors, setCustomColors, applyCustomTheme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCustomEditor, setShowCustomEditor] = useState(theme === "custom");

  const handleThemeChange = async (newTheme: ThemeName) => {
    if (newTheme === "custom") {
      setShowCustomEditor(true);
      return;
    }
    
    setIsUpdating(true);
    setShowCustomEditor(false);
    try {
      await setTheme(newTheme);
      toast.success("Theme updated successfully!");
    } catch (error) {
      toast.error("Failed to update theme");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyCustomTheme = async () => {
    setIsUpdating(true);
    try {
      await applyCustomTheme();
      toast.success("Custom theme applied!");
    } catch (error) {
      toast.error("Failed to save custom theme");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetCustomColors = () => {
    setCustomColors(defaultCustomColors);
    toast.info("Colors reset to defaults");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme. Changes apply instantly across the entire app.
        </p>
      </div>

      {/* Preset Themes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {themes.map((themeOption) => {
          const isActive = theme === themeOption.name;
          
          return (
            <Card
              key={themeOption.name}
              className={`cursor-pointer transition-all hover:scale-[1.02] ${
                isActive ? "ring-2 ring-primary shadow-lg" : ""
              }`}
              onClick={() => handleThemeChange(themeOption.name)}
            >
              <CardContent className="p-2 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  {/* Preview */}
                  <div className={`h-16 sm:h-24 rounded-lg ${themeOption.preview.background} p-2 sm:p-3 space-y-1 sm:space-y-2`}>
                    <div className={`h-5 sm:h-8 rounded ${themeOption.preview.card} ${themeOption.preview.text} flex items-center px-1 sm:px-2 text-[10px] sm:text-xs font-medium`}>
                      Nav Bar
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <div className={`flex-1 h-2 sm:h-3 rounded ${themeOption.preview.card}`} />
                      <div className={`w-8 sm:w-12 h-2 sm:h-3 rounded ${themeOption.preview.accent}`} />
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="[&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-5 sm:[&>svg]:w-5">{themeOption.icon}</span>
                        <span className="font-medium text-xs sm:text-sm truncate">{themeOption.label}</span>
                      </div>
                      {isActive && (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                      {themeOption.description}
                    </p>
                  </div>

                  {/* Apply Button */}
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="w-full h-7 sm:h-9 text-xs sm:text-sm"
                    disabled={isUpdating}
                  >
                    {isActive ? "Active" : "Apply"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Custom Theme Card */}
        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] ${
            theme === "custom" ? "ring-2 ring-primary shadow-lg" : ""
          }`}
          onClick={() => setShowCustomEditor(!showCustomEditor)}
        >
          <CardContent className="p-2 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {/* Preview with custom colors */}
              <div 
                className="h-16 sm:h-24 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2"
                style={{ background: `linear-gradient(135deg, ${customColors.background}, ${customColors.card})` }}
              >
                <div 
                  className="h-5 sm:h-8 rounded flex items-center px-1 sm:px-2 text-[10px] sm:text-xs font-medium"
                  style={{ backgroundColor: customColors.card, color: customColors.cardForeground }}
                >
                  Nav Bar
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <div className="flex-1 h-2 sm:h-3 rounded" style={{ backgroundColor: customColors.card }} />
                  <div className="w-8 sm:w-12 h-2 sm:h-3 rounded" style={{ backgroundColor: customColors.primary }} />
                </div>
              </div>

              {/* Theme Info */}
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Palette className="h-3 w-3 sm:h-5 sm:w-5" />
                    <span className="font-medium text-xs sm:text-sm">Custom Theme</span>
                  </div>
                  {theme === "custom" && (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Create your own color scheme
                </p>
              </div>

              {/* Edit Button */}
              <Button
                variant={theme === "custom" ? "default" : "outline"}
                size="sm"
                className="w-full h-7 sm:h-9 text-xs sm:text-sm"
                disabled={isUpdating}
              >
                {showCustomEditor ? "Editing..." : theme === "custom" ? "Active" : "Customize"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Theme Editor */}
      {showCustomEditor && (
        <CustomThemeEditor
          colors={customColors}
          onChange={setCustomColors}
          onApply={handleApplyCustomTheme}
          onReset={handleResetCustomColors}
        />
      )}
    </div>
  );
};
