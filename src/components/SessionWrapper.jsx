"use client";

import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import ProfileCompletionGate from "./ProfileCompletionGate";

function AuthToast() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const toastSource = sessionStorage.getItem("vyntra-auth-toast");

    if (!toastSource) {
      return;
    }

    sessionStorage.removeItem("vyntra-auth-toast");

    const showToastTimer = window.setTimeout(() => {
      setMessage(
        session?.user?.isProfileComplete === false
          ? "Registration successful. Complete your profile to continue."
          : "Login successful.",
      );
    }, 0);

    const hideToastTimer = window.setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => {
      window.clearTimeout(showToastTimer);
      window.clearTimeout(hideToastTimer);
    };
  }, [session?.user?.isProfileComplete, status]);

  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-6 left-1/2 z-60 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg shadow-black/10">
      {message}
    </div>
  );
}

const SessionWrapper = ({ children }) => {
  return (
    <SessionProvider>
      {children}
      <AuthToast />
      <ProfileCompletionGate />
    </SessionProvider>
  );
};

export default SessionWrapper;
