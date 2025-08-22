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

export function getDynamicIcon(iconName: string): IconType | undefined {
  if (!iconName) return undefined;
  const [prefix, name] = iconName.split(".");
  const set = iconSets[prefix as keyof typeof iconSets];
  return set ? (set as Record<string, IconType>)[name] : undefined;
}
