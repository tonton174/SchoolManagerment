"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface FilterDropdownProps {
  table: string;
}

interface FilterData {
  classes: Array<{ id: number; name: string }>;
  teachers: Array<{ id: string; name: string; surname: string }>;
  subjects: Array<{ id: number; name: string }>;
}

const FilterDropdown = ({ table }: FilterDropdownProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    classId: searchParams.get("classId") || "",
    teacherId: searchParams.get("teacherId") || "",
    subjectId: searchParams.get("subjectId") || "",
    startDate: searchParams.get("startDate") || "",
    dueDate: searchParams.get("dueDate") || "",
  });

  const [filterData, setFilterData] = useState<FilterData>({
    classes: [],
    teachers: [],
    subjects: [],
  });

  // Fetch filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [classesRes, teachersRes, subjectsRes] = await Promise.all([
          fetch('/api/filter-data?type=classes'),
          fetch('/api/filter-data?type=teachers'),
          fetch('/api/filter-data?type=subjects'),
        ]);

        const classes = await classesRes.json();
        const teachers = await teachersRes.json();
        const subjects = await subjectsRes.json();

        setFilterData({
          classes: classes.classes || [],
          teachers: teachers.teachers || [],
          subjects: subjects.subjects || [],
        });
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    if (isOpen) {
      fetchFilterData();
    }
  }, [isOpen]);

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
    
    // Xóa các filter cũ
    params.delete("classId");
    params.delete("teacherId");
    params.delete("subjectId");
    params.delete("startDate");
    params.delete("dueDate");
    params.delete("page"); // Reset về trang 1

    // Thêm filter mới
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
    params.delete("classId");
    params.delete("teacherId");
    params.delete("subjectId");
    params.delete("startDate");
    params.delete("dueDate");
    params.delete("page");
    
    router.push(`/list/${table}?${params.toString()}`);
    setIsOpen(false);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== "").length;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-500 transition-colors relative"
        title="Bộ lọc"
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
              <h3 className="text-lg font-semibold">Bộ lọc</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Image src="/close.png" alt="Close" width={16} height={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp học
                </label>
                <select
                  value={filters.classId}
                  onChange={(e) => handleFilterChange("classId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Tất cả lớp</option>
                  {filterData.classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giáo viên
                </label>
                <select
                  value={filters.teacherId}
                  onChange={(e) => handleFilterChange("teacherId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Tất cả giáo viên</option>
                  {filterData.teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} {teacher.surname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Môn học
                </label>
                <select
                  value={filters.subjectId}
                  onChange={(e) => handleFilterChange("subjectId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Tất cả môn học</option>
                  {filterData.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filters.dueDate}
                    onChange={(e) => handleFilterChange("dueDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
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

export default FilterDropdown; 