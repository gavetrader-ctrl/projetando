import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SummaryCards } from '@/components/SummaryCards';
import { ProjectList } from '@/components/ProjectList';
import { IdeasList } from '@/components/IdeasList';
import { IdeaFormDialog } from '@/components/IdeaFormDialog';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';
import { ProjectViewDialog } from '@/components/ProjectViewDialog';
import { useProjects, useIdeas } from '@/store/useStore';
import { Project, Idea, ProjectStatus } from '@/types/project';

const Index = () => {
  const { projects, addProject, updateProject } = useProjects();
  const { ideas, addIdea, updateIdea, deleteIdea } = useIdeas();
  const [filter, setFilter] = useState<ProjectStatus | 'ideas' | null>(null);

  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [ideaEditOpen, setIdeaEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectEditOpen, setProjectEditOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [projectViewOpen, setProjectViewOpen] = useState(false);

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

  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    setIdeaEditOpen(true);
  };

  const handleIdeaSubmit = (idea: Idea) => {
    if (editingIdea) {
      updateIdea(idea);
    } else {
      addIdea(idea);
    }
    setEditingIdea(null);
  };

  const handleViewProject = (project: Project) => {
    setViewingProject(project);
    setProjectViewOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectEditOpen(true);
  };

  const handleProjectSubmit = (project: Project) => {
    if (editingProject) {
      updateProject(project.id, project);
    } else {
      addProject(project);
    }
    setEditingProject(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeader onAddIdea={addIdea} onAddProject={addProject} />
        <SummaryCards {...counts} onFilter={setFilter} activeFilter={filter} />
        {filter === 'ideas' ? (
          <IdeasList ideas={ideas} onDelete={deleteIdea} onEdit={handleEditIdea} />
        ) : (
          <ProjectList projects={filteredProjects} onView={handleViewProject} onEdit={handleEditProject} />
        )}
      </div>

      <IdeaFormDialog
        open={ideaEditOpen}
        onOpenChange={(open) => { setIdeaEditOpen(open); if (!open) setEditingIdea(null); }}
        onSubmit={handleIdeaSubmit}
        editingIdea={editingIdea}
      />
      <ProjectFormDialog
        open={projectEditOpen}
        onOpenChange={(open) => { setProjectEditOpen(open); if (!open) setEditingProject(null); }}
        onSubmit={handleProjectSubmit}
        editingProject={editingProject}
      />
      <ProjectViewDialog
        open={projectViewOpen}
        onOpenChange={(open) => { setProjectViewOpen(open); if (!open) setViewingProject(null); }}
        project={viewingProject}
        onEdit={handleEditProject}
        onUpdate={updateProject}
      />
    </div>
  );
};

export default Index;
