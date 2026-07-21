import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyActivitiesPanel } from '@/components/DailyActivitiesPanel';
import { useProjects } from '@/store/useStore';

export default function Activities() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text tracking-wider">Atividades Diárias</h1>
            <p className="text-sm text-muted-foreground">Registre e pesquise tudo que você fez.</p>
          </div>
        </div>
        <DailyActivitiesPanel projects={projects} />
      </div>
    </div>
  );
}