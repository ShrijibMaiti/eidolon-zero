import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const Navbar: React.FC = () => {
  return (
    <nav className="h-[48px] w-full border-b border-border-soft bg-bg-primary flex items-center justify-between px-6 z-50 sticky top-0">
      <div className="flex items-center gap-4">
        <span className="section-heading text-text-primary">EIDOLON:ZERO</span>
        <div className="flex items-center gap-2">
          <div className="w-[6px] h-[6px] rounded-full bg-accent-green green-pulse" />
          <span className="tiny-metadata text-accent-green">ENGINE: READY</span>
        </div>
      </div>

      <div className="flex items-center h-full">
        {[
          { label: 'DASHBOARD', path: '/dashboard' },
          { label: 'INFERENCE', path: '/inference' },
          { label: 'DOMAINS', path: '/domain' },
          { label: 'SETTINGS', path: '/settings' },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "h-full px-5 flex items-center section-heading transition-colors border-b-[1px]",
              isActive 
                ? "text-text-primary border-text-primary" 
                : "text-text-disabled border-transparent hover:text-text-secondary"
            )}
          >
            {item.label}
          </NavLink>
        ))}
        <button className="ml-5 text-text-disabled hover:text-text-primary transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
