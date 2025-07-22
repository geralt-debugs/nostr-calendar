import { launch as nostrLogin, logout as nostrLogout } from "nostr-login";
import { getUserPublicKey } from "../common/nostr";
import { MenuItem } from "@mui/material";
import { useUser } from "../stores/user";
import { useIntl } from "react-intl";

export const Auth = () => {
  const { user, updateUser, logout } = useUser((state) => state);
  const hasUserLoggedIn = !!user;
  const intl = useIntl();

  const handleLogin = async () => {
    await nostrLogin();
    const publicKey = await getUserPublicKey();
    updateUser({ publicKey });
  };

  const handleLogout = async () => {
    await nostrLogout();
    await logout();
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
