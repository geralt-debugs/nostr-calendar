import { launch as nostrLogin, logout as nostrLogout } from "nostr-login";
import { getUserPublicKey } from "../common/nostr";
import { MenuItem } from "@mui/material";
import { useUser } from "../stores/user";
import { useIntl } from "react-intl";
import { useEffect } from "react";

export const Auth = () => {
  const { user, updateUser, logout, initializeUser } = useUser((state) => state);
  const hasUserLoggedIn = !!user;
  const intl = useIntl();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const handleLogin = async () => {
    try {
      await nostrLogin();
      const publicKey = await getUserPublicKey();
      updateUser({ publicKey });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await nostrLogout();
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

  return hasUserLoggedIn ? logoutElem : loginElem;
};
