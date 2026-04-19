export default function AnalyticsBoard() {
  const kpiData = {
    totalRevenue: 125000,
    totalOrders: 320,
    activeVendors: 12,
    avgRevenue: 10416,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
      <div style={{ padding: "16px", background: "white", borderRadius: "12px" }}>
        <h4>Total Revenue</h4>
        <h2>R {kpiData.totalRevenue}</h2>
      </div>

      <div style={{ padding: "16px", background: "white", borderRadius: "12px" }}>
        <h4>Total Orders</h4>
        <h2>{kpiData.totalOrders}</h2>
      </div>

      <div style={{ padding: "16px", background: "white", borderRadius: "12px" }}>
        <h4>Active Vendors</h4>
        <h2>{kpiData.activeVendors}</h2>
      </div>

      <div style={{ padding: "16px", background: "white", borderRadius: "12px" }}>
        <h4>Avg Revenue</h4>
        <h2>R {kpiData.avgRevenue}</h2>
      </div>
    </div>
  );
}