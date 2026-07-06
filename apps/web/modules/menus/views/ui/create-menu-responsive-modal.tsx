'use client';

import { useState } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from '@workspace/ui/components/responsive-modal';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Loader } from '@workspace/ui/components/loader';
import api from '@/lib/axios';
import { CreateMenuSchema } from '@workspace/shared/schemas/menu/create';

export default function CreateMenuModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const qc = useQueryClient();

  function reset() {
    setName('');
    setDescription('');
  }

  async function handleCreate() {
    const parsed = CreateMenuSchema.safeParse({
      name: name.trim(),
      description: description.trim() || null,
      isActive: false,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Invalid input');
      return;
    }

    setPending(true);

    try {
      const res = await api.post('/organization/menu', parsed.data, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.data?.status === 'success') {
        setOpen(false);
        reset();
        toast.success('Menu added to your restaurant!');
        qc.invalidateQueries({ queryKey: ['menus'] });
      } else {
        throw new Error(res.data?.message || 'Failed to create menu');
      }
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const message = axiosError?.response?.data?.message
        || axiosError?.response?.data?.error
        || axiosError?.message
        || 'Failed to create menu';
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <ResponsiveModalTrigger>{children}</ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Drafting Menu</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Create a new menu, you can add items, categories, and more in it.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form
          className="grid gap-3 px-4 md:px-0"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="My Originals"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Label htmlFor="description">
            Description{' '}
            <span className="text-foreground/80 text-xs">Optional*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="A pure veg menu for..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>

        <ResponsiveModalFooter>
          <Button
            variant="secondary"
            size="lg"
            disabled={pending}
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button
size="lg"
            disabled={pending || !name.trim()} onClick={handleCreate}>
            Continue
            {pending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
