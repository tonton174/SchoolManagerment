"use client";

import ClientFormContainer from "@/components/ClientFormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";

// Lazy load CommentForm
const CommentForm = dynamic(() => import("@/components/forms/CommentForm"), {
  loading: () => <div>Loading form...</div>,
});

// Client component wrapper cho FormContainer
const CommentFormWrapper = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <ClientFormContainer 
      table="comment" 
      type="create" 
      onSuccess={onSuccess}
    />
  );
};

const CommentListPage = () => {
  const { sessionClaims, userId } = useAuth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // Fetch comments from API
  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments');
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error('Failed to fetch comments');
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
    setLoading(false);
  };

  // Fetch form data for edit
  const fetchFormData = async () => {
    try {
      const response = await fetch('/api/form-data?table=comment&type=update');
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  // Refresh comments when component mounts
  useEffect(() => {
    fetchComments();
    fetchFormData();
  }, []);

  // Callback để cập nhật state khi thêm nhận xét thành công
  const handleCommentSuccess = () => {
    console.log("Refreshing comments...");
    fetchComments();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const response = await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success("Comment deleted successfully!");
        fetchComments();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error deleting comment!");
      }
    } catch (error) {
      toast.error("Error deleting comment!");
    }
  };

  const handleEdit = (item: any) => {
    setEditData(item);
    setShowEdit(true);
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setEditData(null);
    fetchComments();
  };

  const columns = [
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Comment Type",
      accessor: "type",
      className: "hidden lg:table-cell",
    },
    {
      header: "Content",
      accessor: "content",
      className: "hidden xl:table-cell",
    },
    {
      header: "Created Date",
      accessor: "date",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  // Filter theo role
  let filteredComments = comments;
  if (role === "teacher") {
    filteredComments = comments.filter(comment => comment.teacherId === userId);
  } else if (role === "student") {
    filteredComments = comments.filter(comment => comment.studentId === userId);
  } else if (role === "parent") {
    // Trong thực tế sẽ filter theo parent's students
    filteredComments = comments;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "bg-green-100 text-green-800";
      case "NEGATIVE":
        return "bg-red-100 text-red-800";
      case "SUGGESTION":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "Positive";
      case "NEGATIVE":
        return "Negative";
      case "SUGGESTION":
        return "Suggestion";
      default:
        return "Neutral";
    }
  };

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src="/noAvatar.png"
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.student.name} {item.student.surname}</h3>
          <p className="text-xs text-gray-500">{item.student.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          <Image
            src="/noAvatar.png"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span>{item.teacher.name} {item.teacher.surname}</span>
        </div>
      </td>
      <td className="hidden lg:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
          {getTypeText(item.type)}
        </span>
      </td>
      <td className="hidden xl:table-cell max-w-xs truncate">
        {item.content}
      </td>
      <td className="hidden lg:table-cell">
        {new Date(item.date).toLocaleDateString('en-US')}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <button 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky" 
            onClick={() => handleEdit(item)}
          >
            <Image src="/update.png" alt="Edit" width={14} height={14} />
          </button>
          <button 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-200" 
            onClick={() => handleDelete(item.id)}
          >
            <Image src="/delete.png" alt="Delete" width={14} height={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Student Comments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <CommentFormWrapper onSuccess={handleCommentSuccess} />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="mt-8">
        <Table columns={columns} renderRow={renderRow} data={filteredComments} />
      </div>

      {/* Edit Modal */}
      {showEdit && editData && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <CommentForm
              type="update"
              data={editData}
              students={formData?.students || []}
              lessons={formData?.lessons || []}
              onSuccess={handleCloseEdit}
              setOpen={handleCloseEdit}
            />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={handleCloseEdit}
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentListPage; 