import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useCreateEnquiry } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface EnquiryFormProps {
  propertyId: bigint;
  propertyTitle?: string;
}

export default function EnquiryForm({ propertyId, propertyTitle }: EnquiryFormProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createEnquiry = useCreateEnquiry();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await createEnquiry.mutateAsync({
        propertyId,
        senderName: form.name,
        senderPhone: form.phone,
        senderEmail: form.email,
        message: form.message,
        timestamp: BigInt(Date.now()),
      });
      toast.success('Enquiry sent successfully! The agent will contact you shortly.');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      toast.error('Failed to send enquiry. Please try again.');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-serif font-semibold text-foreground text-lg mb-1">Send Enquiry</h3>
      {propertyTitle && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-1">About: {propertyTitle}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="enq-name" className="text-sm">Full Name *</Label>
          <Input
            id="enq-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="enq-phone" className="text-sm">Phone Number *</Label>
          <Input
            id="enq-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="enq-email" className="text-sm">Email Address *</Label>
          <Input
            id="enq-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="enq-message" className="text-sm">Message *</Label>
          <Textarea
            id="enq-message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="I'm interested in this property..."
            rows={3}
            className={errors.message ? 'border-destructive' : ''}
          />
          {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
        </div>
        <button
          type="submit"
          disabled={createEnquiry.isPending}
          className="w-full gold-gradient text-obsidian font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {createEnquiry.isPending ? (
            <span className="animate-pulse">Sending...</span>
          ) : (
            <><Send size={16} /> Send Enquiry</>
          )}
        </button>
      </form>
    </div>
  );
}
