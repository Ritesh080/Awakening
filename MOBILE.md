# Awakening — iOS & Android apps

The native apps are the **same React app** wrapped in a native shell with
[Capacitor](https://capacitorjs.com). There is no separate mobile codebase:
every screen, the dark neon theme, the session player, Journey, Remedy and
Funmaxxing all run inside a native WebView, with native status bar, splash
screen, and Android back-button handling wired in.

```
src/            ← the one shared React app
dist/           ← web build (what gets bundled into the apps)
ios/            ← generated Xcode project (Swift)
android/        ← generated Android Studio project (Kotlin/Gradle)
capacitor.config.json
```

## The one thing you MUST configure: the backend URL

On the web, the app and API share an origin, so requests are relative
(`/api/...`). Inside the native apps the web runs from `capacitor://localhost`,
so `localhost` means *the phone itself* — it can't reach your dev machine.
The apps therefore need an **absolute, public backend URL**.

1. Deploy the backend somewhere public first (see the main [README](README.md)
   — Render/Railway/Fly). You'll get a URL like `https://awakening-api.onrender.com`.
2. Create a `.env` file in the project root with:
   ```
   VITE_API_URL=https://awakening-api.onrender.com
   ```
3. Rebuild + sync so the apps bake in that URL:
   ```
   npm run mobile:sync
   ```

Also set `CLIENT_URL` on the backend to allow the app's origin through CORS
(`capacitor://localhost` for iOS, `http://localhost` for Android), or relax
CORS for the mobile origins.

## Prerequisites (not yet installed on this machine)

| To build… | You need | Notes |
|-----------|----------|-------|
| **iOS**   | **Xcode** (Mac App Store, ~7 GB) | Command Line Tools alone is not enough. A free Apple ID runs on the simulator; a paid **Apple Developer** account ($99/yr) is required to run on a physical device and to publish. |
| **Android** | **Android Studio** (includes the SDK) | Java 21 is already installed. |

Capacitor 8 uses **Swift Package Manager** for iOS, so CocoaPods is not required.

## Everyday workflow

Whenever you change the React app, rebuild the web bundle and copy it into the
native shells:

```
npm run mobile:sync           # vite build + cap sync (both platforms)
```

Then open the native IDE:

```
npm run mobile:ios            # build + sync + open Xcode
npm run mobile:android        # build + sync + open Android Studio
```

### Run on iOS (simulator)
1. `npm run mobile:ios` opens Xcode.
2. Pick a simulator (e.g. iPhone 16) in the top toolbar.
3. Press ▶︎ (Run). First build takes a few minutes.

### Run on Android (emulator)
1. `npm run mobile:android` opens Android Studio; let Gradle finish syncing.
2. Create a virtual device via **Device Manager** if you don't have one.
3. Press ▶︎ (Run).

## App identity & icons

- **App ID / name** live in `capacitor.config.json`
  (`com.awakening.app` / "Awakening"). Change the ID *before* your first
  store submission — it can't change afterward.
- **Icons & splash screens**: drop a 1024×1024 `icon.png` (and optional
  `splash.png`) in a `resources/` folder and run
  `npx @capacitor/assets generate` to produce every required size for both
  platforms. Until then the default Capacitor icon is used.

## Shipping to the stores (done by you — needs accounts & signing)

These steps require developer accounts and signing credentials, so they're
yours to do; I can't create accounts or handle signing keys.

**iOS — App Store**
1. In Xcode: set your Team (Signing & Capabilities), bump the version/build.
2. Product → Archive → distribute to App Store Connect.
3. Fill in the listing, screenshots, privacy questionnaire, then submit for
   review.

**Android — Google Play**
1. In Android Studio: Build → Generate Signed Bundle → **Android App Bundle
   (.aab)**. Create/keep your keystore safe — losing it means you can't
   update the app.
2. Upload the `.aab` in the Play Console, complete the store listing and
   data-safety form, then roll out.

## Known caveats

- **Fonts**: the app loads Manrope + Doto from Google Fonts over the network.
  They'll render on a connected device but fall back to system fonts offline.
  To guarantee them offline, self-host the font files in `public/` and
  `@font-face` them instead of the `<link>` in `index.html`.
- **Stripe checkout** opens Stripe's hosted page in the device browser. That
  works, but for a polished store app you may later switch to native in-app
  purchases (Apple/Google take ~15–30%); RevenueCat is the usual bridge.
- **Project path**: this folder's name contains an unusual space character.
  If Gradle or Xcode ever complains about the path, copy the project to a
  plain-ASCII path (e.g. `~/dev/awakening`) and rebuild.
