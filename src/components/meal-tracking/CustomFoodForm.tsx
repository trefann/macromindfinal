import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CustomFoodFormProps {
  onFoodCreated: () => void;
}

export const CustomFoodForm = ({ onFoodCreated }: CustomFoodFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    servingSize: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    ingredients: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('custom_foods').insert({
        user_id: user.id,
        name: formData.name,
        brand: formData.brand || null,
        serving_size: formData.servingSize,
        calories: parseInt(formData.calories),
        protein: parseFloat(formData.protein),
        carbs: parseFloat(formData.carbs),
        fats: parseFloat(formData.fats),
        ingredients: formData.ingredients || null,
      });

      if (error) throw error;

      setFormData({
        name: "",
        brand: "",
        servingSize: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        ingredients: "",
      });

      onFoodCreated();
    } catch (error) {
      console.error('Error creating custom food:', error);
      toast({
        title: "Error",
        description: "Failed to create custom food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Food Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Homemade Protein Shake"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Brand (Optional)</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="e.g., MyProtein"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="servingSize">Serving Size *</Label>
        <Input
          id="servingSize"
          value={formData.servingSize}
          onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
          placeholder="e.g., 1 scoop, 100g, 1 cup"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calories *</Label>
          <Input
            id="calories"
            type="number"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="protein">Protein (g) *</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            value={formData.protein}
            onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carbs">Carbs (g) *</Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            value={formData.carbs}
            onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fats">Fats (g) *</Label>
          <Input
            id="fats"
            type="number"
            step="0.1"
            value={formData.fats}
            onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients (Optional)</Label>
        <Textarea
          id="ingredients"
          value={formData.ingredients}
          onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
          placeholder="List ingredients and portions..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Custom Food"}
      </Button>
    </form>
  );
};
