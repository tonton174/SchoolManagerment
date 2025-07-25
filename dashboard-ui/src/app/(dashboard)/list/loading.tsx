import Image from "next/image";

const Loading = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
      <div className="mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="drop-shadow-lg rounded-full border-4 border-white bg-white/80" />
      </div>
      <div className="w-16 h-16 border-4 border-t-transparent border-gray-300 border-solid rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang tải dữ liệu...</h2>
      <p className="text-md text-gray-500 mb-2 animate-pulse">Vui lòng chờ trong giây lát</p>
    </div>
  );
};

export default Loading;