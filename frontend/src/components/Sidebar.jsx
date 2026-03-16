import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, Truck, CheckCircle } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">Fashion Tailor</div>
            <nav style={{ marginTop: '1rem' }}>
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    {({ isActive }) => (
                        <>
                            <Home size={22} color={isActive ? '#fff' : '#8b5cf6'} />
                            <span>Home</span>
                        </>
                    )}
                </NavLink>
                <NavLink to="/ready" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    {({ isActive }) => (
                        <>
                            <Package size={22} color={isActive ? '#fff' : '#3b82f6'} />
                            <span>Ready to Deliver</span>
                        </>
                    )}
                </NavLink>
                <NavLink to="/delivered" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    {({ isActive }) => (
                        <>
                            <Truck size={22} color={isActive ? '#fff' : '#059669'} />
                            <span>History</span>
                        </>
                    )}
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '15px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tailor Shop v1.0</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>MariMuthu</p>
            </div>
        </aside>
    );
};

export default Sidebar;
