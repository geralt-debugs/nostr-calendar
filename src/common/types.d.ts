import { Theme } from "@mui/material";

export interface IGetStyles {
  (theme: Theme): Record<string, HTMLAttributes<HTMLDivElement>["style"]>;
}
