import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://simi-pry.com.ar:3000/api/datos');
        
        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }
        
        const data = await response.json();
        setPersonas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    
    <div className="app">
      <helmet>
        <title>SIMI</title>
        <meta name="description" content="Sistema de Monitoreo Inteligente." />
        <link rel="icon" href="./logo.ico" />
      </helmet>
      <h1>Lista de Datos</h1>
      <div className="personas-container">
        {personas.map(persona => (
          <div key={persona._id} className="persona-card">
            <p><strong>Voltage:</strong>{persona.Voltage}</p>
            <p><strong>Corriente:</strong>{persona.Corriente}</p>
            <p><strong>Potencia:</strong> {persona.Potencia}</p>
            <p><strong>Energia:</strong> {persona.Energia}</p>
            <p><strong>Factor de Potencia:</strong> {persona.FPotencia}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
