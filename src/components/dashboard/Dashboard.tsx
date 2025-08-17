import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DailyGoal, Task } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";
import Header from "./Header";
import Footer from "./Footer";
import GoalCard from "./GoalCard";
import TaskCard from "./TaskCard";
import AddGoalDialog from "./AddGoalDialog";
import AddTaskDialog from "./AddTaskDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckSquare, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchDailyGoals(), fetchTasks()]);
    setLoading(false);
  };

  const fetchDailyGoals = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_goals")
        .select("*")
        .eq("goal_date", today)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((goal) => goal.user_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);

        if (!profilesError && profiles) {
          const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
          const enrichedData = data.map((goal) => ({
            ...goal,
            profiles: profileMap.get(goal.user_id) || {
              display_name: "Unknown User",
            },
          }));
          setDailyGoals(enrichedData);
        } else {
          setDailyGoals(data);
        }
      } else {
        setDailyGoals([]);
      }
    } catch (error) {
      console.error("Error fetching daily goals:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile and category data separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((task) => task.user_id))];
        const categoryIds = [
          ...new Set(data.map((task) => task.category_id).filter(Boolean)),
        ];

        const [profilesResult, categoriesResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", userIds),
          categoryIds.length > 0
            ? supabase
                .from("categories")
                .select("id, name")
                .in("id", categoryIds)
            : { data: [], error: null },
        ]);

        const profileMap = new Map(
          (profilesResult.data || []).map((p) => [p.user_id, p])
        );
        const categoryMap = new Map(
          (categoriesResult.data || []).map((c) => [c.id, c])
        );

        const enrichedData = data.map((task) => ({
          ...task,
          profiles: profileMap.get(task.user_id) || {
            display_name: "Unknown User",
          },
          categories: task.category_id
            ? categoryMap.get(task.category_id)
            : undefined,
        }));

        setTasks(enrichedData);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const getConsistencyStats = () => {
    const myGoals = dailyGoals.filter((goal) => goal.user_id === user?.id);
    const myTasks = tasks.filter((task) => task.user_id === user?.id);
    const completedGoals = myGoals.filter((goal) => goal.completed).length;
    const completedTasks = myTasks.filter((task) => task.completed).length;
    const totalGoals = myGoals.length;
    const totalTasks = myTasks.length;

    const goalPercentage =
      totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const taskPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      goalPercentage,
      taskPercentage,
      completedGoals,
      completedTasks,
      totalGoals,
      totalTasks,
    };
  };

  const stats = getConsistencyStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-4">
            <img
              src="/consistent.svg"
              alt="Consistency Logo"
              className="w-6 h-6"
            />
          </div>
          <p className="text-muted-foreground">
            Loading your consistency journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="consistency-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Goals
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedGoals}/{stats.totalGoals}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.goalPercentage}% completed
              </p>
            </CardContent>
          </Card>

          <Card className="consistency-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedTasks}/{stats.totalTasks}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.taskPercentage}% completed
              </p>
            </CardContent>
          </Card>

          <Card className="consistency-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(dailyGoals.map((g) => g.user_id)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Active members today
              </p>
            </CardContent>
          </Card>

          <Card className="consistency-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consistency</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.goalPercentage + stats.taskPercentage) / 2)}%
              </div>
              <p className="text-xs text-muted-foreground">Overall score</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <AddGoalDialog onGoalAdded={fetchData} />
          <AddTaskDialog onTaskAdded={fetchData} />
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals">
              Daily Goals ({dailyGoals.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">To-do list ({tasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Today's Goals</span>
                  <Badge variant="outline">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Daily goals that reset every day. Stay consistent and build
                  better habits with community accountability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyGoals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No daily goals yet. Add your first goal to get started!
                    </p>
                  </div>
                ) : (
                  dailyGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onUpdate={fetchData} />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span>To-do list</span>
                </CardTitle>
                <CardDescription>
                  Tasks that stay until completed. Organize them by category and
                  track your progress.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks yet. Add your first task to get organized!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onUpdate={fetchData} />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
