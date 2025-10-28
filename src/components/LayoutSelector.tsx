import React from "react";
import Select from "react-select";
import { useTheme } from "@mui/material/styles";
import { ISettings, useSettings } from "../stores/settings";
import { getSelectStyles } from "../components/selectStyles";

const layoutOptions = [
  {
    value: "day",
    label: "Day",
  },
  {
    value: "week",
    label: "Week",
  },
  {
    value: "month",
    label: "Month",
  },
];

interface LayoutSelectorProps {
  style?: React.CSSProperties;
  className?: string;
  isSearchable?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  style,
  className,
  isSearchable = false,
  placeholder = "View",
  ariaLabel = "Select calendar layout",
}) => {
  const theme = useTheme();
  const {
    settings: { layout },
    updateSetting,
  } = useSettings((state) => state);

  const setLayout = (newLayout: ISettings["layout"]) => {
    updateSetting("layout", newLayout);
  };

  // Handle layout change from dropdown
  const handleLayoutChange = (
    selectedOption: { value: string; label: string } | null,
  ) => {
    if (selectedOption) {
      setLayout(selectedOption.value as ISettings["layout"]);
    }
  };

  // Custom styles for react-select dropdown
  const selectStyles = getSelectStyles(theme);

  return (
    <div style={style} className={className}>
      <Select
        options={layoutOptions}
        value={layoutOptions.find((option) => option.value === layout)}
        onChange={handleLayoutChange}
        isSearchable={isSearchable}
        placeholder={placeholder}
        aria-label={ariaLabel}
        styles={selectStyles}
      />
    </div>
  );
};

export default LayoutSelector;
