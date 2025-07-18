import { useEffect, useState } from "react";

/**
 * displayのsizeを判定するhooks
 */
export const useWindowSize = (): number[] => {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    const updateSize = (): void => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};
