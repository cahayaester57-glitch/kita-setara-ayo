import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function createSupabaseServerClient(){
 const jar= cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll(){return jar.getAll()},setAll(values: { name: string; value: string; options: Parameters<typeof jar.set>[2] }[]){try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{}}}});
}
