import { Link, useLocation, useNavigate } from "react-router-dom";
import { House, LibraryBig, Mountain, Sparkles, User, Menu } from "lucide-react";
import { useAppState } from "../store.jsx";
import { PersonalAvatar, DEFAULT_AVATAR } from "./Avatar.jsx";

// Phone-card layout used for all in-app screens: warm off-white surface on
// the hazy blue page background, with the bottom tab bar from the design.
export default function AppShell({ children, hideNav = false }) {
  const location = useLocation();

  const tabs = [
    { to: "/app", icon: House, label: "Home" },
    { to: "/app/library", icon: LibraryBig, label: "Library" },
    { to: "/app/journey", icon: Mountain, label: "Journey" },
    { to: "/pricing", icon: Sparkles, label: "Premium" },
    { to: "/app/account", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-haze flex justify-center sm:py-8 sm:px-4">
      <div className="app-card relative w-full sm:max-w-md bg-card sm:rounded-5xl sm:shadow-card flex flex-col min-h-screen sm:min-h-[820px] overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-28">{children}</div>

        {!hideNav && (
          <nav className="app-nav absolute bottom-0 inset-x-0 bg-card/95 backdrop-blur border-t border-white/5 px-8 py-4 flex items-center justify-between">
            {tabs.map(({ to, icon: Icon, label }) => {
              const active =
                to === "/app"
                  ? location.pathname === "/app"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-label={label}
                  className="flex flex-col items-center gap-1"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={active ? "text-neon" : "text-inkmuted"}
                  />
                  <span
                    className={`h-1 w-1 rounded-full ${active ? "bg-neon shadow-neon" : "bg-transparent"}`}
                  />
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export function TopBar() {
  const { user, settings } = useAppState();
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-6 pt-6">
      <button
        aria-label="Menu"
        onClick={() => navigate("/app/account")}
        className="p-1"
      >
        <Menu size={22} className="text-ink" strokeWidth={2.2} />
      </button>
      <button
        aria-label="Profile"
        onClick={() => navigate(user ? "/app/avatar" : "/login")}
        className="h-10 w-10 rounded-full bg-blush flex items-center justify-center overflow-hidden shadow-soft"
      >
        <PersonalAvatar config={settings?.avatar || DEFAULT_AVATAR} level={0}
          className="h-12 w-12 mt-3" />
      </button>
    </div>
  );
}
