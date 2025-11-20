"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Intro() {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // Respect prefers-reduced-motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setInView(true);
      return;
    }

    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-label="Giới thiệu Opti Clean"
      className="py-6 bg-[#A6F4D2] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div
            className={`relative transform transition-all duration-700 ease-out will-change-transform ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <img
              src="/intro-image.png"
              alt="Opti Clean - PANPACIFIC"
              width={900}
              height={400}
              className="rounded-lg shadow-2xl w-[90%] h-auto object-cover transform transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Text */}
          <div
            className={`text-left transform transition-all duration-700 ease-out will-change-transform ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <h1 className="text-3xl font-bold mb-6 text-[#262626]">
              Opti Clean — Giải pháp vệ sinh công nghiệp của PANPACIFIC
            </h1>
            <p className="text-xl mb-8 text-gray-800">
              Opti Clean là giải pháp vệ sinh công nghiệp do PANPACIFIC phát
              triển, cung cấp các dịch vụ và công nghệ giúp không gian sạch
              sẽ, an toàn và hiệu quả.
            </p>

            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("contact");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  // fallback: update hash
                  window.location.hash = "#contact";
                }
              }}
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition transform-gpu hover:-translate-y-0.5 active:translate-y-0 pulse-zoom"
              aria-label="Đặt dịch vụ - chuyển tới phần Liên hệ"
            >
              Đặt Dịch Vụ Ngay
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
