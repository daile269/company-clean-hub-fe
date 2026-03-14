import { notFound } from "next/navigation";

type ContractsDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ContractDetailPage({ params }: ContractsDetailPageProps) {
  if (!params?.id) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow rounded-lg p-8 max-w-xl w-full text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Chi tiết hợp đồng #{params.id}
        </h1>
        <p className="text-gray-600">
          Màn hình chi tiết hợp đồng chưa được triển khai. Vui lòng quay lại danh sách
          hợp đồng hoặc liên hệ quản trị hệ thống nếu bạn cần tính năng này.
        </p>
      </div>
    </div>
  );
}

