import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AICoach from "./pages/AICoach";
import Progress from "./pages/Progress";
import FormChecker from "./pages/FormChecker";
import ProfileSetup from "./pages/ProfileSetup";
import DietPlanner from "./pages/DietPlanner";
import WorkoutPlanner from "./pages/WorkoutPlanner";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/form-checker" element={<FormChecker />} />
          <Route path="/profile" element={<ProfileSetup />} />
          <Route path="/diet-planner" element={<DietPlanner />} />
          <Route path="/workout-planner" element={<WorkoutPlanner />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
