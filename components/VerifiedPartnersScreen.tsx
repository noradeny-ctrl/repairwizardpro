import React, { useEffect, useState, useCallback } from 'react';
import { fetchActivePartners } from '../partners';
import { Partner } from '../types';

// 🧹 TEXT CLEANER
function cleanString(str: string) {
  if(!str) return "";
  return str.toLowerCase().trim();
}

// 🌆 LIST OF CITIES
const CITIES = ["Duhok", "Erbil", "Zakho", "Sulaymaniyah", "Nashville"];

export default function VerifiedPartnersScreen() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState("Duhok"); // Default city
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // 📡 LOAD DATA FROM FIREBASE
  useEffect(() => { loadData(); }, []);

  // Re-filter whenever the city or search text changes
  useEffect(() => {
    applyFilters(searchText, selectedCity);
  }, [searchText, selectedCity, partners]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchActivePartners();
      setPartners(data || []);
    } catch (error) {
      console.error("Failed to load partners:", error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // 🕵️‍♂️ THE SMART FILTERING ENGINE
  function applyFilters(text: string, city: string) {
    let matchedCategories = new Set<string>();
    const userQuery = cleanString(text);
    const userWords = userQuery.split(/\s+/).filter(w => w.length > 1);

    const filtered = partners.filter(p => {
      // 1. MUST MATCH THE SELECTED CITY
      const cityMatch = p.location?.city === city;
      if (!cityMatch) return false;

      // 2. IF NO SEARCH TEXT, SHOW ALL IN CITY
      if (!userQuery) return true;

      // 3. SEARCH LOGIC (Checks Name + Keywords from Admin Panel)
      const nameMatch = cleanString(p.business_name).includes(userQuery) || 
                        cleanString(p.business_name_ar || "").includes(userQuery);
      
      // Note: search_keywords might not exist on all partners yet
      const keywordMatch = (p as any).search_keywords?.some((kw: string) => {
        const cleanKw = cleanString(kw);
        return userQuery.includes(cleanKw) || userWords.includes(cleanKw);
      });

      if (nameMatch || keywordMatch) {
        p.specialties?.forEach(tag => matchedCategories.add(tag));
        return true;
      }
      return false;
    });

    setFilteredPartners(filtered);
    setActiveTags(Array.from(matchedCategories).slice(0, 5));
  }

  // 📞 CONTACT BUTTON ACTIONS
  const openLink = (url: string) => window.open(url, '_blank');
  const callPhone = (phone: string) => window.location.href = `tel:${phone}`;

  return (
    <div className="flex-1 bg-[#f9fafb] min-h-screen">
      
      {/* 1. HEADER & CITY SELECTOR */}
      <div className="px-5 mt-4 mb-2">
        <h1 className="text-3xl font-black text-slate-900 mb-4">Repair Wizard</h1>
        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {CITIES.map((city) => (
            <button 
              key={city} 
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCity === city ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-600'}`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="px-5 mb-4">
        <input 
          type="text"
          placeholder={`Search in ${selectedCity}...`} 
          className="w-full bg-white text-slate-900 p-4 rounded-xl text-base border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={searchText} 
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* 3. DYNAMIC SMART MATCH UI */}
      {activeTags.length > 0 && (
        <div className="flex items-center px-5 mb-4 overflow-x-auto gap-2 hide-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-2">Expertise Match:</span>
          {activeTags.map((tag, index) => (
            <div key={index} className="bg-blue-50 px-3 py-1.5 rounded-full whitespace-nowrap">
              <span className="text-blue-700 text-[10px] font-bold">✓ {tag}</span>
            </div>
          ))}
        </div>
      )}

      {/* 4. SHOP LIST */}
      {loading && !refreshing ? (
        <div className="flex justify-center mt-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="px-5 pb-12 space-y-4">
          {filteredPartners.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-slate-400 text-sm">No experts listed in {selectedCity} yet.</p>
            </div>
          ) : (
            filteredPartners.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center">
                  <img 
                    src={item.images?.profile || 'https://via.placeholder.com/150'} 
                    className="w-14 h-14 rounded-full bg-slate-100 object-cover" 
                    alt={item.business_name}
                  />
                  <div className="ml-4 flex-1">
                    <h2 className="text-slate-900 text-lg font-extrabold leading-tight">{item.business_name}</h2>
                    <p className="text-blue-600 text-xs mt-1 font-semibold">📍 {item.location?.city}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap mt-3 gap-1.5">
                  {item.specialties?.slice(0, 4).map((tag, i) => (
                    <div key={i} className="bg-slate-100 px-2 py-1 rounded-md">
                      <span className="text-slate-600 text-[10px] font-bold">{tag}</span>
                    </div>
                  ))}
                </div>

                <div className="flex mt-4 gap-2">
                  <button 
                    className="flex-1 py-3 bg-[#25D366] text-white rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-transform"
                    onClick={() => openLink(item.contact.whatsapp_link)}
                  >
                    WhatsApp
                  </button>
                  <button 
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-transform"
                    onClick={() => callPhone(item.contact.phone_display)}
                  >
                    Call
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}