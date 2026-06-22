import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { LuUser } from "react-icons/lu";
import Image from "next/image";

const UserIcon = async () => {
  const user = await currentUser();

  const profileImage = user?.imageUrl;

  if (profileImage) {
    return (
      <Image
        src={profileImage}
        alt="profile image"
        className="w-6 h-6 rounded-full object-cover"
        width={192}
        height={192}
      />
    );
  }
  return <LuUser className="w-6 h-6 bg-primary rounded-full text-white" />;
};

export default UserIcon;
