import { create } from 'zustand';

export interface ChatConversation {
  id: string;
  title: string;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'jarvis_chat_history';

function loadConversations(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveConversations(convos: ChatConversation[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(convos)); } catch {}
}

interface ChatHistoryStore {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  createConversation: (title: string) => string;
  setActiveConversation: (id: string | null) => void;
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void;
  deleteConversation: (id: string) => void;
}

export const useChatHistoryStore = create<ChatHistoryStore>((set, get) => ({
  conversations: loadConversations(),
  activeConversationId: null,

  createConversation: (title: string) => {
    const id = Date.now().toString();
    const convo: ChatConversation = {
      id,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const convos = [convo, ...get().conversations];
    saveConversations(convos);
    set({ conversations: convos, activeConversationId: id });
    return id;
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  updateConversation: (id, updates) => {
    const convos = get().conversations.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    saveConversations(convos);
    set({ conversations: convos });
  },

  deleteConversation: (id) => {
    const convos = get().conversations.filter(c => c.id !== id);
    saveConversations(convos);
    set(s => ({
      conversations: convos,
      activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
    }));
  },
}));
