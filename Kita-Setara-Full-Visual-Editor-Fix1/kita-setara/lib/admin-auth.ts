import { createSupabaseServerClient } from './supabase-server';
import { createClient } from '@supabase/supabase-js';
export async function requireAdmin(){
 const auth=await createSupabaseServerClient();
 const {data:{user},error}=await auth.auth.getUser();
 if(error||!user) return {ok:false as const,status:401,user:null};
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data}=await admin.from('site_admins').select('user_id').eq('user_id',user.id).maybeSingle();
 if(!data) return {ok:false as const,status:403,user:null};
 return {ok:true as const,status:200,user};
}
