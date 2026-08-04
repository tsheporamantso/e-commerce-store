import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Prisma } from "@/lib/generated/prisma/client";

const ImageInput = () => {
  const name = Prisma.ProductScalarFieldEnum.image;
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize mb-2">
        image
      </Label>
      <Input
        id={name}
        name={name}
        type="file"
        required
        accept="image/*"
        className="flex items-center file:bg-muted file:px-3 file:mr-2 file:text-sm file:font-medium file:text-foreground"
      />
    </div>
  );
};

export default ImageInput;
