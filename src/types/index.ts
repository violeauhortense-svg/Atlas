export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  type: 'generator' | 'template' | 'calculator' | 'checklist' | 'saas' | 'other'
  created_at: string
  updated_at: string
  config: Record<string, any>
}

export interface Order {
  id: string
  product_id: string
  customer_email: string
  customer_name: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  stripe_payment_intent_id: string
  created_at: string
  updated_at: string
}

export interface Dashboard {
  total_revenue: number
  total_orders: number
  total_products: number
  recent_orders: Order[]
  products: Product[]
}

export interface User {
  id: string
  email: string
  created_at: string
}
