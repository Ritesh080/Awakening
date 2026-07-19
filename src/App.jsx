import { Routes, Route } from "react-router-dom";
import { AppStateProvider } from "./store.jsx";
import PaywallModal from "./components/PaywallModal.jsx";
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import Library from "./pages/Library.jsx";
import ProgramDetail from "./pages/ProgramDetail.jsx";
import SessionPlayer from "./pages/SessionPlayer.jsx";
import Pricing from "./pages/Pricing.jsx";
import Checkout from "./pages/Checkout.jsx";
import BillingSuccess from "./pages/BillingSuccess.jsx";
import Account from "./pages/Account.jsx";
import Journey from "./pages/Journey.jsx";
import Intention from "./pages/Intention.jsx";
import AvatarStudio from "./pages/AvatarStudio.jsx";
import Remedy from "./pages/Remedy.jsx";
import Funmax from "./pages/Funmax.jsx";
import { Login, Register } from "./pages/Auth.jsx";

export default function App() {
  return (
    <AppStateProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/app" element={<Home />} />
        <Route path="/app/library" element={<Library />} />
        <Route path="/app/program/:id" element={<ProgramDetail />} />
        <Route path="/app/session/:id" element={<SessionPlayer />} />
        <Route path="/app/journey" element={<Journey />} />
        <Route path="/app/intention" element={<Intention />} />
        <Route path="/app/avatar" element={<AvatarStudio />} />
        <Route path="/app/remedy" element={<Remedy />} />
        <Route path="/app/funmax" element={<Funmax />} />
        <Route path="/app/account" element={<Account />} />
        <Route path="*" element={<Landing />} />
      </Routes>
      <PaywallModal />
    </AppStateProvider>
  );
}
