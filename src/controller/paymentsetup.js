// // services/paymentService.js
// const db = require('../config/paymentdb');
// const { v4: uuidv4 } = require('uuid');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// class PaymentService { 
//   static async createPayment(paymentData) {
//     const client = await db.pool.connect();
    
//     try {
//       await client.query('BEGIN');
      
//       const paymentId = `PAY-${uuidv4()}`;
      
//       // Create Stripe PaymentIntent
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(paymentData.amount * 100), // Convert to cents
//         currency: paymentData.currency,
//         payment_method_types: ['card', 'upi'],
//         metadata: {
//           payment_id: paymentId,
//         },
//         automatic_payment_methods: {
//           enabled: true,
//           allow_redirects: 'always',
//         },
//       });

//       // Insert into payments table
//       const query = `
//         INSERT INTO payments (
//           payment_id, 
//           stripe_payment_intent_id, 
//           amount, 
//           currency, 
//           status,
//           customer_email,
//           customer_name,
//           metadata
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//         RETURNING *
//       `;

//       const values = [
//         paymentId,
//         paymentIntent.id,
//         paymentData.amount,
//         paymentData.currency,
//         'pending',
//         paymentData.email,
//         paymentData.name,
//         paymentData.metadata || {}
//       ];

//       const result = await client.query(query, values);
//       await client.query('COMMIT');

//       return {
//         payment: result.rows[0],
//         clientSecret: paymentIntent.client_secret
//       };
//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   static async confirmPayment(stripeEvent) {
//     const client = await db.pool.connect();
    
//     try {
//       await client.query('BEGIN');

//       const paymentIntent = stripeEvent.data.object;
//       const status = this.mapStripeStatus(paymentIntent.status);
//       const paymentMethod = paymentIntent.payment_method_types[0];

//       const query = `
//         UPDATE payments 
//         SET 
//           status = $1, 
//           payment_method = $2,
//           metadata = jsonb_set(metadata, '{stripe_event}', $3)
//         WHERE stripe_payment_intent_id = $4
//         RETURNING *
//       `;

//       const values = [
//         status,
//         paymentMethod,
//         JSON.stringify(stripeEvent),
//         paymentIntent.id
//       ];

//       const result = await client.query(query, values);
//       await client.query('COMMIT');

//       return result.rows[0];
//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   static async getPayment(paymentId) {
//     const query = 'SELECT * FROM payments WHERE payment_id = $1';
//     const result = await db.query(query, [paymentId]);
//     return result.rows[0];
//   }

//   static mapStripeStatus(stripeStatus) {
//     const statusMap = {
//       'succeeded': 'completed',
//       'processing': 'processing',
//       'requires_payment_method': 'pending',
//       'requires_confirmation': 'pending',
//       'requires_action': 'pending',
//       'canceled': 'cancelled',
//       'failed': 'failed'
//     };
//     return statusMap[stripeStatus] || 'pending';
//   }
// }

// module.exports = PaymentService;