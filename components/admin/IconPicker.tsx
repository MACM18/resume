"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as Fa from "react-icons/fa";
import * as Fi from "react-icons/fi";
import * as Ai from "react-icons/ai";
import * as Bi from "react-icons/bi";
import * as Bs from "react-icons/bs";
import * as Ci from "react-icons/ci";
import * as Di from "react-icons/di";
import * as Gi from "react-icons/gi";
import * as Hi from "react-icons/hi";
import * as Im from "react-icons/im";
import * as Io from "react-icons/io";
import * as Md from "react-icons/md";
import * as Ri from "react-icons/ri";
import * as Si from "react-icons/si";
import * as Ti from "react-icons/ti";
import * as Fc from "react-icons/fc";
import type { IconType } from "react-icons";

const iconSets = { Fa, Fi, Ai, Bi, Bs, Ci, Di, Gi, Hi, Im, Io, Md, Ri, Si, Ti, Fc };
const collections = {
  Popular: ["Fa.FaGithub", "Fa.FaLinkedin", "Fa.FaEnvelope", "Fa.FaGlobe", "Fa.FaCode", "Fa.FaBriefcase", "Fi.FiExternalLink", "Fi.FiMail", "Fi.FiPhone", "Fi.FiUser", "Fi.FiLayers", "Fi.FiZap"],
  Social: ["Fa.FaGithub", "Fa.FaLinkedin", "Fa.FaTwitter", "Fa.FaInstagram", "Fa.FaYoutube", "Fa.FaFacebook", "Fa.FaMedium", "Fa.FaDev", "Fi.FiMail", "Fi.FiGlobe"],
  Interface: ["Fi.FiCode", "Fi.FiLayers", "Fi.FiDatabase", "Fi.FiSmartphone", "Fi.FiCloud", "Fi.FiShield", "Fi.FiPenTool", "Fi.FiMonitor", "Fi.FiCpu", "Fi.FiSettings"],
  Technology: ["Si.SiReact", "Si.SiNextdotjs", "Si.SiTypescript", "Si.SiJavascript", "Si.SiNodedotjs", "Si.SiPostgresql", "Si.SiDocker", "Si.SiAmazonwebservices", "Si.SiPython", "Si.SiLaravel"],
} as const;

type IconPickerProps = {
  value: string;
  onChange: (data: { icon: string; platform: string; label: string }) => void;
};

function getIcon(name: string): IconType | undefined {
  const [prefix, iconName] = name.split(".");
  const set = iconSets[prefix as keyof typeof iconSets];
  return set ? (set as Record<string, IconType>)[iconName] : undefined;
}

function readableName(name: string) {
  return name.split(".").at(-1)?.replace(/^(Fa|Fi|Ai|Bi|Bs|Ci|Di|Gi|Hi|Im|Io|Md|Ri|Si|Ti|Fc)/, "").replace(/([a-z])([A-Z])/g, "$1 $2").trim() || name;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [collection, setCollection] = React.useState<keyof typeof collections>("Popular");
  const CurrentIcon = getIcon(value);

  const results = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [...collections[collection]].filter((name) => getIcon(name));
    const matches: string[] = [];
    for (const [prefix, set] of Object.entries(iconSets)) {
      for (const name of Object.keys(set)) {
        if (name.toLowerCase().includes(term)) matches.push(`${prefix}.${name}`);
        if (matches.length >= 80) return matches;
      }
    }
    return matches;
  }, [search, collection]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-10 max-w-full gap-2 px-3" aria-label={value ? `Change icon: ${readableName(value)}` : "Choose icon"}>
          {CurrentIcon ? <CurrentIcon className="h-4 w-4 shrink-0" /> : <span className="h-4 w-4 rounded border border-current opacity-40" />}
          <span className="max-w-28 truncate text-xs">{value ? readableName(value) : "Choose icon"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Choose an icon</DialogTitle>
          <p className="text-sm text-muted-foreground">Browse common icons or search the full library.</p>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search GitHub, code, cloud…" className="pl-9" />
        </div>
        {!search && <div className="flex flex-wrap gap-2" role="group" aria-label="Icon collections">
          {Object.keys(collections).map((name) => (
            <button key={name} type="button" aria-pressed={collection === name} onClick={() => setCollection(name as keyof typeof collections)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${collection === name ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}>{name}</button>
          ))}
        </div>}
        <div className="min-h-0 overflow-y-auto rounded-lg border border-border p-2">
          {results.length ? <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5">
            {results.map((name) => {
              const Icon = getIcon(name);
              if (!Icon) return null;
              const label = readableName(name);
              return <button key={name} type="button" aria-label={label} aria-pressed={value === name}
                onClick={() => { onChange({ icon: name, platform: label, label }); setOpen(false); }}
                className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-md p-2 text-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${value === name ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <Icon className="h-5 w-5 shrink-0" /><span className="line-clamp-2 break-words">{label}</span>
              </button>;
            })}
          </div> : <p className="p-8 text-center text-sm text-muted-foreground">No matching icons. Try another word.</p>}
        </div>
        {search && results.length === 80 && <p className="text-xs text-muted-foreground">Showing 80 matches. Use a more specific search to narrow the list.</p>}
      </DialogContent>
    </Dialog>
  );
}
