import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImage, setActiveImage] = useState('')

  useEffect(() => {
    async function fetchProductDetail() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`https://dummyjson.com/products/${id}`)
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        setProduct(data)
        setActiveImage(data.thumbnail || (data.images && data.images[0]) || '')
      } catch (err) {
        setError(err.message || 'Unable to fetch product detail')
      } finally {
        setLoading(false)
      }
    }
    fetchProductDetail()
  }, [id])

  const handleBack = () => {
    navigate(-1)
  }

  // Helper to render rating stars with font compatibility
  const renderStars = (ratingVal) => {
    const stars = []
    const roundedRating = Math.round(ratingVal)

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= roundedRating ? 'var(--amazon-yellow-hover)' : '#ccc' }}>
          ★
        </span>
      )
    }
    return stars
  }

  if (loading) {
    return (
      <main className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Loading product details...
          </p>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="container">
        <div className="back-link-container">
          <button className="back-link-btn" onClick={handleBack}>
            ← Back to Products
          </button>
        </div>
        <div className="error-container">
          <h3>Error Loading Details</h3>
          <p>{error || 'Product details are currently unavailable.'}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </main>
    )
  }

  // Calculate original price
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0
  const originalPrice = hasDiscount
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    : null

  // Combine thumbnail and other images, removing duplicates
  const productImages = [...new Set([product.thumbnail, ...(product.images || [])])].filter(Boolean)

  return (
    <main className="detail-container">
      <div className="back-link-container">
        <button className="back-link-btn" onClick={handleBack}>
          ← Back to Products
        </button>
      </div>

      <div className="detail-card">
        
        {/* Left Half: Gallery */}
        <section className="detail-gallery">
          <div className="main-image-container">
            <img 
              src={activeImage} 
              alt={product.title} 
              className="main-image"
            />
          </div>
          {productImages.length > 1 && (
            <div className="thumbnail-row">
              {productImages.map((imgUrl, index) => (
                <button
                  key={index}
                  className={`thumb-btn ${activeImage === imgUrl ? 'active' : ''}`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="thumb-img" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Right Half: Details */}
        <section className="detail-info">
          <div className="detail-category">{product.category}</div>
          <h1 className="detail-title">{product.title}</h1>
          
          <div className="detail-rating-row">
            <span className="star-rating">{renderStars(product.rating)}</span>
            <span style={{ fontWeight: 600 }}>({product.rating.toFixed(1)})</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--amazon-blue)' }}>{product.reviews ? product.reviews.length : 0} reviews</span>
          </div>

          <div className="detail-price-box">
            <div className="detail-price-row">
              <span className="detail-price">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="detail-original-price">${originalPrice}</span>
                  <span className="detail-discount-pill">
                    {Math.round(product.discountPercentage)}% OFF
                  </span>
                </>
              )}
            </div>
            
            <div 
              className="detail-status" 
              style={{ color: product.stock > 0 ? '#007600' : '#b12704' }}
            >
              {product.stock > 0 ? `In Stock (${product.stock} items left)` : 'Currently Unavailable'}
            </div>
          </div>

          <div className="detail-description-section">
            <h3 className="detail-desc-title">Description</h3>
            <p className="detail-desc-text">{product.description}</p>
          </div>

          {/* Specifications Table */}
          <h3 className="detail-desc-title">Product Details</h3>
          <table className="specs-table">
            <tbody>
              <tr>
                <td className="specs-label">Brand</td>
                <td className="specs-value">{product.brand || 'Generic'}</td>
              </tr>
              <tr>
                <td className="specs-label">Category</td>
                <td className="specs-value">{product.category}</td>
              </tr>
              {product.warrantyInformation && (
                <tr>
                  <td className="specs-label">Warranty</td>
                  <td className="specs-value">{product.warrantyInformation}</td>
                </tr>
              )}
              {product.shippingInformation && (
                <tr>
                  <td className="specs-label">Shipping</td>
                  <td className="specs-value">{product.shippingInformation}</td>
                </tr>
              )}
              {product.dimensions && (
                <tr>
                  <td className="specs-label">Dimensions</td>
                  <td className="specs-value">
                    {product.dimensions.width}W x {product.dimensions.height}H x {product.dimensions.depth}D cm
                  </td>
                </tr>
              )}
              {product.weight && (
                <tr>
                  <td className="specs-label">Weight</td>
                  <td className="specs-value">{product.weight} kg</td>
                </tr>
              )}
              {product.returnPolicy && (
                <tr>
                  <td className="specs-label">Return Policy</td>
                  <td className="specs-value">{product.returnPolicy}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="reviews-container">
          <h2 className="reviews-title">Customer Reviews</h2>
          <div className="reviews-list">
            {product.reviews.map((rev, index) => (
              <div key={index} className="review-item">
                <div className="reviewer-header">
                  <span className="reviewer-name">👤 {rev.reviewerName}</span>
                  <span className="review-date">on {new Date(rev.date).toLocaleDateString()}</span>
                </div>
                <div className="star-rating" style={{ fontSize: '0.85rem' }}>
                  {renderStars(rev.rating)}
                </div>
                <p className="review-comment">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default ProductDetailPage
