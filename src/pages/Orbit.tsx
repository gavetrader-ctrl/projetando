import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Plus, Github, Cloud, Globe, FolderOpen, Users,
  Paperclip, Link2, Copy, ExternalLink, Circle, Lightbulb, FolderKanban,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProjects, useIdeas } from '@/store/useStore';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';
import { Project } from '@/types/project';
import { toast } from 'sonner';

type OrbitNode = {
  id: string;
  label: string;
  kind: string;
  url?: string;
  detail?: string;
  color: string;
  icon: typeof Github;
};

const STATUS_COLOR: Record<string, string> = {
  planning: 'hsl(200 80% 55%)',
  active: 'hsl(175 80% 50%)',
  paused: 'hsl(40 90% 55%)',
  finished: 'hsl(150 60% 45%)',
};

function buildNodes(project: Project): OrbitNode[] {
  const infra = project.infrastructure || {};
  const nodes: OrbitNode[] = [];

  if (infra.githubUrl || infra.githubAccount)
    nodes.push({ id: 'gh', label: 'GitHub', kind: 'Repositório', url: infra.githubUrl, detail: infra.githubAccount, color: 'hsl(260 70% 62%)', icon: Github });
  if (infra.platformUrl || infra.platformAccount)
    nodes.push({ id: 'plat', label: 'Plataforma', kind: 'Criação / Cloud', url: infra.platformUrl, detail: infra.platformAccount, color: 'hsl(200 80% 55%)', icon: Cloud });
  if (infra.hostedUrl || infra.hostedAccount)
    nodes.push({ id: 'host', label: 'Hospedagem', kind: 'Deploy', url: infra.hostedUrl, detail: infra.hostedAccount, color: 'hsl(150 60% 48%)', icon: Globe });
  if (infra.localPath)
    nodes.push({ id: 'local', label: 'Pasta Local', kind: 'Ambiente', detail: infra.localPath, color: 'hsl(40 90% 55%)', icon: FolderOpen });

  [...project.studyAttachments, ...project.projectAttachments].forEach((a) =>
    nodes.push({ id: `att-${a.id}`, label: a.name || 'Anexo', kind: a.type === 'link' ? 'Link' : 'Anexo', url: a.url, detail: a.description, color: 'hsl(175 80% 50%)', icon: a.type === 'link' ? Link2 : Paperclip })
  );

  project.participants.forEach((p) =>
    nodes.push({ id: `pt-${p.id}`, label: p.name || 'Participante', kind: 'Equipe', detail: p.role, color: 'hsl(320 70% 60%)', icon: Users })
  );

  return nodes;
}

