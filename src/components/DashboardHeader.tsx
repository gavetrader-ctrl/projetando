import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lightbulb, Plus, LogOut, StickyNote, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IdeaFormDialog } from './IdeaFormDialog';
import { ProjectFormDialog } from './ProjectFormDialog';
import { Idea, Project } from '@/types/project';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  onAddIdea: (idea: Idea) => void;
  onAddProject: (project: Project) => void;
}

export function DashboardHeader({ onAddIdea, onAddProject }: DashboardHeaderProps) {
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado!');
  };

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold gradient-text tracking-wider">{greeting}!</h1>
        <p className="text-muted-foreground text-sm mt-1 font-body">
          {format(now, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/timeline')}
          className="border-primary/30 hover:border-primary hover:bg-primary/10 text-primary gap-2"
          title="Timeline"
        >
          <CalendarRange className="h-4 w-4" />
          <span className="hidden sm:inline">Timeline</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/notes')}
          className="border-accent/30 hover:border-accent hover:bg-accent/10 text-accent gap-2"
          title="Bloco de Notas"
        >
          <StickyNote className="h-4 w-4" />
          <span className="hidden sm:inline">Notas</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setIdeaOpen(true)}
          className="border-primary/30 hover:border-primary hover:bg-primary/10 text-primary gap-2 glow-primary"
        >
          <Lightbulb className="h-4 w-4" />
          Ideia
        </Button>
        <Button
          onClick={() => setProjectOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 glow-primary font-semibold"
        >
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-destructive gap-2"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <IdeaFormDialog open={ideaOpen} onOpenChange={setIdeaOpen} onSubmit={onAddIdea} />
      <ProjectFormDialog open={projectOpen} onOpenChange={setProjectOpen} onSubmit={onAddProject} />
    </header>
  );
}
