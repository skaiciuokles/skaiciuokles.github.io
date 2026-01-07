import { createRootRoute, Navigate, Outlet } from '@tanstack/react-router';
import { BuildNumber } from '@/components/layouts/build-number';
import { Header } from '@/components/layouts/header';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <Navigate to="/mokesciai" />,
});

function RootLayout() {
  return (
    <div className="max-w-480 mx-auto text-center relative z-10 h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BuildNumber />
    </div>
  );
}
