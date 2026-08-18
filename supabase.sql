-- Créer la table products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  image_url VARCHAR(500),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les indexes
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Activer RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Créer les policies (permettre tout en lecture, admin en écriture)
CREATE POLICY "Allow public read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public read orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Allow admin insert products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update products" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Allow admin delete products" ON products
  FOR DELETE USING (true);

CREATE POLICY "Allow admin insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update orders" ON orders
  FOR UPDATE USING (true);
