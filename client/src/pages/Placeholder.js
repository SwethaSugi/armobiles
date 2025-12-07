import React from 'react';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';
import './Placeholder.css';

const Placeholder = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
      <Navigation />
      <div className="dashboard-container">
        <div className="container-fluid mt-3">
          <div className="placeholder-page">
            <h2>{title || 'Page Coming Soon'}</h2>
            <p>{description || 'This page is under development and will be available soon.'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Placeholder;