import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import VentaPasajes from "./components/VentaPasajes";
import GestionVehiculos from "./components/GestionVehiculos";
import GestionConductores from "./components/GestionConductores";
import Reportes from "./components/Reportes";
import CajaChica from "./components/CajaChica";

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/"
              element={user ? <VentaPasajes /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/vehiculos"
              element={user ? <GestionVehiculos /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/conductores"
              element={user ? <GestionConductores /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/reportes"
              element={user ? <Reportes /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/caja-chica"
              element={user ? <CajaChica /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
