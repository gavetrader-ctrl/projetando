import { useState } from 'react';
import { ExternalLink, Plus, Pencil, Trash2, Copy, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useExternalProjects, ExternalProject } from '@/hooks/useExternalProjects';
import { toast } from 'sonner';

export function ExternalProjectsPanel() {
  const { items, loading, addItem, updateItem, deleteItem } = useExternalProjects();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExternalProject | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const resetForm = () => { setTitle(''); setDescription(''); setUrl(''); setEditing(null); };

  const openEdit = (item: ExternalProject) => {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description);
    setUrl(item.url);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Informe o nome do projeto'); return; }
    const payload = { title: title.trim(), description: description.trim(), url: url.trim() };
    if (editing) await updateItem(editing.id, payload);
    else await addItem(payload);
    setOpen(false);
    resetForm();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  return (
    <section className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider text-primary flex items-center gap-2">
          <Globe className="h-4 w-4" /> Outros Projetos
        </h2>
        <Button size="sm" variant="outline" onClick={() => { resetForm(); setOpen(true); }}
          className="border-primary/30 hover:border-primary hover:bg-primary/10 text-primary gap-1">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum projeto externo cadastrado. Adicione links para outros sistemas de gerenciamento.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map(item => (
            <div key={item.id} className="glass rounded-lg p-3 flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm">{item.title}</span>
                <div className="flex gap-1 shrink-0">
                  {item.url && (
                    <>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Abrir link"
                        onClick={() => window.open(item.url.startsWith('http') ? item.url : `https://${item.url}`, '_blank')}>
                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Copiar link" onClick={() => copyUrl(item.url)}>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Editar" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Excluir" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
              {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
              {item.url && <p className="text-xs text-primary/70 truncate">{item.url}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="glass border-primary/20">
          <DialogHeader>
            <DialogTitle className="gradient-text">{editing ? 'Editar Projeto Externo' : 'Novo Projeto Externo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do projeto *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Gerenciador de Contas" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Para que serve este projeto..." className="bg-background/50" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="bg-background/50" />
            </div>
            <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-semibold">
              {editing ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
