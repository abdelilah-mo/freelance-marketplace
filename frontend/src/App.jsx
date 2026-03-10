import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CreateServicePage from './pages/CreateServicePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import PaymentResultPage from './pages/PaymentResultPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ServiceDetailsPage from './pages/ServiceDetailsPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/services" element={<HomePage />} />
        <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payments/:result" element={<PaymentResultPage />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/services/new"
          element={(
            <ProtectedRoute roles={['freelancer', 'admin']}>
              <CreateServicePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/services/:serviceId/edit"
          element={(
            <ProtectedRoute roles={['freelancer', 'admin']}>
              <CreateServicePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/services/:serviceId/order"
          element={(
            <ProtectedRoute roles={['client', 'admin']}>
              <OrderPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin"
          element={(
            <ProtectedRoute roles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
