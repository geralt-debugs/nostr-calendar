import { Theme } from "@mui/material";

// Custom styles for curvy react-select dropdown
export const getSelectStyles = (theme: Theme) => ({
  control: (provided: any, state: any) => ({
    ...provided,
    borderRadius: "20px", // Make it very curvy
    border: `2px solid ${state.isFocused ? theme.palette.primary.main : "#E0E0E0"}`,
    boxShadow: state.isFocused
      ? `0 0 0 1px ${theme.palette.primary.main}`
      : "none",
    "&:hover": {
      border: `2px solid ${theme.palette.primary.light}`,
    },
    minHeight: "40px",
    paddingLeft: "12px", // Add left padding for the text inside
    transition: "all 0.2s ease-in-out",
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "16px", // Curvy menu
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    border: "1px solid #E0E0E0",
    overflow: "hidden",
  }),
  menuList: (provided: any) => ({
    ...provided,
    borderRadius: "16px",
    padding: "8px",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    borderRadius: "12px", // Curvy options
    margin: "2px 0",
    backgroundColor: state.isSelected
      ? theme.palette.primary.main
      : state.isFocused
        ? theme.palette.primary.light + "20"
        : "transparent",
    color: state.isSelected
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    "&:hover": {
      backgroundColor: state.isSelected
        ? theme.palette.primary.main
        : theme.palette.primary.light + "30",
    },
    transition: "all 0.2s ease-in-out",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: theme.palette.text.primary,
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.primary.main,
    },
    transition: "color 0.2s ease-in-out",
  }),
  indicatorSeparator: () => ({
    display: "none", // Remove the separator line
  }),
});
