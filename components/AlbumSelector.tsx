"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React from "react";

interface Props {
  albums: string[];
  selected: string;
}

export default function AlbumSelector({ albums, selected }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pathname = usePathname();
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const alb = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (alb && alb !== "All") {
      params.set("album", alb);
    } else {
      params.delete("album");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className='flex items-center gap-2'>
      <label className='mr-2'>Album:</label>
      <select
        className='px-2 py-1 border rounded'
        value={selected}
        onChange={handleChange}
      >
        <option value='All'>All</option>
        {albums.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
