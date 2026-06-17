import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// DECISION: accessToken is NOT stored here. The BFF proxy keeps the token in an
// httpOnly cookie and injects Bearer server-side. This store holds display-only
// state so the UI can render the session without reading a token.

interface User {
  id: string;
  fullName: string;
  roles: string[];
  agencyId?: string | null;
}

interface AuthState {
  user: User | null;
  activeJuristicId: string | null;
  juristicRole: string | null;
  // runtime-only: true once session hydration has settled (success or 401).
  // Never persisted — always starts false so the auth guard waits for it.
  hydrated: boolean;
  // Holds the short-lived tempToken returned when mustChangePassword is true.
  // Not persisted — lives only for the duration of the change-password flow.
  pendingTempToken: string | null;

  setAuth: (payload: { user?: User; activeJuristicId?: string | null; juristicRole?: string | null }) => void;
  setContext: (payload: { activeJuristicId: string | null; juristicRole: string | null }) => void;
  setHydrated: (v: boolean) => void;
  setPendingTempToken: (token: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeJuristicId: null,
      juristicRole: null,
      hydrated: false,
      pendingTempToken: null,

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

      setPendingTempToken: (token) => set({ pendingTempToken: token }),

      clear: () => set({ user: null, activeJuristicId: null, juristicRole: null, pendingTempToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // hydrated and pendingTempToken are runtime-only; never save to sessionStorage
      partialize: (state) => ({
        user: state.user,
        activeJuristicId: state.activeJuristicId,
        juristicRole: state.juristicRole,
      }),
    }
  )
);
