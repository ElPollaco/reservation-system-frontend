import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import CompanySelectPage from './pages/CompanySelectPage/CompanySelectPage.jsx';
import DashboardPage from './pages/DashboardPage/DashboardPage.jsx';
import './styles/global.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>

          <Route
            path="/select-company"
            element={
              <PrivateRoute>
                <CompanySelectPage/>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute requireCompany>
                <DashboardPage/>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace/>}/>
          <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;