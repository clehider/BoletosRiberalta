import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase/config"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "./components/Navbar"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import VentaPasajes from "./components/VentaPasajes"
import GestionVehiculos from "./components/GestionVehiculos"
import GestionConductores from "./components/GestionConductores"
import Reportes from "./components/Reportes"
import CajaChica from "./components/CajaChica"
import Gastos from "./components/Gastos"

const App = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background">
          {user && <Navbar />}
          <main className="container mx-auto py-6">
            <Routes>
              <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/venta-pasajes" element={user ? <VentaPasajes /> : <Navigate to="/login" />} />
              <Route path="/vehiculos" element={user ? <GestionVehiculos /> : <Navigate to="/login" />} />
              <Route path="/conductores" element={user ? <GestionConductores /> : <Navigate to="/login" />} />
              <Route path="/reportes" element={user ? <Reportes /> : <Navigate to="/login" />} />
              <Route path="/caja-chica" element={user ? <CajaChica /> : <Navigate to="/login" />} />
              <Route path="/gastos" element={user ? <Gastos /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
