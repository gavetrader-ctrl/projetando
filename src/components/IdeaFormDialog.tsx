import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Link, FileText } from 'lucide-react';
import { Idea, Attachment } from '@/types/project';

interface IdeaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (idea: Idea) => void;
  editingIdea?: Idea | null;
}

export function IdeaFormDialog({ open, onOpenChange, onSubmit, editingIdea }: IdeaFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [observation, setObservation] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attName, setAttName] = useState('');
  const [attUrl, setAttUrl] = useState('');
  const [attDesc, setAttDesc] = useState('');

  useEffect(() => {
    if (editingIdea) {
      setTitle(editingIdea.title);
      setDescription(editingIdea.description);
      setObservation(editingIdea.observation);
      setAttachments([...editingIdea.attachments]);
    } else {
      setTitle(''); setDescription(''); setObservation(''); setAttachments([]);
    }
  }, [editingIdea]);

  const addAttachment = () => {
    if (!attName || !attUrl) return;
    setAttachments(prev => [...prev, {
      id: crypto.randomUUID(),
      name: attName,
      description: attDesc,
      type: attUrl.startsWith('http') ? 'link' : 'document',
      url: attUrl,
    }]);
    setAttName(''); setAttUrl(''); setAttDesc('');
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = () => {
    if (!title) return;
    onSubmit({
      id: editingIdea?.id || crypto.randomUUID(),
      title,
      description,
      observation,
      attachments,
      createdAt: editingIdea?.createdAt || new Date().toISOString(),
    });
    setTitle(''); setDescription(''); setObservation(''); setAttachments([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-display gradient-text text-lg">{editingIdea ? 'Editar Ideia' : 'Nova Ideia'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Ideia *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da ideia" className="bg-muted/50 border-border" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva sua ideia..." className="bg-muted/50 border-border" />
          </div>
          <div>
            <Label>Observação</Label>
            <Textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Observações adicionais..." className="bg-muted/50 border-border" />
          </div>

          <div className="space-y-2">
            <Label>Anexos</Label>
            <div className="flex gap-2">
              <Input value={attName} onChange={e => setAttName(e.target.value)} placeholder="Nome" className="bg-muted/50 border-border flex-1" />
              <Input value={attUrl} onChange={e => setAttUrl(e.target.value)} placeholder="Link/URL" className="bg-muted/50 border-border flex-1" />
            </div>
            <Input value={attDesc} onChange={e => setAttDesc(e.target.value)} placeholder="Descrição do anexo" className="bg-muted/50 border-border" />
            <Button type="button" variant="outline" size="sm" onClick={addAttachment} className="gap-1 border-primary/30 text-primary">
              <Plus className="h-3 w-3" /> Adicionar Anexo
            </Button>
            {attachments.map(att => (
              <div key={att.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-sm">
                {att.type === 'link' ? <Link className="h-3 w-3 text-primary" /> : <FileText className="h-3 w-3 text-accent" />}
                <span className="flex-1 truncate">{att.name}</span>
                <button onClick={() => removeAttachment(att.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Data do registro: {new Date().toLocaleDateString('pt-BR')}
          </div>

          <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground font-semibold">
            {editingIdea ? 'Salvar Alterações' : 'Registrar Ideia'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
