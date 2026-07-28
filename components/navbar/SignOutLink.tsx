"use client";
import { toast } from "sonner";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

const SignOutLink = () => {
  return (
    <SignOutButton>
      <Link
        href={"/"}
        className="w-full text-left"
        onClick={() => toast.success("Logged out successfully.")}
      >
        Logout
      </Link>
    </SignOutButton>
  );
};

export default SignOutLink;
