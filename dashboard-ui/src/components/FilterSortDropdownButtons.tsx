"use client";

import FilterDropdown from "./FilterDropdown";
import SortDropdown from "./SortDropdown";

interface FilterSortDropdownButtonsProps {
  table: string;
}

const FilterSortDropdownButtons = ({ table }: FilterSortDropdownButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <FilterDropdown table={table} />
      <SortDropdown table={table} />
    </div>
  );
};

export default FilterSortDropdownButtons; 