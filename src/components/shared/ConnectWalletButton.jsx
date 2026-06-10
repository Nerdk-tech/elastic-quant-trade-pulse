import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export default function ConnectWalletButton({ size = 'default', className = '' }) {
  
  const handleDirectRedirect = () => {
    // Sends the user instantly to the connect page without prompting a popup menu
    window.location.href = '/connect.html?wallet=Wallet';
  };

  return (
    <Button
      size={size}
      variant="outline"
      onClick={handleDirectRedirect}
      className={`border-primary/30 text-primary hover:bg-primary/10 gap-2 rounded-full ${className}`}
    >
      <Wallet className="w-3.5 h-3.5" />
      Connect Wallet
    </Button>
  );
}