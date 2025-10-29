// Mock data for Macromind fitness app

export const mockDietPlan = {
  calories: 2200,
  protein: 165,
  carbs: 220,
  fats: 73,
  meals: [
    {
      name: "Breakfast",
      time: "8:00 AM",
      items: ["Oatmeal with berries", "Greek yogurt", "Almonds"],
      calories: 450,
      protein: 25,
      carbs: 60,
      fats: 15,
    },
    {
      name: "Lunch",
      time: "12:30 PM",
      items: ["Grilled chicken breast", "Brown rice", "Steamed vegetables"],
      calories: 650,
      protein: 55,
      carbs: 70,
      fats: 18,
    },
    {
      name: "Snack",
      time: "3:30 PM",
      items: ["Protein shake", "Banana"],
      calories: 300,
      protein: 30,
      carbs: 35,
      fats: 8,
    },
    {
      name: "Dinner",
      time: "7:00 PM",
      items: ["Salmon fillet", "Quinoa", "Mixed salad"],
      calories: 700,
      protein: 50,
      carbs: 45,
      fats: 28,
    },
    {
      name: "Evening Snack",
      time: "9:00 PM",
      items: ["Cottage cheese", "Walnuts"],
      calories: 200,
      protein: 15,
      carbs: 10,
      fats: 12,
    },
  ],
};

export const mockWorkoutPlan = {
  name: "Full Body Strength",
  duration: "60 min",
  exercises: [
    {
      name: "Barbell Squats",
      sets: 4,
      reps: "8-10",
      rest: "90s",
      muscleGroup: "Legs",
    },
    {
      name: "Bench Press",
      sets: 4,
      reps: "8-10",
      rest: "90s",
      muscleGroup: "Chest",
    },
    {
      name: "Deadlifts",
      sets: 3,
      reps: "6-8",
      rest: "120s",
      muscleGroup: "Back",
    },
    {
      name: "Overhead Press",
      sets: 3,
      reps: "10-12",
      rest: "60s",
      muscleGroup: "Shoulders",
    },
    {
      name: "Pull-ups",
      sets: 3,
      reps: "8-12",
      rest: "90s",
      muscleGroup: "Back",
    },
    {
      name: "Dumbbell Curls",
      sets: 3,
      reps: "12-15",
      rest: "60s",
      muscleGroup: "Arms",
    },
  ],
};

export const mockProgressData = {
  weight: [
    { date: "Week 1", value: 185 },
    { date: "Week 2", value: 183 },
    { date: "Week 3", value: 182 },
    { date: "Week 4", value: 180 },
    { date: "Week 5", value: 179 },
    { date: "Week 6", value: 178 },
  ],
  calories: [
    { date: "Mon", value: 2100 },
    { date: "Tue", value: 2300 },
    { date: "Wed", value: 2150 },
    { date: "Thu", value: 2250 },
    { date: "Fri", value: 2200 },
    { date: "Sat", value: 2400 },
    { date: "Sun", value: 2050 },
  ],
};

export const mockProfile = {
  name: "Alex Johnson",
  age: 28,
  gender: "Male",
  height: "5'11\"",
  weight: 178,
  goal: "Muscle Gain",
  activityLevel: "Moderately Active",
  cuisine: "Mediterranean",
};

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const mockChatMessages: Message[] = [
  {
    role: "assistant" as const,
    content: "Hello! I'm your AI fitness coach. How can I help you today?",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    role: "user" as const,
    content: "I want to know if my diet plan is optimized for muscle gain.",
    timestamp: new Date(Date.now() - 3500000),
  },
  {
    role: "assistant" as const,
    content:
      "Your current plan looks solid! With 165g of protein and 2200 calories, you're in a good position for lean muscle growth. Consider adding 10-15g more protein post-workout for optimal recovery.",
    timestamp: new Date(Date.now() - 3400000),
  },
];
