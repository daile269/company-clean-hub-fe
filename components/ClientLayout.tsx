"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Check if it's a hash link
      if (href.includes("#")) {
        const [path, hash] = href.split("#");
        
        // Normalize path for comparison
        const normalizedPath = path === "" || path === "/" ? "/" : path;
        const normalizedCurrentPath = pathname === "" || pathname === "/" ? "/" : pathname;
        
        const isCurrentPage = normalizedPath === normalizedCurrentPath || normalizedPath === pathname;

        if (isCurrentPage && hash) {
          const element = document.getElementById(hash);
          if (element) {
            e.preventDefault();
            const headerOffset = 100; // Adjusted for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });

            // Remove hash from URL
            window.history.pushState(null, "", pathname);
          }
        }
      } else if (href === "/" && pathname === "/") {
        // Scroll to top for home link on home page
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
        window.history.pushState(null, "", "/");
      }
    };

    document.addEventListener("click", handleAnchorClick);

    // Handle initial hash on mount
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          window.history.replaceState(null, "", window.location.pathname);
        }
      }, 500);
    }

    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  return (
    <>
      <Toaster position="top-right" />
      {/* Header - Hidden on admin pages */}
      {!isAdminPage && <Header />}

      {/* Main Content */}
      <main>{children}</main>

      {/* Floating Contact Buttons - Hidden on admin pages */}
      {!isAdminPage && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
          {/* Zalo Button */}
          <a
            href="https://zalo.me/0367897956"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
          >
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all hover:scale-110 animate-pulse">
              <img src="/Icon_of_Zalo.svg.png" alt="Zalo" className="w-8 h-8" />
            </div>
          </a>

          {/* Phone Button */}
          <a href="tel:02866838966" className="group relative">
            <div className="flex items-center gap-3 bg-[#19AD70] rounded-full px-6 py-3 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-[#19AD70]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">02866838966</span>
            </div>
          </a>
        </div>
      )}

      {/* Footer - Hidden on admin pages */}
      {!isAdminPage && (
        <footer className="bg-[#19AD70] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-1">
              <div>
                <h3 className="text-xl font-bold mb-4">PANPACIFIC</h3>
                <p className="text-white mb-4">
                  Dịch vụ vệ sinh công nghiệp chuyên nghiệp hàng đầu Việt Nam
                </p>
                <div className="space-y-2 text-white text-sm">
                  <p className="font-semibold text-white">
                    CÔNG TY TNHH PANPACIFIC
                  </p>
                  <p>MST: 0317443120</p>
                  <p>
                    📞 Hotline:{" "}
                    <a href="tel:02866838966" className="hover:text-white">
                      028 6683 8966
                    </a>
                  </p>
                  <p>
                    💬 Zalo:{" "}
                    <a href="tel:0367897956" className="hover:text-white">
                      036 789 7956
                    </a>
                  </p>
                  <p>
                    📧{" "}
                    <a
                      href="mailto: info@opticlean.com.vn"
                      className="hover:text-white mr-2"
                    >
                      info@opticlean.com.vn
                    </a>
                    hoặc
                    <a
                      href="mailto: info@opticlean.com.vn"
                      className="hover:text-white ml-2"
                    >
                      sp.opticlean@gmail.com
                    </a>
                  </p>
                  <p>
                    🌐{" "}
                    <a
                      href="https://opticlean.com.vn/"
                      target="_blank"
                      className="hover:text-white"
                    >
                      www.opticlean.com.vn
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Trụ Sở & PDD Hồ Chí Minh</h4>
                <ul className="space-y-3 text-white text-sm">
                  <li>
                    <p className="font-medium text-white mb-1">Trụ sở chính:</p>
                    <p>349B Lạc Long Quân, P.5, Q.11, TP.HCM</p>
                  </li>
                  <li>
                    <p className="font-medium text-white mb-1">Chi nhánh 2:</p>
                    <p>877 Lê Đức Thọ, P.16, Q.Gò Vấp, TP.HCM</p>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">
                  PDD Miền Trung & Miền Bắc
                </h4>
                <ul className="space-y-3 text-white text-sm">
                  <li>
                    <p className="font-medium text-white mb-1">PDD Đà Nẵng:</p>
                    <p>68 Vũ Lập, P.Hòa Khánh Nam, Q.Liên Chiểu, TP.Đà Nẵng</p>
                  </li>
                  <li>
                    <p className="font-medium text-white mb-1">PDD Hà Nội:</p>
                    <p>
                      54 Nguyễn Chí Thanh, P.Láng Thượng, Q.Đống Đa, TP.Hà Nội
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
