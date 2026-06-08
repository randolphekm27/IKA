import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between transition-all hover:border-black">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
          {title}
        </span>
        {icon && <div className="text-neutral-400 hover:text-black transition-colors">{icon}</div>}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-extrabold tracking-tight text-black font-mono">
          {value}
        </h3>
        {description && (
          <p className="text-xs text-neutral-500 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
