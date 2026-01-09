'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function TablesPage() {
    const tables = Array.from({ length: 15 }, (_, i) => i + 1);
    const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});
    const [mounted, setMounted] = useState(false);

    // Generate QR codes for all tables
    useEffect(() => {
        setMounted(true);

        const generateQRCodes = async () => {
            const codes: { [key: number]: string } = {};

            for (const tableNumber of tables) {
                const url = `${window.location.origin}/menu/rest001?table=${tableNumber}`;
                try {
                    const qrDataUrl = await QRCode.toDataURL(url, {
                        width: 200,
                        margin: 2,
                        color: {
                            dark: '#1a1a1a',
                            light: '#ffffff'
                        }
                    });
                    codes[tableNumber] = qrDataUrl;
                } catch (error) {
                    console.error(`Failed to generate QR code for table ${tableNumber}:`, error);
                }
            }

            setQrCodes(codes);
        };

        generateQRCodes();
    }, []);

    const handleDownloadQR = (tableNumber: number) => {
        const qrDataUrl = qrCodes[tableNumber];
        if (!qrDataUrl) return;

        // Create download link
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `table-${tableNumber}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <header className="dashboard-header">
                <h1>Tables & QR Codes</h1>
                <p className="text-secondary">{tables.length} tables configured</p>
            </header>

            <div className="tables-grid">
                {tables.map(tableNumber => (
                    <div key={tableNumber} className="table-card">
                        <h3>Table {tableNumber}</h3>

                        <div className="qr-code">
                            {qrCodes[tableNumber] ? (
                                <img
                                    src={qrCodes[tableNumber]}
                                    alt={`QR Code for Table ${tableNumber}`}
                                    style={{ width: '150px', height: '150px', display: 'block' }}
                                />
                            ) : (
                                <div>Generating...</div>
                            )}
                        </div>

                        <button
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%' }}
                            onClick={() => handleDownloadQR(tableNumber)}
                            disabled={!qrCodes[tableNumber]}
                        >
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
        </>
    );
}
