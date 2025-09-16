// import { launch as nostrLogin, logout as nostrLogout } from "nostr-login";
import { MenuItem } from "@mui/material";
import { useUser } from "../stores/user";
import { useIntl } from "react-intl";
import { useEffect } from "react";

export const Auth = () => {
  const { user, updateLoginModal, logout, initializeUser } = useUser(
    (state) => state
  );
  const hasUserLoggedIn = !!user;
  const intl = useIntl();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const handleLogin = async () => {
    try {
      updateLoginModal(true);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // await nostrLogout();
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const logoutElem = (
    <MenuItem onClick={handleLogout}>
      {intl.formatMessage({ id: "navigation.logout" })}
    </MenuItem>
  );

  const loginElem = (
    <MenuItem onClick={handleLogin}>
      {intl.formatMessage({ id: "navigation.login" })}
    </MenuItem>
  );

  const toDisplay = hasUserLoggedIn ? logoutElem : loginElem;

  return toDisplay;
};
