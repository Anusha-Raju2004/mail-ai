import { create } from "zustand";
import { MessageSummary, DetailedMessage } from "@/lib/gmail";

export type ViewMode = "inbox" | "sent" | "compose" | "detail";

export interface FilterState {
  sender: string;
  keyword: string;
  unreadOnly: boolean;
  startDate: string;
  endDate: string;
}

export interface ComposeDraft {
  to: string;
  subject: string;
  body: string;
}

interface AppState {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  emails: MessageSummary[];
  setEmails: (emails: MessageSummary[]) => void;
  openEmailId: string | null;
  setOpenEmailId: (id: string | null) => void;
  selectedEmail: DetailedMessage | null;
  setSelectedEmail: (email: DetailedMessage | null) => void;
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  composeDraft: ComposeDraft;
  setComposeDraft: (draft: Partial<ComposeDraft>) => void;
  resetComposeDraft: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const initialFilters: FilterState = {
  sender: "",
  keyword: "",
  unreadOnly: false,
  startDate: "",
  endDate: "",
};

const initialDraft: ComposeDraft = {
  to: "",
  subject: "",
  body: "",
};

export const useAppState = create<AppState>((set) => ({
  view: "inbox",
  setView: (view) => set({ view }),
  emails: [],
  setEmails: (emails) => set({ emails }),
  openEmailId: null,
  setOpenEmailId: (openEmailId) => set({ openEmailId }),
  selectedEmail: null,
  setSelectedEmail: (selectedEmail) => set({ selectedEmail }),
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: initialFilters }),
  composeDraft: initialDraft,
  setComposeDraft: (newDraft) =>
    set((state) => ({ composeDraft: { ...state.composeDraft, ...newDraft } })),
  resetComposeDraft: () => set({ composeDraft: initialDraft }),
  loading: false,
  setLoading: (loading) => set({ loading }),
}));