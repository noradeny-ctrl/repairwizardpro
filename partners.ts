
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Partner } from "./types";
// Static fallback data for immediate load performance (Optimization)
const staticPartners: Partner[] = [
  {
    "id": "partner_1001",
    "business_name": "يوسف نزار وايرمن تبريد سيارات",
    "is_verified": true,
    "location": {
      "city": "Duhok",
      "coordinates": {
        "latitude": 36.8679,
        "longitude": 42.9489
      }
    },
    "contact": {
      "whatsapp_link": "https://wa.me/9647518418285",
    },
    "images": {
      "profile": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop",
    },
    "specialties": ["Car A/C", "Auto Wiring", "ECU Programming"],
    "services_offered": ["A/C Gas Refill", "Diagnostics", "Wiring Repair"],
    "policy": {
      "fair_price_guarantee": true,
      "description": "Standard rates apply for all diagnostic services."
    }
  }
];

export async function fetchActivePartners(): Promise<Partner[]> {
  try {
    const snapshot = await getDocs(collection(db, "partners"));
    const today = new Date().toISOString().split('T')[0];
    const livePartners: Partner[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as any;
      if (!data.subscription_end_date || data.subscription_end_date >= today) {
        livePartners.push({
          id: doc.id,
          business_name: data.business_name,
          is_verified: data.is_verified ?? true,
          location: data.location,
          contact: data.contact,
          images: data.images || { profile: "" },
          specialties: data.specialties || [],
          services_offered: data.services_offered || [],
          policy: data.policy || { fair_price_guarantee: true, description: "" }
        });
      }
    });

    return livePartners.length > 0 ? livePartners : staticPartners;
  } catch (error) {
    console.warn("Firebase fetch failed, using static fallback:", error);
    return staticPartners;
  }
}

// Default export as array to satisfy App.tsx synchronous needs while allowing async updates
const partnersData: Partner[] = staticPartners;
export default partnersData;

