import React, { useState } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';

const SMSModal = ({ isOpen, onClose, onSend, initialMessage, customerName, phoneNumber }) => {
    const [message, setMessage] = useState(initialMessage);

    React.useEffect(() => {
        if (isOpen) {
            setMessage(initialMessage);
        }
    }, [initialMessage, isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                margin: '1rem',
                position: 'relative'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                        background: 'var(--primary-gradient)', 
                        padding: '0.75rem', 
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Send SMS</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            To: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{customerName}</span> ({phoneNumber})
                        </p>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        Message Preview
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: '150px',
                            resize: 'vertical',
                            fontSize: '1rem',
                            lineHeight: '1.5'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        className="btn btn-outline" 
                        style={{ flex: 1 }}
                        onClick={onClose}
                    >
                        Skip Message
                    </button>
                    <button 
                        className="btn btn-primary" 
                        style={{ flex: 2 }}
                        onClick={() => onSend(message)}
                    >
                        <Send size={18} /> Send SMS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SMSModal;
