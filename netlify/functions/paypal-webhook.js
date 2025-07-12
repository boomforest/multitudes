// Save this as: netlify/functions/paypal-webhook.js

import { createClient } from '@supabase/supabase-js'

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Parse the PayPal webhook data
    const payload = JSON.parse(event.body)
    
    console.log('PayPal webhook received:', payload.event_type)
    
    // Only handle completed payments
    if (payload.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const payment = payload.resource
      const amount = parseFloat(payment.amount.value)
      const userId = payment.custom_id // This will be the user's ID
      
      // Calculate DOV tokens ($1 = 1 DOV)
      const dovTokens = amount
      
      console.log(`Payment: ${amount} -> ${dovTokens} DOV for user ${userId}`)
      
      if (userId) {
        // Initialize Supabase client
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY
        )
        
        // Update user's DOV balance
        const { data, error } = await supabase
          .from('profiles')
          .select('dov_balance, username')
          .eq('id', userId)
          .single()
        
        if (error) {
          console.error('Error finding user:', error)
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'User not found' })
          }
        }
        
        // Add tokens to existing balance
        const newBalance = (data.dov_balance || 0) + dovTokens
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ dov_balance: newBalance })
          .eq('id', userId)
        
        if (updateError) {
          console.error('Error updating balance:', updateError)
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Database update failed' })
          }
        }
        
        console.log(`SUCCESS: Added ${dovTokens} DOV to ${data.username}. New balance: ${newBalance}`)
        
        // Optional: Log the transaction
        await supabase
          .from('transactions')
          .insert([{
            user_id: userId,
            type: 'purchase',
            amount: dovTokens,
            token_type: 'DOV',
            paypal_payment_id: payment.id,
            usd_amount: amount
          }])
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    }
    
  } catch (error) {
    console.error('Webhook error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    }
  }
}
