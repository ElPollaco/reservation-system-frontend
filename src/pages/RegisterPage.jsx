// src/pages/RegisterPage.jsx
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '1rem' }}>Client Registration</h1>

        <div style={{
          backgroundColor: '#fff3e0',
          color: '#e65100',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1.5rem'
        }}>
          <p>Client registration is not available yet.</p>
          <p>Please contact us directly to create an account.</p>
        </div>

        <Link to="/login" style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#1976d2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;