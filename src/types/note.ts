export interface Note {
  id: string;
  title: string;
  content: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  theme: string;
  emojiTag: string;
  fontSize: number;
  fontColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteConnection {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
}

export const NOTE_THEMES: Record<string, { bg: string; border: string; label: string }> = {
  default: { bg: 'hsl(220 18% 12%)', border: 'hsl(175 80% 50%)', label: 'Padrão' },
  urgent: { bg: 'hsl(0 30% 12%)', border: 'hsl(0 70% 55%)', label: '🚨 Urgente' },
  attention: { bg: 'hsl(40 30% 12%)', border: 'hsl(40 90% 55%)', label: '⚠️ Atenção' },
  success: { bg: 'hsl(150 20% 10%)', border: 'hsl(150 60% 45%)', label: '✅ Concluído' },
  idea: { bg: 'hsl(260 20% 12%)', border: 'hsl(260 70% 60%)', label: '💡 Ideia' },
  important: { bg: 'hsl(200 25% 12%)', border: 'hsl(200 80% 55%)', label: '📌 Importante' },
  study: { bg: 'hsl(280 20% 12%)', border: 'hsl(280 60% 55%)', label: '📚 Estudo' },
  financial: { bg: 'hsl(120 20% 10%)', border: 'hsl(120 60% 40%)', label: '💰 Financeiro' },
};

export const EMOJI_TAGS: { emoji: string; label: string }[] = [
  { emoji: '', label: 'Nenhum' },
  { emoji: '🚨', label: 'Urgente' },
  { emoji: '⚠️', label: 'Atenção' },
  { emoji: '✅', label: 'Concluído' },
  { emoji: '💡', label: 'Ideia' },
  { emoji: '📌', label: 'Importante' },
  { emoji: '📚', label: 'Estudo' },
  { emoji: '💰', label: 'Financeiro' },
  { emoji: '🔥', label: 'Prioridade' },
  { emoji: '⏳', label: 'Pendente' },
  { emoji: '🎯', label: 'Meta' },
  { emoji: '❤️', label: 'Favorito' },
];
