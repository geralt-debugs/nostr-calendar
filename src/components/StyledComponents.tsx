import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const StyledSecondaryHeader = styled(Box)({
  "@media (min-width:0px)": {
    "@media (orientation: landscape)": {
      top: `48px`,
    },
  },
  "@media (min-width:600px)": {
    top: `64px`,
  },
  top: `56px`,
  position: "sticky",
});
