import React from "react";

interface CustomPinMarkerProps {
  icon: React.ElementType;
  bgColor?: string;
  iconColor?: string;
  size?: number;
  hasShadow?: boolean; // 1. เพิ่ม prop นี้เข้ามา
}

export const CustomPinMarker: React.FC<CustomPinMarkerProps> = ({
  icon: Icon,
  bgColor = "#FFBE3D",
  iconColor = "#FFFFFF",
  size = 42,
  hasShadow = true, // 2. ตั้งค่าเริ่มต้นเป็น true (มีเงา)
}) => {
  const ratio = 54 / 42;
  const height = size * ratio;

  return (
    <div
      className="relative flex justify-center items-start"
      style={{ width: size, height: height }}
    >
      <svg
        viewBox="0 0 42 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        // 3. ใช้ Logic เช็ค: ถ้า hasShadow เป็นจริง ให้ใส่ class 'drop-shadow-md'
        className={`absolute inset-0 w-full h-full transition-all ${
          hasShadow ? "drop-shadow-md" : ""
        }`}
      >
        <path
          d="M21 0.5C32.3218 0.5 41.5 9.67816 41.5 21C41.5 29.8248 35.9236 37.3487 28.1006 40.2373C26.1184 40.9692 24.2112 42.1206 22.9561 43.918L21.2422 46.3711V46.3721C21.2143 46.4122 21.1768 46.4447 21.1348 46.4668C21.0928 46.4887 21.0466 46.5 21 46.5C20.9534 46.5 20.9072 46.4887 20.8652 46.4668C20.8232 46.4447 20.7857 46.4122 20.7578 46.3721V46.3711L19.0439 43.918C17.7888 42.1206 15.8816 40.9692 13.8994 40.2373C6.07643 37.3487 0.5 29.8248 0.5 21C0.5 9.67816 9.67816 0.5 21 0.5Z"
          fill={bgColor}
          stroke="white"
        />
        <path
          d="M23 52C23 50.8954 22.1046 50 21 50C19.8954 50 19 50.8954 19 52C19 53.1046 19.8954 54 21 54C22.1046 54 23 53.1046 23 52Z"
          fill="white"
        />
      </svg>

      <div
        className="z-10 flex justify-center items-center absolute"
        style={{
          top: "16%",
          width: "57%",
          height: "44%",
          color: iconColor,
        }}
      >
        <Icon style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};
