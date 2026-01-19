import Link from "next/link";

export default function Page() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link href="/" className="text-sm text-blue-600 mb-4 inline-block">
          ← Quay lại
        </Link>

        <h1 className="text-3xl font-bold mb-2">GIẶT THẢM ĐỊNH KỲ!</h1>
        <div className="text-sm text-gray-500 mb-6">
          <span>26/12/2025</span>
          <span className="mx-2">•</span>
          <span>Bởi Opticlean</span>
          <span className="mx-2">•</span>
          <span>5/5 - (2 bình chọn)</span>
        </div>

        <img
          src="/giat-tham.jpg"
          alt="Giặt thảm định kỳ"
          className="w-full h-64 object-cover rounded mb-6"
        />

        <article className="prose max-w-none text-gray-700">
          <p>
            Giặt thảm cũng giống như việc đi nha khoa, khi bạn thực sự có vấn
            đề về răng miệng bạn mới đến nha khoa thì kết quả bạn mang về là
            những vết trám, thảm cũng vậy nếu bạn để thảm quá lâu mà không được
            làm sạch thì bụi, đất, các chất bẩn sẽ nhiễm sâu trong thảm làm dãn
            và sơ các sợi thảm
          </p>

          <p>
            gây hư hại cấu trúc thảm cũng như để lại rất nhiều các vết bẩn
            vĩnh viễn không bao giờ điều trị được. Tuy nhiên, thảm là một
            vật liệu ” đỏng đảnh” vì vậy khá khó khăn trong việc chăm sóc làm
            sạch bảo trì thảm.
          </p>

          <p>
            Hút bụi thường xuyên rất hiệu quả trong việc bảo trì thảm từ ngày
            này qua ngày khác. Tuy nhiên, các chuyên gia đã nghiên cứu cho
            thấy bụi bẩn tích tụ sâu trong thảm sẽ không được làm sạch bằng
            cách hút bụi thông thường mà cần được làm sạch chuyên sâu hơn nữa;
            bụi đất tích tụ lâu ngày trong thảm sẽ là môi trường thuận lợi để
            vi khuẩn nấm mốc phát triển ảnh hưởng nghiêm trọng đến sức khỏe.
          </p>

          <p>
            Vì vậy chuyên gia khuyên rằng thảm nên làm sạch sâu bởi các dịch vụ
            giặt thảm chuyên nghiệp định kỳ từ 3, 6 đến 12 tháng.
          </p>

          <h2>Tại sao ư?</h2>

          <p>Giặt thảm định kỳ để đảm bảo</p>
          <ul>
            <li>- Các vết bẩn chưa quá nghiêm trọng</li>
            <li>- Bụi bẩn tích tụ sâu trong thảm chưa ảnh hưởng đến các sợi thảm gây hư hại cấu trúc thảm</li>
            <li>- Vi khuẩn nấm mốc được loại bỏ kịp thời nhằm đảm bảo an toàn sức khỏe cho người sử dụng.</li>
            <li>- Giặt thảm định kỳ giúp bạn tiết kiệm một chi phí lớn cho việc thay thảm.</li>
            <li>- Giặt thảm định kỳ sẽ giúp chăm sóc thảm một cách tốt nhất nhằm làm tăng tính thẩm mỹ và tăng tuổi thọ sử dụng thảm.</li>
          </ul>
        </article>

        <p className="mt-6 text-sm text-gray-500">
          Nguồn gốc: <a href="https://panpacific.com.vn/giat-tham-dinh-ky/" target="_blank" rel="noopener noreferrer" className="text-blue-600">panpacific.com.vn</a>
        </p>
      </div>
    </main>
  );
}
