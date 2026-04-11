import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import "./index.css"
import { DashboardPage } from "./pages/Dashboard.tsx"
import { SchemaExplorerPage } from "./pages/SchemaExplorer.tsx"
import { SavedViewsPage } from "./pages/SavedViews.tsx"
import { LoginPage } from "./pages/Login.tsx"
import { SettingsPage } from "./pages/Settings.tsx"
import { AuthProvider } from "./contexts/AuthContext.tsx"
import { ProtectedRoute } from "./components/ProtectedRoute.tsx"
import { PublicRoute } from "./components/PublicRoute.tsx"
import { AppLayout } from "./components/AppLayout.tsx"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/schema" element={
        <ProtectedRoute>
          <AppLayout>
            <SchemaExplorerPage /> 
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/saved" element={
        <ProtectedRoute>
          <AppLayout>
            <SavedViewsPage />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      } />
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

