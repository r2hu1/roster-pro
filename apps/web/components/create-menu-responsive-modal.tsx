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
import { DnDImageInput } from '@workspace/ui/components/dnd-image-input';
import { useSession } from '@/modules/providers/session-provider';
import api from '@/lib/axios';

export default function CreateMenuModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const {organization:org} = useSession();

  const qc = useQueryClient();

  async function handleCreate() {
    if (!name.trim()) {
      toast.error('Menu name is required');
      return;
    }

    setPending(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('isActive', 'false');
      formData.append('organizationId', org?.id ?? '');

      if (image) formData.append('image', image);

      const res = await api.post('/organization/menu', formData);

      if (res.data) {
        setOpen(false);
        setName('');
        setDescription('');
        setImage(null);
        toast.success('Added new menu in your restaurant!');
        qc.invalidateQueries({
          queryKey: ['all-menus', org?.id],
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.error || 'Failed to save changes', {
        description:
          error.response.data.message || 'If persists contact support',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
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
          <DnDImageInput onChange={(e) => setImage(e)} />

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
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button disabled={pending || !name.trim()} onClick={handleCreate}>
            Continue
            {pending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
