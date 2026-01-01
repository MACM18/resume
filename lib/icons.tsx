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

/**
 * Get a dynamic icon component from react-icons based on the icon name
 * @param iconName - Icon name in format "Prefix.IconName" (e.g., "Fa.FaGithub", "Si.SiReact")
 * @returns IconType component or undefined if not found
 *
 * Supported prefixes:
 * - Fa: Font Awesome
 * - Fi: Feather Icons
 * - Ai: Ant Design Icons
 * - Bi: Bootstrap Icons
 * - Bs: Bootstrap Icons (alt)
 * - Ci: Circum Icons
 * - Di: Devicons
 * - Gi: Game Icons
 * - Hi: Heroicons
 * - Im: IcoMoon Free
 * - Io: Ionicons
 * - Md: Material Design
 * - Ri: Remix Icon
 * - Si: Simple Icons
 * - Ti: Typicons
 * - Fc: Flat Color Icons
 */
export function getDynamicIcon(iconName: string): IconType | undefined {
  if (!iconName || typeof iconName !== "string") return undefined;

  // Check if the icon name is in the correct format (Prefix.IconName)
  if (!iconName.includes(".")) {
    console.warn(
      `Invalid icon format: "${iconName}". Expected format: "Prefix.IconName" (e.g., "Fa.FaGithub")`
    );
    return undefined;
  }

  const [prefix, name] = iconName.split(".");

  // Validate prefix exists
  if (!iconSets[prefix as keyof typeof iconSets]) {
    console.warn(`Unknown icon prefix: "${prefix}". Icon: "${iconName}"`);
    return undefined;
  }

  const set = iconSets[prefix as keyof typeof iconSets];
  const icon = (set as Record<string, IconType>)[name];

  if (!icon) {
    console.warn(
      `Icon "${name}" not found in set "${prefix}". Full name: "${iconName}"`
    );
  }

  return icon;
}

/**
 * Validate if an icon name is in the correct format and exists
 * @param iconName - Icon name to validate
 * @returns true if valid, false otherwise
 */
export function isValidIcon(iconName: string): boolean {
  if (!iconName || typeof iconName !== "string" || !iconName.includes(".")) {
    return false;
  }

  const icon = getDynamicIcon(iconName);
  return icon !== undefined;
}

/**
 * Get a list of all available icon prefixes
 */
export function getIconPrefixes(): string[] {
  return Object.keys(iconSets);
}
