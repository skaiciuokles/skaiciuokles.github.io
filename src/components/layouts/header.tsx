import { siGithub } from 'simple-icons';
import { Link } from '@tanstack/react-router';
import { ChartNoAxesCombinedIcon } from 'lucide-react';
import { SimpleIcon } from '@/components/ui/simple-icon';

export function Header() {
  return (
    <header className="flex items-center justify-between px-3 py-2 border-b">
      <h1 className="text-lg font-semibold flex items-center gap-2">
        <Link to="/home" className="data-[status='active']:text-blue-800">
          <ChartNoAxesCombinedIcon className="size-6" />
        </Link>
        <Link to="/mokesciai" className="min-w-[85px] data-[status='active']:text-blue-700">
          Mokesčiai
        </Link>
      </h1>
      <a
        href="https://github.com/skaiciuokles/skaiciuokles.github.io"
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <SimpleIcon icon={siGithub} className="size-6" />
      </a>
    </header>
  );
}
