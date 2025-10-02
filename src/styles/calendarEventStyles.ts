import { Theme } from "@mui/material";
import { IGetStyles } from "../common/types";

export const getStyles: IGetStyles = (theme: Theme) => ({
  divTitleButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  dialogContentWeb: {
    display: "flex",
    flexDirection: "row",
    gap: "24px",
    height: "500px",
  },
  imageContainer: {
    width: "100%",
    marginBottom: "16px",
  },
  imageContainerWeb: {
    width: "50%",
    minWidth: "300px",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  imageWeb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  contentContainerWeb: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: 1,
    overflowY: "auto",
    paddingRight: "8px",
  },
  rsvpContainer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  rsvpStatus: {
    padding: "8px 12px",
    borderRadius: "4px",
    textAlign: "center",
    fontWeight: "bold",
  },
  rsvpButton: {
    flex: 1,
    padding: "8px 16px",
    borderRadius: "4px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ccc",
    backgroundColor: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    transition: "all 0.2s ease",
    "&:hover": {
      opacity: 0.8,
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});
