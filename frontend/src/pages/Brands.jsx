import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Brands.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const brandCategories = [
  { label: 'All Brands', icon: '✦', query: '' },
  { label: 'Dog Brands', icon: '🐶', query: 'Dogs' },
  { label: 'Cat Brands', icon: '🐱', query: 'Cats' },
  { label: 'Bird Brands', icon: '🐦', query: 'Birds' },
  { label: 'Fish Brands', icon: '🐠', query: 'Fish' },
  { label: 'Food Brands', icon: '🥣', query: 'Food' },
  { label: 'Accessory Brands', icon: '🎀', query: 'Accessories' },
];

const brands = [
  ['ROYAL CANIN', 'Nutrition for every stage', 'brand-red'],
  ['Pedigree', 'For happy, healthy dogs', 'brand-blue'],
  ['Whiskas', 'Love every little whisker', 'brand-purple'],
  ['me-O', 'Delicious cat nutrition', 'brand-coral'],
  ['drools', 'Complete pet care', 'brand-blue'],
  ['Himalaya', 'Gentle natural care', 'brand-green'],
  ['PURINA', 'Your pet, our passion', 'brand-red'],
  ['Hills', 'Science-led nutrition', 'brand-blue'],
  ['Sheba', 'Irresistible taste', 'brand-dark'],
  ['Tetra', 'Made for aquarium life', 'brand-yellow'],
  ['JAPI', 'Smart pet essentials', 'brand-blue'],
  ['Aqueon', 'Aquarium made easy', 'brand-blue'],
  ['Versele-Laga', 'Quality feeds', 'brand-red'],
  ['TRIXIE', 'Fun for every pet', 'brand-red'],
  ['Flexi', 'Freedom on the go', 'brand-orange'],
];

function resolveBannerUrl(imageUrl) {
  if (!imageUrl || /^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  return `${API_URL.replace(/\/api\/v1\/?$/, '')}/${imageUrl.replace(/^\/+/, '')}`;
}

export default function Brands() {
  const [brandCounts, setBrandCounts] = useState({});
  const [pageBanner, setPageBanner] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_URL}/products`)
      .then(response => response.ok ? response.json() : [])
      .then(products => {
        if (!mounted) return;
        const counts = brands.reduce((result, [name]) => {
          const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          result[name] = products.filter(product => String(product.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(normalizedName)).length;
          return result;
        }, {});
        setBrandCounts(counts);
      })
      .catch(() => {});

    fetch(`${API_URL}/banners?page=BRANDS`)
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        if (!mounted) return;
        setPageBanner(Array.isArray(data) && data.length > 0 ? data[0] : null);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <div className="brands-page">
      {pageBanner && (
        <section aria-label="Brand page banner" style={{ width: 'min(1200px, calc(100% - 32px))', margin: '1rem auto 0', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(21, 33, 59, 0.08)' }}>
          <img src={resolveBannerUrl(pageBanner.imageUrl)} alt="Brand banner" style={{ display: 'block', width: '100%', height: '220px', objectFit: 'cover' }} />
        </section>
      )}
      <section className="brands-hero">
        <div className="brands-hero-copy">
          <span className="brands-kicker">Trusted by pet parents</span>
          <h1>Top Pet<br /><strong>Brands</strong></h1>
          <p>Trusted by pet parents. Loved by pets.</p>
        </div>
        <img src="/images/hero-pets.png" alt="Happy dog and cat" />
        <span className="brands-sticker">Quality<br /><strong>Brands</strong><br />Happy Pets</span>
      </section>

      <nav className="brand-category-rail" aria-label="Brand categories">
        {brandCategories.map(category => (
          <Link key={category.label} to={category.query ? `/shop?category=${category.query}` : '/brands'} className={category.label === 'All Brands' ? 'active' : ''}>
            <span>{category.icon}</span>
            <small>{category.label}</small>
          </Link>
        ))}
      </nav>

      <main className="brands-content">
        <div className="brands-heading">
          <span className="brands-kicker">Only the good stuff</span>
          <h2>Popular <strong>Brands</strong></h2>
          <p>Shop trusted names picked for happier, healthier pets.</p>
        </div>
        <div className="brands-grid">
          {brands.map(([name, tagline, color]) => (
            <Link to="/shop" className={`brand-card ${color}`} key={name}>
              <div className="brand-logo">{name}</div>
              <span>{brandCounts[name] ? `${brandCounts[name]} products` : tagline}</span>
              <b>View Products →</b>
            </Link>
          ))}
        </div>
      </main>

      <section className="brands-cta">
        <div>
          <h2>Shop your favourite brands!</h2>
          <p>Find trusted food, toys and care essentials in one happy place.</p>
        </div>
        <Link to="/shop" className="brands-cta-button">Explore products →</Link>
      </section>
    </div>
  );
}
