import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren } from 'react';
import type { Note } from '@/types/note';
import Notes from '@/pages/Notes';

const state = vi.hoisted(() => ({
  notes: [] as Note[],
  addNote: vi.fn(),
  updateNote: vi.fn(),
}));

vi.mock('@/hooks/useNotes', () => ({
  useNotes: () => ({
    notes: state.notes,
    connections: [],
    loading: false,
    addNote: state.addNote,
    updateNote: state.updateNote,
    deleteNote: vi.fn(),
    addConnection: vi.fn(),
    deleteConnection: vi.fn(),
  }),
}));

vi.mock('@/store/useStore', () => ({
  useProjects: () => ({ projects: [], addProject: vi.fn() }),
  useIdeas: () => ({ ideas: [], addIdea: vi.fn() }),
}));

vi.mock('@xyflow/react', async importOriginal => ({
  ...await importOriginal<typeof import('@xyflow/react')>(),
  ReactFlow: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Panel: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Background: () => null,
  Controls: () => null,
  MiniMap: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.notes = [];
  state.addNote.mockImplementation(async (draft: Partial<Note>) => {
    const note: Note = {
      id: `note-${state.notes.length + 1}`,
      title: '', content: '', positionX: 200, positionY: 200,
      width: 280, height: 200, theme: 'default', emojiTag: '',
      fontSize: 14, fontColor: '',
      createdAt: '2026-11-25T12:37:00Z', updatedAt: '2026-11-25T12:37:00Z',
      ...draft,
    };
    state.notes = [...state.notes, note];
    return note;
  });
});

afterEach(cleanup);

function openNotes() {
  render(<MemoryRouter><Notes /></MemoryRouter>);
}

describe('automatic editing of newly created notes', () => {
  it('opens the created note ready to type and saves edits to that note', async () => {
    openNotes();
    fireEvent.click(screen.getByRole('button', { name: 'Nova Nota' }));

    const title = await screen.findByPlaceholderText('Título da nota');
    await waitFor(() => expect(title).toHaveFocus());
    fireEvent.change(title, { target: { value: 'Planejamento pessoal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(state.updateNote).toHaveBeenCalledWith('note-1', expect.objectContaining({ title: 'Planejamento pessoal' }));
  });

  it('focuses the next new note even when the editor is already open', async () => {
    openNotes();
    const create = screen.getByRole('button', { name: 'Nova Nota' });
    fireEvent.click(create);
    const title = await screen.findByPlaceholderText('Título da nota');
    fireEvent.change(title, { target: { value: 'Primeira nota' } });

    create.focus();
    fireEvent.click(create);
    await waitFor(() => expect(state.notes).toHaveLength(2));
    await waitFor(() => expect(title).toHaveValue(''));
    expect(title).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(state.updateNote).toHaveBeenCalledWith('note-2', expect.objectContaining({ title: '' }));
  });

  it('does not open an editor if creation fails', async () => {
    state.addNote.mockResolvedValueOnce(null);
    openNotes();
    fireEvent.click(screen.getByRole('button', { name: 'Nova Nota' }));
    await waitFor(() => expect(state.addNote).toHaveResolvedWith(null));
    expect(screen.queryByPlaceholderText('Título da nota')).not.toBeInTheDocument();
  });
});