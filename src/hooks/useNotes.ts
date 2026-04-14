import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Note, NoteConnection } from '@/types/note';

function mapNoteFromDb(row: any): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    positionX: row.position_x,
    positionY: row.position_y,
    width: row.width,
    height: row.height,
    theme: row.theme,
    emojiTag: row.emoji_tag,
    fontSize: row.font_size,
    fontColor: row.font_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapConnectionFromDb(row: any): NoteConnection {
  return {
    id: row.id,
    sourceNoteId: row.source_note_id,
    targetNoteId: row.target_note_id,
  };
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<NoteConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setNotes([]); setConnections([]); setLoading(false); return; }
    setLoading(true);
    Promise.all([
      supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('note_connections').select('*').eq('user_id', user.id),
    ]).then(([notesRes, connsRes]) => {
      if (!notesRes.error && notesRes.data) setNotes(notesRes.data.map(mapNoteFromDb));
      if (!connsRes.error && connsRes.data) setConnections(connsRes.data.map(mapConnectionFromDb));
      setLoading(false);
    });
  }, [user]);

  const addNote = useCallback(async (note: Partial<Note>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('notes').insert({
      user_id: user.id,
      title: note.title || '',
      content: note.content || '',
      position_x: note.positionX ?? 100,
      position_y: note.positionY ?? 100,
      width: note.width ?? 280,
      height: note.height ?? 200,
      theme: note.theme || 'default',
      emoji_tag: note.emojiTag || '',
      font_size: note.fontSize ?? 14,
      font_color: note.fontColor || '',
    }).select().single();
    if (!error && data) {
      const mapped = mapNoteFromDb(data);
      setNotes(prev => [...prev, mapped]);
      return mapped;
    }
    return null;
  }, [user]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.positionX !== undefined) dbUpdates.position_x = updates.positionX;
    if (updates.positionY !== undefined) dbUpdates.position_y = updates.positionY;
    if (updates.width !== undefined) dbUpdates.width = updates.width;
    if (updates.height !== undefined) dbUpdates.height = updates.height;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    if (updates.emojiTag !== undefined) dbUpdates.emoji_tag = updates.emojiTag;
    if (updates.fontSize !== undefined) dbUpdates.font_size = updates.fontSize;
    if (updates.fontColor !== undefined) dbUpdates.font_color = updates.fontColor;

    const { data, error } = await supabase.from('notes').update(dbUpdates).eq('id', id).eq('user_id', user.id).select().single();
    if (!error && data) setNotes(prev => prev.map(n => n.id === id ? mapNoteFromDb(data) : n));
  }, [user]);

  const deleteNote = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== id));
      setConnections(prev => prev.filter(c => c.sourceNoteId !== id && c.targetNoteId !== id));
    }
  }, [user]);

  const addConnection = useCallback(async (sourceId: string, targetId: string) => {
    if (!user) return;
    const exists = connections.find(c =>
      (c.sourceNoteId === sourceId && c.targetNoteId === targetId) ||
      (c.sourceNoteId === targetId && c.targetNoteId === sourceId)
    );
    if (exists) return;
    const { data, error } = await supabase.from('note_connections').insert({
      user_id: user.id,
      source_note_id: sourceId,
      target_note_id: targetId,
    }).select().single();
    if (!error && data) setConnections(prev => [...prev, mapConnectionFromDb(data)]);
  }, [user, connections]);

  const deleteConnection = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('note_connections').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setConnections(prev => prev.filter(c => c.id !== id));
  }, [user]);

  return { notes, connections, loading, addNote, updateNote, deleteNote, addConnection, deleteConnection };
}
