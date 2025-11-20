"use client";
import { useState, useEffect } from "react";

const clients = [
  { src: "/mb.png", alt: "Samsung" },
  { src: "/ex.png", alt: "First Solar" },
  { src: "/nk.png", alt: "AEON Mall" },
  { src: "/acb.jpg", alt: "Olam" },
  { src: "/cgv.jpg", alt: "Jabil" },
  { src: "/school1.jpg", alt: "H&M" },
  { src: "/vh.png", alt: "Coca Cola" },
  { src: "/flc.jpg", alt: "HSBC" },
  { src: "/kd.png", alt: "Client 9" },
  { src: "/th.png", alt: "Client 10" },
];

export default function ClientsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(2);
      } else if (window.innerWidth < 768) {
        setItemsPerView(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4);
      } else {
        setItemsPerView(5);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % clients.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % clients.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + clients.length) % clients.length);
  };

  const getVisibleClients = () => {
    const visible = [];
    for (let i = 0; i < itemsPerView; i++) {
      visible.push(clients[(currentIndex + i) % clients.length]);
    }
    return visible;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-6">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {getVisibleClients().map((client, index) => (
              <div
                key={`${client.alt}-${index}`}
                className="bg-white p-4 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition transform hover:scale-105"
              >
                <img
                  src={client.src}
                  alt={client.alt}
                  className="max-w-full h-auto max-h-28 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
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
        {clients.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-[#19AD70] w-8"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
