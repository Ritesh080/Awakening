import { Capacitor } from "@capacitor/core";

// Native-only setup (no-ops on the web). Called once at startup.
export async function initNative() {
  if (!Capacitor.isNativePlatform()) return;
  document.documentElement.classList.add("native");

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark }); // light text on our dark UI
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#060608" });
    }
  } catch { /* plugin unavailable */ }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch { /* plugin unavailable */ }

  // Hardware back button on Android: let the router go back, else exit.
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  } catch { /* plugin unavailable */ }
}

export const isNative = () => Capacitor.isNativePlatform();
