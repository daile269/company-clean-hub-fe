import Link from "next/link";

export default function Page() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Quay lại
        </Link>

        <h1 className="text-3xl font-bold mb-2">Sử dụng hóa chất thân thiện với môi trường</h1>
        <div className="text-sm text-gray-500 mb-6">
          <span>12/12/2025</span>
          <span className="mx-2">•</span>
          <span>Bởi Opticlean</span>
          <span className="mx-2">•</span>
          <span>4/5 - (2 bình chọn)</span>
        </div>

        <img
          src="/mt.png"
          alt="Sử dụng hóa chất thân thiện"
          className="w-full h-64 object-cover rounded mb-6"
        />

        <article className="prose max-w-none text-gray-700">
          <p>
            PANPACIFIC cam kết sử dụng các sản phẩm vệ sinh thân thiện với
            môi trường và an toàn cho sức khỏe. Hóa chất xanh giúp giảm tác
            hại tới con người và hệ sinh thái khi được lựa chọn và sử dụng
            đúng cách.
          </p>

          <h2>Lợi ích của hóa chất thân thiện</h2>
          <p>
            Hóa chất thân thiện thường ít bay hơi độc hại, ít gây kích ứng
            da và hô hấp, đồng thời dễ phân hủy sinh học hơn, giảm nguy cơ ô
            nhiễm nguồn nước và đất.
          </p>

          <h2>Hướng dẫn chọn và sử dụng</h2>
          <ul>
            <li>Chọn sản phẩm có nhãn rõ ràng, chứng nhận an toàn môi trường.</li>
            <li>Đọc kỹ hướng dẫn sử dụng, pha đúng nồng độ khuyến cáo.</li>
            <li>Trang bị găng tay, khẩu trang khi tiếp xúc trực tiếp.</li>
            <li>Tránh xả trực tiếp lượng hóa chất đậm đặc vào hệ thống thoát nước.</li>
          </ul>

          <p>
            Sử dụng hóa chất xanh không những bảo vệ sức khỏe người dùng mà
            còn góp phần xây dựng môi trường bền vững cho cộng đồng.
          </p>
        </article>

        <p className="mt-6 text-sm text-gray-500">
          Nguồn gốc: <a href="https://panpacific.com.vn/hoa-chat-xanh" target="_blank" rel="noopener noreferrer" className="text-blue-600">panpacific.com.vn</a>
        </p>
      </div>
    </main>
  );
}
