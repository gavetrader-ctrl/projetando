import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { Project, Attachment, Participant, CostItem, ProjectType, Priority, ReturnTimeline, ReturnFrequency } from '@/types/project';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: Project) => void;
  editingProject?: Project | null;
}

const emptyProject = (): Partial<Project> => ({
  name: '', description: '', startDate: '', endDate: '',
  type: 'personal', status: 'planning', priority: 'medium', progress: 0,
  hasParticipants: false, participants: [],
  studyAttachments: [], projectAttachments: [],
  financial: { totalBudget: 0, fixedCosts: [], variableCosts: [], reserve: [], unexpected: [], goal: '' },
  returnTimeline: 'medium', returnFrequency: 'once', observations: '', activities: [],
});

export function ProjectFormDialog({ open, onOpenChange, onSubmit, editingProject }: ProjectFormDialogProps) {
  const [form, setForm] = useState<Partial<Project>>(emptyProject());
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (editingProject) {
      setForm({ ...editingProject });
      setStep(0);
    } else {
      setForm(emptyProject());
      setStep(0);
    }
  }, [editingProject]);

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const setFinancial = (key: string, value: any) => setForm(prev => ({
    ...prev, financial: { ...prev.financial!, [key]: value }
  }));

  const addCostItem = (key: 'fixedCosts' | 'variableCosts' | 'reserve' | 'unexpected') => {
    const item: CostItem = { id: crypto.randomUUID(), description: '', value: 0 };
    setFinancial(key, [...(form.financial?.[key] || []), item]);
  };

  const updateCostItem = (key: 'fixedCosts' | 'variableCosts' | 'reserve' | 'unexpected', id: string, field: string, value: any) => {
    setFinancial(key, (form.financial?.[key] || []).map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCostItem = (key: 'fixedCosts' | 'variableCosts' | 'reserve' | 'unexpected', id: string) => {
    setFinancial(key, (form.financial?.[key] || []).filter(c => c.id !== id));
  };

  const addParticipant = () => {
    set('participants', [...(form.participants || []), { id: crypto.randomUUID(), name: '', role: '' }]);
  };

  const addAttachment = (key: 'studyAttachments' | 'projectAttachments') => {
    const att: Attachment = { id: crypto.randomUUID(), name: '', description: '', type: 'link', url: '' };
    set(key, [...(form[key] || []), att]);
  };

  const updateAttachment = (key: 'studyAttachments' | 'projectAttachments', id: string, field: string, value: any) => {
    set(key, (form[key] || []).map((a: Attachment) => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAttachment = (key: 'studyAttachments' | 'projectAttachments', id: string) => {
    set(key, (form[key] || []).filter((a: Attachment) => a.id !== id));
  };

  const updateParticipant = (id: string, field: string, value: string) => {
    set('participants', (form.participants || []).map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeParticipant = (id: string) => {
    set('participants', (form.participants || []).filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    if (!form.name) return;
    onSubmit({
      ...form,
      id: editingProject?.id || crypto.randomUUID(),
      createdAt: editingProject?.createdAt || new Date().toISOString(),
      activities: form.activities || [],
    } as Project);
    setForm(emptyProject());
    setStep(0);
    onOpenChange(false);
  };

  const steps = ['Básico', 'Anexos', 'Equipe', 'Financeiro', 'Detalhes'];

  const renderCostSection = (label: string, key: 'fixedCosts' | 'variableCosts' | 'reserve' | 'unexpected') => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => addCostItem(key)} className="h-6 text-xs text-primary gap-1">
          <Plus className="h-3 w-3" /> Adicionar
        </Button>
      </div>
      {(form.financial?.[key] || []).map(item => (
        <div key={item.id} className="flex gap-2 items-center">
          <Input value={item.description} onChange={e => updateCostItem(key, item.id, 'description', e.target.value)} placeholder="Descrição" className="bg-muted/50 border-border flex-1 h-8 text-sm" />
          <Input type="number" value={item.value || ''} onChange={e => updateCostItem(key, item.id, 'value', Number(e.target.value))} placeholder="R$" className="bg-muted/50 border-border w-24 h-8 text-sm" />
          <button onClick={() => removeCostItem(key, item.id)} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-display gradient-text text-lg">{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-1 mb-4">
          {steps.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className={`flex-1 py-1.5 text-xs rounded-md transition-all ${i === step ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label>Nome do Projeto *</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do projeto" className="bg-muted/50 border-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data Início</Label>
                  <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="bg-muted/50 border-border" />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="bg-muted/50 border-border" />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva o projeto..." className="bg-muted/50 border-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => set('type', v as ProjectType)}>
                    <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="study">Estudo</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="health">Saúde</SelectItem>
                      <SelectItem value="spiritual">Espiritual</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select value={form.priority} onValueChange={v => set('priority', v as Priority)}>
                    <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Anexos de Estudo</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => addAttachment('studyAttachments')} className="text-primary gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Adicionar
                  </Button>
                </div>
                {(form.studyAttachments || []).map(att => (
                  <div key={att.id} className="space-y-1 p-2 rounded bg-muted/20">
                    <div className="flex gap-2">
                      <Input value={att.name} onChange={e => updateAttachment('studyAttachments', att.id, 'name', e.target.value)} placeholder="Nome" className="bg-muted/50 border-border h-8 text-sm flex-1" />
                      <Input value={att.url} onChange={e => updateAttachment('studyAttachments', att.id, 'url', e.target.value)} placeholder="Link/URL" className="bg-muted/50 border-border h-8 text-sm flex-1" />
                      <button onClick={() => removeAttachment('studyAttachments', att.id)} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <Input value={att.description} onChange={e => updateAttachment('studyAttachments', att.id, 'description', e.target.value)} placeholder="Descrição" className="bg-muted/50 border-border h-8 text-sm" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Anexos do Projeto</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => addAttachment('projectAttachments')} className="text-primary gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Adicionar
                  </Button>
                </div>
                {(form.projectAttachments || []).map(att => (
                  <div key={att.id} className="space-y-1 p-2 rounded bg-muted/20">
                    <div className="flex gap-2">
                      <Input value={att.name} onChange={e => updateAttachment('projectAttachments', att.id, 'name', e.target.value)} placeholder="Nome" className="bg-muted/50 border-border h-8 text-sm flex-1" />
                      <Input value={att.url} onChange={e => updateAttachment('projectAttachments', att.id, 'url', e.target.value)} placeholder="Link/URL" className="bg-muted/50 border-border h-8 text-sm flex-1" />
                      <button onClick={() => removeAttachment('projectAttachments', att.id)} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <Input value={att.description} onChange={e => updateAttachment('projectAttachments', att.id, 'description', e.target.value)} placeholder="Descrição" className="bg-muted/50 border-border h-8 text-sm" />
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3">
                <Label>Participação de outros</Label>
                <Switch checked={form.hasParticipants} onCheckedChange={v => set('hasParticipants', v)} />
              </div>
              {form.hasParticipants && (
                <div className="space-y-2">
                  <Button type="button" variant="ghost" size="sm" onClick={addParticipant} className="text-primary gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Adicionar Participante
                  </Button>
                  {(form.participants || []).map(p => (
                    <div key={p.id} className="flex gap-2 items-center">
                      <Input value={p.name} onChange={e => updateParticipant(p.id, 'name', e.target.value)} placeholder="Nome" className="bg-muted/50 border-border h-8 text-sm flex-1" />
                      <Input value={p.role} onChange={e => updateParticipant(p.id, 'role', e.target.value)} placeholder="Como participa" className="bg-muted/50 border-border h-8 text-sm flex-1" />
                      <button onClick={() => removeParticipant(p.id)} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>Orçamento Total Previsto (R$)</Label>
                <Input type="number" value={form.financial?.totalBudget || ''} onChange={e => setFinancial('totalBudget', Number(e.target.value))} className="bg-muted/50 border-border" />
              </div>
              {renderCostSection('Custos Fixos', 'fixedCosts')}
              {renderCostSection('Custos Variáveis', 'variableCosts')}
              {renderCostSection('Reserva', 'reserve')}
              {renderCostSection('Imprevistos', 'unexpected')}
              <div>
                <Label>Meta do Projeto</Label>
                <Input value={form.financial?.goal} onChange={e => setFinancial('goal', e.target.value)} placeholder="Meta financeira..." className="bg-muted/50 border-border" />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Retorno Financeiro</Label>
                  <Select value={form.returnTimeline} onValueChange={v => set('returnTimeline', v as ReturnTimeline)}>
                    <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Curto prazo</SelectItem>
                      <SelectItem value="medium">Médio prazo</SelectItem>
                      <SelectItem value="long">Longo prazo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequência</Label>
                  <Select value={form.returnFrequency} onValueChange={v => set('returnFrequency', v as ReturnFrequency)}>
                    <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Apenas uma vez</SelectItem>
                      <SelectItem value="recurring">Recorrente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea value={form.observations} onChange={e => set('observations', e.target.value)} placeholder="Observações gerais..." className="bg-muted/50 border-border" />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 border-border">Anterior</Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1 bg-primary text-primary-foreground">Próximo</Button>
            ) : (
              <Button onClick={handleSubmit} className="flex-1 bg-primary text-primary-foreground font-semibold">{editingProject ? 'Salvar Alterações' : 'Criar Projeto'}</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
