'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import FloorPlan, { LayoutItem } from '@/components/FloorPlan';

export default function TablesPage() {
    const [viewMode, setViewMode] = useState<'qr' | 'map'>('map');
    const [tableCount, setTableCount] = useState(15);
    const [tables, setTables] = useState<number[]>([]);
    const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});
    const [mounted, setMounted] = useState(false);

    // Floor plan state (Controlled)
    const [positions, setPositions] = useState<LayoutItem[]>([]);
    const [activeTables, setActiveTables] = useState<number[]>([]);

    // Load active orders to show status
    useEffect(() => {
        const fetchActiveOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                if (response.ok) {
                    const orders: any[] = await response.json();
                    // Active tables have orders that are NOT paid or cancelled
                    const active = orders
                        .filter(o => ['new', 'preparing', 'done'].includes(o.status))
                        .map(o => parseInt(o.tableNumber));

                    setActiveTables([...new Set(active)]);
                }
            } catch (e) {
                console.error("Failed to fetch table status", e);
            }
        };

        fetchActiveOrders();
        // Poll for updates
        const interval = setInterval(fetchActiveOrders, 10000); // Check every 10s

        return () => clearInterval(interval);
    }, []);

    // Load Config and Layout from DATABASE (with localStorage fallback)
    useEffect(() => {
        setMounted(true);

        const loadSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    setTableCount(data.table_count || 15);
                    if (data.table_layout) {
                        setPositions(data.table_layout);
                    }
                } else {
                    // Fallback to localStorage if API fails
                    const savedCount = localStorage.getItem('tableCount');
                    const initialCount = savedCount ? parseInt(savedCount) : 15;
                    setTableCount(initialCount);

                    const savedLayout = localStorage.getItem('tableLayout');
                    if (savedLayout) {
                        setPositions(JSON.parse(savedLayout));
                    }
                }
            } catch (error) {
                console.error('Failed to load settings from API, using localStorage:', error);
                // Fallback to localStorage
                const savedCount = localStorage.getItem('tableCount');
                const initialCount = savedCount ? parseInt(savedCount) : 15;
                setTableCount(initialCount);

                const savedLayout = localStorage.getItem('tableLayout');
                if (savedLayout) {
                    setPositions(JSON.parse(savedLayout));
                }
            }
        };

        loadSettings();
    }, []);

    // Sync `tables` array with `tableCount`
    useEffect(() => {
        const newTables = Array.from({ length: tableCount }, (_, i) => i + 1);
        setTables(newTables);
    }, [tableCount]);

    // Sync Positions when Tables change (Add new, Remove old)
    useEffect(() => {
        if (tables.length === 0) return;

        setPositions(prev => {
            let newPositions: LayoutItem[] = [];
            const seenTableLabels = new Set<string>();

            // 1. Process existing items, filtering out duplicate tables and invalid tables
            prev.forEach(item => {
                if (item.type !== 'table') {
                    // Keep walls and desks
                    newPositions.push(item);
                } else {
                    // It's a table
                    const label = item.label || '0';
                    const tableId = parseInt(label);

                    // Only keep if:
                    // A) It is a valid table number (in current count)
                    // B) We haven't seen this table number yet (deduplication)
                    if (tables.includes(tableId) && !seenTableLabels.has(label)) {
                        newPositions.push(item);
                        seenTableLabels.add(label);
                    }
                }
            });

            // 2. Identify missing tables
            const missingTables = tables.filter(id => !seenTableLabels.has(id.toString()));

            // 3. Add missing tables
            if (missingTables.length > 0) {
                const addedPositions = missingTables.map((id, index) => ({
                    id: `table-${id}`,
                    type: 'table' as const,
                    label: id.toString(),
                    x: ((id - 1) % 5) * 120 + 20,
                    y: Math.floor((id - 1) / 5) * 120 + 20,
                    width: 60,
                    height: 40
                }));
                newPositions = [...newPositions, ...addedPositions];
            }

            return newPositions;
        });

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

    // Save layout to DATABASE (and localStorage as backup)
    useEffect(() => {
        if (positions.length > 0) {
            // Save to database
            const saveSettings = async () => {
                try {
                    await fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            table_count: tableCount,
                            table_layout: positions
                        })
                    });
                } catch (error) {
                    console.error('Failed to save settings to database:', error);
                }
            };

            saveSettings();
            // Also save to localStorage as backup
            localStorage.setItem('tableLayout', JSON.stringify(positions));
            localStorage.setItem('tableCount', tableCount.toString());
        }
    }, [positions, tableCount]);

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

    const addWall = () => {
        const newWall: LayoutItem = {
            id: `wall-${Date.now()}`,
            type: 'wall',
            x: 50,
            y: 50,
            width: 150,
            height: 10,
            rotation: 0
        };
        setPositions(prev => [...prev, newWall]);
    };

    const addDesk = () => {
        const newDesk: LayoutItem = {
            id: `desk-${Date.now()}`,
            type: 'desk',
            x: 100,
            y: 100,
            width: 100,
            height: 60,
            rotation: 0
        };
        setPositions(prev => [...prev, newDesk]);
    };

    return (
        <>
            <header className="dashboard-header" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1>Tables & QR Codes</h1>
                        <p className="text-secondary">Manage restaurant layout and QR codes</p>
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
                </div>

                {/* Configuration Section */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <label style={{ fontWeight: 600, color: '#4b5563' }}>Total Tables:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setTableCount(prev => Math.max(1, prev - 1))}
                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >-</button>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                            {tableCount}
                        </span>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setTableCount(prev => prev + 1)}
                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >+</button>
                    </div>

                    <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 1rem' }}></div>

                    {/* Editor Controls */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={addWall} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            🧱 Add Wall
                        </button>
                        <button onClick={addDesk} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            🖥️ Add Desk
                        </button>
                    </div>

                    <span style={{ fontSize: '0.9rem', color: '#6b7280', marginLeft: 'auto' }}>
                        Changes are saved automatically
                    </span>
                </div>
            </header>

            {viewMode === 'map' ? (
                <div style={{ marginBottom: '2rem' }}>
                    <FloorPlan
                        tables={tables}
                        activeTables={activeTables}
                        readOnly={false}
                        positions={positions}
                        onPositionsChange={setPositions}
                        scale={typeof window !== 'undefined' && window.innerWidth < 768 ? 0.5 : 1}
                    />
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Drag to move • Click wall to show controls • Drag dots to Rotate/Resize
                    </div>
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
