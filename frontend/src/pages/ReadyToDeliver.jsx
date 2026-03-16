import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, CheckCircle } from 'lucide-react';
import SMSModal from '../components/SMSModal';

const ReadyToDeliver = () => {
    const [orders, setOrders] = useState([]);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, order: null, messageText: '', action: null });
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders?status=Ready to Deliver');
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const handleReminderClick = (order) => {
        const message = `Hello! This is a reminder from Fashion Tailor. Your stitching order is ready for pickup.
        
Total Amount: ₹${order.payment.totalAmount}
Advance Paid: ₹${order.payment.advancePaid}
Balance Amount: ₹${order.payment.balanceAmount}

– Fashion Tailor
MariMuthu
9894142906`;
        setModalConfig({
            isOpen: true,
            order,
            messageText: message,
            action: 'reminder'
        });
    };

    const handleDeliverClick = (order) => {
        const method = prompt('Select Balance Payment Method (Cash/UPI/Card)', 'Cash');
        if (!method) return;

        const message = `Hello! Your order has been successfully delivered.

Total Amount: ${order.payment.totalAmount}
Advance Paid: ${order.payment.advancePaid}
Balance Paid: ${order.payment.balanceAmount}

Thank you for choosing us!

– Fashion Tailor
MariMuthu
9894142906`;

        setModalConfig({
            isOpen: true,
            order: { ...order, paymentMethod: method },
            messageText: message,
            action: 'deliver'
        });
    };

    const handleSendSMS = async (customMessage) => {
        const { order, action } = modalConfig;
        try {
            if (action === 'reminder') {
                // Reminder doesn't update status, just sends SMS
                await axios.post('http://localhost:5000/api/orders/send-custom-sms', {
                    phone: order.customer.phone,
                    message: customMessage
                });
            } else if (action === 'deliver') {
                await axios.patch(`http://localhost:5000/api/orders/${order._id}/deliver`, { 
                    balancePaidMethod: order.paymentMethod,
                    customSMS: customMessage
                });
            }
            setModalConfig({ isOpen: false, order: null, messageText: '', action: null });
            fetchOrders();
        } catch (err) {
            console.error('Error in handleSendSMS:', err);
        }
    };

    const handleSkipSMS = async () => {
        const { order, action } = modalConfig;
        try {
            if (action === 'deliver') {
                await axios.patch(`http://localhost:5000/api/orders/${order._id}/deliver`, { 
                    balancePaidMethod: order.paymentMethod,
                    skipSMS: true
                });
            }
            setModalConfig({ isOpen: false, order: null, messageText: '', action: null });
            fetchOrders();
        } catch (err) {
            console.error('Error in handleSkipSMS:', err);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Ready for Pickup</h1>
                <p style={{ color: 'var(--text-muted)' }}>These orders are completed and waiting for the customer.</p>
            </div>

            <div className="card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Order Details</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => order && order.customer && (
                            <tr 
                                key={order._id} 
                                onClick={() => navigate(`/order/${order._id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td style={{ fontWeight: 600 }}>{order.customer.name}</td>
                                <td>{order.customer.phone}</td>
                                <td>
                                    <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                        {order.counts.shirtsCount} Shirt, {order.counts.pantsCount} Pant
                                    </div>
                                </td>
                                <td><span className="status-badge status-ready">Ready to Deliver</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                                        <button className="btn btn-outline" onClick={() => handleReminderClick(order)} style={{ padding: '0.6rem' }} title="Send Reminder">
                                            <MessageSquare size={18} color="var(--primary)" />
                                        </button>
                                        <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }} onClick={() => handleDeliverClick(order)}>
                                            <CheckCircle size={16} /> Confirm Delivery
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No orders are waiting for delivery.</p>
                    </div>
                )}
            </div>

            <SMSModal
                isOpen={modalConfig.isOpen}
                onClose={handleSkipSMS}
                onSend={handleSendSMS}
                initialMessage={modalConfig.messageText}
                customerName={modalConfig.order?.customer?.name}
                phoneNumber={modalConfig.order?.customer?.phone}
            />
        </div>
    );
};

export default ReadyToDeliver;
