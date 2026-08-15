/** La sesion del admin ahora vive en un store de Zustand (src/lib/auth.ts), no
 * en React Context. Este archivo se conserva para no tener que tocar el
 * import de cada pagina de /admin/*. */
export { useAdminAuth } from "@/lib/auth";
