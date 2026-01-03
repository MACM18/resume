import { Theme } from "@/types/portfolio";

export const generateCssVariables = (
  theme: Theme,
  backgroundImageUrl: string | null
) => {
  let css = `:root { ${Object.entries(theme)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ")} }`;

  if (backgroundImageUrl) {
    css += `\n:root { 
      --background-image-url: url('${backgroundImageUrl}');
      --has-background-image: 1;
    }`;
  } else {
    css += `\n:root { 
      --background-image-url: none;
      --has-background-image: 0;
    }`;
  }
  return css;
};
