import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import { useTheme } from '../context/ThemeContext';

const About = () => {
  const { isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.style.opacity = '1';
        }
      });
    }, observerOptions);

    setTimeout(() => {
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      
      animatedElements.forEach(element => {
        observer.observe(element);
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          element.classList.add('animate-fade-in');
          element.style.opacity = '1';
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  const artists = [
    {
      id: 1,
      name: 'Binara Yomal',
      specialization: 'Traditional & Neo-Traditional',
      experience: '2 years',
      bio: 'Binara has been pioneering the traditional tattoo scene for over a decade. Her bold lines, vibrant colors, and attention to detail have made her one of the most sought-after traditional artists in the city.',
      image: '/images/artists/binara-yomal.jpg',
      styles: ['Traditional', 'Neo-Traditional', 'American Traditional'],
      awards: [
        'Best Traditional Tattoo 2023',
        
      ],
      socialMedia: {
        instagram: '@binarayomal01',
        facebook: 'BinaraYomalTattoo'
      }
    },
    {
      id: 2,
      name: 'Lasal manith',
      specialization: 'Watercolor & Fine Art',
      experience: '3 years',
      bio: 'Lasal brings a unique artistic vision to tattoo art, specializing in watercolor techniques and delicate fine art pieces. Her work is characterized by soft gradients, flowing colors, and ethereal beauty.',
      image: '/images/artists/lasal-manith.jpg',
      styles: ['Watercolor', 'Fine Art', 'Botanical', 'Minimalist'],
      awards: [
        'Best Watercolor Piece - Art & Ink Awards 2023',
        'Innovation in Tattooing - Creative Arts Festival 2022'
      ],
      socialMedia: {
        instagram: '@lasalmanith',
        facebook: 'LasalManithArt'
      }
    },
    {
      id: 3,
      name: 'Tenura Shanelka',
      specialization: 'Geometric & Blackwork',
      experience: '1 years',
      bio: 'Tenura is known for his precision and mathematical approach to tattooing. His geometric designs and intricate blackwork pieces showcase perfect symmetry and bold, clean lines.',
      image: '/images/artists/tenura-shanelka.jpg',
      styles: ['Geometric', 'Blackwork', 'Mandala', 'Dotwork'],
      awards: [
        'Best Geometric Design - Precision Ink Awards 2023',
        'Technical Excellence Award - Tattoo Masters 2022'
      ],
      socialMedia: {
        instagram: '@Tenurashanelka',
        facebook: 'Tenura Shanelka'
      }
    },
    {
      id: 4,
      name: 'Lakmi Deshani',
      specialization: 'Photorealism & Portraits',
      experience: '1 years',
      bio: 'Lakmi is a master of photorealistic tattoos and portrait work. Her ability to capture emotion and detail in skin is unmatched, creating tattoos that look like photographs.',
      image: '/images/artists/lakmi-deshani.jpg',
      styles: ['Photorealism', 'Portraits', 'Black & Grey', 'Color Realism'],
      awards: [
        
      ],
      socialMedia: {
        instagram: '@LakmiDeshani',
        facebook: 'Lakmi Deshani'
      }
    }
  ];

  const studioInfo = {
    founded: '2023',
    location: 'Minuwangoda, Gampaha, Sri Lanka',
    mission: 'To create exceptional tattoo art while providing a safe, clean, and welcoming environment for our clients to express their individuality.',
    values: [
      'Artistic Excellence',
      'Client Safety & Comfort',
      'Creative Expression',
      'Professional Standards',
      'Community Connection'
    ],
    certifications: [
      'Health Department Certified',
      'Bloodborne Pathogen Training',
      'First Aid & CPR Certified',
      'Professional Tattoo Association Member'
    ]
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section 
        className={isDark ? 'gradient-bg-hero text-white py-20' : 'bg-gradient-to-br from-blue-900 to-purple-800 text-white py-20'}
        style={{
          transform: `translateY(${scrollY * 0.4}px)`,
          opacity: 1 - scrollY / 800
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className={isDark ? 'text-gold-500' : 'text-purple-300'}>InkCraft</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Where artistry meets passion, and every tattoo tells a story
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="large"
                onClick={() => {
                  const artistSection = document.getElementById('artists-section');
                  artistSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Meet Our Artists
              </Button>
              <Button
                variant="outline"
                size="large"
                className="text-white border-white hover:bg-white hover:text-primary-900"
                onClick={() => {
                  const storySection = document.getElementById('story-section');
                  storySection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Our Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Story Section */}
      <section id="story-section" className={`py-16 ${isDark ? 'bg-dark-850' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll opacity-0 transition-all duration-700" style={{ transitionDelay: '0ms' }}>
              <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Story</h2>
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Founded in {studioInfo.founded}, InkCraft has grown from a small neighborhood studio 
                to one of the city's premier tattoo destinations. Our journey began with a simple vision: 
                to create exceptional tattoo art while providing a safe, welcoming space for artistic expression.
              </p>
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Over the years, we've built a reputation for excellence, attracting talented artists 
                who share our passion for the craft. Each member of our team brings their unique style 
                and expertise, ensuring that we can bring any vision to life.
              </p>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                We believe that every tattoo is a collaboration between artist and client, resulting 
                in meaningful art that will be cherished for a lifetime.
              </p>
            </div>
            <div className="relative animate-on-scroll opacity-0 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
              <div className={`aspect-square rounded-lg flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-gold-500/10 to-blood-500/10' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                <div className="text-center">
                  <svg className={`w-24 h-24 mx-auto mb-4 ${isDark ? 'text-gold-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-3.464a1 1 0 00-.26-.62L3 17l1.26.38a1 1 0 01.74.9V21m3.5 0v-2a1 1 0 011-1h1a1 1 0 011 1v2m3.5 0h4" />
                  </svg>
                  <p className={`font-semibold ${isDark ? 'text-gold-400' : 'text-blue-800'}`}>Studio Since {studioInfo.founded}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Values */}
      <section className={`py-16 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Values</h2>
            <p className={`text-lg max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {studioInfo.mission}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
            {studioInfo.values.map((value, index) => (
              <div key={index} className="text-center animate-on-scroll opacity-0 transition-all duration-700" style={{ transitionDelay: `${index * 100}ms` }}>
                <div className={`rounded-lg shadow-sm p-6 h-full ${isDark ? 'bg-dark-850 border border-dark-700' : 'bg-white'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gold-500/10' : 'bg-blue-100'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-gold-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className={`rounded-lg shadow-sm p-8 animate-on-scroll opacity-0 transition-all duration-700 ${isDark ? 'bg-dark-850 border border-dark-700' : 'bg-white'}`} style={{ transitionDelay: '600ms' }}>
            <h3 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Certifications & Standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {studioInfo.certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <svg className={`w-5 h-5 ${isDark ? 'text-neon-500' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section id="artists-section" className={`py-16 ${isDark ? 'bg-dark-850' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Meet Our Artists</h2>
            <p className={`text-lg max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Our talented team of artists brings decades of combined experience and diverse artistic styles to create the perfect tattoo for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {artists.map((artist, index) => (
              <div key={artist.id} className={`rounded-lg shadow-lg overflow-hidden animate-on-scroll opacity-0 transition-all duration-700 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-full h-full object-cover aspect-square"
                      onError={(e) => {
                        // Fallback to SVG icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className={`aspect-square hidden items-center justify-center ${isDark ? 'bg-gradient-to-br from-gold-500/10 to-blood-500/10' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                      <div className="text-center">
                        <svg className={`w-16 h-16 mx-auto mb-2 ${isDark ? 'text-gold-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className={`text-xs font-medium ${isDark ? 'text-gold-400' : 'text-blue-800'}`}>{artist.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-6">
                    <div className="mb-4">
                      <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{artist.name}</h3>
                      <p className={`font-semibold ${isDark ? 'text-gold-500' : 'text-blue-600'}`}>{artist.specialization}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{artist.experience} of experience</p>
                    </div>

                    <p className={`mb-4 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{artist.bio}</p>

                    {/* Specialties */}
                    <div className="mb-4">
                      <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {artist.styles.map((style, index) => (
                          <span key={index} className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${isDark ? 'bg-gold-500/10 text-gold-400' : 'bg-blue-100 text-blue-700'}`}>
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Awards */}
                    <div className="mb-4">
                      <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Awards & Recognition</h4>
                      <ul className="space-y-1">
                        {artist.awards.map((award, index) => (
                          <li key={index} className={`text-xs flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <svg className="w-3 h-3 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            {award}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Social Media */}
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Follow:</span>
                      <a href={`https://instagram.com/${artist.socialMedia.instagram.substring(1)}`} 
                         className={`text-xs ${isDark ? 'text-gold-500 hover:text-gold-400' : 'text-blue-600 hover:text-blue-800'}`}>
                        📸 {artist.socialMedia.instagram}
                      </a>
                      <a href={`https://facebook.com/${artist.socialMedia.facebook}`} 
                         className={`text-xs ${isDark ? 'text-gold-500 hover:text-gold-400' : 'text-blue-600 hover:text-blue-800'}`}>
                        📘 Facebook
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-16 ${isDark ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-blood-900/20' : 'bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900/20'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Tattoo Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Book a consultation with one of our talented artists today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book">
              <Button variant="secondary" size="large">
                Book Consultation
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" size="large" className="text-white border-white hover:bg-white hover:text-primary-900">
                View Portfolio
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-primary-700">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{studioInfo.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(011) 229-9213</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@inkcraft.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;