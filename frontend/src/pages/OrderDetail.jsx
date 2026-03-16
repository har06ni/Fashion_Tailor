import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Ruler, CreditCard, Image as ImageIcon, X, Maximize2, MessageSquare, CheckCircle } from 'lucide-react';
import SMSModal from '../components/SMSModal';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, messageText: '', action: null, paymentMethod: 'Cash' });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/api/orders/${id}`);
                setOrder(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order detail:', err);
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    const handleReminderClick = () => {
        const message = `Hello! This is a reminder from Fashion Tailor. Your stitching order is ready for pickup.
        
Total Amount: ₹${order.payment.totalAmount}
Advance Paid: ₹${order.payment.advancePaid}
Balance Amount: ₹${order.payment.balanceAmount}

– Fashion Tailor
MariMuthu
9894142906`;
        setModalConfig({
            isOpen: true,
            messageText: message,
            action: 'reminder'
        });
    };

    const handleFinishClick = () => {
        const message = `Hello! Your stitching order is completed.
You can visit the shop and collect your clothes.

– Fashion Tailor
MariMuthu
9894142906`;
        setModalConfig({
            isOpen: true,
            messageText: message,
            action: 'finish'
        });
    };

    const handleDeliverClick = () => {
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
            messageText: message,
            action: 'deliver',
            paymentMethod: method
        });
    };

    const handleSendSMS = async (customMessage) => {
        try {
            const currentAction = modalConfig.action;
            if (currentAction === 'reminder') {
                await axios.post('/api/orders/send-custom-sms', {
                    phone: order.customer.phone,
                    message: customMessage
                });
            } else if (currentAction === 'finish') {
                await axios.patch(`/api/orders/${id}/status`, { 
                    status: 'Ready to Deliver',
                    customSMS: customMessage 
                });
            } else if (currentAction === 'deliver') {
                await axios.patch(`/api/orders/${id}/deliver`, { 
                    balancePaidMethod: modalConfig.paymentMethod,
                    customSMS: customMessage
                });
            }
            setModalConfig({ isOpen: false, messageText: '', action: null });
            if (currentAction === 'finish') navigate('/ready');
            if (currentAction === 'deliver') navigate('/delivered');
        } catch (err) {
            console.error('Error in handleSendSMS:', err);
        }
    };

    const handleSkipSMS = async () => {
        try {
            const currentAction = modalConfig.action;
            if (currentAction === 'finish') {
                await axios.patch(`/api/orders/${id}/status`, { 
                    status: 'Ready to Deliver',
                    skipSMS: true
                });
            } else if (currentAction === 'deliver') {
                await axios.patch(`/api/orders/${id}/deliver`, { 
                    balancePaidMethod: modalConfig.paymentMethod,
                    skipSMS: true
                });
            }
            setModalConfig({ isOpen: false, messageText: '', action: null });
            if (currentAction === 'finish') navigate('/ready');
            if (currentAction === 'deliver') navigate('/delivered');
        } catch (err) {
            console.error('Error in handleSkipSMS:', err);
        }
    };

    if (loading) return <div className="fade-in" style={{ padding: '2rem', textAlign: 'center' }}>Loading order details...</div>;
    if (!order) return <div className="fade-in" style={{ padding: '2rem', textAlign: 'center' }}>Order not found.</div>;

    const { customer, measurements, counts, payment, createdAt, updatedAt } = order;

    return (
        <div className="fade-in" style={{ paddingBottom: '5rem' }}>
            {/* Header & Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    className="btn btn-outline" 
                    onClick={() => {
                        if (order.status === 'Stitching') navigate('/');
                        else if (order.status === 'Ready to Deliver') navigate('/ready');
                        else navigate('/delivered');
                    }} 
                    style={{ padding: '0.5rem 1rem' }}
                >
                    <ArrowLeft size={18} /> Back to {order.status === 'Stitching' ? 'Home' : (order.status === 'Ready to Deliver' ? 'Ready for Pickup' : 'Delivered History')}
                </button>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary)', margin: 0 }}>
                    Order Details: {order.orderId}
                    <span style={{ 
                        fontSize: '1rem', 
                        marginLeft: '1rem', 
                        verticalAlign: 'middle', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        background: order.status === 'Stitching' ? 'var(--primary)' : (order.status === 'Ready to Deliver' ? 'var(--accent-gold)' : 'var(--success)'), 
                        color: 'white' 
                    }}>
                        {order.status}
                    </span>
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                
                {/* Section 1: Customer Details */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        <User size={20} /> Customer Details
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer ID</label><div style={{ fontWeight: 600 }}>{customer.customerId}</div></div>
                        <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Name</label><div style={{ fontWeight: 600 }}>{customer.name}</div></div>
                        <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Phone Number</label><div style={{ fontWeight: 600 }}>{customer.phone}</div></div>
                        <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Age</label><div style={{ fontWeight: 600 }}>{customer.age || 'N/A'}</div></div>
                        <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</label><div style={{ fontWeight: 600 }}>{customer.email || 'N/A'}</div></div>
                        <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Order Registered</label><div style={{ fontWeight: 600 }}>{new Date(createdAt).toLocaleDateString()}</div></div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Section 2: Measurement Summary */}
                    <div className="card">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: order.status === 'Stitching' ? 'var(--primary)' : '#d97706', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                            <Ruler size={20} /> Order Inventory
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div className="measurement-box" style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '1rem' }}><label>Pants</label><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{counts.pantsCount}</div></div>
                            <div className="measurement-box" style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '1rem' }}><label>Shirts</label><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{counts.shirtsCount}</div></div>
                            <div className="measurement-box" style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '1rem' }}><label>Full Slv</label><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{counts.fullSleeveCount}</div></div>
                            <div className="measurement-box" style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '1rem' }}><label>Half Slv</label><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{counts.halfSleeveCount}</div></div>
                        </div>
                    </div>

                    {/* Pant Measurements & Images */}
                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', color: '#d97706' }}>Pant Dimensions</h2>
                        
                        {/* Row 1: 1-5 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="measurement-box">
                                    <label>{i}</label>
                                    <div style={{ padding: '0.5rem', fontWeight: 600 }}>{measurements.pants[`pantMeasurement${i}`] || '-'}</div>
                                </div>
                            ))}
                        </div>

                        {/* Row 2: 6(a), 6(b) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                            {['6a', '6b'].map(i => (
                                <div key={i} className="measurement-box">
                                    <label>{i === '6a' ? '6(a)' : '6(b)'}</label>
                                    <div style={{ padding: '0.5rem', fontWeight: 600 }}>{measurements.pants[`pantMeasurement${i}`] || '-'}</div>
                                </div>
                            ))}
                        </div>

                        {/* Row 3: 7, 8, 9(a), 9(b) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                            {[7, 8].map(i => (
                                <div key={i} className="measurement-box">
                                    <label>{i}</label>
                                    <div style={{ padding: '0.5rem', fontWeight: 600 }}>{measurements.pants[`pantMeasurement${i}`] || '-'}</div>
                                </div>
                            ))}
                            {['9a', '9b'].map(i => (
                                <div key={i} className="measurement-box">
                                    <label>{i === '9a' ? '9(a)' : '9(b)'}</label>
                                    <div style={{ padding: '0.5rem', fontWeight: 600 }}>{measurements.pants[`pantMeasurement${i}`] || '-'}</div>
                                </div>
                            ))}
                        </div>

                        {measurements.pants.comments && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Pant Comments</label>
                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginTop: '0.5rem' }}>{measurements.pants.comments}</div>
                            </div>
                        )}

                        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ImageIcon size={18} /> PANT CLOTH IMAGES
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {measurements.pants.images && measurements.pants.images.length > 0 ? (
                                measurements.pants.images.map((img, idx) => (
                                    <div key={idx} className="image-preview" onClick={() => setSelectedImage(img)} style={{ cursor: 'pointer', width: '100px', height: '100px', position: 'relative' }}>
                                        <img src={img} alt={`Pant material ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, padding: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', borderBottomRightRadius: '8px' }}><Maximize2 size={12} /></div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No images captured.</div>
                            )}
                        </div>
                    </div>

                    {/* Shirt Measurements & Images */}
                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', color: '#db2777' }}>Shirt Dimensions</h2>
                        <div className="measurement-grid" style={{ marginBottom: '2rem' }}>
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div key={i + 1} className="measurement-box">
                                    <label>{i + 1}</label>
                                    <div style={{ padding: '0.5rem', fontWeight: 600 }}>{measurements.shirts[`m${i + 1}`] || '-'}</div>
                                </div>
                            ))}
                        </div>

                        {measurements.shirts.comments && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Shirt Comments</label>
                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginTop: '0.5rem' }}>{measurements.shirts.comments}</div>
                            </div>
                        )}

                        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ImageIcon size={18} /> SHIRT CLOTH IMAGES
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {measurements.shirts.images && measurements.shirts.images.length > 0 ? (
                                measurements.shirts.images.map((img, idx) => (
                                    <div key={idx} className="image-preview" onClick={() => setSelectedImage(img)} style={{ cursor: 'pointer', width: '100px', height: '100px', position: 'relative' }}>
                                        <img src={img} alt={`Shirt material ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, padding: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', borderBottomRightRadius: '8px' }}><Maximize2 size={12} /></div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No images captured.</div>
                            )}
                        </div>
                    </div>

                    {/* Style & Pockets */}
                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem' }}>Style & Options</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Sleeve & Fit</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <div className="status-badge status-ready" style={{ fontSize: '0.85rem' }}>{measurements.options.sleeve}</div>
                                    <div className="status-badge status-ready" style={{ fontSize: '0.85rem' }}>{measurements.options.fit}</div>
                                </div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Selected Pockets</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {measurements.options.pockets.length > 0 ? (
                                        measurements.options.pockets.map(p => <div key={p} className="status-badge status-stitching" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{p}</div>)
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>None</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Payment Details */}
                    <div className="card" style={{ border: order.status === 'Ready to Deliver' ? '2px solid var(--accent-gold)' : '2px solid var(--success-light)' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: order.status === 'Ready to Deliver' ? 'var(--accent-gold)' : 'var(--success)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                            <CreditCard size={20} /> Payment Details {order.status === 'Ready to Deliver' && '(PENDING)'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                            <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Amount</label><h3 style={{ color: 'var(--primary)', margin: 0 }}>₹{payment.totalAmount}</h3></div>
                            <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Advance Paid</label><h3 style={{ color: 'var(--success)', margin: 0 }}>₹{payment.advancePaid}</h3></div>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{order.status === 'Ready to Deliver' ? 'Balance to Pay' : 'Balance Paid'}</label>
                                <h3 style={{ color: 'var(--accent-gold)', margin: 0 }}>₹{payment.balanceAmount}</h3>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <div><label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Payment Method</label><div style={{ fontWeight: 600 }}>{payment.balancePaidMethod || payment.method}</div></div>
                            <div style={{ textAlign: 'right' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{order.status === 'Ready to Deliver' ? 'Expected Delivery' : 'Delivered Date'}</label>
                                <div style={{ fontWeight: 600, color: order.status === 'Ready to Deliver' ? 'var(--accent-gold)' : 'var(--success)' }}>
                                    {new Date(order.status === 'Ready to Deliver' ? order.deliveryDate : updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons for Different Statuses */}
                    {order.status === 'Stitching' && (
                        <div style={{ marginTop: '1rem' }}>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem' }} onClick={handleFinishClick}>
                                <CheckCircle size={22} /> Done Stitching
                            </button>
                        </div>
                    )}

                    {order.status === 'Ready to Deliver' && (
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                            <button className="btn btn-outline" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleReminderClick}>
                                <MessageSquare size={20} /> Send Reminder Message
                            </button>
                            <button className="btn btn-primary" style={{ flex: 2, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }} onClick={handleDeliverClick}>
                                <CheckCircle size={22} /> Mark as Delivered
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Full Screen Image Preview Modal */}
            {selectedImage && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }} onClick={() => setSelectedImage(null)}>
                    <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setSelectedImage(null)}><X size={32} /></button>
                    <img id="enlarged-img" src={selectedImage} alt="Enlarged cloth" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px' }} />
                </div>
            )}

            <SMSModal
                isOpen={modalConfig.isOpen}
                onClose={handleSkipSMS}
                onSend={handleSendSMS}
                initialMessage={modalConfig.messageText}
                customerName={customer.name}
                phoneNumber={customer.phone}
            />
        </div>
    );
};

export default OrderDetail;
