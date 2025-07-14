import Image from "next/image";
import Link from "next/link";

interface CommentCardProps {
  comment: {
    id: number;
    content: string;
    type: string;
    date: Date;
    teacher: {
      id: string;
      name: string;
      surname: string;
      img?: string;
    };
    lesson?: {
      id: number;
      name: string;
      subject: {
        name: string;
      };
    };
  };
}

const CommentCard = ({ comment }: CommentCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "NEGATIVE":
        return "bg-red-100 text-red-800 border-red-200";
      case "SUGGESTION":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "Tích cực";
      case "NEGATIVE":
        return "Tiêu cực";
      case "SUGGESTION":
        return "Đề xuất";
      default:
        return "Trung tính";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Image
            src={comment.teacher.img || "/noAvatar.png"}
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900">
              {comment.teacher.name} {comment.teacher.surname}
            </h4>
            <p className="text-sm text-gray-500">
              {new Date(comment.date).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(comment.type)}`}>
          {getTypeText(comment.type)}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
      </div>

      {comment.lesson && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          <p className="text-gray-600">
            <strong>Bài học:</strong> {comment.lesson.name} - {comment.lesson.subject.name}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Link href={`/list/comments/${comment.id}`}>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Xem chi tiết →
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CommentCard; 