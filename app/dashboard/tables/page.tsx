'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';

interface TablePosition {
    id: number;
    x: number;
    y: number;
}

export default function TablesPage() {
    const [viewMode, setViewMode] = useState<'qr' | 'map'>('map');
    const [tables] = useState(Array.from({ length: 15 }, (_, i) => i + 1));
    const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});
    const [mounted, setMounted] = useState(false);

    // Floor plan state
    const [positions, setPositions] = useState<TablePosition[]>([]);
    const [activeTables, setActiveTables] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState<number | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Load active orders to show status
    useEffect(() => {
        const fetchActiveOrders = async () => {
            const { data } = await supabase
                .from('orders')
                .select('table_number')
                .neq('status', 'done');

            if (data) {
                const uniqueTables = [...new Set(data.map(o => parseInt(o.table_number)))];
                setActiveTables(uniqueTables);
            }
        };

        fetchActiveOrders();
        // Poll for updates
        const interval = setInterval(fetchActiveOrders, 10000); // Check every 10s

        return () => clearInterval(interval);
    }, []);

    // Load layout from local storage
    useEffect(() => {
        setMounted(true);
        const savedLayout = localStorage.getItem('tableLayout');
        if (savedLayout) {
            setPositions(JSON.parse(savedLayout));
        } else {
            // Default grid layout
            const defaultLayout = tables.map((id, index) => ({
                id,
                x: (index % 5) * 120 + 20,
                y: Math.floor(index / 5) * 120 + 20
            }));
            setPositions(defaultLayout);
        }

        // Generate QRs
        const generateQRCodes = async () => {
            const codes: { [key: number]: string } = {};
            for (const tableNumber of tables) {
                const url = `${window.location.origin}/menu/rest001?table=${tableNumber}`;
                try {
                    const qrDataUrl = await QRCode.toDataURL(url, {
                        width: 200, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' }
                    });
                    codes[tableNumber] = qrDataUrl;
                } catch (error) { console.error(error); }
            }
            setQrCodes(codes);
        };
        generateQRCodes();
    }, [tables]);

    // Save layout
    useEffect(() => {
        if (positions.length > 0) {
            localStorage.setItem('tableLayout', JSON.stringify(positions));
        }
    }, [positions]);

    const handleDragStart = (e: React.MouseEvent, tableId: number) => {
        const pos = positions.find(p => p.id === tableId);
        if (pos) {
            setIsDragging(tableId);
            dragOffset.current = {
                x: e.clientX - pos.x,
                y: e.clientY - pos.y
            };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging !== null) {
            const newX = e.clientX - dragOffset.current.x;
            const newY = e.clientY - dragOffset.current.y;

            setPositions(prev => prev.map(p =>
                p.id === isDragging ? { ...p, x: newX, y: newY } : p
            ));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    const handleDownloadQR = (tableNumber: number) => {
        const qrDataUrl = qrCodes[tableNumber];
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `table-${tableNumber}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Restaurant Floor Plan</h1>
                    <p className="text-secondary">Drag tables to rearrange • Green = Active Order</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('map')}
                    >
                        🗺️ Floor Plan
                    </button>
                    <button
                        className={`btn ${viewMode === 'qr' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('qr')}
                    >
                        📱 QR Codes
                    </button>
                </div>
            </header>

            {viewMode === 'map' ? (
                <div
                    className="floor-plan-container"
                    style={{
                        position: 'relative',
                        height: '600px',
                        backgroundColor: '#f8fafc',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        userSelect: 'none'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {positions.map(pos => {
                        const isActive = activeTables.includes(pos.id);
                        return (
                            <div
                                key={pos.id}
                                onMouseDown={(e) => handleDragStart(e, pos.id)}
                                style={{
                                    position: 'absolute',
                                    left: pos.x,
                                    top: pos.y,
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    backgroundColor: isActive ? '#fef08a' : 'white',
                                    border: `3px solid ${isActive ? '#eab308' : '#e2e8f0'}`,
                                    boxShadow: isDragging === pos.id ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: isDragging === pos.id ? 'grabbing' : 'grab',
                                    zIndex: isDragging === pos.id ? 10 : 1,
                                    transition: isDragging === pos.id ? 'none' : 'box-shadow 0.2s, transform 0.2s',
                                }}
                            >
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#334155' }}>{pos.id}</span>
                                {isActive && <span style={{ fontSize: '0.6rem', color: '#854d0e', fontWeight: 600 }}>BUSY</span>}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="tables-grid">
                    {tables.map(tableNumber => (
                        <div key={tableNumber} className="table-card">
                            <h3>Table {tableNumber}</h3>
                            <div className="qr-code">
                                {qrCodes[tableNumber] ? (
                                    <img src={qrCodes[tableNumber]} alt={`QR Code for Table ${tableNumber}`} style={{ width: '150px', height: '150px', display: 'block' }} />
                                ) : (<div>Generating...</div>)}
                            </div>
                            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleDownloadQR(tableNumber)} disabled={!qrCodes[tableNumber]}>
                                Download QR
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
