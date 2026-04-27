import { useMemo } from "react";

const COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

interface ServerIconProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function ServerIcon({ name, size = "md" }: ServerIconProps) {
  const colorClass = useMemo(() => {
    const hash = hashString(name);
    return COLORS[hash % COLORS.length];
  }, [name]);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`${colorClass} ${sizeClasses[size]} rounded-md flex items-center justify-center text-white font-semibold`}
    >
      {initial}
    </div>
  );
}
