"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { linkStudentToClerk } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const CreateAccountButton = ({ studentId }: { studentId: string }) => {
  const [showForm, setShowForm] = useState(false);
  const [password, setPassword] = useState("");
  const [state, formAction] = useFormState(linkStudentToClerk, {
    success: false,
    error: false,
  });

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("studentId", studentId);
    if (password) {
      formData.append("password", password);
    }
    formAction(formData);
  };

  useEffect(() => {
    if (state.success) {
      toast.success("Tài khoản đã được tạo thành công!");
      setShowForm(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Có lỗi xảy ra khi tạo tài khoản!");
    }
  }, [state, router]);

  if (showForm) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <h3 className="text-sm font-semibold mb-2">Tạo tài khoản cho học sinh</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Mật khẩu (để trống để tự động)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1 text-sm border rounded"
              placeholder="Để trống để tự động tạo"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tạo tài khoản
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
    >
      Tạo tài khoản
    </button>
  );
};

export default CreateAccountButton;
