import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Check, Edit2, Trash2, X } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editEmoji, setEditEmoji] = useState(task.emoji);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isOwner = user?.id === task.user_id;

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);

      if (error) throw error;
      onUpdate();
      
      toast({
        title: task.completed ? "Task unchecked" : "Task completed! 🎉",
        description: task.completed 
          ? "Keep working on it!" 
          : "One more task down!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editTitle.trim(),
          emoji: editEmoji || '📝'
        })
        .eq('id', task.id);

      if (error) throw error;
      
      setIsEditing(false);
      onUpdate();
      
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;
      
      onUpdate();
      
      toast({
        title: "Task deleted",
        description: "Your task has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="consistency-card animate-slide-up">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                disabled={loading}
                className="p-1 h-6 w-6 rounded-full"
              >
                <Check className={`h-4 w-4 ${task.completed ? 'text-success' : 'text-muted-foreground'}`} />
              </Button>
            )}
            
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editEmoji}
                    onChange={(e) => setEditEmoji(e.target.value)}
                    className="w-12 text-center"
                    placeholder="📝"
                  />
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1"
                    placeholder="Task title"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{task.emoji}</span>
                  <span className={`font-medium ${task.completed ? 'strike-through completed text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              {task.categories?.name && (
                <Badge variant="secondary" className="text-xs">
                  {task.categories.name}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {task.profiles?.display_name || 'User'}
              </Badge>
            </div>
            
            {isOwner && (
              <div className="flex items-center space-x-1">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleUpdate} disabled={loading}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}