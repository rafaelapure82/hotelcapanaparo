import Hero from "./components/Hero";
import HomeCard from "./components/HomeCard";

export default function Home() {
  const featuredHomes = [
    { title: "Azure Coast Villa", location: "Santorini, Greece", price: 450, rating: 4.9 },
    { title: "Midnight Chalet", location: "Zermatt, Switzerland", price: 720, rating: 5.0 },
    { title: "Emerald Bamboo Farm", location: "Bali, Indonesia", price: 280, rating: 4.8 },
    { title: "Skyline Penthouse", location: "New York, USA", price: 1200, rating: 4.9 },
  ];

  return (
    <div className="animate-in">
      <Hero />
      
      <section style={{ 
        padding: '4rem 2rem', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end',
          marginBottom: '2rem'
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Explore Featured Stays</h2>
            <p style={{ color: 'var(--secondary)' }}>Handpicked properties with exceptional style and comfort.</p>
          </div>
          <a href="/homes" style={{ color: 'var(--primary)', fontWeight: 600 }}>View all →</a>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          {featuredHomes.map((home, index) => (
            <HomeCard 
              key={index} 
              title={home.title} 
              location={home.location} 
              price={home.price} 
              rating={home.rating} 
            />
          ))}
        </div>
      </section>

      {/* Trust / Features Section */}
      <section style={{ 
        padding: '6rem 2rem', 
        backgroundColor: '#f8fafc',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4rem' }}>Why choose AweBooking?</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '4rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
            <h3 style={{ marginBottom: '1rem' }}>Premium Security</h3>
            <p style={{ color: 'var(--secondary)' }}>Verified properties and secure payments for columns peace of mind.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
            <h3 style={{ marginBottom: '1rem' }}>Unique Experiences</h3>
            <p style={{ color: 'var(--secondary)' }}>Beyond just a place to sleep—stay in homes with character.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
            <h3 style={{ marginBottom: '1rem' }}>Host Support</h3>
            <p style={{ color: 'var(--secondary)' }}>Dedicated assistance for both travelers and property owners.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
