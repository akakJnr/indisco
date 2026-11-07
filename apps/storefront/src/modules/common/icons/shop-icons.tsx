import React from "react"

const PATHS: Record<string, string> = {
  groceries: "M6 8h12l-1 12H7L6 8Z M9 8V6a3 3 0 0 1 6 0v2",
  beverages: "M7 8h10l-1 12H8L7 8Z M6 8h12 M12 8V3l3-1",
  "dairy-breakfast": "M8 3h8l2 4v14H6V7l2-4Z M6 7h12 M10 12h4",
  "fresh-produce": "M5 19c0-8 5-14 14-14 0 9-6 14-14 14Z M5 19l8-8",
  "meat-fish": "M15 4a5 5 0 0 1 5 5c0 2-1.5 3.5-3 4.5L13 17a2.5 2.5 0 1 1-3.5-3.5l3.5-3.5C14 8.500 15 6 15 4Z",
  household: "M9 9h6v11H9V9Z M10 9V6h4v3 M14 6h4 M18 4v4",
  "personal-care": "M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11Z",
  "baby-kids": "M10 3h4v3h-4V3Z M9 6h6l1 4v10H8V10l1-4Z M8 13h8",
  laboratory:
    "M9 3h6 M10 3v6L5 19a2 2 0 0 0 1.800 3h10.400A2 2 0 0 0 19 19l-5-10V3 M8 15h8",
  truck: "M2 6h11v10H2z M13 10h4l3 3v3h-7z M6 20a1.500 1.500 0 1 0 0-.01 M17 20a1.500 1.500 0 1 0 0-.01",
  shield: "M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6l8-3Z M9 12l2 2 4-4",
  star: "M12 3l2.700 5.600 6.100.900-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.900L12 3Z",
  flask:
    "M9 3h6 M10 3v6L5 19a2 2 0 0 0 1.800 3h10.400A2 2 0 0 0 19 19l-5-10V3 M8 15h8",
  basket: "M3.500 9h17l-1.700 9.200a2 2 0 0 1-2 1.600H7.200a2 2 0 0 1-2-1.600L3.500 9Z M8 9l3-5 M16 9l-3-5",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  home: "M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21a8 8 0 0 1 16 0",
  cart: "M3 4h2l2.400 11.200a1 1 0 0 0 1 .800h9.200a1 1 0 0 0 1-.800L20 8H6 M9 20.500a.500.500 0 1 0 0-.010 M17 20.500a.500.500 0 1 0 0-.010",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  chevron: "M9 6l6 6-6 6",
  close: "M6 6l12 12 M18 6L6 18",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  phone: "M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
}

export type ShopIconName = keyof typeof PATHS

export const ShopIcon = ({
  name,
  className = "h-6 w-6",
}: {
  name: string
  className?: string
}) => {
  const d = PATHS[name] ?? PATHS.basket
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {d.split(" M").map((segment, index) => (
        <path key={index} d={index === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  )
}

/** Colour pairs (text, soft background) used to tint each category tile. */
export const CATEGORY_TONES: Record<string, string> = {
  groceries: "bg-sun-100 text-sun-600",
  beverages: "bg-sky-100 text-sky-600",
  "dairy-breakfast": "bg-blue-100 text-blue-600",
  "fresh-produce": "bg-emerald-100 text-emerald-600",
  "meat-fish": "bg-red-100 text-red-600",
  household: "bg-violet-100 text-violet-600",
  "personal-care": "bg-pink-100 text-pink-600",
  "baby-kids": "bg-cyan-100 text-cyan-600",
  laboratory: "bg-lab-100 text-lab-700",
}
