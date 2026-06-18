import React from "react";
import { toast } from "sonner";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

const handleLogout = () => {
  toast("Logging Out", { description: "Logged out successfully" });
};
const SignOutLink = () => {
  return (
    <SignOutButton>
      <Link href={"/"} className="w-full text-left" onClick={handleLogout}>
        Logout
      </Link>
    </SignOutButton>
  );
};

export default SignOutLink;
