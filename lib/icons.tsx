import {
  FaBriefcase,
  FaCode,
  FaDatabase as FaDatabaseIcon,
  FaEnvelope,
  FaFacebook,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaMedium,
  FaServer,
  FaTwitter,
  FaYoutube,
  FaDev,
} from "react-icons/fa";
import {
  FiCloud,
  FiCpu,
  FiDatabase,
  FiExternalLink,
  FiLayers,
  FiMonitor,
  FiPenTool,
  FiPhone,
  FiSettings,
  FiShield,
  FiSmartphone,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { BsTwitterX } from "react-icons/bs";
import { GiCloudUpload } from "react-icons/gi";
import {
  SiDocker,
  SiJavascript,
  SiLaravel,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import type { IconType } from "react-icons";

/** Small curated React Icons set shared by the public portfolio and icon editor. */
export const portfolioIconOptions = [
  { name: "Fa.FaGithub", label: "GitHub", icon: FaGithub, category: "Popular" },
  { name: "Fa.FaLinkedinIn", label: "LinkedIn", icon: FaLinkedinIn, category: "Popular" },
  { name: "Fa.FaEnvelope", label: "Email", icon: FaEnvelope, category: "Popular" },
  { name: "Fa.FaGlobe", label: "Website", icon: FaGlobe, category: "Popular" },
  { name: "Fa.FaCode", label: "Code", icon: FaCode, category: "Popular" },
  { name: "Fa.FaBriefcase", label: "Work", icon: FaBriefcase, category: "Popular" },
  { name: "Fi.FiExternalLink", label: "External link", icon: FiExternalLink, category: "Popular" },
  { name: "Fi.FiPhone", label: "Phone", icon: FiPhone, category: "Popular" },
  { name: "Fi.FiUser", label: "Profile", icon: FiUser, category: "Popular" },
  { name: "Fi.FiLayers", label: "Layers", icon: FiLayers, category: "Interface" },
  { name: "Fi.FiDatabase", label: "Database", icon: FiDatabase, category: "Interface" },
  { name: "Fi.FiSmartphone", label: "Mobile", icon: FiSmartphone, category: "Interface" },
  { name: "Fi.FiCloud", label: "Cloud", icon: FiCloud, category: "Interface" },
  { name: "Fi.FiShield", label: "Security", icon: FiShield, category: "Interface" },
  { name: "Fi.FiPenTool", label: "Design", icon: FiPenTool, category: "Interface" },
  { name: "Fi.FiMonitor", label: "Desktop", icon: FiMonitor, category: "Interface" },
  { name: "Fi.FiCpu", label: "Technology", icon: FiCpu, category: "Interface" },
  { name: "Fi.FiZap", label: "Automation", icon: FiZap, category: "Interface" },
  { name: "Fa.FaServer", label: "Infrastructure", icon: FaServer, category: "Technology" },
  { name: "Gi.GiCloudUpload", label: "Cloud hosting", icon: GiCloudUpload, category: "Technology" },
  { name: "Fa.FaDatabase", label: "Data", icon: FaDatabaseIcon, category: "Technology" },
  { name: "Si.SiReact", label: "React", icon: SiReact, category: "Technology" },
  { name: "Si.SiNextdotjs", label: "Next.js", icon: SiNextdotjs, category: "Technology" },
  { name: "Si.SiTypescript", label: "TypeScript", icon: SiTypescript, category: "Technology" },
  { name: "Si.SiJavascript", label: "JavaScript", icon: SiJavascript, category: "Technology" },
  { name: "Si.SiNodedotjs", label: "Node.js", icon: SiNodedotjs, category: "Technology" },
  { name: "Si.SiPostgresql", label: "PostgreSQL", icon: SiPostgresql, category: "Technology" },
  { name: "Si.SiDocker", label: "Docker", icon: SiDocker, category: "Technology" },
  { name: "Si.SiPython", label: "Python", icon: SiPython, category: "Technology" },
  { name: "Si.SiLaravel", label: "Laravel", icon: SiLaravel, category: "Technology" },
  { name: "Fa.FaTwitter", label: "Twitter", icon: FaTwitter, category: "Social" },
  { name: "Fa.FaInstagram", label: "Instagram", icon: FaInstagram, category: "Social" },
  { name: "Fa.FaYoutube", label: "YouTube", icon: FaYoutube, category: "Social" },
  { name: "Fa.FaFacebook", label: "Facebook", icon: FaFacebook, category: "Social" },
  { name: "Fa.FaMedium", label: "Medium", icon: FaMedium, category: "Social" },
  { name: "Fa.FaDev", label: "Dev.to", icon: FaDev, category: "Social" },
  { name: "Bs.BsTwitterX", label: "X", icon: BsTwitterX, category: "Social" },
  { name: "Fi.FiSettings", label: "Settings", icon: FiSettings, category: "Interface" },
] as const satisfies readonly { name: string; label: string; icon: IconType; category: string }[];

const iconsByName = new Map<string, IconType>(portfolioIconOptions.map((item) => [item.name, item.icon]));

// Preserve common icon names already saved by the previous React Icons picker.
const legacyAliases: Record<string, string> = {
  "Fa.FaLinkedin": "Fa.FaLinkedinIn",
  "Fi.FiMail": "Fa.FaEnvelope",
  "Fi.FiGlobe": "Fa.FaGlobe",
  "Fi.FiCode": "Fa.FaCode",
  "Fi.FiExternalLink": "Fi.FiExternalLink",
  "Fa.FaTwitter": "Bs.BsTwitterX",
  "Fa.FaDatabase": "Fa.FaDatabase",
  "Fi.FiDatabase": "Fi.FiDatabase",
  "Fi.FiSettings": "Fi.FiSettings",
  "Fi.FiZap": "Fi.FiZap",
};

export function getDynamicIcon(iconName: string): IconType | undefined {
  if (!iconName || typeof iconName !== "string") return undefined;
  return iconsByName.get(legacyAliases[iconName] ?? iconName);
}

export function isValidIcon(iconName: string): boolean {
  return Boolean(getDynamicIcon(iconName));
}

export function getIconPrefixes(): string[] {
  return ["Fa", "Fi", "Bs", "Gi", "Si"];
}
