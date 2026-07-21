import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DailyActivity {
  id: string;
  title: string;
  description: string;
  category: string;
  activityDate: string;
  startTime: string;
  endTime: string;
  projectId: string | null;
  createdAt: string;
}

function fromDb(r: any): DailyActivity {
  return {
    id: r.id,
    title: r.title,
    description: r.description || '',
    category: r.category || 'geral',
    activityDate: r.activity_date,
    startTime: r.start_time || '',
    endTime: r.end_time || '',
    projectId: r.project_id,
    createdAt: r.created_at,
  };
}

export function useDailyActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setActivities([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .order('start_time', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setActivities(data.map(fromDb));
        setLoading(false);
      });
  }, [user]);

  const addActivity = useCallback(async (a: Omit<DailyActivity, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('daily_activities').insert({
      user_id: user.id,
      title: a.title,
      description: a.description,
      category: a.category,
      activity_date: a.activityDate,
      start_time: a.startTime,
      end_time: a.endTime,
      project_id: a.projectId,
    }).select().single();
    if (!error && data) setActivities(prev => [fromDb(data), ...prev]);
  }, [user]);

  const updateActivity = useCallback(async (id: string, a: Partial<DailyActivity>) => {
    if (!user) return;
    const upd: any = {};
    if (a.title !== undefined) upd.title = a.title;
    if (a.description !== undefined) upd.description = a.description;
    if (a.category !== undefined) upd.category = a.category;
    if (a.activityDate !== undefined) upd.activity_date = a.activityDate;
    if (a.startTime !== undefined) upd.start_time = a.startTime;
    if (a.endTime !== undefined) upd.end_time = a.endTime;
    if (a.projectId !== undefined) upd.project_id = a.projectId;
    const { data, error } = await supabase
      .from('daily_activities')
      .update(upd)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (!error && data) setActivities(prev => prev.map(x => x.id === id ? fromDb(data) : x));
  }, [user]);

  const deleteActivity = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('daily_activities').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setActivities(prev => prev.filter(x => x.id !== id));
  }, [user]);

  return { activities, loading, addActivity, updateActivity, deleteActivity };
}