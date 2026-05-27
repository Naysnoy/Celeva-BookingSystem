import { Timestamp } from 'firebase/firestore';
import { PropertyType } from './user';

export interface AirbnbGuide {
  locationMap: string;
  address: string;
  contactName: string;
  contactNumber: string;
  houseRules: string;
  extraNotes: string;
  wifiName: string | null;
  wifiPassword: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  keyInstructions: string | null;
  parkingInfo: string | null;
  snacks: string | null;
  paymentNotes: string | null;
}

export interface ResortExtraCharge {
  item: string;
  price: number;
}

export interface ResortAmenity {
  name: string;
  price: number;
  per: string;
}

export interface ResortGuide {
  locationMap: string;
  address: string;
  contactName: string;
  contactNumber: string;
  houseRules: string;
  extraNotes: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  karaokeRules: string | null;
  extraCharges: ResortExtraCharge[] | null;
  poolRules: string | null;
  amenities: ResortAmenity[] | null;
  capacityLimit: number | null;
}

export interface ApartmentUtility {
  type: string;
  amount: number;
  dueDate: number;
  billPhoto: string | null;
}

export interface ApartmentGuide {
  locationMap: string;
  address: string;
  contactName: string;
  contactNumber: string;
  houseRules: string;
  extraNotes: string;
  monthlyRent: number | null;
  rentDueDate: number | null;
  paymentMethod: string | null;
  leaseStart: Timestamp | null;
  leaseEnd: Timestamp | null;
  utilities: ApartmentUtility[] | null;
  maintenanceContact: string | null;
  buildingRules: string | null;
}

export type PropertyGuide = AirbnbGuide | ResortGuide | ApartmentGuide;

export interface Property {
  id: string;
  userId: string;
  name: string;
  address: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  photos: string[];
  defaultRate: number;
  currency: string;
  notes: string;
  guide: PropertyGuide | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
