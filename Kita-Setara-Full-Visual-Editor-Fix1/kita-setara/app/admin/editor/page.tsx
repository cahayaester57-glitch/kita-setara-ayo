import {redirect} from 'next/navigation';
import VisualEditor from '@/components/VisualEditor';
import {requireAdmin} from '@/lib/admin-auth';
export const dynamic='force-dynamic';
export default async function Page(){const gate=await requireAdmin();if(!gate.ok)redirect('/admin/login');return <VisualEditor/>}
