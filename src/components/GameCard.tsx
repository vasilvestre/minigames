import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
}

export default function GameCard({ title, description, href }: GameCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h3 className="text-lg font-semibold text-foreground group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      <div className="mt-4 flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
        <span>Jouer</span>
        <svg
          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
