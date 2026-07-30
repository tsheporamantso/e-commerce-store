"use client";

import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

type CheckBoxInputProps = {
  name: string;
  label: string;
  defaultChecked?: boolean;
};

const CheckBoxInput = ({
  name,
  label,
  defaultChecked = false,
}: CheckBoxInputProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={name} name={name} defaultChecked={defaultChecked} />
      <Label
        htmlFor={name}
        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
      >
        {label}
      </Label>
    </div>
  );
};

export default CheckBoxInput;
