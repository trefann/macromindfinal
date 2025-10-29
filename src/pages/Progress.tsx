import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { mockProgressData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Scale, Activity, TrendingUp, Calendar } from "lucide-react";

const Progress = () => {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Progress Tracker
          </h1>
          <p className="text-muted-foreground">
            Visualize your fitness journey and achievements
          </p>
        </div>

        {/* Stats Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                  <p className="text-3xl font-bold">178 lbs</p>
                  <p className="text-sm text-green-400 mt-1">-7 lbs from start</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center">
                  <Scale className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workout Streak</p>
                  <p className="text-3xl font-bold">14 days</p>
                  <p className="text-sm text-green-400 mt-1">Personal best!</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Calories</p>
                  <p className="text-3xl font-bold">2,178</p>
                  <p className="text-sm text-muted-foreground mt-1">This week</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                  <p className="text-3xl font-bold">42</p>
                  <p className="text-sm text-muted-foreground mt-1">Last 6 weeks</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Weight Progress (6 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={mockProgressData.weight}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" domain={[175, 190]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#weightGradient)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(217, 91%, 60%)", r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
                      <stop offset="100%" stopColor="hsl(270, 80%, 65%)" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Body Measurements */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Body Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Chest", value: "42 in", change: "+0.5" },
                  { label: "Waist", value: "32 in", change: "-2.0" },
                  { label: "Arms", value: "15 in", change: "+0.3" },
                  { label: "Legs", value: "24 in", change: "+0.8" },
                ].map((measurement, index) => (
                  <div key={index} className="p-4 rounded-xl glass">
                    <p className="text-sm text-muted-foreground mb-1">
                      {measurement.label}
                    </p>
                    <p className="text-2xl font-bold">{measurement.value}</p>
                    <p className={`text-sm mt-1 ${
                      parseFloat(measurement.change) > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>
                      {measurement.change > "0" ? "+" : ""}{measurement.change} in
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Progress;
