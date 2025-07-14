import Image from "next/image";

const Loading = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 animate-gradient-move">
      <div className="mb-6 animate-fade-in">
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="drop-shadow-lg rounded-full border-4 border-white bg-white/80" />
      </div>
      <h2 className="text-2xl font-bold text-purple-700 mb-2 animate-bounce">Chào mừng đến với School Management!</h2>
      <p className="text-md text-gray-600 mb-8 animate-fade-in-slow">Hệ thống đang khởi động, vui lòng chờ trong giây lát...</p>
      <div className="w-full max-w-2xl space-y-4">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="flex space-x-4">
            <div className="h-8 w-1/6 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton"></div>
            <div className="h-8 w-2/6 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton"></div>
            <div className="h-8 w-1/6 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton"></div>
            <div className="h-8 w-1/6 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton"></div>
          </div>
        ))}
      </div>
      <div className="mt-10 animate-twinkle text-yellow-400 text-3xl font-extrabold select-none">✨✨✨</div>
    </div>
  );
};

export default Loading;