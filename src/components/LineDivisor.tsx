import { useTheme } from "@mui/material/styles";
import { IGetStyles } from "../common/types";

const getStyles: IGetStyles = () => ({
  lineDivisorContainer: {
    borderTop: "1px solid #dadce0",
    // minWidth: '100%',
  },
  lineDivisor: {
    height: 60,
    "&:after": {
      content: "''",
      borderBottom: "1px solid #dadce0",
      position: "absolute",
      width: "100%",
      marginTop: -1,
      zIndex: 3,
      pointerEvents: "none",
    },
  },
  columnDivisor: {
    height: "100%",
    paddingLeft: 8,
    borderRight: "1px solid #dadce0",
  },
});

function LineDivisor(props: any) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <div style={{ ...styles.lineDivisorContainer }}>
      {Array.from(Array(24).keys()).map((_: any, ix: number) => (
        <div
          key={`time-line-divisor-${ix}`}
          style={{ ...styles.lineDivisor }}
          data-group="time-line"
        />
      ))}
    </div>
  );
  // ....
  // ....
}

export default LineDivisor;
