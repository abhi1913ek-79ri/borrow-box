"use client";

import { SessionProvider } from "next-auth/react";
import ProfileCompletionGate from "./ProfileCompletionGate";

const SessionWrapper = ({ children }) => {
  return (
    <SessionProvider>
      {children}
      <ProfileCompletionGate />
    </SessionProvider>
  );
};

export default SessionWrapper;
