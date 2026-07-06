import MenusPageView from '@/modules/menus/views/ui/menus-page-view';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Menus',
  description: 'Manage your restaurant menus.',
};

export default async function Page() {
return(<MenusPageView/>)
}
