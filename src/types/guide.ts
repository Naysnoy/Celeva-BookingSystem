import { Timestamp } from 'firebase/firestore';
import { PropertyGuide } from './property';

export interface CheckInLink {
  id: string;
  userId: string;
  propertyId: string;
  propertyType: string;
  propertyName: string;
  photos: string[];
  guide: PropertyGuide;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp | null;
}
