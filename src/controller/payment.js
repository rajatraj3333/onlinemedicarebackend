// const PaymentService = require('./paymentsetup');


// const Payment = {

//     async createpayment(req,res){

//         if (req.method !== 'POST') {
//             return res.status(405).json({ message: 'Method not allowed' });
//           }
//           try {
//             const { amount, currency, email, name, metadata } = req.body;
        
//             const result = await PaymentService.createPayment({
//               amount,
//               currency,
//               email,
//               name,
//               metadata
//             });
        
//             res.status(200).json({
//               paymentId: result.payment.payment_id,
//               clientSecret: result.clientSecret
//             });
//           } catch (error) {
//             console.error('Error creating payment:', error);
//             res.status(500).json({ message: 'Error creating payment' });
//           }
//     }
// }

// module.exports =Payment