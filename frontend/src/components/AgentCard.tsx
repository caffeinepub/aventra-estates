import { Phone, Mail, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentCardProps {
  name?: string;
  email?: string;
  phone?: string;
  isLoading?: boolean;
}

const DEFAULT_CONTACT = {
  name: 'Aventra Estates',
  phone1: '+917020271267',
  phone2: '+919535511171',
  email: 'aventraestate@gmail.com',
};

export default function AgentCard({ name, email, phone, isLoading }: AgentCardProps) {
  const displayName = name || DEFAULT_CONTACT.name;
  const displayEmail = email || DEFAULT_CONTACT.email;
  const displayPhone = phone || DEFAULT_CONTACT.phone1;

  const whatsappNumber = (phone || DEFAULT_CONTACT.phone1).replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-3 bg-muted rounded w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-9 bg-muted rounded" />
          <div className="h-9 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-card-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">Property Agent</p>
        </div>
      </div>

      <div className="space-y-2">
        <a href={`tel:${displayPhone}`} className="block">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-sm">{displayPhone}</span>
          </Button>
        </a>

        {/* Show second number if using default */}
        {!phone && (
          <a href={`tel:${DEFAULT_CONTACT.phone2}`} className="block">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm">{DEFAULT_CONTACT.phone2}</span>
            </Button>
          </a>
        )}

        <a href={`mailto:${displayEmail}`} className="block">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-sm truncate">{displayEmail}</span>
          </Button>
        </a>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button size="sm" className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">Chat on WhatsApp</span>
          </Button>
        </a>
      </div>
    </div>
  );
}
