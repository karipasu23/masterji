import axios from 'axios'
import React from 'react'
import { useLogin } from '../context/LoginContext'

function PaymentButton({ amount }) {
    const { user } = useLogin();

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            const orderResponse = await axios.post(`${process.env.REACT_APP_BACKEND_API}/api/payment/create-order`, { amount: amount });
            const { orederId } = orderResponse.data.orederId;

            const options = {
                key: 'rzp_test_AyMdIWw0Bommab',
                amount: amount * 100,
                currency: "INR",
                name: "Masterji",
                description: "Payment for your services",

                orderId: orederId,
                handler: async (response) => {
                    const paymentData = {
                        orederId,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                    };

                    const result = await axios.post(`${process.env.REACT_APP_BACKEND_API}/api/payment/verify-payment`);
                    if (result.data.success) {
                        alert('Payment successful!');
                    } else {
                        alert('Payment verification failed. Please try again.');
                    }

                },
                prefill: {
                    name: user?.username || "Customer Name",
                    email: user?.email || "customer.email@example.com",
                    contact: user?.phone || "9999999999",
                },
                notes: {
                    address: "Customer address",
                },
                theme: {
                    color: "#F37254",
                },

            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Error creating payment order:', error);
            alert('There was an error creating the payment order. Please try again.');
        }
    }

    return (
        <div onClick={handlePayment} className="px-[10px] flex h-[50px] w-full items-center justify-center rounded-md border-2 bg-white text-black border-[#c8a165] ml-[10px] text-base font-medium hover:text-white hover:bg-[#c8a165] hover:transition hover:duration-200 hover:ease-in-out">
            <button >Buy</button>
        </div>
    )
}

export default PaymentButton