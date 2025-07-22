import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { format } from "date-fns";
import { useId } from "react";
import { useIntl } from "react-intl";

type Option = {
  value: string;
};

function TimeSelect({
  value,
  options,
  onChange,
}: {
  value: Option;
  options: Option[];
  onChange: (newTime: Option["value"]) => void;
}) {
  const id = useId();
  const intl = useIntl();
  return (
    <FormControl>
      <InputLabel id={`time-select-${id}`}>Time</InputLabel>
      <Select
        labelId={`time-select-${id}`}
        value={value.value}
        label={intl.formatMessage({ id: "navigation.timeSelectorPlaceholder" })}
        onChange={(event) => {
          const eventTime = options.find(
            (times) => times.value === event.target.value,
          );
          if (eventTime) {
            onChange(eventTime.value);
          }
        }}
      >
        {options.map(({ value }) => {
          return (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default TimeSelect;
