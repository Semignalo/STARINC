import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from 'recharts';

function formatCurrency(value) {
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
}

export default function DashboardCharts({ monthly_stats, top_products }) {
    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Pendapatan Bulanan</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthly_stats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
                            />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                labelStyle={{ color: '#333', fontWeight: 'bold' }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px]">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Produk (Terjual)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={top_products} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="product_title" type="category" width={150} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="total_sold" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}
