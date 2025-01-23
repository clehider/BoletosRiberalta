import { Link } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/config"
import { Bus, Users, FileText, Wallet, Receipt, LogOut, Menu, Home } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Navbar: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const menuItems = [
    { path: "/", icon: <Home className="w-4 h-4" />, label: "Dashboard" },
    { path: "/venta-pasajes", icon: <Bus className="w-4 h-4" />, label: "Venta de Pasajes" },
    { path: "/vehiculos", icon: <Bus className="w-4 h-4" />, label: "Gestión de Vehículos" },
    { path: "/conductores", icon: <Users className="w-4 h-4" />, label: "Gestión de Conductores" },
    { path: "/reportes", icon: <FileText className="w-4 h-4" />, label: "Reportes" },
    { path: "/socios", icon: <Users className="w-4 h-4" />, label: "Gestión de Socios" },  
    { path: "/ingresos", icon: <Receipt className="w-4 h-4" />, label: "Registro de Ingresos" },   
    { path: "/caja-chica", icon: <Wallet className="w-4 h-4" />, label: "Caja Chica" },
    { path: "/gastos", icon: <Receipt className="w-4 h-4" />, label: "Gastos" },
  ]

  return (
    <nav className="bg-white border-b shadow-sm dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Bus className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Sistema de Pasajes</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Button variant="outline" className="flex items-center space-x-1" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
