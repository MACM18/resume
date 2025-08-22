"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
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

// Combine all icon sets
const iconSets = {
  Fa,
  Fi,
  Ai,
  Bi,
  Bs,
  Ci,
  Di,
  Gi,
  Hi,
  Im,
  Io,
  Md,
  Ri,
  Si,
  Ti,
  Fc,
};

import { IconType } from "react-icons";

type IconPickerProps = {
  value: string;
  onChange: (data: { icon: string; platform: string; label: string }) => void;
};

// Utility to prettify icon names (e.g., FaGithub -> Github)
function prettifyIconName(iconName: string) {
  // Remove prefix and split camel case
  const name = iconName
    .replace(/^[A-Z][a-z]/, (m) => m.toUpperCase())
    .replace(/^[A-Za-z]+/, (m) => m)
    .replace(/([a-z])([A-Z])/g, "$1 $2");
  // Remove any trailing numbers (e.g., X123)
  return name.replace(/\d+$/, "").trim();
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get all icons by category
  const iconsByCategory = React.useMemo(() => {
    const categories: { [key: string]: { name: string; Icon: IconType }[] } =
      {};
    Object.entries(iconSets).forEach(([prefix, set]) => {
      categories[prefix] = [];
      Object.entries(set).forEach(([name, Icon]) => {
        if (typeof Icon === "function") {
          categories[prefix].push({
            name: `${prefix}.${name}`,
            Icon: Icon as IconType,
          });
        }
      });
    });
    return categories;
  }, []);

  // Filter icons based on search
  const filteredIcons = React.useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered: { name: string; Icon: IconType }[] = [];

    Object.values(iconsByCategory).forEach((icons) => {
      icons.forEach((icon) => {
        if (!search || icon.name.toLowerCase().includes(searchLower)) {
          filtered.push(icon);
        }
      });
    });

    return filtered;
  }, [search, iconsByCategory]);

  // Find the current icon component
  const CurrentIcon = React.useMemo(() => {
    if (!value) return null;
    const [prefix, name] = value.split(".");
    const set = iconSets[prefix as keyof typeof iconSets];
    return set ? (set as Record<string, IconType>)[name] : undefined;
  }, [value]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='w-[240px] justify-start text-left font-normal'
        >
          <div className='w-full flex items-center gap-2'>
            {CurrentIcon ? (
              <CurrentIcon className='h-4 w-4' />
            ) : (
              <div className='h-4 w-4 rounded border border-foreground/20' />
            )}
            {value || "Select an icon..."}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
        </DialogHeader>
        <div className='flex items-center border rounded-md px-3 mb-4'>
          <Search className='w-4 h-4 mr-2 opacity-50' />
          <Input
            placeholder='Search icons...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
          />
        </div>
        <div className='grid grid-cols-8 gap-2 p-2'>
          {filteredIcons.map(({ name, Icon }) => {
            // Extract platform/label from icon name
            const [, iconComponent] = name.split(".");
            const pretty = prettifyIconName(iconComponent);
            return (
              <Button
                key={name}
                variant={value === name ? "default" : "outline"}
                className='h-12 w-12 p-0'
                onClick={() => {
                  onChange({
                    icon: name,
                    platform: pretty,
                    label: pretty,
                  });
                  setIsOpen(false);
                }}
              >
                <Icon className='h-5 w-5' />
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
