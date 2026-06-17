import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// DECISION: accessToken is NOT stored here. The BFF proxy keeps the token in an
// httpOnly cookie and injects Bearer server-side. This store holds display-only
// state so the UI can render the session without reading a token.

interface User {
  id: string;
  fullName: string;
  roles: string[];
  agency?: string | null;
}

interface AuthState {
  user: User | null;
  activeJuristicId: string | null;
  juristicRole: string | null;
  // runtime-only: true once session hydration has settled (success or 401).
  // Never persisted — always starts false so the auth guard waits for it.
  hydrated: boolean;

  setAuth: (payload: { user?: User; activeJuristicId?: string | null; juristicRole?: string | null }) => void;
  setContext: (payload: { activeJuristicId: string | null; juristicRole: string | null }) => void;
  setHydrated: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeJuristicId: null,
      juristicRole: null,
      hydrated: false,

      setAuth: (payload) =>
        set((state) => ({
          user: payload.user !== undefined ? payload.user : state.user,
          activeJuristicId:
            payload.activeJuristicId !== undefined
              ? payload.activeJuristicId
              : state.activeJuristicId,
          juristicRole:
            payload.juristicRole !== undefined ? payload.juristicRole : state.juristicRole,
        })),

      setContext: (payload) =>
        set({
          activeJuristicId: payload.activeJuristicId,
          juristicRole: payload.juristicRole,
        }),

      setHydrated: (v) => set({ hydrated: v }),

      clear: () => set({ user: null, activeJuristicId: null, juristicRole: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // hydrated is runtime-only; never save it to sessionStorage
      partialize: (state) => ({
        user: state.user,
        activeJuristicId: state.activeJuristicId,
        juristicRole: state.juristicRole,
      }),
    }
  )
);
