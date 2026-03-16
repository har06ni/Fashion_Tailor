import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Ruler, CreditCard, ChevronRight, CheckCircle, Camera, X } from 'lucide-react';
import SMSModal from '../components/SMSModal';

const AddCustomer = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        customer: { name: '', phone: '', age: '', email: '' },
        measurements: {
            pants: { m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '', m8: '', m9: '', m10: '', m11: '', comments: '', images: [] },
            shirts: { m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '', m8: '', m9: '', m10: '', m11: '', m12: '', m13: '', m14: '', m15: '', comments: '', images: [] },
            options: { sleeve: 'Full Sleeve', fit: 'Arrow', pockets: [] }
        },
        counts: { pantsCount: 1, shirtsCount: 1, fullSleeveCount: 0, halfSleeveCount: 0 },
        deliveryDate: '',
        payment: { totalAmount: '', advancePaid: '', balanceAmount: 0, method: 'Cash' }
    });
    const [modalConfig, setModalConfig] = useState({ isOpen: false, messageText: '' });

    const checkExistingCustomer = async (phone) => {
        if (phone.length === 10) {
            try {
                const res = await axios.get(`http://localhost:5000/api/customers?phone=${phone}`);
                if (res.data.length > 0) {
                    const cust = res.data[0];
                    setFormData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, name: cust.name, age: cust.age || '', email: cust.email || '' },
                        measurements: cust.lastMeasurements || prev.measurements
                    }));
                }
            } catch (err) {
                console.error('Error checking customer:', err);
            }
        }
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const calculateBalance = (total, advance) => {
        const balance = (parseFloat(total) || 0) - (parseFloat(advance) || 0);
        setFormData(prev => ({
            ...prev,
            payment: { ...prev.payment, balanceAmount: Math.max(0, balance) }
        }));
    };

    const handleOrderConfirm = () => {
        const message = `Hello! Your order has been successfully registered.

Total Amount: ${formData.payment.totalAmount}
Advance Paid: ${formData.payment.advancePaid}
Balance Amount: ${formData.payment.balanceAmount}
Delivery Date: ${new Date(formData.deliveryDate).toLocaleDateString()}

– Fashion Tailor
MariMuthu
9894142906`;

        setModalConfig({
            isOpen: true,
            messageText: message
        });
    };

    const confirmOrder = async (customMessage) => {
        try {
            await axios.post('http://localhost:5000/api/orders', {
                ...formData,
                customSMS: customMessage
            });
            setModalConfig({ isOpen: false, messageText: '' });
            navigate('/');
        } catch (err) {
            console.error('Error creating order:', err);
            alert('Failed to create order');
        }
    };

    const skipOrderSMS = async () => {
        try {
            await axios.post('http://localhost:5000/api/orders', {
                ...formData,
                skipSMS: true
            });
            setModalConfig({ isOpen: false, messageText: '' });
            navigate('/');
        } catch (err) {
            console.error('Error creating order:', err);
            alert('Failed to create order');
        }
    };

    const updateMeasurement = (type, key, value) => {
        setFormData(prev => ({
            ...prev,
            measurements: {
                ...prev.measurements,
                [type]: { ...prev.measurements[type], [key]: value }
            }
        }));
    };

    const togglePocket = (pocket) => {
        const current = formData.measurements.options.pockets;
        const updated = current.includes(pocket)
            ? current.filter(p => p !== pocket)
            : [...current, pocket];
        setFormData(prev => ({
            ...prev,
            measurements: {
                ...prev.measurements,
                options: { ...prev.measurements.options, pockets: updated }
            }
        }));
    };

    const handleImageUpload = (type, files) => {
        const currentImages = formData.measurements[type].images || [];
        if (currentImages.length + files.length > 5) {
            alert('Maximum 5 images allowed per section');
            return;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    measurements: {
                        ...prev.measurements,
                        [type]: {
                            ...prev.measurements[type],
                            images: [...(prev.measurements[type].images || []), reader.result]
                        }
                    }
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (type, index) => {
        setFormData(prev => ({
            ...prev,
            measurements: {
                ...prev.measurements,
                [type]: {
                    ...prev.measurements[type],
                    images: prev.measurements[type].images.filter((_, i) => i !== index)
                }
            }
        }));
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
                <div className={`status-badge ${step >= 1 ? 'status-ready' : 'status-stitching'}`} style={{ flex: 1, textAlign: 'center' }}>1. Customer Details</div>
                <div className={`status-badge ${step >= 2 ? 'status-ready' : 'status-stitching'}`} style={{ flex: 1, textAlign: 'center' }}>2. Measurements</div>
                <div className={`status-badge ${step >= 3 ? 'status-ready' : 'status-stitching'}`} style={{ flex: 1, textAlign: 'center' }}>3. Payment</div>
            </div>

            {step === 1 && (
                <div className="card fade-in">
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--primary)' }}>Customer Details</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Phone Number</label>
                            <input
                                type="text" placeholder="e.g. 9876543210" style={{ width: '100%' }}
                                value={formData.customer.phone}
                                onChange={(e) => {
                                    const phone = e.target.value.trim().replace(/\s/g, '');
                                    setFormData({ ...formData, customer: { ...formData.customer, phone } });
                                    checkExistingCustomer(phone);
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Full Name</label>
                            <input
                                type="text" placeholder="e.g. John Doe" style={{ width: '100%' }}
                                value={formData.customer.name}
                                onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, name: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Age</label>
                            <input
                                type="number" placeholder="25" style={{ width: '100%' }}
                                value={formData.customer.age}
                                onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, age: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Email Address</label>
                            <input
                                type="email" placeholder="john@example.com" style={{ width: '100%' }}
                                value={formData.customer.email}
                                onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, email: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleNext}>
                            Continue to Measurements <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="fade-in">
                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', color: '#2563eb' }}>Order Inventory</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            <div className="measurement-box"><label>PANTS</label><input type="number" value={formData.counts.pantsCount} onChange={e => setFormData({ ...formData, counts: { ...formData.counts, pantsCount: e.target.value } })} /></div>
                            <div className="measurement-box"><label>SHIRTS</label><input type="number" value={formData.counts.shirtsCount} onChange={e => setFormData({ ...formData, counts: { ...formData.counts, shirtsCount: e.target.value } })} /></div>
                            <div className="measurement-box"><label>FULL SLV</label><input type="number" value={formData.counts.fullSleeveCount} onChange={e => setFormData({ ...formData, counts: { ...formData.counts, fullSleeveCount: e.target.value } })} /></div>
                            <div className="measurement-box"><label>HALF SLV</label><input type="number" value={formData.counts.halfSleeveCount} onChange={e => setFormData({ ...formData, counts: { ...formData.counts, halfSleeveCount: e.target.value } })} /></div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', color: '#d97706' }}>Pant Dimensions</h2>
                        
                        {/* Row 1: 1-5 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="measurement-box">
                                    <label>{i}</label>
                                    <input 
                                        type="text" 
                                        value={formData.measurements.pants[`m${i}`]} 
                                        onChange={e => updateMeasurement('pants', `m${i}`, e.target.value)} 
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Row 2: 6(a), 6(b) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                            {[6, 10].map(i => (
                                <div key={i} className="measurement-box">
                                    <label>{i === 6 ? '6(a)' : '6(b)'}</label>
                                    <input 
                                        type="text" 
                                        value={formData.measurements.pants[`m${i}`]} 
                                        onChange={e => updateMeasurement('pants', `m${i}`, e.target.value)} 
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Row 3: 7, 8, 9(a), 9(b) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                            {[7, 8].map(i => (
                                <div key={i} className="measurement-box">
                                    <label>{i}</label>
                                    <input 
                                        type="text" 
                                        value={formData.measurements.pants[`m${i}`]} 
                                        onChange={e => updateMeasurement('pants', `m${i}`, e.target.value)} 
                                    />
                                </div>
                            ))}
                            {[9, 11].map(i => (
                                <div key={i} className="measurement-box">
                                    <label>{i === 9 ? '9(a)' : '9(b)'}</label>
                                    <input 
                                        type="text" 
                                        value={formData.measurements.pants[`m${i}`]} 
                                        onChange={e => updateMeasurement('pants', `m${i}`, e.target.value)} 
                                    />
                                </div>
                            ))}
                        </div>
                        <textarea placeholder="Special Pant Comments (Fit, Pocket style, etc.)" style={{ width: '100%', marginTop: '1.5rem', minHeight: '100px' }} value={formData.measurements.pants.comments} onChange={e => updateMeasurement('pants', 'comments', e.target.value)} />
                        
                        <div style={{ marginTop: '1.5rem' }}>
                            <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Camera size={18} /> Add Pant Cloth Image
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    multiple 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleImageUpload('pants', e.target.files)}
                                />
                            </label>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                {formData.measurements.pants.images.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                        <img src={img} alt="Pant cloth" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <button 
                                            onClick={() => removeImage('pants', idx)}
                                            style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', color: '#db2777' }}>Shirt Dimensions</h2>
                        <div className="measurement-grid">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div key={i + 1} className="measurement-box">
                                    <label>{i + 1}</label>
                                    <input type="text" value={formData.measurements.shirts[`m${i + 1}`]} onChange={e => updateMeasurement('shirts', `m${i + 1}`, e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <textarea placeholder="Special Shirt Comments (Collar, Cuffs, etc.)" style={{ width: '100%', marginTop: '1.5rem', minHeight: '100px' }} value={formData.measurements.shirts.comments} onChange={e => updateMeasurement('shirts', 'comments', e.target.value)} />
                        
                        <div style={{ marginTop: '1.5rem' }}>
                            <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Camera size={18} /> Add Shirt Cloth Image
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    multiple 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleImageUpload('shirts', e.target.files)}
                                />
                            </label>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                {formData.measurements.shirts.images.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                        <img src={img} alt="Shirt cloth" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <button 
                                            onClick={() => removeImage('shirts', idx)}
                                            style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem' }}>Style Options</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr', gap: '3rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>SLEEVE & FIT</h3>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {['Full Sleeve', 'Half Sleeve'].map(s => <button key={s} className={`btn ${formData.measurements.options.sleeve === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFormData({ ...formData, measurements: { ...formData.measurements, options: { ...formData.measurements.options, sleeve: s } } })}>{s}</button>)}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['Arrow', 'Slack'].map(f => <button key={f} className={`btn ${formData.measurements.options.fit === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFormData({ ...formData, measurements: { ...formData.measurements, options: { ...formData.measurements.options, fit: f } } })}>{f}</button>)}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>POCKETS</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
                                    {['P1', 'P2', 'SSP1', 'SSP2', '1.25 Cup', '2 Cup', '2.5 Cup', '3 Cup'].map(p => (
                                        <button
                                            key={p}
                                            className={`btn ${formData.measurements.options.pockets.includes(p) ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                                            onClick={() => togglePocket(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1rem' }}>Delivery Date</h2>
                        <input type="date" style={{ width: '300px' }} value={formData.deliveryDate} onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem' }}>
                        <button className="btn btn-outline" onClick={handleBack}>← Previous</button>
                        <button className="btn btn-primary" onClick={handleNext}>
                            Continue to Payment <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--success)' }}>Payment & Confirmation</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Total Service Fee</label>
                            <input type="number" placeholder="0.00" style={{ width: '100%', fontSize: '1.5rem !important' }} value={formData.payment.totalAmount} onChange={e => {
                                const val = e.target.value;
                                setFormData({ ...formData, payment: { ...formData.payment, totalAmount: val } });
                                calculateBalance(val, formData.payment.advancePaid);
                            }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Advance Payment Received</label>
                            <input type="number" placeholder="0.00" style={{ width: '100%', fontSize: '1.5rem !important' }} value={formData.payment.advancePaid} onChange={e => {
                                const val = e.target.value;
                                setFormData({ ...formData, payment: { ...formData.payment, advancePaid: val } });
                                calculateBalance(formData.payment.totalAmount, val);
                            }} />
                        </div>

                        <div style={{
                            padding: '2rem',
                            background: 'rgba(255, 191, 36, 0.1)',
                            border: '1px dashed var(--accent-gold)',
                            borderRadius: '15px',
                            textAlign: 'center'
                        }}>
                            <span className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Remaining Balance</span>
                            <h1 style={{ color: 'var(--accent-gold)', fontSize: '3.5rem', marginTop: '0.5rem' }}>₹{formData.payment.balanceAmount}</h1>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Payment Method</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['Cash', 'UPI', 'Card'].map(m => (
                                    <button key={m} className={`btn ${formData.payment.method === m ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setFormData({ ...formData, payment: { ...formData.payment, method: m } })}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleBack}>Go Back</button>
                        <button className="btn btn-primary" style={{ flex: 2, fontSize: '1.2rem' }} onClick={handleOrderConfirm}>
                            <CheckCircle size={20} /> Confirm & Place Order
                        </button>
                    </div>
                </div>
            )}

            <SMSModal
                isOpen={modalConfig.isOpen}
                onClose={skipOrderSMS}
                onSend={confirmOrder}
                initialMessage={modalConfig.messageText}
                customerName={formData.customer.name}
                phoneNumber={formData.customer.phone}
            />
        </div>
    );
};

export default AddCustomer;
