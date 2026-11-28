type ArtVariant = "hero" | "work" | "story" | "skills" | "contact";

export function ChapterArt({ variant = "hero", className = "" }: { variant?: ArtVariant; className?: string }) {
  if (variant === "hero") return <svg className={className} viewBox="0 0 440 440" fill="none" aria-hidden="true">
    <circle className="art-orbit art-orbit-one" cx="220" cy="220" r="158" />
    <ellipse className="art-orbit art-orbit-two" cx="220" cy="220" rx="194" ry="104" transform="rotate(-35 220 220)" />
    <ellipse className="art-orbit art-orbit-three" cx="220" cy="220" rx="185" ry="76" transform="rotate(38 220 220)" />
    <path pathLength="1" className="art-trace" d="M24 277C94 277 111 129 185 129s85 152 157 152c35 0 46-26 74-26" />
    <path pathLength="1" className="art-trace art-trace-secondary" d="M45 111c48-25 92-27 131-4 42 25 61 70 99 92 39 23 80 21 120-5" />
    <circle className="art-node art-node-one" cx="185" cy="129" r="7" /><circle className="art-node art-node-two" cx="342" cy="281" r="6" />
    <circle className="art-node art-node-three" cx="275" cy="199" r="4" /><circle className="art-spark" cx="92" cy="83" r="2.5" />
    <path className="art-cross" d="M354 83v18m-9-9h18M95 336v14m-7-7h14" />
  </svg>;
  const path = variant === "work" ? "M8 55C45 8 74 104 111 55s66 1 105 20" : variant === "story" ? "M8 18c34 0 34 50 68 50s34-50 68-50 34 50 68 50" : variant === "skills" ? "M10 60c33-54 65-54 98 0s65 54 98 0" : "M9 65c35-58 70-58 105 0s70 58 105 0";
  return <svg className={className} viewBox="0 0 230 90" fill="none" aria-hidden="true">
    <path pathLength="1" className="art-trace" d={path} />
    <circle className="art-node art-node-one" cx="8" cy={variant === "story" ? "18" : "55"} r="4" />
    <circle className="art-node art-node-two" cx="111" cy="55" r="5" />
    <circle className="art-node art-node-three" cx="222" cy={variant === "story" ? "68" : "75"} r="4" />
    <path className="art-cross" d="M184 14v12m-6-6h12" />
  </svg>;
}
