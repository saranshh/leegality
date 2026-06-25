import { useNavigate } from 'react-router-dom'

function ProductCard({ product }) {
  const navigate = useNavigate()

  const {
    id,
    title,
    price,
    rating,
    discountPercentage,
    thumbnail,
    brand,
    stock
  } = product

  const handleCardClick = () => {
    navigate(`/product/${id}`)
  }

  // Generate star ratings
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

  // Calculate original price if discounted
  const hasDiscount = discountPercentage && discountPercentage > 0
  const originalPrice = hasDiscount
    ? (price / (1 - discountPercentage / 100)).toFixed(2)
    : null

  return (
    <div className="product-card" onClick={handleCardClick}>
      {stock <= 5 && (
        <span 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: stock === 0 ? '#ef4444' : '#f59e0b',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            zIndex: 2
          }}
        >
          {stock === 0 ? 'OUT OF STOCK' : `ONLY ${stock} LEFT`}
        </span>
      )}
      
      <div className="card-img-container">
        <img 
          src={thumbnail} 
          alt={title} 
          className="card-img"
          loading="lazy"
        />
      </div>

      <div className="card-content">
        <div className="card-brand">{brand || 'Generic'}</div>
        <h3 className="card-title" title={title}>{title}</h3>
        
        <div className="card-rating-row">
          <div className="star-rating">{renderStars(rating)}</div>
          <span>({rating.toFixed(1)})</span>
        </div>

        <div className="card-price-row">
          <span className="card-price">${price.toFixed(2)}</span>
          {hasDiscount && (
            <>
              <span className="card-original-price">${originalPrice}</span>
              <span className="card-discount-badge">
                {Math.round(discountPercentage)}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
