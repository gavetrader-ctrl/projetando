import { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjects, useIdeas } from '@/store/useStore';
import { Project, Idea } from '@/types/project';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MindMapNode } from '@/components/mindmap/MindMapNode';
import { MindMapEditPanel } from '@/components/mindmap/MindMapEditPanel';

const nodeTypes = { mindMapNode: MindMapNode };

const STATUS_COLORS: Record<string, string> = {
  planning: 'hsl(200 80% 55%)',
  active: 'hsl(150 60% 45%)',
  paused: 'hsl(40 90% 55%)',
  finished: 'hsl(260 70% 60%)',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planejamento',
  active: 'Ativo',
  paused: 'Pausado',
  finished: 'Finalizado',
};

const TYPE_LABELS: Record<string, string> = {
  personal: 'Pessoal',
  professional: 'Profissional',
  study: 'Estudo',
  financial: 'Financeiro',
  health: 'Saúde',
  spiritual: 'Espiritual',
  other: 'Outro',
};

function buildNodes(projects: Project[], ideas: Idea[]): Node[] {
  const nodes: Node[] = [];
  const centerX = 0;
  const centerY = 0;

  nodes.push({
    id: 'root',
    type: 'mindMapNode',
    position: { x: centerX, y: centerY },
    data: {
      label: 'Meus Projetos & Ideias',
      nodeType: 'root',
      color: 'hsl(175 80% 50%)',
    },
  });

  const projectsBranchX = centerX - 400;
  const projectsBranchY = centerY - 50;

  nodes.push({
    id: 'projects-branch',
    type: 'mindMapNode',
    position: { x: projectsBranchX, y: projectsBranchY },
    data: {
      label: `Projetos (${projects.length})`,
      nodeType: 'branch',
      color: 'hsl(175 80% 50%)',
    },
  });

  const ideasBranchX = centerX + 400;
  const ideasBranchY = centerY - 50;

  nodes.push({
    id: 'ideas-branch',
    type: 'mindMapNode',
    position: { x: ideasBranchX, y: ideasBranchY },
    data: {
      label: `Ideias (${ideas.length})`,
      nodeType: 'branch',
      color: 'hsl(40 90% 55%)',
    },
  });

  const projectSpacing = 220;
  const projectStartY = projectsBranchY - ((projects.length - 1) * projectSpacing) / 2;

  projects.forEach((project, i) => {
    const px = projectsBranchX - 380;
    const py = projectStartY + i * projectSpacing;
    const statusColor = STATUS_COLORS[project.status] || 'hsl(175 80% 50%)';

    nodes.push({
      id: `project-${project.id}`,
      type: 'mindMapNode',
      position: { x: px, y: py },
      data: {
        label: project.name,
        nodeType: 'project',
        color: statusColor,
        entityId: project.id,
        details: [
          { key: 'Status', value: STATUS_LABELS[project.status] || project.status },
          { key: 'Tipo', value: TYPE_LABELS[project.type] || project.type },
          { key: 'Prioridade', value: PRIORITY_LABELS[project.priority] || project.priority },
          { key: 'Progresso', value: `${project.progress}%` },
          ...(project.activities.length > 0 ? [{ key: 'Atividades', value: `${project.activities.filter(a => a.completed).length}/${project.activities.length}` }] : []),
          ...(project.participants.length > 0 ? [{ key: 'Participantes', value: `${project.participants.length}` }] : []),
        ],
        description: project.description,
      },
    });

    const visibleActivities = project.activities.slice(0, 5);
    visibleActivities.forEach((activity, j) => {
      nodes.push({
        id: `activity-${project.id}-${activity.id}`,
        type: 'mindMapNode',
        position: { x: px - 300, y: py - 60 + j * 50 },
        data: {
          label: activity.title,
          nodeType: 'leaf',
          color: activity.completed ? 'hsl(150 60% 45%)' : 'hsl(200 80% 55%)',
          completed: activity.completed,
          entityId: project.id,
          activityId: activity.id,
        },
      });
    });

    if (project.participants.length > 0) {
      project.participants.slice(0, 3).forEach((participant, j) => {
        nodes.push({
          id: `participant-${project.id}-${participant.id}`,
          type: 'mindMapNode',
          position: { x: px - 300, y: py + (visibleActivities.length * 50) + j * 45 },
          data: {
            label: `${participant.name} (${participant.role})`,
            nodeType: 'leaf',
            color: 'hsl(260 70% 60%)',
          },
        });
      });
    }
  });

  const ideaSpacing = 180;
  const ideaStartY = ideasBranchY - ((ideas.length - 1) * ideaSpacing) / 2;

  ideas.forEach((idea, i) => {
    const ix = ideasBranchX + 380;
    const iy = ideaStartY + i * ideaSpacing;

    nodes.push({
      id: `idea-${idea.id}`,
      type: 'mindMapNode',
      position: { x: ix, y: iy },
      data: {
        label: idea.title,
        nodeType: 'idea',
        color: 'hsl(40 90% 55%)',
        entityId: idea.id,
        details: [
          ...(idea.observation ? [{ key: 'Obs', value: idea.observation }] : []),
          ...(idea.attachments.length > 0 ? [{ key: 'Anexos', value: `${idea.attachments.length}` }] : []),
        ],
        description: idea.description,
      },
    });

    idea.attachments.slice(0, 3).forEach((att, j) => {
      nodes.push({
        id: `att-${idea.id}-${att.id}`,
        type: 'mindMapNode',
        position: { x: ix + 280, y: iy - 30 + j * 45 },
        data: {
          label: att.name,
          nodeType: 'leaf',
          color: 'hsl(200 80% 55%)',
        },
      });
    });
  });

  return nodes;
}

