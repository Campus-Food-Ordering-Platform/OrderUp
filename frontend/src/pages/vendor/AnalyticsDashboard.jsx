import { useEffect, useState } from 'react';

// lucide icons used in the KPI cards
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
} from 'lucide-react';

// main brand color reused across the dashboard
const BRAND = '#C0474A';

// analytics board component
// vendorId should eventually come from authenticated vendor data
export default function AnalyticsBoard({ vendor_id }) {

  // loading state while analytics data is being fetched
  const [loading, setLoading] = useState(true);

  // stores all calculated KPI metrics
  // these are derived frontend values, not raw backend values
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    avgRevenue: 0,
  });

  // controls curr 
  // used in the API query params
  const [analyticsRange, setAnalyticsRange] = useState('month');

  // fetch analytics whenever:
  // 1. vendor changes
  // 2. analytics range changes
  useEffect(() => {

    // stop execution if vendorId is missing
    // prevents invalid API calls
    if (!vendor_id) return;

    // async function for analytics fetching
    const fetchAnalytics = async () => {

      // show loading screen while requests are running
      setLoading(true);

      try {

        // Promise.all runs all requests concurrently
        // this is much faster than waiting for each request individually
        const [
          revenueResponse,
          ordersResponse,
          customersResponse,
        ] = await Promise.all([

          // revenue analytics endpoint
          fetch(
            `${import.meta.env.VITE_API_URL}/analytics/revenue/${vendor_id}?range=${analyticsRange}`
          ),

          // orders analytics endpoint
          fetch(
            `${import.meta.env.VITE_API_URL}/analytics/orders/${vendor_id}?range=${analyticsRange}`
          ),

          // customers analytics endpoint
          fetch(
            `${import.meta.env.VITE_API_URL}/analytics/customers/${vendor_id}?range=${analyticsRange}`
          ),
        ]);

        // validate responses
        // if even one request fails, throw error
        if (
          !revenueResponse.ok ||
          !ordersResponse.ok ||
          !customersResponse.ok
        ) {
          throw new Error('Failed to fetch analytics data');
        }

        // convert responses into JSON
        const revenueData = await revenueResponse.json();
        const ordersData = await ordersResponse.json();
        const customersData = await customersResponse.json();

        /*
          Backend returns grouped period data like:

          revenueData.data = [
            { period: "2025-05-01", revenue: 2500 },
            { period: "2025-05-02", revenue: 1800 }
          ]

          We aggregate/summarise the data here in the frontend.
        */

        // total all revenue values
        const totalRevenue = (revenueData.data || []).reduce(

          // accumulator pattern
          // sum starts at 0
          // each item's revenue gets added
          (sum, item) => sum + Number(item.revenue || 0),

          // initial accumulator value
          0
        );

        // total all order counts
        const totalOrders = (ordersData.data || []).reduce(
          (sum, item) => sum + Number(item.orders || 0),
          0
        );

        // total all unique customer counts
        const activeCustomers = (customersData.data || []).reduce(
          (sum, item) => sum + Number(item.unique_customers || 0),
          0
        );

        // calculate average revenue generated per order
        // avoid division by zero
        const avgRevenue =
          totalOrders > 0
            ? totalRevenue / totalOrders
            : 0;

        // store final calculated KPI values
        setKpiData({
          totalRevenue,
          totalOrders,
          activeCustomers,
          avgRevenue,
        });

      } catch (err) {

        // log error for debugging
        console.error('Failed to fetch analytics:', err);

        // reset all KPI values if request fails
        setKpiData({
          totalRevenue: 0,
          totalOrders: 0,
          activeCustomers: 0,
          avgRevenue: 0,
        });

      } finally {

        // stop loading regardless of success/failure
        setLoading(false);

      }
    };

    // invoke async analytics fetch
    fetchAnalytics();

  }, [vendor_id, analyticsRange]);

  // reusable card container style
  const cardStyle = {
    background: 'white',
    padding: '16px',
    borderRadius: '14px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  };

  // shared small text style
  const labelStyle = {
    fontSize: '0.75rem',
    color: '#888',
    margin: 0,
  };

  // shared large KPI number style
  const valueStyle = {
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: '6px 0 0',
    color: BRAND,
  };

  // top section inside KPI cards
  const cardHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  };

  // loading screen while analytics are still fetching
  if (loading) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: '#aaa',
        }}
      >
        Loading analytics...
      </div>
    );
  }

  // main analytics UI
  return (

    // section wrapper
    <section style={{ padding: '16px' }}>

      {/* analytics dashboard top header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >

        {/* analytics title */}
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            margin: 0,
          }}
        >
          Analytics Dashboard
        </h2>

        {/* range selector */}
        {/* updates analyticsRange state */}
        {/* triggers useEffect refetch */}
        <select
          value={analyticsRange}

          // update range state whenever dropdown changes
          onChange={(e) => setAnalyticsRange(e.target.value)}

          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #E0E0E0',
            fontSize: '0.7rem',
            backgroundColor: 'white',
          }}
        >

          {/* backend should support these values */}
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="3months">Last 3 Months</option>

        </select>
      </div>

      {/* KPI cards grid */}
      <div
        style={{
          display: 'grid',

          // creates 4 equal width columns
          gridTemplateColumns: 'repeat(4, 1fr)',

          gap: '12px',
        }}
      >

        {/* ================= REVENUE CARD ================= */}
        <div style={cardStyle}>

          <div style={cardHeader}>

            {/* revenue icon */}
            <DollarSign size={16} color={BRAND} />

          </div>

          <p style={labelStyle}>
            Total Revenue
          </p>

          {/* toLocaleString adds commas automatically */}
          <h3 style={valueStyle}>
            R {kpiData.totalRevenue.toLocaleString()}
          </h3>

        </div>

        {/* ================= ORDERS CARD ================= */}
        <div style={cardStyle}>

          <div style={cardHeader}>

            <ShoppingBag size={16} color="#2A6DB5" />

          </div>

          <p style={labelStyle}>
            Total Orders
          </p>

          <h3 style={valueStyle}>
            {kpiData.totalOrders}
          </h3>

        </div>

        {/* ================= CUSTOMERS CARD ================= */}
        <div style={cardStyle}>

          <div style={cardHeader}>

            <Users size={16} color="#7B4FBF" />

          </div>

          <p style={labelStyle}>
            Active Customers
          </p>

          <h3 style={valueStyle}>
            {kpiData.activeCustomers}
          </h3>

        </div>

        {/* ================= AVERAGE REVENUE CARD ================= */}
        <div style={cardStyle}>

          <div style={cardHeader}>

            <TrendingUp size={16} color="#C26A1A" />

          </div>

          <p style={labelStyle}>
            Average Revenue Per Order
          </p>

          {/* fixed to 2 decimal places */}
          <h3 style={valueStyle}>
            R {Number(kpiData.avgRevenue).toFixed(2)}
          </h3>

        </div>

      </div>
    </section>
  );
}