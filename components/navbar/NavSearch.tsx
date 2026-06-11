import React from "react";
import { Input } from "../ui/input";

const NavSearch = () => {
  return (
    <Input
      type="search"
      placeholder="search product..."
      className="max-w-xs dark:bd-muted"
    />
  );
};

export default NavSearch;
