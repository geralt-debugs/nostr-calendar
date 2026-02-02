import { Toolbar } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { Link } from "react-router";
import { UserMenu } from "./UserMenu";

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
      <Toolbar
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
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
        <UserMenu />
      </Toolbar>
    </AppBar>
  );
};
