import React, { useEffect, useState } from 'react';

type Sale = {
    id: number;
    date: string;
    total: number;
};

const AdminSales = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                // Mock data instead of API call for demo purposes
                const mockSalesData = [
                    { id: 1, date: '2025-08-01', total: 2500.50 },
                    { id: 2, date: '2025-08-02', total: 3200.75 },
                    { id: 3, date: '2025-08-03', total: 1800.25 },
                    { id: 4, date: '2025-08-04', total: 4100.00 },
                    { id: 5, date: '2025-08-05', total: 3750.80 }
                ];
                
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 800));
                
                setSales(mockSalesData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();
    }, []);

    if (loading) {
        return <div>Loading sales data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '32px' }}>
            <h1>Sales Report</h1>
            {sales.length === 0 ? (
                <p>No sales data available.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Sale ID</th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Date</th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale.id}>
                                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{sale.id}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{sale.date}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>₱{sale.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminSales;