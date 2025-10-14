import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Voice from './pages/Voice';
import Kitchen from './pages/Kitchen';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 1000, margin: '24px auto', fontFamily: 'system-ui, Arial' }}>
        <h1><center>Bon Appétit</center></h1>
        <center> 
        <nav style={{ display: 'inline-flex', gap: 12, marginBottom: 16 }}> 
          <Link to="/">Voice</Link>
          <Link to="/kitchen">Kitchen</Link>
          <Link to="/admin">Admin</Link>
        </nav>
        </center>
        <Routes>
          <Route path="/" element={<Voice />} />
          <Route path="/kitchen" element={<Kitchen />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
