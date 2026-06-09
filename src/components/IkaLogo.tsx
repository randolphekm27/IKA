import React from "react";

interface IkaLogoProps {
  size?: number;
  inverted?: boolean; // true = blanc sur fond noir
  className?: string;
}

export function IkaLogo({ size = 32, inverted = false, className }: IkaLogoProps) {
  const fg = inverted ? "#FFFFFF" : "#000000";
  const bg = inverted ? "#000000" : "#FFFFFF";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Logo IKA"
    >
      <rect x="1" y="1" width="38" height="38" rx="4" ry="4"
            stroke={fg} strokeWidth="3" fill={bg}/>
      <rect x="6"  y="6"  width="6" height="6" rx="1" fill={fg}/>
      <rect x="14" y="6"  width="6" height="6" rx="1" fill={fg}/>
      <rect x="22" y="6"  width="6" height="6" rx="1" fill={fg}/>
      <rect x="30" y="6"  width="6" height="6" rx="1" fill={fg}/>
      <rect x="6"  y="14" width="6" height="6" rx="1" fill={fg}/>
      <rect x="22" y="14" width="6" height="6" rx="1" fill={fg}/>
      <rect x="6"  y="22" width="6" height="6" rx="1" fill={fg}/>
      <rect x="14" y="22" width="6" height="6" rx="1" fill={fg}/>
      <rect x="22" y="22" width="6" height="6" rx="1" fill={fg}/>
      <rect x="30" y="22" width="6" height="6" rx="1" fill={fg}/>
      <rect x="6"  y="30" width="6" height="6" rx="1" fill={fg}/>
      <rect x="22" y="30" width="6" height="6" rx="1" fill={fg}/>
    </svg>
  );
}
