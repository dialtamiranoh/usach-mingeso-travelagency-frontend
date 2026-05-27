// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import HeaderFooter from './components/HeaderFooter'

// Public pages
import Home from './pages/Home'
import PackageDetail from './pages/customer/PackageDetail'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminPackages from './pages/admin/Packages'
import AdminCategories from './pages/admin/Categories'
import AdminDestinations from './pages/admin/Destinations'
import AdminSeasons from './pages/admin/Seasons'
import AdminPackageTypes from './pages/admin/PackageTypes'
import AdminServices from './pages/admin/Services'
import AdminPromotions from './pages/admin/Promotions'
import AdminStatuses from './pages/admin/Statuses'
import AdminBookings from './pages/admin/Bookings'
import AdminPayments from './pages/admin/Payments'
import AdminReports from './pages/admin/Reports'

// Customer pages
import MyBookings from './pages/customer/MyBookings'
import MyBookingDetail from './pages/customer/MyBookingDetail'
import MyPayments from './pages/customer/MyPayments'

function App() {
  return (
    <Router>
      <Sidebar />
      <HeaderFooter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/customer/packages/:id" element={<PackageDetail />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/packages" element={<AdminPackages />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/destinations" element={<AdminDestinations />} />
          <Route path="/admin/seasons" element={<AdminSeasons />} />
          <Route path="/admin/package-types" element={<AdminPackageTypes />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/statuses" element={<AdminStatuses />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          {/* Customer */}
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-bookings/:id" element={<MyBookingDetail />} />
          <Route path="/my-payments" element={<MyPayments />} />
        </Routes>
      </HeaderFooter>
    </Router>
  )
}

export default App