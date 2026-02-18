import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CoffeeButton from './CoffeeButton';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <CoffeeButton />
    </div>
  );
}
