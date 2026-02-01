import styled from "@emotion/styled";
import { Box, BoxProps } from "@mui/material";

interface SecondaryHeaderProps extends BoxProps {
  topOffset?: number;
}

export const StyledSecondaryHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== "topOffset",
})<SecondaryHeaderProps>(({ topOffset = 0 }) => ({
  position: "sticky",
  // mobile portrait
  top: 56 + topOffset,

  background: "#fff",
  zIndex: 1,

  // mobile landscape
  "@media (min-width:0px) and (orientation: landscape)": {
    top: 48 + topOffset,
  },

  // desktop
  "@media (min-width:600px)": {
    top: 64 + topOffset,
  },
}));
