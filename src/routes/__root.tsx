import { UnlinkIcon } from 'lucide-react';
import { createRootRoute, HeadContent, Link, Outlet } from '@tanstack/react-router';
import { HEADER_HEIGHT } from '@/lib/constants';
import { BuildNumber } from '@/components/layouts/build-number';
import { Header } from '@/components/layouts/header';
import { HomePage } from './index';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <HomePage>
        <div className="mb-8 space-y-3">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2 text-gray-700 ">
            <UnlinkIcon className="size-8" strokeWidth={3} /> 404 | Puslapis nerastas
          </h1>
          <p className="text-lg text-gray-600">
            Prašome pasirinkti skaičiuoklę iš sąrašo arba{' '}
            <Link to="/" className="underline text-blue-500 hover:text-blue-600">
              grįžkite į pagrindinį puslapį
            </Link>
            .
          </p>
        </div>
      </HomePage>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  head: ({ matches }) => {
    return {
      meta: [
        {
          title: matches.length > 1 ? 'Skaičiuoklės' : 'Skaičiuoklės | 404 Puslapis nerastas',
        },
      ],
    };
  },
});

function RootLayout() {
  return (
    <>
      <HeadContent />
      <div className="max-w-480 mx-auto relative z-10 h-screen flex flex-col" style={{ paddingTop: HEADER_HEIGHT }}>
        <Header style={{ height: HEADER_HEIGHT }} />
        <Outlet />
        <BuildNumber />
      </div>
    </>
  );
}
