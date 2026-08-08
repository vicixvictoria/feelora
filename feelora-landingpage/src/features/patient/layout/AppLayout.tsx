import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SessionNotificationModal from '@/features/calendar/components/SessionNotificationModal';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
      <SessionNotificationModal />
    </div>
  );
};

export default AppLayout;
