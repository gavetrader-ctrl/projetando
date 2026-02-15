import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SummaryCards } from '@/components/SummaryCards';
import { ProjectList } from '@/components/ProjectList';
import { IdeasList } from '@/components/IdeasList';
import { useProjects, useIdeas } from '@/store/useStore';
import { ProjectStatus } from '@/types/project';

const Index = () => {
  const { projects, addProject } = useProjects();
  const { ideas, addIdea, deleteIdea } = useIdeas();
  const [filter, setFilter] = useState<ProjectStatus | 'ideas' | null>(null);

  const counts = {
    ideas: ideas.length,
    planning: projects.filter(p => p.status === 'planning').length,
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    finished: projects.filter(p => p.status === 'finished').length,
  };

  const filteredProjects = filter && filter !== 'ideas'
    ? projects.filter(p => p.status === filter)
    : projects;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeader onAddIdea={addIdea} onAddProject={addProject} />
        <SummaryCards {...counts} onFilter={setFilter} activeFilter={filter} />
        {filter === 'ideas' ? (
          <IdeasList ideas={ideas} onDelete={deleteIdea} />
        ) : (
          <ProjectList projects={filteredProjects} />
        )}
      </div>
    </div>
  );
};

export default Index;
