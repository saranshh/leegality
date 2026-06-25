import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProductListingPage from './pages/ProductListingPage'
import ProductDetailPage from './pages/ProductDetailPage'

function Header() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    setSearchValue(searchParams.get('search') || '')
  }, [searchParams])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    navigate(`/?search=${encodeURIComponent(searchValue)}&page=1`)
  }

  return (
    <header className="amazon-header-container">
      {/* Upper Main Navbar */}
      <div className="nav-main">
        {/* Logo */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <span className="logo-text">leegality</span>
            <span className="logo-domain">.in</span>
            <div className="logo-arrow-container">
              {/* Curved orange arrow connecting l to y */}
              <svg className="logo-arrow" viewBox="0 0 100 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 2C30 12 70 12 90 2" stroke="#ff9900" strokeWidth="3" strokeLinecap="round" />
                <path d="M85 2L92 2L89 8" stroke="#ff9900" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>

          {/* Location Delivery Selector */}
          <div className="nav-delivery">
            <div className="delivery-icon">📍</div>
            <div className="delivery-text-container">
              <span className="delivery-line1">Delivering to Bengaluru 562130</span>
              <span className="delivery-line2">Update location</span>
            </div>
          </div>
        </div>

        {/* Center Search Bar */}
        <form className="nav-search-bar" onSubmit={handleSearchSubmit}>
          <div className="search-dropdown-wrapper">
            <select className="search-category-select" aria-label="Search category">
              <option value="all">All</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search Leegality.in"
            className="nav-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Search Leegality.in"
          />
          <button type="submit" className="nav-search-submit-btn" aria-label="Go">
            {/* Magnifying glass SVG */}
            <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        {/* Right Section Links */}
        <div className="nav-right">
          {/* Language Selector */}
          <div className="nav-link-item language-selector">
            <span className="flag-icon">🇮🇳</span>
            <span className="language-text">EN</span>
            <span className="arrow-down">▼</span>
          </div>

          {/* Account Lists */}
          <div className="nav-link-item">
            <span className="link-line1">Hello, sign in</span>
            <span className="link-line2">Account & Lists <span className="arrow-down">▼</span></span>
          </div>

          {/* Returns & Orders */}
          <div className="nav-link-item">
            <span className="link-line1">Returns</span>
            <span className="link-line2">& Orders</span>
          </div>

          {/* Shopping Cart */}
          <Link to="/" className="nav-cart-container">
            <div className="cart-icon-wrapper">
              {/* Cart SVG */}
              <svg className="cart-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <span className="cart-label">Cart</span>
          </Link>
        </div>
      </div>

      {/* Lower Sub Navbar (nav-sub) */}
      <div className="nav-sub">
        <div className="nav-sub-left">
          <span className="nav-sub-item all-menu-btn">☰ All</span>
          <span className="nav-sub-item">Fresh</span>
          <span className="nav-sub-item">MX Player</span>
          <span className="nav-sub-item">Sell</span>
          <span className="nav-sub-item">Bestsellers</span>
          <span className="nav-sub-item">Today's Deals</span>
          <span className="nav-sub-item">Prime ▼</span>
          <span className="nav-sub-item">Mobiles</span>
          <span className="nav-sub-item">New Releases</span>
          <span className="nav-sub-item">Customer Service</span>
          <span className="nav-sub-item">Amazon Pay</span>
          <span className="nav-sub-item">Electronics</span>
        </div>
        <div className="nav-sub-right">
          <span className="nav-sub-item prime-day-ad">prime day | 4 - 6 July</span>
        </div>
      </div>
    </header>
  )
}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<ProductListingPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
      </Routes>
    </Router>
  )
}

export default App
