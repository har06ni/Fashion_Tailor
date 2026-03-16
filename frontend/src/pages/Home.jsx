import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Plus, Package, CheckCircle } from 'lucide-react';
import SMSModal from '../components/SMSModal';

const Home = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, order: null, messageText: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders?status=Stitching');
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const handleFinishClick = (order) => {
        const message = `Hello! Your stitching order is completed.
You can visit the shop and collect your clothes.

– Fashion Tailor
MariMuthu
9894142906`;
        setModalConfig({
            isOpen: true,
            order,
            messageText: message
        });
    };

    const confirmFinish = async (customMessage) => {
        const { order } = modalConfig;
        try {
            await axios.patch(`/api/orders/${order._id}/status`, { 
                status: 'Ready to Deliver',
                customSMS: customMessage 
            });
            setModalConfig({ isOpen: false, order: null, messageText: '' });
            fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const skipFinishSMS = async () => {
        const { order } = modalConfig;
        try {
            await axios.patch(`/api/orders/${order._id}/status`, { 
                status: 'Ready to Deliver',
                skipSMS: true
            });
            setModalConfig({ isOpen: false, order: null, messageText: '' });
            fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Active Orders</h1>
                    <p style={{ color: 'var(--text-muted)' }}>You have {orders.length} orders in stitching</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/add-customer')} style={{ padding: '1rem 2rem' }}>
                    <Plus size={20} />
                    <span>New Customer</span>
                </button>
            </div>

            <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1rem 1.5rem', marginBottom: '2rem' }}>
                <Search size={22} color="var(--primary)" />
                <input
                    type="text"
                    placeholder="Search by ID, Name or Phone..."
                    className="btn-outline"
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.5rem', outline: 'none', fontSize: '1.1rem' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Shirts</th>
                            <th>Pants</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(o =>
                            o.customer && (
                                o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
                                o.customer.phone.includes(search) ||
                                (o.customer.customerId && o.customer.customerId.toLowerCase().includes(search.toLowerCase()))
                            )
                        ).map(order => (
                            <tr 
                                key={order._id} 
                                onClick={() => navigate(`/order/${order._id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{order.customer.customerId}</td>
                                <td>
                                    <div style={{ fontWeight: '600' }}>{order.customer.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.customer.email || 'No Email'}</div>
                                </td>
                                <td>{order.customer.phone}</td>
                                <td align="center"><span style={{ background: 'var(--secondary-gradient)', padding: '4px 10px', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}>{order.counts.shirtsCount}</span></td>
                                <td align="center"><span style={{ background: 'var(--primary-gradient)', padding: '4px 10px', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}>{order.counts.pantsCount}</span></td>
                                <td>
                                    <div style={{ fontWeight: '600' }}>{new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Priority</div>
                                </td>
                                <td><span className="status-badge status-stitching">{order.status}</span></td>
                                <td onClick={e => e.stopPropagation()}>
                                    <button className="btn btn-outline" onClick={() => handleFinishClick(order)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                        <CheckCircle size={14} /> Finish
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No active stitching orders found.</p>
                    </div>
                )}
            </div>

            <SMSModal
                isOpen={modalConfig.isOpen}
                onClose={skipFinishSMS}
                onSend={confirmFinish}
                initialMessage={modalConfig.messageText}
                customerName={modalConfig.order?.customer?.name}
                phoneNumber={modalConfig.order?.customer?.phone}
            />
        </div>
    );
};

export default Home;
