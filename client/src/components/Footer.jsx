import { useEffect, useState } from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  const [showUploadButton, setShowUploadButton] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const upload1 = document.getElementById("upload1");
  //     const upload2 = document.getElementById("upload2");

  //     const upload1Rect = upload1 ? upload1.getBoundingClientRect() : {};
  //     const upload2Rect = upload2 ? upload2.getBoundingClientRect() : {};

  //     // Kiểm tra xem buttons có trong viewport không
  //     const isInView =
  //       (upload1Rect.bottom >= 0 && upload1Rect.top <= window.innerHeight) ||
  //       (upload2Rect.bottom >= 0 && upload2Rect.top <= window.innerHeight);

  //     setShowUploadButton(!isInView);
  //   };

  //   handleScroll(); // Gọi lần đầu
  //   window.addEventListener("scroll", handleScroll);

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  return (
    <div>
      <h1 className="text-center text-2xl font-bold mt-10">
        Upload your photo
      </h1>
    </div>
  );
};

export default Footer;
