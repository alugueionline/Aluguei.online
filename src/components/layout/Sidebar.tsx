import React from 'react';
import { NavContent } from './NavContent';

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex-col">
      <NavContent />
    </aside>
  );
};