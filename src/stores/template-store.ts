import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TransactionTemplate } from "@/types";

type TemplateInput = Omit<TransactionTemplate, "id" | "usageCount" | "lastUsed"> & {
  id?: string;
  usageCount?: number;
  lastUsed?: string;
};

interface TemplateState {
  templates: TransactionTemplate[];
  addTemplate: (template: TemplateInput) => TransactionTemplate;
  updateTemplate: (id: string, template: Partial<TemplateInput>) => void;
  removeTemplate: (id: string) => void;
  recordTemplateUse: (id: string) => void;
  clearTemplates: () => void;
}

function createTemplate(input: TemplateInput): TransactionTemplate {
  const now = new Date().toISOString();

  return {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    icon: input.icon,
    type: input.type,
    account_id: input.account_id,
    category_id: input.category_id,
    amount: input.amount,
    currency: input.currency,
    notes: input.notes,
    usageCount: input.usageCount ?? 0,
    lastUsed: input.lastUsed ?? now,
  };
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (input) => {
        const template = createTemplate(input);
        set((state) => ({ templates: [template, ...state.templates] }));
        return template;
      },
      updateTemplate: (id, input) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...input, id: template.id } : template,
          ),
        })),
      removeTemplate: (id) =>
        set((state) => ({ templates: state.templates.filter((template) => template.id !== id) })),
      recordTemplateUse: (id) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, usageCount: template.usageCount + 1, lastUsed: new Date().toISOString() }
              : template,
          ),
        })),
      clearTemplates: () => set({ templates: [] }),
    }),
    { name: "fitracker-templates" },
  ),
);
