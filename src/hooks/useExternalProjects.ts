import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ExternalProject {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
}

export function useExternalProjects() {
  const { user } = useAuth();
  const [items, setItems] = useState<ExternalProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('external_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar projetos externos');
    } else {
      setItems((data || []).map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        url: d.url,
        createdAt: d.created_at,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (item: Omit<ExternalProject, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { error } = await supabase.from('external_projects').insert({
      user_id: user.id,
      title: item.title,
      description: item.description,
      url: item.url,
    });
    if (error) toast.error('Erro ao salvar');
    else { toast.success('Projeto adicionado!'); fetchItems(); }
  };

  const updateItem = async (id: string, item: Omit<ExternalProject, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('external_projects').update({
      title: item.title,
      description: item.description,
      url: item.url,
    }).eq('id', id);
    if (error) toast.error('Erro ao atualizar');
    else { toast.success('Atualizado!'); fetchItems(); }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('external_projects').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir');
    else { toast.success('Excluído!'); fetchItems(); }
  };

  return { items, loading, addItem, updateItem, deleteItem };
}
