import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

const MobileLayout = ({ children, hideBottomNav }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen max-w-lg mx-auto relative bg-background">
      <main className={hideBottomNav ? "" : "pb-20"}>
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default MobileLayout;
