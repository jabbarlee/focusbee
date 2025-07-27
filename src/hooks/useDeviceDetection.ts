import { useState, useEffect } from "react";

export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      // Check user agent for mobile devices
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        "android",
        "webos",
        "iphone",
        "ipad",
        "ipod",
        "blackberry",
        "windows phone",
        "mobile",
      ];

      const isMobileUserAgent = mobileKeywords.some((keyword) =>
        userAgent.includes(keyword)
      );

      // Check screen width (tablets and small laptops consideration)
      const isMobileScreen = window.innerWidth <= 768;

      // Check touch capability
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // Consider it mobile if it matches user agent OR (small screen AND touch)
      const isMobileDevice =
        isMobileUserAgent || (isMobileScreen && isTouchDevice);

      setIsMobile(isMobileDevice);
      setIsLoading(false);
    };

    // Check immediately
    checkDevice();

    // Also check on resize (for cases where window is resized)
    const handleResize = () => {
      checkDevice();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { isMobile, isLoading };
}
