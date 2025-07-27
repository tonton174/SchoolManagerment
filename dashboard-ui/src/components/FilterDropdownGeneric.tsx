"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface FilterDropdownGenericProps {
  table: string;
  filterOptions: FilterOption[];
  title?: string;
}

interface FilterOption {
  key: string;
  label: string;
  type: "select" | "date" | "text";
  options?: Array<{ id: string | number; name: string }>;
  placeholder?: string;
}

interface FilterData {
  classes: Array<{ id: number; name: string }>;
  teachers: Array<{ id: string; name: string; surname: string }>;
  subjects: Array<{ id: number; name: string }>;
  students: Array<{ id: string; name: string; surname: string }>;
  parents: Array<{ id: string; name: string; surname: string }>;
}

const FilterDropdownGeneric = ({ table, filterOptions, title = "Bộ lọc" }: FilterDropdownGenericProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize filters from URL params
  const initialFilters = filterOptions.reduce((acc, option) => {
    acc[option.key] = searchParams.get(option.key) || "";
    return acc;
  }, {} as Record<string, string>);
  
  const [filters, setFilters] = useState(initialFilters);

  const [filterData, setFilterData] = useState<FilterData>({
    classes: [],
    teachers: [],
    subjects: [],
    students: [],
    parents: [],
  });

  // Fetch filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const promises = [];
        const dataTypes = new Set<string>();

        // Determine what data to fetch based on filter options
        filterOptions.forEach(option => {
          if (option.type === "select" && !option.options) {
            if (option.key.includes("class")) dataTypes.add("classes");
            if (option.key.includes("teacher")) dataTypes.add("teachers");
            if (option.key.includes("subject")) dataTypes.add("subjects");
            if (option.key.includes("student")) dataTypes.add("students");
            if (option.key.includes("parent")) dataTypes.add("parents");
          }
        });

        const fetchPromises = Array.from(dataTypes).map(type =>
          fetch(`/api/filter-data?type=${type}`).then(res => res.json())
        );

        const results = await Promise.all(fetchPromises);
        
        const newFilterData = { ...filterData };
        results.forEach((result, index) => {
          const type = Array.from(dataTypes)[index];
          newFilterData[type as keyof FilterData] = result[type] || [];
        });

        setFilterData(newFilterData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    if (isOpen) {
      fetchFilterData();
    }
  }, [isOpen, filterOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    // Clear old filters
    filterOptions.forEach(option => {
      params.delete(option.key);
    });
    params.delete("page"); // Reset to page 1

    // Add new filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`/list/${table}?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    filterOptions.forEach(option => {
      params.delete(option.key);
    });
    params.delete("page");
    
    router.push(`/list/${table}?${params.toString()}`);
    setIsOpen(false);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== "").length;
  };

  const getOptionsForFilter = (option: FilterOption) => {
    if (option.options) return option.options;
    
    if (option.key.includes("class")) return filterData.classes;
    if (option.key.includes("teacher")) return filterData.teachers;
    if (option.key.includes("subject")) return filterData.subjects;
    if (option.key.includes("student")) return filterData.students;
    if (option.key.includes("parent")) return filterData.parents;
    
    return [];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-500 transition-colors relative"
        title={title}
      >
        <Image src="/filter.png" alt="Filter" width={14} height={14} />
        {getActiveFiltersCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {getActiveFiltersCount()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Image src="/close.png" alt="Close" width={16} height={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filterOptions.map((option) => (
                <div key={option.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {option.label}
                  </label>
                  {option.type === "select" ? (
                    <select
                      value={filters[option.key]}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">{option.placeholder || `Tất cả ${option.label.toLowerCase()}`}</option>
                      {getOptionsForFilter(option).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  ) : option.type === "date" ? (
                    <input
                      type="date"
                      value={filters[option.key]}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={filters[option.key]}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      placeholder={option.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Áp dụng
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdownGeneric; 