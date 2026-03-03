import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CollectionRow from './components/CollectionRow';
import PopupModal from './components/PopupModal';
import SearchOverlay from './components/SearchOverlay';
import Footer from './components/Footer';
import CollectionDetails from './components/CollectionDetails';
import CustomCursor from './components/CustomCursor';
import CookieConsent from './components/CookieConsent';
import { NotificationProvider } from './context/NotificationContext';
import { supabase } from './lib/supabaseClient';
import './index.css';
import './styles/premium-sync.css';

function App() {
  const [collectionsData, setCollectionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myList, setMyList] = useState(() => {
    return JSON.parse(localStorage.getItem('myCollectionList') || '[]');
  });
  const [searchActive, setSearchActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentView, setCurrentView] = useState('gallery'); // 'gallery' or 'details'
  const [detailsData, setDetailsData] = useState(null);

  useEffect(() => {
    fetchCollections();

    // Disable right-click for image protection like vanilla version
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('.collection-item') || e.target.closest('.main-image-container')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const fixPath = (path) => {
    if (!path) return '';
    return path.replace(/^\/Vrindopnishad Web\//, '/');
  };

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('*');

      if (error) throw error;

      if (data) {
        const structuredData = {
          featured: { title: "Featured Collections", items: [] },
          popular: { title: "Popular Right Now", items: [] },
          rapper: { title: "Rapper Style", items: [] },
          anime: { title: "Anime Style", items: [] },
          dark: { title: "Dark Aesthetic", items: [] },
          warrior: { title: "Warrior Styles", items: [] },
          chhibi: { title: "Chhibi Styles", items: [] }
        };

        data.forEach(item => {
          const section = item.cat_section || 'featured';
          const fixedItem = {
            ...item,
            image: fixPath(item.image),
            images: Array.isArray(item.images) ? item.images.map(img => fixPath(img)) : []
          };

          if (structuredData[section]) {
            structuredData[section].items.push(fixedItem);
          } else {
            if (!structuredData[section]) {
              structuredData[section] = { title: item.cat_section || section, items: [] };
            }
            structuredData[section].items.push(fixedItem);
          }
        });
        setCollectionsData(structuredData);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMyList = (item) => {
    const newList = [...myList];
    const index = newList.findIndex(i => i.id === item.id);
    if (index === -1) {
      newList.push(item);
    } else {
      newList.splice(index, 1);
    }
    setMyList(newList);
    localStorage.setItem('myCollectionList', JSON.stringify(newList));
  };

  const handleViewDetails = (item) => {
    setDetailsData(item);
    setCurrentView('details');
    setSelectedItem(null);
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
    setCurrentView('gallery');
    setDetailsData(null);
    window.scrollTo(0, 0);
  };

  return (
    <NotificationProvider>
      <div className="app-container">
        <CustomCursor />
        <Navbar
          onSearchClick={() => setSearchActive(true)}
          myListCount={myList.length}
        />

        <SearchOverlay
          active={searchActive}
          onClose={() => setSearchActive(false)}
          collectionsData={collectionsData}
          onItemClick={(item) => {
            setSelectedItem(item);
            setSearchActive(false);
          }}
        />

        {currentView === 'gallery' ? (
          <main className="main-content">
            <Hero />

            {myList.length > 0 && (
              <CollectionRow
                title="My List"
                items={myList}
                onItemClick={setSelectedItem}
                isMyList={true}
              />
            )}

            {Object.entries(collectionsData).map(([key, section]) => (
              section.items.length > 0 && (
                <CollectionRow
                  key={key}
                  title={section.title}
                  items={section.items}
                  onItemClick={setSelectedItem}
                />
              )
            ))}

            {loading && <div className="loading-state">Loading divine collections...</div>}
            {error && <div className="error-state">Error: {error}</div>}
          </main>
        ) : (
          <CollectionDetails
            data={detailsData}
            onBack={handleGoBack}
            onToggleMyList={toggleMyList}
            isInList={detailsData ? myList.some(i => i.id === detailsData.id) : false}
          />
        )}

        <PopupModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onToggleMyList={toggleMyList}
          isInList={selectedItem ? myList.some(i => i.id === selectedItem.id) : false}
          onViewDetails={handleViewDetails}
        />

        <CookieConsent />
        <Footer />
      </div>
    </NotificationProvider>
  );
}

export default App;
