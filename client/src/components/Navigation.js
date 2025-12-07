import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);
  const dropdownRefs = {
    products: useRef(null),
    billing: useRef(null),
    others: useRef(null),
    user: useRef(null)
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleDropdownMouseEnter = (dropdownName) => {
    // Clear any pending timeout
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(dropdownName);
  };

  const handleDropdownMouseLeave = () => {
    // Delay closing to allow moving cursor to dropdown menu
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.values(dropdownRefs).forEach(ref => {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpenDropdown(null);
        }
      });
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          🏪 TNLocalShop
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li 
              className={`nav-item dropdown ${openDropdown === 'products' ? 'show' : ''}`}
              ref={dropdownRefs.products}
              onMouseEnter={() => handleDropdownMouseEnter('products')}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="productsDropdown"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownToggle('products');
                }}
              >
                Products
              </a>
              <ul 
                className={`dropdown-menu ${openDropdown === 'products' ? 'show' : ''}`}
                aria-labelledby="productsDropdown"
                onMouseEnter={() => handleDropdownMouseEnter('products')}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <li>
                  <Link className="dropdown-item" to="/products" onClick={() => {
                    setIsMenuOpen(false);
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">📦</span>
                    <span className="dropdown-text">All Products</span>
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item" to="/categories" onClick={() => {
                    setIsMenuOpen(false);
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">🏷️</span>
                    <span className="dropdown-text">Manage Categories</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/repairs" onClick={() => setIsMenuOpen(false)}>
                Service Log
              </Link>
            </li>
            <li 
              className={`nav-item dropdown ${openDropdown === 'billing' ? 'show' : ''}`}
              ref={dropdownRefs.billing}
              onMouseEnter={() => handleDropdownMouseEnter('billing')}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="billingDropdown"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownToggle('billing');
                }}
              >
                🧾 Billing
              </a>
              <ul 
                className={`dropdown-menu ${openDropdown === 'billing' ? 'show' : ''}`}
                aria-labelledby="billingDropdown"
                onMouseEnter={() => handleDropdownMouseEnter('billing')}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <li>
                  <Link className="dropdown-item" to="/billing" onClick={() => {
                    setIsMenuOpen(false);
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">➕</span>
                    <span className="dropdown-text">Create Bill</span>
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item" to="/billing/list" onClick={() => {
                    setIsMenuOpen(false);
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">📋</span>
                    <span className="dropdown-text">All Bills</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li 
              className={`nav-item dropdown ${openDropdown === 'others' ? 'show' : ''}`}
              ref={dropdownRefs.others}
              onMouseEnter={() => handleDropdownMouseEnter('others')}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="othersDropdown"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownToggle('others');
                }}
              >
                Others
              </a>
              <ul 
                className={`dropdown-menu ${openDropdown === 'others' ? 'show' : ''}`}
                aria-labelledby="othersDropdown"
                onMouseEnter={() => handleDropdownMouseEnter('others')}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <li>
                  <Link className="dropdown-item" to="/others" onClick={() => {
                    setIsMenuOpen(false);
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">💼</span>
                    <span className="dropdown-text">All Transactions</span>
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item" to="/other-categories" onClick={() => {
                    setIsMenuOpen(false);
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">🏷️</span>
                    <span className="dropdown-text">Manage Categories</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            <li 
              className={`nav-item dropdown ${openDropdown === 'user' ? 'show' : ''}`}
              ref={dropdownRefs.user}
              onMouseEnter={() => handleDropdownMouseEnter('user')}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <a
                className="nav-link dropdown-toggle text-white"
                href="#"
                id="userDropdown"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownToggle('user');
                }}
              >
                <small>
                  <strong>AR MOBILES AND AR ESEVAI</strong>
                </small>
              </a>
              <ul 
                className={`dropdown-menu dropdown-menu-end ${openDropdown === 'user' ? 'show' : ''}`}
                aria-labelledby="userDropdown"
                onMouseEnter={() => handleDropdownMouseEnter('user')}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <li>
                  <Link className="dropdown-item" to="/shop-settings" onClick={() => {
                    setIsMenuOpen(false);
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">⚙️</span>
                    <span className="dropdown-text">Shop Settings</span>
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/profile/change-password" onClick={() => {
                    setIsMenuOpen(false);
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">🔐</span>
                    <span className="dropdown-text">Change Password</span>
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" type="button" onClick={() => {
                    handleLogout();
                    setOpenDropdown(null);
                  }}>
                    <span className="dropdown-icon">🚪</span>
                    <span className="dropdown-text">Logout</span>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;