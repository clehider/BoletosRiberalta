import { initSociosIngresos } from './firebase/initSociosIngresos';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'  // Asegúrate que esta línea esté presente

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
initSociosIngresos().then(() => {
  console.log('Base de datos inicializada con socios e ingresos de ejemplo');

}).catch((error: Error) => {
  console.error('Error al inicializar datos:', error);
});
