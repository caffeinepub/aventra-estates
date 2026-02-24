import React from 'react';
import { Link } from '@tanstack/react-router';
import { ShieldX, Home } from 'lucide-react';

export default function AccessDeniedScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full border-2 border-destructive/30 flex items-center justify-center mb-6">
        <ShieldX size={40} className="text-destructive/60" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        You don't have permission to access this page. This area is restricted to authorized users only.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 gold-gradient text-obsidian font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-all"
      >
        <Home size={16} /> Back to Home
      </Link>
    </div>
  );
}
