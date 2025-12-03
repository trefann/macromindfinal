import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export interface CustomThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
}

interface CustomThemeEditorProps {
  colors: CustomThemeColors;
  onChange: (colors: CustomThemeColors) => void;
  onApply: () => void;
  onReset: () => void;
}

const defaultCustomColors: CustomThemeColors = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#141414",
  cardForeground: "#fafafa",
  primary: "#8b5cf6",
  primaryForeground: "#000000",
  secondary: "#27272a",
  secondaryForeground: "#fafafa",
  muted: "#262626",
  mutedForeground: "#a1a1aa",
  accent: "#a855f7",
  accentForeground: "#000000",
  border: "#27272a",
};

const colorFields: { key: keyof CustomThemeColors; label: string; description: string }[] = [
  { key: "background", label: "Background", description: "Main app background" },
  { key: "foreground", label: "Text Color", description: "Primary text color" },
  { key: "primary", label: "Primary", description: "Buttons, links, accents" },
  { key: "primaryForeground", label: "Primary Text", description: "Text on primary elements" },
  { key: "card", label: "Card Background", description: "Cards and panels" },
  { key: "cardForeground", label: "Card Text", description: "Text on cards" },
  { key: "secondary", label: "Secondary", description: "Secondary buttons" },
  { key: "accent", label: "Accent", description: "Highlights and hovers" },
  { key: "muted", label: "Muted", description: "Subtle backgrounds" },
  { key: "mutedForeground", label: "Muted Text", description: "Subtle text" },
  { key: "border", label: "Border", description: "Borders and dividers" },
];

// Convert hex to HSL string for CSS variables
export const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Convert HSL string to hex
export const hslToHex = (hsl: string): string => {
  const parts = hsl.match(/(\d+(?:\.\d+)?)/g);
  if (!parts || parts.length < 3) return "#000000";

  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const CustomThemeEditor = ({ colors, onChange, onApply, onReset }: CustomThemeEditorProps) => {
  const handleColorChange = (key: keyof CustomThemeColors, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5 text-primary" />
          Custom Theme Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Preview */}
        <div 
          className="rounded-lg p-4 space-y-3"
          style={{ 
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`
          }}
        >
          <div 
            className="rounded-md p-3"
            style={{ 
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`
            }}
          >
            <p style={{ color: colors.cardForeground }} className="font-semibold text-sm">
              Preview Card
            </p>
            <p style={{ color: colors.mutedForeground }} className="text-xs mt-1">
              This shows how your theme will look
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div 
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: colors.primary, color: colors.primaryForeground }}
            >
              Primary Button
            </div>
            <div 
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: colors.secondary, color: colors.secondaryForeground }}
            >
              Secondary
            </div>
            <div 
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: colors.accent, color: colors.accentForeground }}
            >
              Accent
            </div>
          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {colorFields.map(({ key, label, description }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs font-medium">{label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-10 h-8 p-0 border-0 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="h-8 text-xs font-mono flex-1 min-w-0"
                  placeholder="#000000"
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={onApply} className="flex-1">
            Apply Custom Theme
          </Button>
          <Button variant="outline" size="icon" onClick={onReset} title="Reset to defaults">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { defaultCustomColors };
