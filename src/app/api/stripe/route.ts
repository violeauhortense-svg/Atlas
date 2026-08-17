import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'
import { createOrder } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, productId, customerEmail, customerName } = body

    if (!amount || !productId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const paymentIntent = await createPaymentIntent(
      amount,
      productId,
      customerEmail
    )

    await createOrder({
      product_id: productId,
      customer_email: customerEmail,
      customer_name: customerName,
      amount,
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    )
  }
}