function buildEdges(projects: Project[], ideas: Idea[]): Edge[] {
  const edges: Edge[] = [];

  edges.push({
    id: 'root-projects',
    source: 'root',
    target: 'projects-branch',
    style: { stroke: 'hsl(175 80% 50%)', strokeWidth: 3 },
    type: 'smoothstep',
  });

  edges.push({
    id: 'root-ideas',
    source: 'root',
    target: 'ideas-branch',
    style: { stroke: 'hsl(40 90% 55%)', strokeWidth: 3 },
    type: 'smoothstep',
  });

  projects.forEach((project) => {
    const statusColor = STATUS_COLORS[project.status] || 'hsl(175 80% 50%)';

    edges.push({
      id: `branch-project-${project.id}`,
      source: 'projects-branch',
      target: `project-${project.id}`,
      style: { stroke: statusColor, strokeWidth: 2 },
      type: 'smoothstep',
    });

    project.activities.slice(0, 5).forEach((activity) => {
      edges.push({
        id: `project-activity-${project.id}-${activity.id}`,
        source: `project-${project.id}`,
        target: `activity-${project.id}-${activity.id}`,
        style: { stroke: activity.completed ? 'hsl(150 60% 45%)' : 'hsl(200 80% 55%)', strokeWidth: 1.5 },
        type: 'smoothstep',
      });
    });

    project.participants.slice(0, 3).forEach((participant) => {
      edges.push({
        id: `project-participant-${project.id}-${participant.id}`,
        source: `project-${project.id}`,
        target: `participant-${project.id}-${participant.id}`,
        style: { stroke: 'hsl(260 70% 60%)', strokeWidth: 1.5 },
        type: 'smoothstep',
      });
    });
  });

  ideas.forEach((idea) => {
    edges.push({
      id: `branch-idea-${idea.id}`,
      source: 'ideas-branch',
      target: `idea-${idea.id}`,
      style: { stroke: 'hsl(40 90% 55%)', strokeWidth: 2 },
      type: 'smoothstep',
    });

    idea.attachments.slice(0, 3).forEach((att) => {
      edges.push({
        id: `idea-att-${idea.id}-${att.id}`,
        source: `idea-${idea.id}`,
        target: `att-${idea.id}-${att.id}`,
        style: { stroke: 'hsl(200 80% 55%)', strokeWidth: 1.5 },
        type: 'smoothstep',
      });
    });
  });

  return edges;
}

export default function MindMap() {
  const { projects, updateProject } = useProjects();
  const { ideas, updateIdea } = useIdeas();
  const navigate = useNavigate();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const computedNodes = useMemo(() => buildNodes(projects, ideas), [projects, ideas]);
  const computedEdges = useMemo(() => buildEdges(projects, ideas), [projects, ideas]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

  // Sync nodes/edges when data changes, preserving user-dragged positions
  useEffect(() => {
    setNodes((prev) => {
      const posMap = new Map(prev.map(n => [n.id, n.position]));
      return computedNodes.map(n => ({
        ...n,
        position: posMap.get(n.id) || n.position,
      }));
    });
    setEdges(computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    const data = node.data as any;
    if (data.nodeType === 'project') {
      const project = projects.find(p => p.id === data.entityId);
      if (project) {
        setSelectedProject(project);
        setSelectedIdea(null);
      }
    } else if (data.nodeType === 'idea') {
      const idea = ideas.find(i => i.id === data.entityId);
      if (idea) {
        setSelectedIdea(idea);
        setSelectedProject(null);
      }
    } else if (data.nodeType === 'leaf' && data.entityId && data.activityId) {
      // Toggle activity completion
      const project = projects.find(p => p.id === data.entityId);
      if (project) {
        const updatedActivities = project.activities.map(a =>
          a.id === data.activityId ? { ...a, completed: !a.completed } : a
        );
        updateProject(project.id, { activities: updatedActivities });
      }
    }
  }, [projects, ideas, updateProject]);

  const handleResetLayout = useCallback(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

  const handleClosePanel = useCallback(() => {
    setSelectedProject(null);
    setSelectedIdea(null);
  }, []);

  return (
    <div className="h-screen w-screen bg-background flex">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="hsl(200 15% 18%)" gap={24} size={1} />
          <Controls
            className="!bg-card !border-border !rounded-lg !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-secondary"
          />
          <MiniMap
            nodeColor={(node) => (node.data as any)?.color || 'hsl(175 80% 50%)'}
            maskColor="hsl(220 20% 7% / 0.8)"
            className="!bg-card !border-border !rounded-lg"
          />
          <Panel position="top-left" className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-primary/30 hover:border-primary hover:bg-primary/10 text-primary gap-2 glass"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <h1 className="text-lg font-bold gradient-text text-display tracking-wider">
              Mapa Mental
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetLayout}
              className="text-muted-foreground hover:text-primary gap-1"
              title="Resetar layout"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </Panel>
          <Panel position="bottom-left" className="text-xs text-muted-foreground glass px-3 py-1.5 rounded-lg">
            Clique em um projeto ou ideia para editar • Arraste os nós para reorganizar
          </Panel>
        </ReactFlow>
      </div>

      {(selectedProject || selectedIdea) && (
        <MindMapEditPanel
          project={selectedProject}
          idea={selectedIdea}
          onUpdateProject={updateProject}
          onUpdateIdea={updateIdea}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}
