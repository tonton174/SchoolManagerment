import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const CommentDetailPage = async ({ params }: { params: { id: string } }) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <div className="bg-white p-6 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Chi tiết nhận xét</h1>
        <Link href="/list/comments">
          <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
            Quay lại
          </button>
        </Link>
      </div>

      <div className="text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🚧 Chức năng đang được cập nhật
          </h3>
          <p className="text-blue-700 mb-4">
            Trang chi tiết nhận xét sẽ hiển thị đầy đủ thông tin sau khi generate Prisma client.
          </p>
          <div className="bg-white rounded-lg p-4 text-left">
            <h4 className="font-semibold mb-2">📋 Thông tin sẽ hiển thị:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✅ Thông tin học sinh (tên, lớp, email, số điện thoại)</li>
              <li>✅ Thông tin giáo viên (tên, email, số điện thoại)</li>
              <li>✅ Thông tin bài học (nếu có liên kết)</li>
              <li>✅ Nội dung nhận xét chi tiết</li>
              <li>✅ Loại nhận xét (Tích cực/Tiêu cực/Trung tính/Đề xuất)</li>
              <li>✅ Ngày tạo nhận xét</li>
            </ul>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🔧 Để hoàn tất:</h4>
            <p className="text-yellow-700 text-sm">
              Chạy lệnh: <code className="bg-yellow-100 px-2 py-1 rounded">npx prisma generate</code> 
              trong terminal để generate Prisma client với model Comment mới.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentDetailPage; 