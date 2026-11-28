"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getDynamicIcon, portfolioIconOptions } from "@/lib/icons";

type IconPickerProps = {
  value: string;
  onChange: (data: { icon: string; platform: string; label: string }) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [collection, setCollection] = React.useState("Popular");
  const CurrentIcon = getDynamicIcon(value);
  const term = search.trim().toLowerCase();
  const results = portfolioIconOptions.filter((option) => {
    const inCollection = term || option.category === collection;
    const matchesSearch = !term || `${option.label} ${option.name} ${option.category}`.toLowerCase().includes(term);
    return inCollection && matchesSearch;
  });
  const collections = [...new Set(portfolioIconOptions.map((option) => option.category))];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-10 max-w-full gap-2 px-3" aria-label={value ? `Change icon: ${value}` : "Choose icon"}>
          {CurrentIcon ? <CurrentIcon className="h-4 w-4 shrink-0" aria-hidden="true" /> : <span className="h-4 w-4 rounded border border-current opacity-40" />}
          <span className="max-w-28 truncate text-xs">{value ? portfolioIconOptions.find((option) => option.name === value)?.label || value.split(".").at(-1) : "Choose icon"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col">
        <DialogHeader>
          <DialogTitle>Choose an icon</DialogTitle>
          <p className="text-sm text-muted-foreground">A focused set of clear icons for links, skills, and project details.</p>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search GitHub, code, cloud…" className="pl-9" />
        </div>
        {!term && <div className="flex flex-wrap gap-2" role="group" aria-label="Icon collections">
          {collections.map((name) => (
            <button key={name} type="button" aria-pressed={collection === name} onClick={() => setCollection(name)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${collection === name ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}>{name}</button>
          ))}
        </div>}
        <div className="min-h-0 overflow-y-auto rounded-lg border border-border p-2">
          {results.length ? <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
            {results.map(({ name, label, icon: Icon }) => {
              const icon = name;
              return <button key={name} type="button" aria-label={label} aria-pressed={value === icon}
                onClick={() => { onChange({ icon, platform: label, label }); setOpen(false); }}
                className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-md p-2 text-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${value === icon ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" /><span className="line-clamp-2 break-words">{label}</span>
              </button>;
            })}
          </div> : <p className="p-8 text-center text-sm text-muted-foreground">No matching icons. Try another word.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
