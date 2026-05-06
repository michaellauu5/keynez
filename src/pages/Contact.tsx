import { useState } from 'react';
import { z } from 'zod';
import { Mail, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  message: z.string().trim().min(1, 'Message is required').max(5000),
});

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse({ name, email, message });
    if (!parsed.success) {
      toast({
        title: parsed.error.issues[0]?.message ?? 'Invalid input',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Thanks — we will be in touch shortly.' });
      setName('');
      setEmail('');
      setMessage('');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container max-w-3xl px-4 md:px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get in touch</h1>
          <p className="text-lg text-muted-foreground">
            Questions, feedback, partnership ideas — we'd love to hear from you.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:hello@keynez.com"
            className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted transition-colors"
          >
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">hello@keynez.com</div>
            </div>
          </a>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4 opacity-60">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">WhatsApp</div>
              <div className="font-medium">Coming soon</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              rows={6}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      </div>
    </Layout>
  );
}