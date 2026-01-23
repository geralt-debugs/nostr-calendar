import { Toolbar } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { Link } from "react-router";

export const HEADER_HEIGHT = 56;

export const Header = () => {
  return (
    <AppBar
      position="fixed"
      color="primary"
      style={{
        justifyContent: "start",
        backgroundColor: "white",
      }}
    >
      <Toolbar>
        <Link
          to={"/"}
          style={{
            display: "flex",
            alignItems: "center",
            width: "fit-content",
          }}
        >
          <img
            src="/formstr.png"
            style={{
              objectFit: "contain",
              height: "40px",
              width: "fit-content",
            }}
            alt="Calendar Logo"
          />
        </Link>
      </Toolbar>
    </AppBar>
  );
};
