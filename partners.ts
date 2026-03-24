
import { collection, getDocs } from "firebase/firestore";
import { db } from "./components/firebaseConfig";
import { Partner } from "./types";

// Static fallback data for immediate load performance (Optimization)
const staticPartners: Partner[] = [
  {
    "id": "partner_1001",
    "business_name": "يوسف نزار وايرمن تبريد سيارات",
    "business_name_ar": "يوسف نزار وايرمن تبريد سيارات",
    "is_verified": true,
    "rating": 5.0,
    "location": {
      "city": "Duhok",
      "address": "Industrial Area, Duhok",
      "coordinates": {
        "latitude": 36.8679,
        "longitude": 42.9489
      }
    },
    "contact": {
      "phone_display": "0751 841 8285",
      "whatsapp_link": "https://wa.me/9647518418285",
      "email": null
    },
    "images": {
      "profile": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop",
      "verified_badge": ""
    },
    "specialties": ["Car A/C", "Auto Wiring", "ECU Programming"],
    "services_offered": ["A/C Gas Refill", "Diagnostics", "Wiring Repair"],
    "policy": {
      "fair_price_guarantee": true,
      "description": "Standard rates apply for all diagnostic services."
    }
  },
  {
    "id": "partner_1002",
    "business_name": "Noor Auto Electric & A/C",
    "business_name_ar": "نور كهربائي وتبريد",
    "is_verified": true,
    "rating": 4.8,
    "location": {
      "city": "Nashville",
      "address": "Antioch, Nashville, TN",
      "coordinates": {
        "latitude": 36.0595,
        "longitude": -86.6732
      }
    },
    "contact": {
      "phone_display": "(615) 916-8034",
      "whatsapp_link": "https://wa.me/16159168034",
      "email": null
    },
    "images": {
      "profile": "https://images.unsplash.com/photo-1517524008436-bbdb53ac5445?q=80&w=1000&auto=format&fit=crop",
      "verified_badge": ""
    },
    "specialties": ["Electrical Systems", "A/C Repair", "Diagnostics"],
    "services_offered": ["Battery Test", "AC Component Replacement", "Alternator Repair"],
    "policy": {
      "fair_price_guarantee": true,
      "description": "Guaranteed fair pricing on all labor."
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
          business_name_ar: data.business_name_ar || "",
          is_verified: data.is_verified ?? true,
          rating: data.rating || 5.0,
          location: data.location,
          contact: data.contact,
          images: data.images || { profile: "", verified_badge: "" },
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
