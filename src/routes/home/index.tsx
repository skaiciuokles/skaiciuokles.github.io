import { createFileRoute, Link } from '@tanstack/react-router';
import { CalculatorIcon } from 'lucide-react';

export const Route = createFileRoute('/home/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h2 className="text-2xl font-bold mb-8 text-gray-700">Pasirinkite skaičiuoklę</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        <Link
          to="/mokesciai"
          className="group flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white hover:bg-blue-50"
        >
          <CalculatorIcon className="size-12 text-gray-400 group-hover:text-blue-500 transition-colors mb-4" />
          <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            Mokesčių Skaičiuoklė
          </span>
          <span className="text-sm text-gray-500 mt-2 text-center">GPM, Sodra, IV ir MB mokesčių skaičiavimas</span>
        </Link>
      </div>
    </div>
  );
}
