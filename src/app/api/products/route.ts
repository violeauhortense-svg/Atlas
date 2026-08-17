import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const product = {
      id: uuidv4(),
      name: body.name,
      description: body.description,
      price: body.price,
      type: body.type,
      image_url: body.image_url || null,
      config: body.config || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const result = await createProduct(product)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
