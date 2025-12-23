import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated })
    }
  )
);

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      setTheme: (theme) => set({ theme })
    }),
    { name: 'theme-storage' }
  )
);

export const useDocumentStore = create((set) => ({
  documents: [],
  currentDocument: null,
  activeUsers: [],
  filter: 'all',
  searchQuery: '',
  viewMode: 'grid',

  setDocuments: (documents) => set({ documents }),

  addDocument: (document) => set((state) => ({
    documents: [document, ...state.documents]
  })),

  updateDocumentInList: (id, updates) => set((state) => ({
    documents: state.documents.map(doc =>
      doc._id === id ? { ...doc, ...updates } : doc
    )
  })),

  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter(doc => doc._id !== id)
  })),

  setCurrentDocument: (document) => set({ currentDocument: document }),

  updateCurrentDocument: (updates) => set((state) => ({
    currentDocument: state.currentDocument
      ? { ...state.currentDocument, ...updates }
      : null
  })),

  setActiveUsers: (users) => set({ activeUsers: users }),

  setFilter: (filter) => set({ filter }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setViewMode: (mode) => set({ viewMode: mode })
}));

export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      { id: Date.now(), ...notification }
    ]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] })
}));
