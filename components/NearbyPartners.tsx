
import React, { useMemo } from 'react';
import { MapPin, ExternalLink, ShieldCheck, Navigation } from 'lucide-react';
import { Partner, Coordinates } from '../types';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface NearbyPartnersProps {
  partners: Partner[];
  userLocation: Coordinates | null;
  isRTL: boolean;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const NearbyPartners: React.FC<NearbyPartnersProps> = ({ partners, userLocation, isRTL }) => {
  const { t } = useTranslation();
  const sortedPartners = useMemo(() => {
    if (!userLocation) return partners;

    return [...partners].map(partner => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        partner.location.coordinates.latitude,
        partner.location.coordinates.longitude
      );
      return { ...partner, distance };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [partners, userLocation]);

  if (!userLocation) {
    return (
      <div className="p-6 bg-slate-800/20 rounded-[2rem] border border-white/5 flex flex-col items-center text-center gap-3">
        <MapPin className="w-8 h-8 text-slate-600" />
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
          {isRTL ? 'بۆ دیتنا نێزیکترین وەستایا، جهێ خۆ دیار بکە' : 'Enable location to find nearby experts'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black tracking-widest text-cyan-500 uppercase">
          {isRTL ? 'وەستایێن نێزیک' : 'Nearby Verified Partners'}
        </h3>
        <span className="text-[9px] text-slate-500 font-bold uppercase">
          {sortedPartners.length} {isRTL ? 'وەستا' : 'Experts Found'}
        </span>
      </div>

      <div className="grid gap-4">
        {sortedPartners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-slate-800/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-cyan-500/30 transition-all shadow-xl backdrop-blur-md"
          >
            <div className="flex p-4 gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <img 
                  src={partner.images.profile || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=200&auto=format&fit=crop'} 
                  className="w-full h-full object-cover rounded-2xl border border-white/10"
                  alt={partner.business_name}
                />
                {partner.is_verified && (
                  <div className="absolute -top-1 -right-1 bg-cyan-500 rounded-full p-1 shadow-lg">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-white truncate group-hover:text-cyan-400 transition-colors">
                    {partner.business_name}
                  </h4>
                  {partner.distance !== undefined && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <Navigation className="w-2.5 h-2.5" />
                      {partner.distance.toFixed(1)} km
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-3">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {partner.location.city}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {partner.specialties.slice(0, 2).map(spec => (
                    <span key={spec} className="text-[9px] font-bold px-2 py-0.5 bg-white/5 rounded-full text-slate-300 border border-white/5">
                      {spec}
                    </span>
                  ))}
                </div>

                <a 
                  href={`${partner.contact.whatsapp_link}${partner.contact.whatsapp_link.includes('?') ? '&' : '?'}text=${encodeURIComponent(t('common.whatsapp_message', 'Hello, I found you on RepairWizard and I need help with my car.'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isRTL ? 'پەیوەندی' : 'Contact Expert'}
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
