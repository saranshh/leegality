import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

const ITEMS_PER_PAGE = 8

function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // State for raw data
  const [categories, setCategories] = useState([])
  const [rawProducts, setRawProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Price range local state (so they only filter when clicking "Apply" button, matching PDF layout)
  const [localMinPrice, setLocalMinPrice] = useState('')
  const [localMaxPrice, setLocalMaxPrice] = useState('')

  // Sync price input fields from URL search parameters on load
  useEffect(() => {
    setLocalMinPrice(searchParams.get('minPrice') || '')
    setLocalMaxPrice(searchParams.get('maxPrice') || '')
  }, [searchParams])

  // Get current filter states from URL search params
  const activeSearch = searchParams.get('search') || ''
  
  // Multiple categories from URL query (comma-separated)
  const selectedCategories = useMemo(() => {
    const catsStr = searchParams.get('categories') || ''
    return catsStr ? catsStr.split(',') : []
  }, [searchParams])

  // Multiple brands from URL query
  const selectedBrands = useMemo(() => {
    const brandsStr = searchParams.get('brands') || ''
    return brandsStr ? brandsStr.split(',') : []
  }, [searchParams])

  const minPriceFilter = searchParams.get('minPrice') || ''
  const maxPriceFilter = searchParams.get('maxPrice') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // Fetch categories & all products on mount (limit=0 fetches all 194 products)
  useEffect(() => {
    async function initFetch() {
      try {
        setLoading(true)
        setError(null)

        const [catRes, prodRes] = await Promise.all([
          fetch('https://dummyjson.com/products/categories'),
          fetch('https://dummyjson.com/products?limit=0')
        ])

        if (!catRes.ok || !prodRes.ok) {
          throw new Error('Failed to fetch store data')
        }

        const catData = await catRes.json()
        const prodData = await prodRes.json()

        setCategories(catData || [])
        setRawProducts(prodData.products || [])
      } catch (err) {
        setError(err.message || 'Something went wrong while fetching data')
      } finally {
        setLoading(false)
      }
    }
    initFetch()
  }, [])

  // Helper to update filters in URL search params (resets page to 1)
  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1')

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    setSearchParams(params)
  }

  // Handle Category check/uncheck
  const handleCategoryToggle = (slug) => {
    let nextCategories
    if (selectedCategories.includes(slug)) {
      nextCategories = selectedCategories.filter((c) => c !== slug)
    } else {
      nextCategories = [...selectedCategories, slug]
    }
    updateFilters({ categories: nextCategories.join(',') })
  }

  // Handle Brand check/uncheck
  const handleBrandToggle = (brand) => {
    let nextBrands
    if (selectedBrands.includes(brand)) {
      nextBrands = selectedBrands.filter((b) => b !== brand)
    } else {
      nextBrands = [...selectedBrands, brand]
    }
    updateFilters({ brands: nextBrands.join(',') })
  }

  // Apply Price Range
  const handleApplyPriceRange = (e) => {
    e.preventDefault()
    updateFilters({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice
    })
  }

  // Clear all filters
  const handleClearFilters = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    setSearchParams({ page: '1' })
  }

  // Helper to format Category slugs to match category names
  const getCategoryName = (slug) => {
    const cat = categories.find((c) => c.slug === slug)
    return cat ? cat.name : slug
  }

  // Extract available brands dynamically based on currently loaded / selected categories
  const availableBrands = useMemo(() => {
    let productsForBrands = rawProducts
    
    // If specific categories are selected, restrict brands list to those categories
    if (selectedCategories.length > 0) {
      productsForBrands = rawProducts.filter((p) => selectedCategories.includes(p.category))
    }

    const brands = productsForBrands
      .map((p) => p.brand)
      .filter((b) => b) // filter out undefined/null/empty
    
    return [...new Set(brands)].sort()
  }, [rawProducts, selectedCategories])

  // Combine filters: Categories, Search query, Brands, Price Range
  const filteredProducts = useMemo(() => {
    return rawProducts.filter((product) => {
      // 1. Search filter (check title, description, brand, category)
      if (activeSearch !== '') {
        const query = activeSearch.toLowerCase()
        const titleMatch = product.title?.toLowerCase().includes(query)
        const descMatch = product.description?.toLowerCase().includes(query)
        const brandMatch = product.brand?.toLowerCase().includes(query)
        const catMatch = product.category?.toLowerCase().includes(query)
        
        if (!titleMatch && !descMatch && !brandMatch && !catMatch) {
          return false
        }
      }

      // 2. Categories filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(product.category)) {
          return false
        }
      }

      // 3. Brands filter
      if (selectedBrands.length > 0) {
        if (!product.brand || !selectedBrands.includes(product.brand)) {
          return false
        }
      }

      // 4. Price range filter
      if (minPriceFilter !== '') {
        const min = parseFloat(minPriceFilter)
        if (!isNaN(min) && product.price < min) return false
      }
      if (maxPriceFilter !== '') {
        const max = parseFloat(maxPriceFilter)
        if (!isNaN(max) && product.price > max) return false
      }

      return true
    })
  }, [rawProducts, activeSearch, selectedCategories, selectedBrands, minPriceFilter, maxPriceFilter])

  // Pagination bounds checking
  const totalItems = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const activePage = currentPage > totalPages ? totalPages : currentPage

  const paginatedProducts = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProducts, activePage])

  const handlePageChange = (pageNum) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNum.toString())
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get a sliding window of visible page numbers
  const getPageNumbers = () => {
    const maxVisible = 5
    const pages = []
    
    let start = Math.max(1, activePage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <main className="container">
      <div className="listing-layout">
        
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div className="filter-header-row">
            <span className="filter-header-title">🔍 Filters</span>
            <button className="clear-btn" onClick={handleClearFilters} style={{ fontSize: '0.8rem' }}>
              Clear
            </button>
          </div>

          {/* Sidebar local Search bar (matches PDF screenshot 3) */}
          <div className="sidebar-search-box">
            <span className="sidebar-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              className="sidebar-search-input"
              value={activeSearch}
              onChange={(e) => updateFilters({ search: e.target.value })}
              aria-label="Filter by keyword"
            />
          </div>

          {/* Categories checklist */}
          <div className="filter-group">
            <h3 className="filter-group-title">Categories</h3>
            <div className="checklist-container">
              {categories.map((cat) => (
                <label key={cat.slug} className="checklist-item">
                  <input
                    type="checkbox"
                    className="checklist-checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryToggle(cat.slug)}
                  />
                  <span className="checklist-label-text" title={cat.name}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range with Apply Button */}
          <div className="filter-group">
            <h3 className="filter-group-title">Price Range</h3>
            <form onSubmit={handleApplyPriceRange}>
              <div className="price-range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  className="price-box-input"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  min="0"
                  aria-label="Min price filter"
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="price-box-input"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  min="0"
                  aria-label="Max price filter"
                />
              </div>
              <button type="submit" className="price-apply-btn">
                Apply
              </button>
            </form>
          </div>

          {/* Brand checklist */}
          <div className="filter-group">
            <h3 className="filter-group-title">Brands</h3>
            {loading ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : availableBrands.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No brands found</div>
            ) : (
              <div className="checklist-container">
                {availableBrands.map((brand) => (
                  <label key={brand} className="checklist-item">
                    <input
                      type="checkbox"
                      className="checklist-checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <span className="checklist-label-text" title={brand}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Product area grid */}
        <section className="product-area">
          {error ? (
            <div className="error-container">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button className="price-apply-btn" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          ) : loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading catalog...</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {paginatedProducts.length === 0 ? (
                  <div className="empty-results">
                    <h3>No products found</h3>
                    <p>Try broadening your filter checklist criteria.</p>
                  </div>
                ) : (
                  paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>

              {/* Centered Pagination (matches PDF layout) */}
              {totalItems > ITEMS_PER_PAGE && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(activePage - 1)}
                    disabled={activePage === 1}
                  >
                    ← Previous
                  </button>

                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`page-btn ${activePage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(activePage + 1)}
                    disabled={activePage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </div>
    </main>
  )
}

export default ProductListingPage
