"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AdminLayout from "@/components/AdminLayout";
import {
  PageShell, PageHeader, ErrorBox, Badge,
  Table, Thead, Th, Tbody, Tr, Td, EmptyState,
  BtnGhost, BtnDanger,
} from "@/components/AdminUI";
import { api, loadToken, type ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function UsersPage() {
  const { user, loading, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [err, setErr] = useState<string | null>(null);

  function reload() {
    api.get<User[]>("/users", loadToken()!).then(setUsers).catch((e: ApiError) => setErr(e.detail));
  }
  useEffect(() => { if (user) reload(); }, [user]);

  async function toggleActive(u: User) {
    try {
      await api.patch(`/users/${u.id}`, { is_active: !u.is_active }, loadToken()!);
      reload();
    } catch (e) {
      setErr((e as ApiError).detail);
    }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await api.delete(`/users/${id}`, loadToken()!);
      reload();
    } catch (e) {
      setErr((e as ApiError).detail);
    }
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Cargando...</div>;
  if (!user) return null;

  return (
    <AdminLayout user={user} onLogout={logout}>
      <PageShell>
        <PageHeader
          title="Usuarios"
          subtitle={`${users.length} usuario${users.length !== 1 ? "s" : ""} registrados`}
        />

        <ErrorBox message={err} />

        <Table>
          <Thead>
            <Th>Usuario</Th>
            <Th>Email</Th>
            <Th>Rol</Th>
            <Th>Estado</Th>
            <Th />
          </Thead>
          <Tbody>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "#8B0000" }}
                    >
                      {(u.full_name ?? u.username).split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{u.full_name ?? "—"}</div>
                      <div className="text-xs text-gray-400">@{u.username}</div>
                    </div>
                  </div>
                </Td>
                <Td muted>{u.email}</Td>
                <Td>
                  <Badge color={u.role === "admin" ? "red" : "blue"}>{u.role}</Badge>
                </Td>
                <Td>
                  <Badge color={u.is_active ? "green" : "gray"}>
                    {u.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <BtnGhost onClick={() => toggleActive(u)}>
                      <i className={`fa-solid ${u.is_active ? "fa-ban" : "fa-circle-check"} text-xs`} />
                      {u.is_active ? "Desactivar" : "Activar"}
                    </BtnGhost>
                    <BtnDanger onClick={() => remove(u.id)}>
                      <i className="fa-solid fa-trash text-xs" /> Eliminar
                    </BtnDanger>
                  </div>
                </Td>
              </Tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5}><EmptyState message="Sin usuarios" /></td></tr>
            )}
          </Tbody>
        </Table>
      </PageShell>
    </AdminLayout>
  );
}
