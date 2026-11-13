import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/auth'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RefugeesPage from './pages/RefugeesPage'
import FamiliesPage from './pages/FamiliesPage'
import InventoryPage from './pages/InventoryPage'
import RequestsPage from './pages/RequestsPage'
import DistributionsPage from './pages/DistributionsPage'
import DonorsPage from './pages/DonorsPage'
import UsersPage from './pages/UsersPage'
import ReportsPage from './pages/ReportsPage'
import AuditPage from './pages/AuditPage'
import CampPage from './pages/CampPage'
import NotificationsPage from './pages/NotificationsPage'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sky-600">Loading…</div>
  return user ? <AppLayout /> : <Navigate to="/login" replace />
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth()
  return roles.includes(user?.role_name) ? children : <Navigate to="/" replace />
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<DashboardPage />} />
        <Route path="refugees" element={<RoleRoute roles={['Administrator', 'Manager', 'Volunteer']}><RefugeesPage /></RoleRoute>} />
        <Route path="families" element={<RoleRoute roles={['Administrator', 'Manager']}><FamiliesPage /></RoleRoute>} />
        <Route path="camp" element={<RoleRoute roles={['Administrator', 'Manager']}><CampPage /></RoleRoute>} />
        <Route path="inventory" element={<RoleRoute roles={['Administrator', 'Manager', 'Volunteer']}><InventoryPage /></RoleRoute>} />
        <Route path="requests" element={<RoleRoute roles={['Administrator', 'Manager', 'Volunteer', 'Donor']}><RequestsPage /></RoleRoute>} />
        <Route path="distributions" element={<RoleRoute roles={['Administrator', 'Manager', 'Volunteer']}><DistributionsPage /></RoleRoute>} />
        <Route path="donors" element={<RoleRoute roles={['Administrator', 'Manager', 'Donor']}><DonorsPage /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute roles={['Administrator', 'Manager']}><ReportsPage /></RoleRoute>} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="users" element={<RoleRoute roles={['Administrator']}><UsersPage /></RoleRoute>} />
        <Route path="audit" element={<RoleRoute roles={['Administrator']}><AuditPage /></RoleRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
