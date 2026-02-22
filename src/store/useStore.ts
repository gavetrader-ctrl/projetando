import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, Idea } from '@/types/project';
import { useAuth } from '@/hooks/useAuth';

function mapProjectFromDb(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    type: row.type,
    status: row.status,
    priority: row.priority,
    progress: row.progress,
    hasParticipants: row.has_participants,
    participants: row.participants || [],
    studyAttachments: row.study_attachments || [],
    projectAttachments: row.project_attachments || [],
    financial: row.financial || { totalBudget: 0, fixedCosts: [], variableCosts: [], reserve: [], unexpected: [], goal: '' },
    returnTimeline: row.return_timeline,
    returnFrequency: row.return_frequency,
    observations: row.observations,
    activities: row.activities || [],
    pauseReason: row.pause_reason || '',
    createdAt: row.created_at,
  };
}

function mapProjectToDb(project: Project, userId: string) {
  return {
    id: project.id,
    user_id: userId,
    name: project.name,
    description: project.description,
    start_date: project.startDate || null,
    end_date: project.endDate || null,
    type: project.type,
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    has_participants: project.hasParticipants,
    participants: project.participants as any,
    study_attachments: project.studyAttachments as any,
    project_attachments: project.projectAttachments as any,
    financial: project.financial as any,
    return_timeline: project.returnTimeline,
    return_frequency: project.returnFrequency,
    observations: project.observations,
    activities: project.activities as any,
    pause_reason: project.pauseReason || '',
  };
}

function mapIdeaFromDb(row: any): Idea {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    observation: row.observation || '',
    attachments: row.attachments || [],
    createdAt: row.created_at,
  };
}

function mapIdeaToDb(idea: Idea, userId: string) {
  return {
    id: idea.id,
    user_id: userId,
    title: idea.title,
    description: idea.description,
    observation: idea.observation || '',
    attachments: idea.attachments as any,
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setProjects([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setProjects(data.map(mapProjectFromDb));
        setLoading(false);
      });
  }, [user]);

  const addProject = useCallback(async (project: Project) => {
    if (!user) return;
    const row = mapProjectToDb(project, user.id);
    const { data, error } = await supabase.from('projects').insert(row).select().single();
    if (!error && data) setProjects(prev => [mapProjectFromDb(data), ...prev]);
  }, [user]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate || null;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate || null;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.hasParticipants !== undefined) dbUpdates.has_participants = updates.hasParticipants;
    if (updates.participants !== undefined) dbUpdates.participants = updates.participants;
    if (updates.studyAttachments !== undefined) dbUpdates.study_attachments = updates.studyAttachments;
    if (updates.projectAttachments !== undefined) dbUpdates.project_attachments = updates.projectAttachments;
    if (updates.financial !== undefined) dbUpdates.financial = updates.financial;
    if (updates.returnTimeline !== undefined) dbUpdates.return_timeline = updates.returnTimeline;
    if (updates.returnFrequency !== undefined) dbUpdates.return_frequency = updates.returnFrequency;
    if (updates.observations !== undefined) dbUpdates.observations = updates.observations;
    if (updates.activities !== undefined) dbUpdates.activities = updates.activities;
    if (updates.pauseReason !== undefined) dbUpdates.pause_reason = updates.pauseReason;

    const { data, error } = await supabase.from('projects').update(dbUpdates).eq('id', id).eq('user_id', user.id).select().single();
    if (!error && data) setProjects(prev => prev.map(p => p.id === id ? mapProjectFromDb(data) : p));
  }, [user]);

  const deleteProject = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setProjects(prev => prev.filter(p => p.id !== id));
  }, [user]);

  return { projects, loading, addProject, updateProject, deleteProject };
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setIdeas([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setIdeas(data.map(mapIdeaFromDb));
        setLoading(false);
      });
  }, [user]);

  const addIdea = useCallback(async (idea: Idea) => {
    if (!user) return;
    const row = mapIdeaToDb(idea, user.id);
    const { data, error } = await supabase.from('ideas').insert(row).select().single();
    if (!error && data) setIdeas(prev => [mapIdeaFromDb(data), ...prev]);
  }, [user]);

  const updateIdea = useCallback(async (idea: Idea) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('ideas')
      .update({ title: idea.title, description: idea.description, observation: idea.observation || '', attachments: idea.attachments as any })
      .eq('id', idea.id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (!error && data) setIdeas(prev => prev.map(i => i.id === idea.id ? mapIdeaFromDb(data) : i));
  }, [user]);

  const deleteIdea = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('ideas').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setIdeas(prev => prev.filter(i => i.id !== id));
  }, [user]);

  return { ideas, loading, addIdea, updateIdea, deleteIdea };
}
