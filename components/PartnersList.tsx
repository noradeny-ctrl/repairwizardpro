
import React, { useEffect, useState, memo } from 'react';
import { fetchActivePartners } from '../partners';
import { Partner, RegionMode } from '../types';
import PartnerCard from './PartnerCard';

const PartnersList: React.FC = memo(() => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePartners().then((data) => {
      setPartners(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-cyan-500 font-bold uppercase tracking-widest text-xs">Finding Pros...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-black text-white uppercase tracking-widest">
        Verified Partners
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} mode={RegionMode.WESTERN} />
        ))}
      </div>
    </div>
  );
});

export default PartnersList;
