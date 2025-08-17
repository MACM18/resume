"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Theme } from "@/types/portfolio";

const generateCssVariables = (theme: Theme) => {
  return `:root { ${Object.entries(theme)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ")} }`;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: theme } = useQuery({
    queryKey: ["theme", hostname],
    queryFn: async () => {
      if (!hostname) return null;
      const { data } = await supabase
        .from("profiles")
        .select("theme")
        .eq("domain", hostname)
        .single();
      return data?.theme;
    },
    enabled: !!hostname,
  });

  return (
    <>
      {theme && (
        <style dangerouslySetInnerHTML={{ __html: generateCssVariables(theme) }} />
      )}
      {children}
    </>
  );
}