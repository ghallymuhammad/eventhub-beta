import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex items-center space-x-2 group" aria-label="EventHub">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-gray-900 group-hover:text-blue-600 transition-colors duration-200"
      >
        <path d="M8 2v4"/>
        <path d="M16 2v4"/>
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <path d="M3 10h18"/>
        <path d="M8 14h.01"/>
        <path d="M12 14h.01"/>
        <path d="M16 14h.01"/>
        <path d="M8 18h.01"/>
        <path d="M12 18h.01"/>
        <path d="M16 18h.01"/>
      </svg>
      <span className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
        EventHub
      </span>
    </Link>
  );
}
