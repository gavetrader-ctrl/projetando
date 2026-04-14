import { useState, useEffect } from 'react';
import { Note, NOTE_THEMES, EMOJI_TAGS } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Trash2, Calendar, Clock } from 'lucide-react';

interface NoteEditPanelProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];
const FONT_COLORS = [
  { value: '', label: 'Padrão' },
  { value: 'hsl(0 0% 100%)', label: '⬜ Branco' },
  { value: 'hsl(0 70% 60%)', label: '🟥 Vermelho' },
  { value: 'hsl(40 90% 55%)', label: '🟨 Amarelo' },
  { value: 'hsl(120 60% 50%)', label: '🟩 Verde' },
  { value: 'hsl(200 80% 55%)', label: '🟦 Azul' },
  { value: 'hsl(280 70% 60%)', label: '🟪 Roxo' },
  { value: 'hsl(30 80% 55%)', label: '🟧 Laranja' },
];

export function NoteEditPanel({ note, onUpdate, onDelete, onClose }: NoteEditPanelProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [theme, setTheme] = useState(note.theme);
  const [emojiTag, setEmojiTag] = useState(note.emojiTag);
  const [fontSize, setFontSize] = useState(note.fontSize);
  const [fontColor, setFontColor] = useState(note.fontColor);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTheme(note.theme);
    setEmojiTag(note.emojiTag);
    setFontSize(note.fontSize);
    setFontColor(note.fontColor);
  }, [note]);

  const handleSave = () => {
    onUpdate(note.id, { title, content, theme, emojiTag, fontSize, fontColor });
  };

  const createdDate = new Date(note.createdAt);
  const updatedDate = new Date(note.updatedAt);

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary">Editar Nota</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Timestamps */}
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Criado: {createdDate.toLocaleDateString('pt-BR')} {createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Atualizado: {updatedDate.toLocaleDateString('pt-BR')} {updatedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-xs">Título</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da nota" className="h-8 text-sm" />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label className="text-xs">Conteúdo</Label>
        <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Use **negrito**, | para tabelas..." className="min-h-[120px] text-sm" />
        <p className="text-[9px] text-muted-foreground">
          Dicas: **negrito**, | col1 | col2 | para tabelas
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-1.5">
        <Label className="text-xs">Tema</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(NOTE_THEMES).map(([key, t]) => (
              <SelectItem key={key} value={key} className="text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: t.border }} />
                  {t.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Emoji Tag */}
      <div className="space-y-1.5">
        <Label className="text-xs">Marcador Emoji</Label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_TAGS.map(({ emoji, label }) => (
            <button
              key={label}
              onClick={() => setEmojiTag(emoji)}
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                emojiTag === emoji
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {emoji || '∅'} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-1.5">
        <Label className="text-xs">Tamanho da Fonte</Label>
        <div className="flex gap-1">
          {FONT_SIZES.map(size => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                fontSize === size
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Font Color */}
      <div className="space-y-1.5">
        <Label className="text-xs">Cor da Fonte</Label>
        <div className="flex flex-wrap gap-1.5">
          {FONT_COLORS.map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setFontColor(value)}
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                fontColor === value
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} size="sm" className="flex-1">
          Salvar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => { onDelete(note.id); onClose(); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
