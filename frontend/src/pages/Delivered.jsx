import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck } from 'lucide-react';

const Delivered = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders?status=Delivered');
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Delivered History</h1>
                <p style={{ color: 'var(--text-muted)' }}>A permanent archive of all completed and delivered orders.</p>
            </div>

            <div className="card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Order Details</th>
                            <th>Delivered On</th>
                            <th>Payment</th>
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
                                <td style={{ color: 'var(--primary)' }}>
                                    {order.counts.shirtsCount} Shirt(s), {order.counts.pantsCount} Pant(s)
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{new Date(order.updatedAt).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Successfully Delivered</div>
                                </td>
                                <td>
                                    <span style={{
                                        background: 'var(--secondary-gradient)',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}>
                                        {order.payment.balancePaidMethod || order.payment.method}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <Truck size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No delivery history found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Delivered;
