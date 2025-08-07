"use client";

import { useState } from "react";
import TableSearch from "./TableSearch";

const TableSearchWrapper = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <TableSearch 
      value={searchValue} 
      onChange={(e) => setSearchValue(e.target.value)} 
    />
  );
};

export default TableSearchWrapper; 