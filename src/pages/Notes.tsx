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
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { NoteBlock } from '@/components/notes/NoteBlock';
import { NoteEditPanel } from '@/components/notes/NoteEditPanel';
import { useNotes } from '@/hooks/useNotes';
import { Note, NOTE_THEMES } from '@/types/note';

const nodeTypes = { noteBlock: NoteBlock };

export default function Notes() {
  const { notes, connections, loading, addNote, updateNote, deleteNote, addConnection } = useNotes();
  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const computedNodes: Node[] = useMemo(() =>
    notes.map(note => ({
      id: note.id,
      type: 'noteBlock',
      position: { x: note.positionX, y: note.positionY },
      data: {
        label: note.title,
        content: note.content,
        theme: note.theme,
        emojiTag: note.emojiTag,
        fontSize: note.fontSize,
        fontColor: note.fontColor,
        createdAt: note.createdAt,
        noteId: note.id,
      },
    })),
  [notes]);

  const computedEdges: Edge[] = useMemo(() =>
    connections.map(conn => {
      const sourceNote = notes.find(n => n.id === conn.sourceNoteId);
      const theme = NOTE_THEMES[sourceNote?.theme || 'default'] || NOTE_THEMES.default;
      return {
        id: conn.id,
        source: conn.sourceNoteId,
        target: conn.targetNoteId,
        style: { stroke: theme.border, strokeWidth: 2 },
        type: 'smoothstep',
        animated: true,
      };
    }),
  [connections, notes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

  useEffect(() => {
    setNodes(prev => {
      const posMap = new Map(prev.map(n => [n.id, n.position]));
      return computedNodes.map(n => ({
        ...n,
        position: posMap.get(n.id) || n.position,
      }));
    });
    setEdges(computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

  const handleNodeDragStop = useCallback((_: any, node: Node) => {
    updateNote(node.id, { positionX: node.position.x, positionY: node.position.y });
  }, [updateNote]);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    const note = notes.find(n => n.id === node.id);
    if (note) setSelectedNote(note);
  }, [notes]);

  const handleConnect = useCallback((params: Connection) => {
    if (params.source && params.target && params.source !== params.target) {
      addConnection(params.source, params.target);
    }
  }, [addConnection]);

  const handleAddNote = useCallback(async () => {
    const offset = notes.length * 30;
    await addNote({
      title: '',
      content: '',
      positionX: 200 + offset,
      positionY: 200 + offset,
      theme: 'default',
    });
  }, [addNote, notes.length]);

  useEffect(() => {
    if (selectedNote) {
      const updated = notes.find(n => n.id === selectedNote.id);
      if (updated) setSelectedNote(updated);
      else setSelectedNote(null);
    }
  }, [notes, selectedNote?.id]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <span className="text-primary animate-pulse text-lg font-display">Carregando notas...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background flex">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeDragStop={handleNodeDragStop}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="hsl(200 15% 18%)" gap={24} size={1} />
          <Controls className="!bg-card !border-border !rounded-lg !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-secondary" />
          <MiniMap
            nodeColor={() => 'hsl(175 80% 50%)'}
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
              Bloco de Notas
            </h1>
            <Button
              size="sm"
              onClick={handleAddNote}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Nova Nota
            </Button>
          </Panel>
          <Panel position="bottom-left" className="text-xs text-muted-foreground glass px-3 py-1.5 rounded-lg">
            Clique para editar • Arraste para mover • Conecte arrastando dos pontos
          </Panel>
        </ReactFlow>
      </div>

      {selectedNote && (
        <NoteEditPanel
          note={selectedNote}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
}
