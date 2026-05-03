import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Idea, Attachment } from '@/types/project';
import { Lightbulb, Pencil, ExternalLink, Copy, Paperclip, Link, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface IdeaViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: Idea | null;
  onEdit: (idea: Idea) => void;
}

function AttachmentItem({ att }: { att: Attachment }) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (att.url) {
      navigator.clipboard.writeText(att.url);
      toast.success('Link copiado!');
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (att.url) window.open(att.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="glass rounded-md p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm truncate flex items-center gap-2">
          {att.type === 'link' ? <Link className="h-3 w-3 text-primary shrink-0" /> : <FileText className="h-3 w-3 text-accent shrink-0" />}
          {att.name || 'Sem nome'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {att.url && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={handleOpen} title="Abrir">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={handleCopy} title="Copiar link">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
      {att.description && <p className="text-xs text-muted-foreground pl-5">{att.description}</p>}
      {att.url && <p className="text-[10px] text-muted-foreground/60 pl-5 truncate">{att.url}</p>}
    </div>
  );
}

export function IdeaViewDialog({ open, onOpenChange, idea, onEdit }: IdeaViewDialogProps) {
  if (!idea) return null;

  const handleEdit = () => {
    onOpenChange(false);
    setTimeout(() => onEdit(idea), 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-display gradient-text text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning shrink-0" />
                {idea.title}
              </DialogTitle>
            </div>
            <Button onClick={handleEdit} className="bg-primary text-primary-foreground gap-2 shrink-0" size="sm">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {idea.description && (
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Descrição</h4>
              <p className="text-sm leading-relaxed">{idea.description}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Grau de Importância</h4>
            <p className="text-sm">
              {idea.importance === 'high' ? '🔴 Alta' : idea.importance === 'low' ? '🟢 Baixa' : '🟡 Média'}
            </p>
          </div>

          {idea.observation && (
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Observação</h4>
              <p className="text-sm text-muted-foreground italic">{idea.observation}</p>
            </div>
          )}

          {idea.attachments.length > 0 && (
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Paperclip className="h-3 w-3" /> Anexos ({idea.attachments.length})
              </h4>
              <div className="space-y-2">
                {idea.attachments.map(att => (
                  <AttachmentItem key={att.id} att={att} />
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t border-border/30">
            Registrado em {format(new Date(idea.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
