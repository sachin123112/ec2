import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const reportTypes = [
  'Sales Report',
  'Order Report',
  'Customer Report',
  'Inventory Report',
];
const reportFormats = ['PDF', 'Excel', 'CSV'];
const categories = ['All Categories', 'Dogs', 'Fish', 'Plants', 'Birds', 'Pet Food', 'Fish Food', 'Aquarium'];
const products = ['All Products', 'Dog Food', 'Cat Toy', 'Aquarium Filter', 'Bird Cage'];
const brands = ['All Brands', 'PawNature', 'AquaLife', 'PetJoy', 'GreenGrow'];
const statuses = ['All Status', 'Pending', 'Completed', 'Cancelled', 'Refunded'];
const customers = ['All Customers', 'Retail', 'Wholesale', 'Guest'];

export default function Reports() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState(reportTypes[0]);
  const [reportFormat, setReportFormat] = useState(reportFormats[0]);
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [category, setCategory] = useState(categories[0]);
  const [product, setProduct] = useState(products[0]);
  const [brand, setBrand] = useState(brands[0]);
  const [paymentStatus, setPaymentStatus] = useState(statuses[0]);
  const [orderStatus, setOrderStatus] = useState(statuses[0]);
  const [customer, setCustomer] = useState(customers[0]);
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [includeTaxDetails, setIncludeTaxDetails] = useState(true);
  const [submitStatus, setSubmitStatus] = useState('');

  const summaryItems = useMemo(() => [
    { label: 'Accurate real-time data', icon: '✓' },
    { label: 'Multiple formats supported', icon: '✓' },
    { label: 'Custom date range', icon: '✓' },
    { label: 'Easy to download & share', icon: '✓' },
  ], []);

  const recentReports = useMemo(() => [
    { title: 'Sales Report - May 2026', format: 'PDF', size: '1.2 MB', date: '02 Jun 2026', time: '11:30 AM' },
    { title: 'Order Report - May 2026', format: 'Excel', size: '850 KB', date: '01 Jun 2026', time: '05:15 PM' },
    { title: 'Customer Report - May 2026', format: 'PDF', size: '950 KB', date: '31 May 2026', time: '09:45 AM' },
  ], []);

  function resetForm() {
    setReportType(reportTypes[0]);
    setReportFormat(reportFormats[0]);
    setStartDate('2026-06-01');
    setEndDate('2026-06-30');
    setCategory(categories[0]);
    setProduct(products[0]);
    setBrand(brands[0]);
    setPaymentStatus(statuses[0]);
    setOrderStatus(statuses[0]);
    setCustomer(customers[0]);
    setIncludeCancelled(false);
    setIncludeTaxDetails(true);
    setSubmitStatus('');
  }

  function generateReport(event) {
    event.preventDefault();
    setSubmitStatus('Generating report...');
    window.setTimeout(() => setSubmitStatus('Report generated successfully. Download will begin shortly.'), 800);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <div className="breadcrumb">
            <button type="button" className="breadcrumb-link" onClick={() => navigate('/admin')}>Dashboard</button>
            <span>›</span>
            <button type="button" className="breadcrumb-link" onClick={() => navigate('/reports')}>Reports</button>
            <span>›</span>
            <span>Generate Report</span>
          </div>
          <h1>Generate Report</h1>
          <p className="page-description">Select the report type and filters to generate your report.</p>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-left-column">
          <div className="dashboard-card">
            <h2>Report Details</h2>
            <p className="card-note">Select the report type and filters to generate your report.</p>
            <form onSubmit={generateReport} className="panel-form">
              <div className="form-grid">
                <label>
                  Report Type <span className="required">*</span>
                  <select value={reportType} onChange={e => setReportType(e.target.value)}>
                    {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label>
                  Report Format <span className="required">*</span>
                  <select value={reportFormat} onChange={e => setReportFormat(e.target.value)}>
                    {reportFormats.map(format => <option key={format} value={format}>{format}</option>)}
                  </select>
                </label>
                <label>
                  Date Range <span className="required">*</span>
                  <div className="date-range-row">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>to</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </label>
              </div>

              <div className="report-filters-heading">Filters <span className="optional">(Optional)</span></div>
              <div className="form-grid filter-grid">
                <label>
                  Category
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {categories.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Product
                  <select value={product} onChange={e => setProduct(e.target.value)}>
                    {products.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Brand
                  <select value={brand} onChange={e => setBrand(e.target.value)}>
                    {brands.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Payment Status
                  <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                    {statuses.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Order Status
                  <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
                    {statuses.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Customer
                  <select value={customer} onChange={e => setCustomer(e.target.value)}>
                    {customers.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              </div>

              <div className="additional-options">
                <label className="checkbox-label">
                  <input type="checkbox" checked={includeCancelled} onChange={e => setIncludeCancelled(e.target.checked)} />
                  Include Cancelled Orders
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={includeTaxDetails} onChange={e => setIncludeTaxDetails(e.target.checked)} />
                  Include Tax Details
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={resetForm}>Reset</button>
                <button type="submit" className="btn-primary">Generate Report</button>
              </div>
              {submitStatus && <p className="status-note report-status">{submitStatus}</p>}
            </form>
          </div>
        </div>

        <div className="dashboard-right-side">
          <div className="side-card">
            <div className="side-card-header">
              <div>
                <h3>About Reports</h3>
                <p>Generate and download detailed reports based on your selected criteria.</p>
              </div>
            </div>
            <div className="side-stat-grid">
              {summaryItems.map(item => (
                <div key={item.label} className="side-stat">
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="side-card">
            <div className="side-card-header">
              <div>
                <h3>Recent Reports</h3>
                <p>View your latest generated files.</p>
              </div>
              <button type="button" className="breadcrumb-link" onClick={() => navigate('/reports')}>View All</button>
            </div>
            <div className="recent-report-list">
              {recentReports.map(report => (
                <div key={report.title} className="recent-report-item">
                  <div>
                    <strong>{report.title}</strong>
                    <p>{report.format} · {report.size}</p>
                  </div>
                  <div className="recent-report-date">
                    <span>{report.date}</span>
                    <span>{report.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="side-card">
            <div className="side-card-header">
              <div>
                <h3>Need Help?</h3>
                <p>Learn more about reports and how to customize them.</p>
              </div>
            </div>
            <button type="button" className="btn-primary btn-full">Help Center →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
