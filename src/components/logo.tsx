'use client';

import { Church } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/context/settings-context';

export function Logo() {
  const { settings } = useSettings();

  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      {settings.logoUrl ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden">
          <Image
            src={settings.logoUrl}
            alt="Logo"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Church className="h-6 w-6" />
        </div>
      )}
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {settings.appName}
        </h1>
      </div>
    </Link>
  );
}
