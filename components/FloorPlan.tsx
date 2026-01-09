'use client';

import { useEffect, useState, useRef } from 'react';

interface TablePosition {
    id: number;
    x: number;
    y: number;
}

interface FloorPlanProps {
    tables?: number[];
    activeTables?: number[];
    onTableClick?: (tableId: number) => void;
    readOnly?: boolean;
}

export default function FloorPlan({
    tables = Array.from({ length: 15 }, (_, i) => i + 1),
    activeTables = [],
    onTableClick,
    readOnly = false
}: FloorPlanProps) {
    const [positions, setPositions] = useState<TablePosition[]>([]);
    const [isDragging, setIsDragging] = useState<number | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);

    // Load layout
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
    }, [tables]);

    // Save layout
    useEffect(() => {
        if (positions.length > 0 && !readOnly) {
            localStorage.setItem('tableLayout', JSON.stringify(positions));
        }
    }, [positions, readOnly]);

    const handleDragStart = (e: React.MouseEvent, tableId: number) => {
        if (readOnly) return;
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
        if (isDragging !== null && !readOnly) {
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

    if (!mounted) return <div style={{ height: '600px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>Loading Map...</div>;

    return (
        <div
            className="floor-plan-container"
            style={{
                position: 'relative',
                height: '600px',
                backgroundColor: '#f8fafc',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                overflow: 'hidden',
                userSelect: 'none',
                cursor: readOnly ? 'default' : 'grab'
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
                        onClick={() => onTableClick && onTableClick(pos.id)}
                        style={{
                            position: 'absolute',
                            left: pos.x,
                            top: pos.y,
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#fef08a' : 'white', // Yellow if active
                            border: `3px solid ${isActive ? '#eab308' : '#e2e8f0'}`,
                            boxShadow: isDragging === pos.id ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: readOnly ? 'pointer' : (isDragging === pos.id ? 'grabbing' : 'grab'),
                            zIndex: isDragging === pos.id ? 10 : 1,
                            transition: isDragging === pos.id ? 'none' : 'box-shadow 0.2s, transform 0.2s',
                        }}
                        title={isActive ? 'Active Order' : 'Empty Table'}
                    >
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#334155' }}>{pos.id}</span>
                        {isActive && <span style={{ fontSize: '0.6rem', color: '#854d0e', fontWeight: 600 }}>BUSY</span>}
                    </div>
                );
            })}
        </div>
    );
}
