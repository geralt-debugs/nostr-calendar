import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useId } from "react";

type Option = {
  label: string;
  value: string;
};

function TimeSelect({
  originalValue,
  options,
  onChange,
  ...props
}: {
  originalValue: Option;
  options: Option[];
  onChange: (newTime: Option) => void;
}) {
  const id = useId();
  console.log(props);
  return (
    <FormControl>
      <InputLabel id={`time-select-${id}`}>Time</InputLabel>
      <Select
        labelId={`time-select-${id}`}
        defaultValue={originalValue.value}
        label="Time"
        onChange={(event) => {
          const eventTime = options.find(
            (times) => times.value === event.target.value,
          );
          if (eventTime) {
            onChange(eventTime);
          }
        }}
      >
        {options.map(({ value, label }) => {
          return (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default TimeSelect;
