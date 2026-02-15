import { useState, useEffect, useCallback } from 'react';
import { Project, Idea } from '@/types/project';

const PROJECTS_KEY = 'pm-projects';
const IDEAS_KEY = 'pm-ideas';

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage<Project>(PROJECTS_KEY, []));

  useEffect(() => { saveToStorage(PROJECTS_KEY, projects); }, [projects]);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  return { projects, addProject, updateProject, deleteProject };
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>(() => loadFromStorage<Idea>(IDEAS_KEY, []));

  useEffect(() => { saveToStorage(IDEAS_KEY, ideas); }, [ideas]);

  const addIdea = useCallback((idea: Idea) => {
    setIdeas(prev => [idea, ...prev]);
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  }, []);

  return { ideas, addIdea, deleteIdea };
}
