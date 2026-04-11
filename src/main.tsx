import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import "./index.css"
import { DashboardPage } from "./pages/Dashboard.tsx"
import { LoginPage } from "./pages/Login.tsx"
import { SettingsPage } from "./pages/Settings.tsx"
import { SchemaExplorerPage } from "./pages/SchemaExplorer.tsx"
import { ConnectionSetupPage } from "./pages/ConnectionSetup.tsx"
import { SavedViewsPage } from "./pages/SavedViews.tsx"
import { HistoryPage } from "./pages/History.tsx"

import { AuthProvider } from "./contexts/AuthContext.tsx"
import { ProtectedRoute } from "./components/ProtectedRoute.tsx"
import { PublicRoute } from "./components/PublicRoute.tsx"
import { AppLayout } from "./components/Layout/AppLayout.tsx"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      
      {/* Standalone Route for Connection Setup */}
      <Route path="/connect" element={
        <ProtectedRoute>
          <ConnectionSetupPage />
        </ProtectedRoute>
      } />

      {/* Routes wrapped in AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/schema" element={<SchemaExplorerPage />} />
        <Route path="/saved" element={<SavedViewsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
