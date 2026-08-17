import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(
  supabaseUrl!,
  supabaseAnonKey!
)

export const supabaseAdmin = createClient(
  supabaseUrl!,
  supabaseServiceRoleKey!
)

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProduct(product: any) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, products(name, price)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createOrder(order: any) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert([order])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDashboardData() {
  const productsPromise = supabase.from('products').select('*')
  const ordersPromise = supabase.from('orders').select('*')

  const [{ data: products }, { data: orders }] = await Promise.all([
    productsPromise,
    ordersPromise,
  ])

  const totalRevenue = (orders || []).reduce(
    (sum, order) => sum + (order.amount || 0),
    0
  )

  return {
    total_revenue: totalRevenue,
    total_orders: orders?.length || 0,
    total_products: products?.length || 0,
    recent_orders: (orders || []).slice(0, 10),
    products: products || [],
  }
}
