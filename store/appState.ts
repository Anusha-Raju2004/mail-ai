import { create } from "zustand";
import { MessageSummary, DetailedMessage } from "@/lib/gmail";

export type ViewMode =
  | "inbox"
  | "sent"
  | "trash"
  | "drafts"
  | "starred"
  | "compose"
  | "detail";

export interface FilterState {
  sender: string;
  keyword: string;
  unreadOnly: boolean;
  starredOnly?: boolean;
  startDate: string;
  endDate: string;
}

export interface ComposeDraft {
  to: string;
  subject: string;
  body: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AppState {
  // Auth State
  isAuthenticated: boolean;
  setIsAuthenticated: (status: boolean) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // App Navigation & Mail Data
  view: ViewMode;
  setView: (view: ViewMode) => void;
  emails: MessageSummary[];
  setEmails: (emails: MessageSummary[]) => void;
  openEmailId: string | null;
  setOpenEmailId: (id: string | null) => void;
  selectedEmail: DetailedMessage | null;
  setSelectedEmail: (email: DetailedMessage | null) => void;

  // Filters State
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Compose State
  composeDraft: ComposeDraft;
  setComposeDraft: (draft: Partial<ComposeDraft>) => void;
  resetComposeDraft: () => void;

  // UI Status State
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const initialFilters: FilterState = {
  sender: "",
  keyword: "",
  unreadOnly: false,
  starredOnly: false,
  startDate: "",
  endDate: "",
};

const initialDraft: ComposeDraft = {
  to: "",
  subject: "",
  body: "",
};

export const useAppState = create<AppState>((set) => ({
  // Auth initial values
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  user: null,
  setUser: (user) => set({ user }),

  // Mail initial values
  view: "inbox",
  setView: (view) => set({ view }),
  emails: [],
  setEmails: (emails) => set({ emails }),
  openEmailId: null,
  setOpenEmailId: (openEmailId) => set({ openEmailId }),
  selectedEmail: null,
  setSelectedEmail: (selectedEmail) => set({ selectedEmail }),

  // Filters actions
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: initialFilters }),

  // Draft actions
  composeDraft: initialDraft,
  setComposeDraft: (newDraft) =>
    set((state) => ({ composeDraft: { ...state.composeDraft, ...newDraft } })),
  resetComposeDraft: () => set({ composeDraft: initialDraft }),

  // Loading indicator actions
  loading: false,
  setLoading: (loading) => set({ loading }),
}));