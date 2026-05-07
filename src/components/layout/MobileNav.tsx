import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { NavContent } from './NavContent';
import { useState } from 'react';

export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden flex items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-none">
          <NavContent onItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};