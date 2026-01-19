import Link from "next/link";

export default function Page() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Quay lại
        </Link>

        <h1 className="text-3xl font-bold mb-2">MẸO VẶT LÀM SẠCH NHÀ BẾP SIÊU THÚ VỊ</h1>
        <div className="text-sm text-gray-500 mb-6">
          <span>21/12/2025</span>
          <span className="mx-2">•</span>
          <span>Bởi Opticlean</span>
          <span className="mx-2">•</span>
          <span>4.5/5 - (2 bình chọn)</span>
        </div>

        <img
          src="ve-sinh-sau-xay-dung2.jpg"
          alt="Mẹo vặt làm sạch nhà bếp"
          className="w-full h-64 object-cover rounded mb-6"
        />

        <article className="prose max-w-none text-gray-700">
          <p>
            Dầu mỡ, nhờn và các chất bẩn trong nhà bếp rất khó làm sạch. Dùng
            chất tẩy mạnh lại chứa nhiều hóa chất độc hại. Nhưng chỉ cần vỏ
            chanh áp dụng cho những mẹo vặt làm sạch nhà bếp, công dụng thần kì
            cũng chẳng kém.
          </p>

          <h2>Vết ố trên cốc, ấm nước</h2>
          <p>
            Những vết đọng lâu ngày của trà, cà phê sẽ thành những vệt ố vàng.
            Chà mạnh bằng vỏ chanh thêm chút muối, nước lạnh. Xả lại bằng nước
            sạch.
          </p>
          <p>
            Với ấm nước bị cặn vôi: cắt lát vỏ chanh cho vào ấm, đun sôi rồi tắt
            bếp. Để nước từ từ rồi rửa lại ấm.
          </p>

          <h2>Tẩy bám màu trên thớt</h2>
          <p>
            Thớt rửa qua nước, chà sát bề mặt bằng vỏ chanh. Để khoảng 30s cho
            axit trong chanh khử trùng mặt thớt rồi rửa lại. Thớt không những
            không còn bám màu do các vết cắt, khử trùng mà còn có mùi thơm dịu
            nhẹ của chanh.
          </p>

          <h2>Xua đuổi côn trùng</h2>
          <p>
            Bếp luôn là nơi trú ẩn lí tưởng cho côn trùng. Axit trong chanh là
            khắc tinh của côn trùng: đặt vỏ chanh ở nơi côn trùng dễ xâm nhập
            như ngưỡng cửa, lỗ hổng, kẽ tủ.
          </p>

          <h2>Làm sạch dầu mỡ</h2>
          <p>
            Rắc chút muối vào khu vực cần làm sạch. Chà với nửa quả chanh,
            sau đó lau lại bằng khăn ẩm. Tránh dùng chanh cho bề mặt nhạy cảm
            như đá cẩm thạch.
          </p>

          <h2>Lò vi sóng</h2>
          <p>
            Cho vài lát vỏ chanh vào bát nước, đặt vào lò ở nhiệt độ cao nhất
            trong 5 phút. Hơi nước sẽ làm mềm vết bám; lau lại bằng khăn sạch.
          </p>

          <h2>Khử mùi rác</h2>
          <p>
            Đặt vỏ chanh vào túi rác (hoặc thái lát) để giảm mùi khó chịu.
          </p>

          <h2>Đánh bóng kim loại</h2>
          <p>
            Ngâm vỏ chanh trong hỗn hợp nước soda, kem đánh răng, muối rồi
            chà lên kim loại cần đánh bóng, để 10 phút, sau đó rửa sạch.
          </p>

          <h2>Tạo hương thơm và độ ẩm</h2>
          <p>
            Đun vài miếng vỏ chanh trong nồi nước lửa nhỏ để tạo hương thơm và
            làm ẩm không khí vào mùa đông.
          </p>

          <h2>Giữ đường không vón cục</h2>
          <p>
            Bào nhỏ vỏ chanh, rắc lên đường để tránh vón cục và tạo mùi thơm
            nhẹ.
          </p>

          <p>
            Công việc dọn dẹp sẽ trở nên nhẹ nhàng và thú vị hơn rất nhiều với
            mẹo vặt làm sạch nhà bếp từ vỏ chanh.
          </p>
        </article>

        <p className="mt-6 text-sm text-gray-500">
          Nguồn gốc: <a href="https://panpacific.com.vn/meo-vat-lam-sach-nha-bep-sieu-thu-vi/" target="_blank" rel="noopener noreferrer" className="text-blue-600">panpacific.com.vn</a>
        </p>
      </div>
    </main>
  );
}
