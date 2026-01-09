'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import FloorPlan from '@/components/FloorPlan';

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
                    <h1>Tables & QR Codes</h1>
                    <p className="text-secondary">{tables.length} tables configured</p>
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
                <div style={{ marginBottom: '2rem' }}>
                    <FloorPlan
                        activeTables={activeTables}
                        readOnly={false}
                    />
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
                            <a
                                href={`/menu/rest001?table=${tableNumber}`}
                                target="_blank"
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', marginTop: '0.5rem', display: 'inline-flex' }}
                            >
                                Preview Menu
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
