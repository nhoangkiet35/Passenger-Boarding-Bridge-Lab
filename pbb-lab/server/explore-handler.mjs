import { handleAdmin } from './admin-handler.mjs';
export function handleExplore(request) {
 if (request.method === 'GET') return new Response(null,{status:303,headers:{Location:'/admin/explore','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
 return handleAdmin(request);
}
