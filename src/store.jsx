import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "./lib/api.js";

// Global app state: authenticated user (with server-verified premium flag),
// billing config, and the paywall modal.
const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState(null); // { mode, plans }
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [settings, setSettings] = useState({}); // { intention, avatar, funmax }

  useEffect(() => {
    (async () => {
      try {
        const cfg = await api("/billing/config");
        setBilling(cfg);
      } catch {
        setBilling(null);
      }
      if (getToken()) {
        try {
          const { user } = await api("/auth/me");
          setUser(user);
          const { settings } = await api("/settings");
          setSettings(settings || {});
        } catch {
          setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const saveSetting = useCallback(async (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
    try {
      await api(`/settings/${key}`, { method: "PUT", body: { value } });
    } catch { /* optimistic; next load re-syncs */ }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    setToken(data.token);
    setUser(data.user);
    try {
      const { settings } = await api("/settings");
      setSettings(settings || {});
    } catch { /* non-fatal */ }
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSettings({});
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return null;
    try {
      const { user } = await api("/auth/me");
      setUser(user);
      return user;
    } catch {
      return null;
    }
  }, []);

  const isPremium = !!user?.premium;

  return (
    <AppStateContext.Provider
      value={{
        user,
        setUser,
        loading,
        billing,
        isPremium,
        paywallOpen,
        setPaywallOpen,
        login,
        register,
        logout,
        refreshUser,
        settings,
        saveSetting,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
