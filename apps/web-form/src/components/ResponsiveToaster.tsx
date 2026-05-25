"use client";

import { ToastContainer, type ToastPosition } from "react-toastify";
import { useEffect, useState } from "react";

export default function ResponsiveToaster() {
  const [position, setPosition] = useState<ToastPosition>("top-center");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)"); // md breakpoint
    const update = () => setPosition(mq.matches ? "top-right" : "top-center");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <ToastContainer
      position={position}
      newestOnTop
      closeOnClick
      theme="dark"
      autoClose={4000}
      pauseOnFocusLoss
      draggable={false}
    />
  );
}
