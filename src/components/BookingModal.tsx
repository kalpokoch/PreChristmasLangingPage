import { useState } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const checkExistingBooking = async (email: string, phone: string) => {
    const emailQuery = query(
      collection(db, 'bookings'),
      where('email', '==', email),
      where('status', '==', 'confirmed')
    );
    const phoneQuery = query(
      collection(db, 'bookings'),
      where('phone', '==', phone),
      where('status', '==', 'confirmed')
    );

    const [emailSnapshot, phoneSnapshot] = await Promise.all([
      getDocs(emailQuery),
      getDocs(phoneQuery)
    ]);

    return !emailSnapshot.empty || !phoneSnapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate phone number
      if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        throw new Error('Please enter a valid 10-digit Indian mobile number');
      }

      // Check if user already has a booking
      const hasExistingBooking = await checkExistingBooking(formData.email, formData.phone);
      if (hasExistingBooking) {
        throw new Error('You have already booked a ticket with this email or phone number');
      }

      // Create pending booking entry
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        ...formData,
        status: 'pending',
        amount: 200,
        currency: 'INR',
        createdAt: new Date().toISOString(),
        eventDate: '2025-12-20',
        eventTime: '6:00 PM - 10:00 PM'
      });

      // Create Razorpay order
      const orderResponse = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 200,
          bookingId: bookingRef.id,
          ...formData
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NextGen Brothers',
        description: 'Pre-Christmas Musical Night Ticket',
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/.netlify/functions/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingRef.id
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert('Booking confirmed! Check your email for the ticket.');
              onClose();
              setFormData({ name: '', email: '', phone: '' });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
            console.error(err);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#FF6B5A'
        },
        modal: {
          ondismiss: async () => {
            // User closed payment modal - remove pending entry
            try {
              await fetch('/.netlify/functions/cancel-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: bookingRef.id })
              });
            } catch (err) {
              console.error('Error canceling booking:', err);
            }
            setLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-black text-black mb-2">Book Your Ticket</h2>
        <p className="text-sm text-gray-600 mb-6">
          Pre-Christmas Musical Night | Dec 20, 6-10 PM | ₹200
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-black mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-coral-primary"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-coral-primary"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-bold text-black mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[6-9][0-9]{9}"
              className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-coral-primary"
              placeholder="10-digit mobile number"
            />
          </div>

          <p className="text-xs text-gray-600">
            * One ticket per person. You'll receive your ticket via email with a QR code.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-black text-white font-bold uppercase tracking-wide hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Pay ₹200 & Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
