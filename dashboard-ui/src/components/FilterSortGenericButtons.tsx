"use client";

import FilterDropdownGeneric from "./FilterDropdownGeneric";
import SortDropdownGeneric from "./SortDropdownGeneric";

interface FilterSortGenericButtonsProps {
  table: string;
  filterOptions: FilterOption[];
  sortOptions: SortOption[];
  filterTitle?: string;
  sortTitle?: string;
}

interface FilterOption {
  key: string;
  label: string;
  type: "select" | "date" | "text";
  options?: Array<{ id: string | number; name: string }>;
  placeholder?: string;
}

interface SortOption {
  key: string;
  label: string;
}

const FilterSortGenericButtons = ({ 
  table, 
  filterOptions, 
  sortOptions, 
  filterTitle = "Bộ lọc",
  sortTitle = "Sắp xếp"
}: FilterSortGenericButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <FilterDropdownGeneric 
        table={table} 
        filterOptions={filterOptions}
        title={filterTitle}
      />
      <SortDropdownGeneric 
        table={table} 
        sortOptions={sortOptions}
        title={sortTitle}
      />
    </div>
  );
};

export default FilterSortGenericButtons; 