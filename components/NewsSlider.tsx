"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const news = [
  {
    id: "nghe-tap-vu",
    img: "/vs-tong.jpg",
    category: "Câu chuyện",
    title: "NGHỀ TẠP VỤ: MONG ĐƯỢC SỰ TÔN TRỌNG",
    excerpt:
      "Mẹ tôi là nhân viên tạp vụ cho một công ty lớn. Công việc của mẹ là lau dọn sạch sẽ công ty — vất vả, nhọc nhằn và thường bị xem nhẹ, nhưng lại giữ cho nơi làm việc sạch sẽ từng ngóc ngách.",
    href: "/news/nghe-tap-vu-mong-duoc-su-ton-trong",
  },
  {
    id: "meo-vat",
    img: "/ve-sinh-sau-xay-dung2.jpg",
    category: "Mẹo vặt",
    title: "MẸO VẶT LÀM SẠCH NHÀ BẾP SIÊU THÚ VỊ",
    excerpt:
      "Dầu mỡ, nhờn và các chất bẩn trong nhà bếp rất khó làm sạch — nhưng chỉ cần vỏ chanh và vài mẹo nhỏ, công việc sẽ nhẹ nhàng hơn rất nhiều.",
    href: "/news/meo-vat-lam-sach-nha-bep-sieu-thu-vi",
  },
  {
    id: "giat-tham",
    img: "/giat-tham.jpg",
    category: "Chăm sóc",
    title: "GIẶT THẢM ĐỊNH KỲ!",
    excerpt:
      "Giặt thảm định kỳ giúp loại bỏ bụi bẩn sâu, ngăn nấm mốc và kéo dài tuổi thọ thảm — một khoản đầu tư tiết kiệm cho gia đình và doanh nghiệp.",
    href: "/news/giat-tham-dinh-ky",
  },
  {
    id: "hoa-chat",
    img: "/mt.png",
    category: "Môi trường",
    title: "Sử dụng hóa chất thân thiện với môi trường",
    excerpt:
      "PANPACIFIC cam kết sử dụng các sản phẩm vệ sinh không gây hại cho môi trường và sức khỏe, lựa chọn an toàn cho gia đình và doanh nghiệp.",
    href: "/news/hoa-chat-xanh",
  },
];

export default function NewsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 768) setItemsPerView(2);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setCurrentIndex((p) => (p - 1 + news.length) % news.length);
  const next = () => setCurrentIndex((p) => (p + 1) % news.length);

  const getVisible = () => {
    const visible = [];
    for (let i = 0; i < itemsPerView; i++) {
      visible.push(news[(currentIndex + i) % news.length]);
    }
    return visible;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-6">
        {/* Previous Button */}
        <button
          onClick={prev}
          className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-100 transition z-10"
          aria-label="Previous"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Slider Container */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisible().map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:scale-105"
              >
                <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <span className="text-sm text-[#4CCF96] font-semibold">{item.category}</span>
                  <h3 className="text-xl font-bold mt-2 mb-3 text-[#4CCF96]">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                  <Link href={item.href} className="text-blue-600 font-medium hover:text-blue-800">Đọc thêm →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={next}
          className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-100 transition z-10"
          aria-label="Next"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {news.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-[#19AD70] w-8" : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
