import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types/database';
import { Plus, Loader2 } from 'lucide-react';

interface AddTaskDialogProps {
  onTaskAdded: () => void;
}

export default function AddTaskDialog({ onTaskAdded }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📝');
  const [categoryId, setCategoryId] = useState<string>('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchCategories();
    }
  }, [open, user]);

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('created_by', user.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
      
      // Set default to "Uncategorized" if it exists
      const uncategorized = data?.find(cat => cat.name === 'Uncategorized');
      if (uncategorized && !categoryId) {
        setCategoryId(uncategorized.id);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setLoading(true);
    try {
      let finalCategoryId = categoryId;

      // Create new category if specified
      if (newCategory.trim()) {
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', newCategory.trim())
          .eq('created_by', user.id)
          .single();

        if (existingCategory) {
          finalCategoryId = existingCategory.id;
        } else {
          const { data: createdCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({
              name: newCategory.trim(),
              created_by: user.id,
            })
            .select()
            .single();

          if (categoryError) throw categoryError;
          if (createdCategory) {
            finalCategoryId = createdCategory.id;
          }
        }
      }

      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: title.trim(),
          emoji: emoji || '📝',
          category_id: finalCategoryId || null,
        });

      if (error) throw error;

      setTitle('');
      setEmoji('📝');
      setCategoryId('');
      setNewCategory('');
      setOpen(false);
      onTaskAdded();

      toast({
        title: "Task added! 📝",
        description: "Your task has been added and is visible to the community.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding task",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/20 hover:border-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add One-Time Task</DialogTitle>
            <DialogDescription>
              Create a new task that stays until completed. This will be visible to the community for accountability.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emoji" className="text-right">
                Emoji
              </Label>
              <Input
                id="emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="col-span-3 text-center"
                placeholder="📝"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Task
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Learn React hooks"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newCategory" className="text-right">
                New Category
              </Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="col-span-3"
                placeholder="Create new category (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}