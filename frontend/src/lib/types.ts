export type Role = "admin" | "vendedor" | "cliente";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type Category = "res" | "cerdo" | "pollo" | "embutidos" | "pescado";

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  old_price: number | null;
  image_url: string | null;
  rating: number;
  review_count: number;
  discount: string | null;
  tags: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pendiente" | "confirmado" | "en_camino" | "entregado" | "cancelado";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string | null;
  notes: string | null;
  status: OrderStatus;
  total: number;
  channel: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface DashboardStats {
  products_count: number;
  products_active: number;
  orders_total: number;
  orders_pending: number;
  orders_today: number;
  sales_total: number;
  sales_today: number;
  users_count: number;
}