export default function Orbit() {
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  const { ideas } = useIdeas();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<OrbitNode | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  const current = projects.find((p) => p.id === selectedId) || filtered[0] || null;
  const nodes = current ? buildNodes(current) : [];
  const linkedIdeas = useMemo(
    () => (current ? ideas.filter((i) => i.title && current.name && i.title.toLowerCase() === current.name.toLowerCase()) : []),
    [ideas, current]
  );

  const R = 250;
  const centerColor = current ? STATUS_COLOR[current.status] || 'hsl(175 80% 50%)' : 'hsl(175 80% 50%)';
  const total = Math.max(nodes.length, 1);

  const copy = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
        <h1 className="font-display tracking-wider text-primary text-lg">Órbita de Projetos</h1>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-[240px] border-r border-border bg-card/50 flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar" className="pl-8 h-9 bg-secondary border-border text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedId(p.id); setSelectedNode(null); }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-sm transition-colors ${current?.id === p.id ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-secondary'}`}
              >
                <span className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ background: `${STATUS_COLOR[p.status]}25`, color: STATUS_COLOR[p.status] }}>
                  {p.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="truncate">{p.name}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-muted-foreground p-2">Nenhum projeto.</p>}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative overflow-auto flex items-center justify-center">
          {!current ? (
            <p className="text-muted-foreground text-sm">Crie um projeto para visualizar a órbita.</p>
          ) : (
            <div className="relative" style={{ width: R * 2 + 200, height: R * 2 + 200 }}>
              {/* orbit ring */}
              <div className="absolute rounded-full border border-border/60"
                style={{ width: R * 2, height: R * 2, left: 100, top: 100 }} />

              {/* connectors */}
              <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                {nodes.map((n, i) => {
                  const a = (i / total) * Math.PI * 2 - Math.PI / 2;
                  const cx = R + 100, cy = R + 100;
                  return (
                    <line key={n.id} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)}
                      stroke={n.color} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="4 4" />
                  );
                })}
              </svg>

              {/* center */}
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute rounded-full flex flex-col items-center justify-center text-center px-4 animate-glow-pulse"
                style={{
                  width: 160, height: 160, left: R + 100 - 80, top: R + 100 - 80,
                  background: `${centerColor}22`, border: `2px solid ${centerColor}`,
                  boxShadow: `0 0 40px ${centerColor}40`, color: centerColor,
                }}
              >
                <FolderKanban className="h-5 w-5 mb-1" />
                <span className="text-sm font-semibold leading-tight line-clamp-3">{current.name}</span>
                <span className="text-[10px] opacity-70 mt-1">{current.progress}%</span>
              </button>

              {/* satellites */}
              {nodes.map((n, i) => {
                const a = (i / total) * Math.PI * 2 - Math.PI / 2;
                const x = R + 100 + R * Math.cos(a) - 45;
                const y = R + 100 + R * Math.sin(a) - 45;
                const Icon = n.icon;
                const active = selectedNode?.id === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className="absolute rounded-full flex flex-col items-center justify-center gap-1 px-2 transition-transform hover:scale-110"
                    style={{
                      width: 90, height: 90, left: x, top: y,
                      background: `${n.color}22`,
                      border: `${active ? 2 : 1}px solid ${n.color}`,
                      boxShadow: active ? `0 0 25px ${n.color}55` : `0 0 12px ${n.color}22`,
                      color: n.color,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] leading-tight text-center line-clamp-2">{n.label}</span>
                  </button>
                );
              })}

              {/* add connection */}
              <button
                onClick={() => setEditOpen(true)}
                title="Adicionar conexão"
                className="absolute rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                style={{ width: 48, height: 48, left: R + 100 + R * 0.72 - 24, top: R + 100 - R * 0.72 - 24 }}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )}
        </main>

        {/* Info panel */}
        <aside className="w-[300px] border-l border-border bg-card overflow-y-auto p-4 space-y-4">
          {selectedNode ? (
            <>
              <div>
                <p className="text-xs text-muted-foreground">{selectedNode.kind}</p>
                <h2 className="text-lg font-semibold" style={{ color: selectedNode.color }}>{selectedNode.label}</h2>
              </div>
              {selectedNode.detail && <p className="text-sm text-muted-foreground break-words">{selectedNode.detail}</p>}
              {selectedNode.url && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground break-all">{selectedNode.url}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => window.open(selectedNode.url, '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5" /> Abrir
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => copy(selectedNode.url)}>
                      <Copy className="h-3.5 w-3.5" /> Copiar
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : current ? (
            <>
              <div>
                <p className="text-xs text-muted-foreground">Projeto central</p>
                <h2 className="text-lg font-semibold text-primary">{current.name}</h2>
              </div>
              {current.description && <p className="text-sm text-muted-foreground">{current.description}</p>}
              <div className="glass rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span style={{ color: centerColor }}>{current.status}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Progresso</span><span>{current.progress}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Conexões</span><span>{nodes.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Atividades</span><span>{current.activities.length}</span></div>
              </div>
              {linkedIdeas.length > 0 && (
                <div className="glass rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Ideias relacionadas</p>
                  {linkedIdeas.map((i) => <p key={i.id} className="text-xs text-foreground">{i.title}</p>)}
                </div>
              )}
              <Button className="w-full gap-2" onClick={() => setEditOpen(true)}>
                <Plus className="h-4 w-4" /> Adicionar conexão
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center gap-2"><Circle className="h-3.5 w-3.5" /> Selecione um projeto.</p>
          )}
        </aside>
      </div>

      {current && (
        <ProjectFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          editingProject={current}
          onSubmit={(p) => { updateProject(p.id, p); setEditOpen(false); toast.success('Projeto atualizado!'); }}
        />
      )}
    </div>
  );
}