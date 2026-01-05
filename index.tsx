import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering React app:', error);
  rootElement.innerHTML = `
    <div style="color: white; padding: 20px; font-family: Arial;">
      <h1>Erro ao carregar a aplicação</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>Por favor, abra o console do navegador (F12) para mais detalhes.</p>
    </div>
  `;
}
