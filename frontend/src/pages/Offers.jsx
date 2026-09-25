import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Offers.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

function resolveBannerUrl(imageUrl) {
  if (!imageUrl || /^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  return `${API_URL.replace(/\/api\/v1\/?$/, '')}/${imageUrl.replace(/^\/+/, '')}`;
}

const offers = [
  {
    title: 'Healthy meals\nfor happier pets',
    detail: 'Save on premium food from trusted brands.',
    code: 'MEAL30',
    discount: 'Up to 30% OFF',
    link: '/shop?category=Food',
    image: '/images/product-royal-canin.png',
    className: 'offer-food',
  },
  {
    title: 'Toys & accessories\nfor every adventure',
    detail: 'Make playtime brighter with new favourites.',
    code: 'PLAY20',
    discount: '20% OFF',
    link: '/shop?category=Toys',
    image: '/images/promo-toys.png',
    className: 'offer-toys',
  },
  {
    title: 'Welcome home,\nnew pet parent',
    detail: 'A little extra love for your first PawMart order.',
    code: 'WELCOME15',
    discount: '15% OFF',
    link: '/shop',
    image: '/images/hero-pets.png',
    className: 'offer-welcome',
  },
  {
    title: 'Bring your aquarium\nto life',
    detail: 'Fresh plants and essentials for a vibrant tank.',
    code: 'AQUA10',
    discount: '10% OFF',
    link: '/shop?category=Aquarium%20Plants',
    image: '/images/category-aquarium-plants.png',
    className: 'offer-aquarium',
  },
];

export default function Offers() {
  const [productCount, setProductCount] = useState(null);
  const [pageBanner, setPageBanner] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_URL}/products`)
      .then(response => response.ok ? response.json() : [])
      .then(products => { if (mounted) setProductCount(products.length); })
      .catch(() => {});

    fetch(`${API_URL}/banners?page=OFFERS`)
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        if (!mounted) return;
        setPageBanner(Array.isArray(data) && data.length > 0 ? data[0] : null);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <div className="offers-page">
      {pageBanner && (
        <section aria-label="Offer page banner" style={{ width: 'min(1200px, calc(100% - 32px))', margin: '1rem auto 0', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(21, 33, 59, 0.08)' }}>
          <img src={resolveBannerUrl(pageBanner.imageUrl)} alt="Offer banner" style={{ display: 'block', width: '100%', height: '220px', objectFit: 'cover' }} />
        </section>
      )}
      <section className="offers-hero">
        <div>
          <span className="offers-kicker">PawMart specials</span>
          <h1>More love.<br /><strong>Less spend.</strong></h1>
          <p>Thoughtful offers for the pets who make every day happier.</p>
          <Link to="/shop" className="offers-primary">Shop all offers <b>→</b></Link>
        </div>
        <img src="/images/hero-pets.png" alt="Happy dog and cat" />
        <span className="offers-burst">Fresh<br /><strong>deals</strong><br />for pets</span>
      </section>

      <section className="offers-content">
        <div className="offers-heading">
          <div>
            <span className="offers-kicker">Save on the good stuff</span>
            <h2>Offers made for <strong>happy pets</strong></h2>
          </div>
          <span className="offers-count">{productCount ? `${productCount} products available` : 'Limited-time specials'}</span>
        </div>

        <div className="offers-grid">
          {offers.map(offer => (
            <article className={`offer-card ${offer.className}`} key={offer.code}>
              <div className="offer-card-copy">
                <span className="offer-discount">{offer.discount}</span>
                <h3>{offer.title.split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h3>
                <p>{offer.detail}</p>
                <div className="offer-code">Use code <strong>{offer.code}</strong></div>
                <Link to={offer.link} className="offer-link">Shop now <b>→</b></Link>
              </div>
              <img src={offer.image} alt="" loading="lazy" />
            </article>
          ))}
        </div>

        <section className="offers-bottom-banner" aria-label="Pet offers banner">
          <div className="offers-bottom-banner__content">
            <div className="offers-bottom-banner__brand">
              <span className="brand-badge">🐾</span>
              <div>
                <span className="brand-label">PawMart</span>
                <strong>Get Special Offers &amp; Pet Care Tips</strong>
              </div>
            </div>

            <div className="offers-bottom-banner__meta">
              <span>Free delivery</span>
              <span>Healthy food</span>
              <span>Pet care</span>
            </div>

            <div className="offers-bottom-banner__cta">
              <button type="button" className="offers-bottom-banner__button">Explore now</button>
            </div>
          </div>

          <div className="offers-bottom-banner__visual" aria-hidden="true">
            <div className="pet-image-card pet-image-card--large">
              <img src="/images/category-dogs.png" alt="Dog" />
            </div>
            <div className="pet-image-stack">
              <div className="pet-image-card pet-image-card--small">
                <img src="/images/category-cats.png" alt="Cat" />
              </div>
              <div className="pet-image-card pet-image-card--small pet-image-card--accent">
                <img src="/images/hero-pets.png" alt="Happy pets" />
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
