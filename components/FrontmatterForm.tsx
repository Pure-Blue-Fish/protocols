// ABOUTME: Form for editing protocol frontmatter (title, category, etc)
// ABOUTME: Sits above WYSIWYG editor, uses CATEGORIES from lib/protocols

"use client";

const CATEGORIES = {
  he: {
    feeding: "האכלה",
    "water-quality": "איכות מים",
    treatments: "טיפולים",
    "tank-procedures": "פרוצדורות מיכלים",
    "pool-procedures": "פרוצדורות בריכות",
    transfers: "העברות",
    monitoring: "מעקב דגים",
    arrival: "הגעת דגים",
    lab: "מעבדה",
    other: "אחר",
  },
  en: {
    feeding: "Feeding",
    "water-quality": "Water Quality",
    treatments: "Treatments",
    "tank-procedures": "Tank Procedures",
    "pool-procedures": "Pool Procedures",
    transfers: "Transfers",
    monitoring: "Fish Monitoring",
    arrival: "Fish Arrival",
    lab: "Laboratory",
    other: "Other",
  },
} as const;

export interface FrontmatterData {
  title: string;
  category: string;
  protocolNumber: string;
  frequency: string;
}

interface FrontmatterFormProps {
  data: FrontmatterData;
  onChange: (data: FrontmatterData) => void;
  lang: "he" | "en";
}

export function FrontmatterForm({ data, onChange, lang }: FrontmatterFormProps) {
  const categories = CATEGORIES[lang];
  const isRtl = lang === "he";

  const labels = {
    he: { title: "כותרת", category: "קטגוריה", protocolNumber: "מספר פרוטוקול", frequency: "תדירות" },
    en: { title: "Title", category: "Category", protocolNumber: "Protocol Number", frequency: "Frequency" },
  };

  const update = (field: keyof FrontmatterData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-surface-subtle border border-border-default rounded-lg mb-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-text-secondary mb-1">{labels[lang].title}</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full px-3 py-2 border border-border-default rounded-md focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{labels[lang].category}</label>
        <select
          value={data.category}
          onChange={(e) => update("category", e.target.value)}
          className="w-full px-3 py-2 border border-border-default rounded-md focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary"
        >
          {Object.entries(categories).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{labels[lang].protocolNumber}</label>
        <input
          type="text"
          value={data.protocolNumber}
          onChange={(e) => update("protocolNumber", e.target.value)}
          placeholder="PRO.X.X.X"
          className="w-full px-3 py-2 border border-border-default rounded-md focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary"
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className="block text-sm font-medium text-text-secondary mb-1">{labels[lang].frequency}</label>
        <input
          type="text"
          value={data.frequency}
          onChange={(e) => update("frequency", e.target.value)}
          className="w-full px-3 py-2 border border-border-default rounded-md focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary"
        />
      </div>
    </div>
  );
}
