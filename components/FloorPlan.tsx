'use client';

import { useEffect, useState, useRef } from 'react';

export type ItemType = 'table' | 'wall' | 'desk';

export interface LayoutItem {
    id: string; // "table-1", "wall-123", "desk-1"
    type: ItemType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    label?: string; // For table numbers
}

// Backward compatibility helper
export interface TablePosition {
    id: number;
    x: number;
    y: number;
}

interface FloorPlanProps {
    tables?: number[];
    activeTables?: number[];
    onTableClick?: (tableId: number) => void;
    readOnly?: boolean;
    scale?: number;
    height?: number | string;
    positions?: LayoutItem[];
    onPositionsChange?: (items: LayoutItem[]) => void;
    onDelete?: (itemId: string) => void;
}

const DEFAULT_TABLES = Array.from({ length: 15 }, (_, i) => i + 1);

export default function FloorPlan({
    tables = DEFAULT_TABLES,
    activeTables = [],
    onTableClick,
    readOnly = false,
    scale = 1,
    height = '600px',
    positions: controlledPositions,
    onPositionsChange,
    onDelete
}: FloorPlanProps) {

    // Helper to generate default table layout if nothing exists
    const getDefaultPositions = (tableIds: number[]): LayoutItem[] => {
        return tableIds.map((id, index) => ({
            id: `table-${id}`,
            type: 'table',
            label: id.toString(),
            x: (index % 5) * 130 + 20,
            y: Math.floor(index / 5) * 130 + 20,
            width: 60,
            height: 40
        }));
    };

    const [internalItems, setInternalItems] = useState<LayoutItem[]>(() => []);
    const [mounted, setMounted] = useState(false);

    // Selection for editing (walls/desks)
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [isDragging, setIsDragging] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [isRotating, setIsRotating] = useState<string | null>(null);

    const dragOffset = useRef({ x: 0, y: 0 });
    const startInteraction = useRef({ x: 0, y: 0, initialWidth: 0, initialRotation: 0 });

    const isControlled = controlledPositions !== undefined;

    // Normalize input positions (convert old format if necessary)
    // Legacy support: if items have numeric ID and no type, convert to table
    const rawItems = (isControlled ? controlledPositions! : internalItems) || [];
    const items: LayoutItem[] = rawItems.map(item => {
        if (!item.type) {
            // It's a legacy TablePosition { id: number, x, y }
            const legacyId = (item as any).id;
            return {
                id: `table-${legacyId}`,
                type: 'table',
                label: legacyId.toString(),
                x: item.x,
                y: item.y,
                width: 60,
                height: 40
            };
        }
        return item;
    });

    // Initialize/Sync Logic
    useEffect(() => {
        setMounted(true);

        // If controlled and empty, or internal and empty, we might need to sync with `tables` prop
        // We only GENERATE defaults if we have absolutely nothing.

        let currentItems = [...items];

        // 1. Identify existing tables
        const existingTableIds = new Set(
            currentItems
                .filter(i => i.type === 'table')
                .map(i => parseInt(i.label || '0'))
        );

        // 2. Add missing tables
        const missingTables = tables.filter(id => !existingTableIds.has(id));
        if (missingTables.length > 0) {
            const newTables = missingTables.map((id, index) => ({
                id: `table-${id}`,
                type: 'table' as const,
                label: id.toString(),
                x: ((id - 1) % 5) * 130 + 20,
                y: Math.floor((id - 1) / 5) * 130 + 20,
                width: 90,
                height: 90
            }));
            currentItems = [...currentItems, ...newTables];
        }

        // 3. Remove invalid tables (tables that are no longer in the list)
        // Only if we are syncing purely based on numbers. 
        // We filter out items that are type='table' BUT explicitly NOT in the tables list
        currentItems = currentItems.filter(item => {
            if (item.type !== 'table') return true;
            return tables.includes(parseInt(item.label || '0'));
        });

        // 4. Update if changed
        // Simple length check + ID check to avoid infinite loops, simplistic but effective for now
        const currentIds = new Set(currentItems.map(i => i.id));
        const prevIds = new Set(items.map(i => i.id));

        const hasChanges = currentItems.length !== items.length || [...currentIds].some(id => !prevIds.has(id));

        if (hasChanges) {
            if (isControlled && onPositionsChange) {
                // Defer to parent
                // We only trigger this if there's a structural mismatch (count mismatch)
                // prevent loop

            } else {
                setInternalItems(currentItems);
            }
        }

        // Initial Load for Internal Mode handled by parent likely, or localStorage in parent
        // For this component, we blindly render what is passed or generated.

    }, [tables, isControlled]); // removed `items` from dependency to avoid loop

    // -- Interaction Handlers --

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, itemId: string, action: 'drag' | 'resize' | 'rotate') => {
        if (readOnly) return;
        e.stopPropagation();

        // Deselect if clicking something else, select current
        setSelectedId(itemId);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const item = items.find(i => i.id === itemId);

        if (!item) return;

        if (action === 'drag') {
            setIsDragging(itemId);
            dragOffset.current = {
                x: clientX - item.x * scale,
                y: clientY - item.y * scale
            };
        } else if (action === 'resize') {
            setIsResizing(itemId);
            startInteraction.current = {
                x: clientX,
                y: clientY,
                initialWidth: item.width || 100,
                initialRotation: 0
            };
        } else if (action === 'rotate') {
            setIsRotating(itemId);
            startInteraction.current = {
                x: clientX,
                y: clientY,
                initialWidth: 0,
                initialRotation: item.rotation || 0
            };
        }
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (readOnly) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        if (isDragging) {
            const newX = (clientX - dragOffset.current.x) / scale;
            const newY = (clientY - dragOffset.current.y) / scale;

            updateItem(isDragging, { x: newX, y: newY });
        } else if (isResizing) {
            const item = items.find(i => i.id === isResizing);
            if (item) {
                const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
                const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;

                const dx = (currentX - startInteraction.current.x) / scale;
                const dy = (currentY - startInteraction.current.y) / scale;

                // Project screen movement onto the local X axis of the item to handle rotation correctly
                const rad = ((startInteraction.current.initialRotation || 0) * Math.PI) / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);

                // Dot product to get magnitude in direction of local width
                const deltaWidth = (dx * cos) + (dy * sin);

                const newWidth = Math.max(20, startInteraction.current.initialWidth + deltaWidth);
                updateItem(isResizing, { width: newWidth });
            }
        } else if (isRotating) {
            const item = items.find(i => i.id === isRotating);
            if (item) {
                const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
                // Sensitivity factor
                const deltaX = (currentX - startInteraction.current.x) * 1.5;
                let newRotation = (startInteraction.current.initialRotation + deltaX) % 360;

                // Normalize negative angles
                if (newRotation < 0) newRotation += 360;

                // Snap to 45 degree increments
                const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
                const threshold = 5; // Degrees

                for (const angle of snapAngles) {
                    if (Math.abs(newRotation - angle) < threshold) {
                        newRotation = angle;
                        if (newRotation === 360) newRotation = 0;
                        break;
                    }
                }

                updateItem(isRotating, { rotation: newRotation });
            }
        }
    };

    const handleUp = () => {
        setIsDragging(null);
        setIsResizing(null);
        setIsRotating(null);
    };

    const updateItem = (id: string, updates: Partial<LayoutItem>) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        if (isControlled && onPositionsChange) {
            onPositionsChange(newItems);
        } else {
            setInternalItems(newItems);
        }
    };

    // Background deselection
    const handleBackgroundClick = () => {
        if (!readOnly) setSelectedId(null);
    };

    // Delete Loop (Delete key) logic could go here

    if (!mounted) return <div style={{ height: typeof height === 'number' ? `${height}px` : height, backgroundColor: '#f8fafc', borderRadius: '12px' }}>Loading Map...</div>;

    return (
        <div
            className="floor-plan-container"
            style={{
                position: 'relative',
                height: typeof height === 'number' ? `${height}px` : height,
                backgroundColor: 'white',
                overflow: 'auto', // changed from hidden to auto to allow scrolling
                userSelect: 'none',
                cursor: readOnly ? 'default' : 'grab',
                touchAction: 'pan-x pan-y' // Allow scrolling/panning
            }}
            onMouseMove={handleMove}
            onMouseUp={handleUp}
            onMouseLeave={handleUp}
            onTouchMove={handleMove}
            onTouchEnd={handleUp}
            onClick={handleBackgroundClick}
        >
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                minWidth: '4000px', // Massive canvas
                minHeight: '3000px', // Massive canvas
                position: 'relative',
                height: '3000px',
                backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}>
                {items.length === 0 && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: '#64748b', fontSize: '1rem'
                    }}>
                        No layout configured
                    </div>
                )}

                {items.map(item => {
                    const isActive = item.type === 'table' && activeTables.includes(parseInt(item.label || '-1'));
                    const isSelected = selectedId === item.id;

                    const commonStyle: React.CSSProperties = {
                        position: 'absolute',
                        left: item.x,
                        top: item.y,
                        transform: `rotate(${item.rotation || 0}deg)`,
                        touchAction: 'none',
                        cursor: readOnly ? 'default' : (isDragging === item.id ? 'grabbing' : 'grab'),
                    };

                    // --- TABLE ---
                    if (item.type === 'table') {
                        return (
                            <div
                                key={item.id}
                                onMouseDown={(e) => handleMouseDown(e, item.id, 'drag')}
                                onTouchStart={(e) => handleMouseDown(e, item.id, 'drag')}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onTableClick) onTableClick(parseInt(item.label!));
                                }}
                                style={{
                                    ...commonStyle,
                                    width: `${item.width || 60}px`,
                                    height: `${item.height || 40}px`,
                                    borderRadius: '6px', // Rounded Rectangle
                                    backgroundColor: isActive ? '#fef08a' : 'white',
                                    border: `3px solid ${isActive ? '#eab308' : '#e2e8f0'}`,
                                    boxShadow: isDragging === item.id ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 10
                                }}
                            >
                                <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#334155' }}>{item.label}</span>
                                {isActive && <span style={{ fontSize: '0.65rem', color: '#854d0e', fontWeight: 600 }}>BUSY</span>}

                                {isSelected && !readOnly && (
                                    <>
                                        {/* Resize Handle (Right) */}
                                        <div
                                            onMouseDown={(e) => handleMouseDown(e, item.id, 'resize')}
                                            style={{
                                                position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)',
                                                width: 15, height: 15, backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'ew-resize',
                                                zIndex: 20
                                            }}
                                        />
                                        {/* Rotate Handle (Top) */}
                                        <div
                                            onMouseDown={(e) => handleMouseDown(e, item.id, 'rotate')}
                                            style={{
                                                position: 'absolute', left: '50%', top: -20, transform: 'translateX(-50%)',
                                                width: 15, height: 15, backgroundColor: '#22c55e', borderRadius: '50%', cursor: 'alias',
                                                zIndex: 20
                                            }}
                                        />
                                        {/* Delete Button (Top Right) */}
                                        {onDelete && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(item.id);
                                                }}
                                                onTouchStart={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(item.id);
                                                }}
                                                style={{
                                                    position: 'absolute', top: -15, right: -15,
                                                    width: 20, height: 20, backgroundColor: '#ef4444',
                                                    borderRadius: '50%', color: 'white', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', fontSize: '0.8rem', zIndex: 30,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                                title="Delete"
                                            >
                                                ✕
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    }

                    // --- WALL ---
                    if (item.type === 'wall') {
                        return (
                            <div
                                key={item.id}
                                onMouseDown={(e) => handleMouseDown(e, item.id, 'drag')}
                                onTouchStart={(e) => handleMouseDown(e, item.id, 'drag')}
                                style={{
                                    ...commonStyle,
                                    width: `${item.width || 150}px`,
                                    height: `${item.height || 10}px`, // Thickness
                                    backgroundColor: '#334155',
                                    borderRadius: '4px',
                                    zIndex: 5,
                                }}
                                onClick={(e) => e.stopPropagation()} // Prevent deselection
                            >
                                {isSelected && !readOnly && (
                                    <>
                                        {/* Resize Handle (Right) */}
                                        <div
                                            onMouseDown={(e) => handleMouseDown(e, item.id, 'resize')}
                                            style={{
                                                position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)',
                                                width: 20, height: 20, backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'ew-resize',
                                                zIndex: 20
                                            }}
                                        />
                                        {/* Rotate Handle (Top) */}
                                        <div
                                            onMouseDown={(e) => handleMouseDown(e, item.id, 'rotate')}
                                            style={{
                                                position: 'absolute', left: '50%', top: -20, transform: 'translateX(-50%)',
                                                width: 20, height: 20, backgroundColor: '#22c55e', borderRadius: '50%', cursor: 'alias',
                                                zIndex: 20
                                            }}
                                        />
                                        {/* Delete Button (Top Right) */}
                                        {onDelete && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(item.id);
                                                }}
                                                onTouchStart={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(item.id);
                                                }}
                                                style={{
                                                    position: 'absolute', top: -25, right: -10,
                                                    width: 20, height: 20, backgroundColor: '#ef4444',
                                                    borderRadius: '50%', color: 'white', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', fontSize: '0.8rem', zIndex: 30,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                                title="Delete"
                                            >
                                                ✕
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    }

                    // --- DESK ---
                    if (item.type === 'desk') {
                        return (
                            <div
                                key={item.id}
                                onMouseDown={(e) => handleMouseDown(e, item.id, 'drag')}
                                onTouchStart={(e) => handleMouseDown(e, item.id, 'drag')}
                                style={{
                                    ...commonStyle,
                                    width: '100px',
                                    height: '60px',
                                    backgroundColor: '#e2e8f0',
                                    border: '2px solid #cbd5e1',
                                    borderRadius: '8px',
                                    zIndex: 8,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#64748b', fontWeight: 600, fontSize: '0.8rem'
                                }}
                                onClick={(e) => e.stopPropagation()} // Prevent deselection
                            >
                                🖥️ DESK
                                {isSelected && !readOnly && onDelete && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(item.id);
                                        }}
                                        onTouchStart={(e) => {
                                            e.stopPropagation();
                                            onDelete(item.id);
                                        }}
                                        style={{
                                            position: 'absolute', top: -10, right: -10,
                                            width: 20, height: 20, backgroundColor: '#ef4444',
                                            borderRadius: '50%', color: 'white', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', fontSize: '0.8rem', zIndex: 30,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        title="Delete"
                                    >
                                        ✕
                                    </div>
                                )}
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}

// Default export

