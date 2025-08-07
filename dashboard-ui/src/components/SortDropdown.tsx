"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface SortDropdownProps {
  table: string;
}

const SortDropdown = ({ table }: SortDropdownProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "dueDate");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "asc");

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

  const applySort = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("sortBy");
    params.delete("sortOrder");
    params.delete("page"); // Reset về trang 1

    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    router.push(`/list/${table}?${params.toString()}`);
    setIsOpen(false);
  };

  const clearSort = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("sortBy");
    params.delete("sortOrder");
    params.delete("page");
    
    router.push(`/list/${table}?${params.toString()}`);
    setIsOpen(false);
  };

  const getSortLabel = () => {
    const sortOptions = {
      dueDate: "Ngày hạn nộp",
      startDate: "Ngày bắt đầu",
      title: "Tiêu đề",
      subject: "Môn học",
      class: "Lớp học",
      teacher: "Giáo viên",
    };
    return sortOptions[sortBy as keyof typeof sortOptions] || "Ngày hạn nộp";
  };

  const getOrderLabel = () => {
    return sortOrder === "asc" ? "Tăng dần" : "Giảm dần";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-500 transition-colors relative"
        title="Sắp xếp"
      >
        <Image src="/sort.png" alt="Sort" width={14} height={14} />
        {(searchParams.get("sortBy") || searchParams.get("sortOrder")) && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            ✓
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sắp xếp</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Image src="/close.png" alt="Close" width={16} height={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="dueDate">Ngày hạn nộp</option>
                  <option value="startDate">Ngày bắt đầu</option>
                  <option value="title">Tiêu đề</option>
                  <option value="subject">Môn học</option>
                  <option value="class">Lớp học</option>
                  <option value="teacher">Giáo viên</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thứ tự
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="asc"
                      checked={sortOrder === "asc"}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Tăng dần (A → Z, 1 → 9)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="desc"
                      checked={sortOrder === "desc"}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Giảm dần (Z → A, 9 → 1)</span>
                  </label>
                </div>
              </div>

              {/* Preview current sort */}
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Hiện tại: <span className="font-medium">{getSortLabel()}</span> - <span className="font-medium">{getOrderLabel()}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={applySort}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Áp dụng
              </button>
              <button
                onClick={clearSort}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors text-sm"
              >
                Xóa sắp xếp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown; 