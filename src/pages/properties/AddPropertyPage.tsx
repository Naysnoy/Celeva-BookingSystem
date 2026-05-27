import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, createProperty } from '@/services/propertyService';
import { uploadPropertyPhoto } from '@/services/storageService';
import { PROPERTY_TYPE_LABELS } from '@/shared';
import { PropertyType, PropertyGuide } from '@/types';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const EMPTY_COMMON_GUIDE = {
  locationMap: '',
  address: '',
  contactName: '',
  contactNumber: '',
  houseRules: '',
  extraNotes: '',
};

export function AddPropertyPage() {
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', hostUser?.id],
    queryFn: () => getProperties(hostUser!.id),
    enabled: !!hostUser,
  });

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<PropertyType>('airbnb');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [defaultRate, setDefaultRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  // Guide state — common
  const [guideLocationMap, setGuideLocationMap] = useState('');
  const [guideAddress, setGuideAddress] = useState('');
  const [guideContactName, setGuideContactName] = useState('');
  const [guideContactNumber, setGuideContactNumber] = useState('');
  const [guideHouseRules, setGuideHouseRules] = useState('');
  const [guideExtraNotes, setGuideExtraNotes] = useState('');

  // Guide — Airbnb
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [keyInstructions, setKeyInstructions] = useState('');
  const [parkingInfo, setParkingInfo] = useState('');
  const [snacks, setSnacks] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Guide — Resort
  const [karaokeRules, setKaraokeRules] = useState('');
  const [poolRules, setPoolRules] = useState('');
  const [capacityLimit, setCapacityLimit] = useState<number | ''>('');
  const [extraCharges, setExtraCharges] = useState<{ item: string; price: number }[]>([]);
  const [amenities, setAmenities] = useState<{ name: string; price: number; per: string }[]>([]);

  // Guide — Apartment
  const [monthlyRent, setMonthlyRent] = useState<number | ''>('');
  const [rentDueDate, setRentDueDate] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [maintenanceContact, setMaintenanceContact] = useState('');
  const [buildingRules, setBuildingRules] = useState('');

  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState('');

  // Plan enforcement
  const upgradeReasonCount = subscription.getUpgradeReason({
    type: 'addProperty',
    currentCount: properties.length,
    propertyType: type,
  });
  const upgradeReasonType = subscription.getUpgradeReason({
    type: 'addProperty',
    currentCount: 0,
    propertyType: type,
  });
  const upgradeReason = upgradeReasonCount || upgradeReasonType;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!hostUser) throw new Error('Not authenticated');

      // Build guide object
      let guide: PropertyGuide | null = null;
      if (showGuide) {
        const common = {
          locationMap: guideLocationMap || '',
          address: guideAddress || '',
          contactName: guideContactName || '',
          contactNumber: guideContactNumber || '',
          houseRules: guideHouseRules || '',
          extraNotes: guideExtraNotes || '',
        };

        if (type === 'airbnb' || type === 'condo' || type === 'house') {
          guide = {
            ...common,
            wifiName: wifiName || null,
            wifiPassword: wifiPassword || null,
            checkInTime: checkInTime || null,
            checkOutTime: checkOutTime || null,
            keyInstructions: keyInstructions || null,
            parkingInfo: parkingInfo || null,
            snacks: snacks || null,
            paymentNotes: paymentNotes || null,
          };
        } else if (type === 'resort') {
          guide = {
            ...common,
            checkInTime: checkInTime || null,
            checkOutTime: checkOutTime || null,
            karaokeRules: karaokeRules || null,
            extraCharges: extraCharges.length ? extraCharges : null,
            poolRules: poolRules || null,
            amenities: amenities.length ? amenities : null,
            capacityLimit: capacityLimit || null,
          };
        } else if (type === 'apartment') {
          guide = {
            ...common,
            monthlyRent: monthlyRent || null,
            rentDueDate: rentDueDate || null,
            paymentMethod: paymentMethod || null,
            leaseStart: null,
            leaseEnd: null,
            utilities: null,
            maintenanceContact: maintenanceContact || null,
            buildingRules: buildingRules || null,
          };
        }
      }

      const propertyId = await createProperty(
        hostUser.id,
        {
          name,
          address,
          type,
          bedrooms,
          bathrooms,
          photos: [],
          defaultRate,
          currency: 'PHP',
          notes,
          guide,
        },
        {
          // Lock the property type for Starter plan when this is their first property
          lockTypeForStarter:
            subscription.plan === 'starter' &&
            (hostUser.allowedTypes ?? []).length === 0,
        }
      );

      // Upload photos (paid only)
      if (subscription.canUploadPhotos && photoFiles.length > 0) {
        const photoUrls: string[] = [];
        for (let i = 0; i < photoFiles.length; i++) {
          const url = await uploadPropertyPhoto(hostUser.id, propertyId, photoFiles[i], i);
          photoUrls.push(url);
        }
        const { updateProperty } = await import('@/services/propertyService');
        await updateProperty(hostUser.id, propertyId, { photos: photoUrls });
      }

      return propertyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/properties');
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Property name is required');
    if (!address.trim()) return setError('Address is required');
    if (defaultRate <= 0) return setError('Default rate must be greater than 0');
    setError('');
    createMutation.mutate();
  }

  if (upgradeReason) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Add Property</h1>
        <UpgradePrompt
          message={upgradeReason}
          showStarterUpgrade={!!upgradeReasonType && !upgradeReasonCount}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/properties')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft size={16} /> Back to Properties
      </button>

      <h1 className="text-2xl font-bold mb-6">Add Property</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Property Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunset Villa"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Beach Road, Mactan, Cebu"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Property Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PropertyType)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bedrooms</label>
              <input
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bathrooms</label>
              <input
                type="number"
                min={0}
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Default Rate (₱/{type === 'apartment' ? 'month' : 'night'})
            </label>
            <input
              type="number"
              min={0}
              value={defaultRate || ''}
              onChange={(e) => setDefaultRate(Number(e.target.value))}
              placeholder="0"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional notes..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </section>

        {/* Photos (Paid only) */}
        {subscription.canUploadPhotos && (
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Property Photos</h2>
            <div className="flex flex-wrap gap-2">
              {photoFiles.map((f, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(f)}
                    alt={`Photo ${i + 1}`}
                    className="h-20 w-20 rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <label className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload size={16} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground mt-1">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhotoFiles((prev) => [...prev, file]);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </section>
        )}

        {/* Guide section */}
        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Property Guide</h2>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-sm text-primary hover:underline"
            >
              {showGuide ? 'Hide Guide' : 'Add Guide'}
            </button>
          </div>

          {showGuide && (
            <div className="space-y-4 pt-2">
              {/* Common fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Google Maps Link</label>
                  <input
                    type="url"
                    value={guideLocationMap}
                    onChange={(e) => setGuideLocationMap(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Guide Address</label>
                  <input
                    type="text"
                    value={guideAddress}
                    onChange={(e) => setGuideAddress(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={guideContactName}
                    onChange={(e) => setGuideContactName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={guideContactNumber}
                    onChange={(e) => setGuideContactNumber(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">House Rules</label>
                <textarea
                  value={guideHouseRules}
                  onChange={(e) => setGuideHouseRules(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* Airbnb / Condo / House specific */}
              {(type === 'airbnb' || type === 'condo' || type === 'house') && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Self Check-in Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-in Time</label>
                      <input type="text" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} placeholder="2:00 PM" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-out Time</label>
                      <input type="text" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} placeholder="12:00 PM" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">WiFi Name</label>
                      <input type="text" value={wifiName} onChange={(e) => setWifiName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">WiFi Password</label>
                      <input type="text" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Key/Lockbox Instructions</label>
                    <textarea value={keyInstructions} onChange={(e) => setKeyInstructions(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Parking Info</label>
                    <input type="text" value={parkingInfo} onChange={(e) => setParkingInfo(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Snacks Available</label>
                    <input type="text" value={snacks} onChange={(e) => setSnacks(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Notes</label>
                    <input type="text" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              )}

              {/* Resort specific */}
              {type === 'resort' && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Resort Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-in Time</label>
                      <input type="text" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} placeholder="2:00 PM" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Check-out Time</label>
                      <input type="text" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} placeholder="12:00 PM" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacity Limit</label>
                    <input type="number" min={0} value={capacityLimit} onChange={(e) => setCapacityLimit(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Karaoke Rules</label>
                    <textarea value={karaokeRules} onChange={(e) => setKaraokeRules(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pool Rules</label>
                    <textarea value={poolRules} onChange={(e) => setPoolRules(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>

                  {/* Extra Charges */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Extra Charges</label>
                      <button type="button" onClick={() => setExtraCharges([...extraCharges, { item: '', price: 0 }])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
                    </div>
                    {extraCharges.map((c, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" placeholder="Item" value={c.item} onChange={(e) => { const n = [...extraCharges]; n[i].item = e.target.value; setExtraCharges(n); }} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        <input type="number" placeholder="₱" value={c.price || ''} onChange={(e) => { const n = [...extraCharges]; n[i].price = Number(e.target.value); setExtraCharges(n); }} className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        <button type="button" onClick={() => setExtraCharges(extraCharges.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>

                  {/* Amenities */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Amenities</label>
                      <button type="button" onClick={() => setAmenities([...amenities, { name: '', price: 0, per: 'session' }])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
                    </div>
                    {amenities.map((a, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" placeholder="Name" value={a.name} onChange={(e) => { const n = [...amenities]; n[i].name = e.target.value; setAmenities(n); }} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        <input type="number" placeholder="₱" value={a.price || ''} onChange={(e) => { const n = [...amenities]; n[i].price = Number(e.target.value); setAmenities(n); }} className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        <input type="text" placeholder="per" value={a.per} onChange={(e) => { const n = [...amenities]; n[i].per = e.target.value; setAmenities(n); }} className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        <button type="button" onClick={() => setAmenities(amenities.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apartment specific */}
              {type === 'apartment' && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Tenant Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Monthly Rent (₱)</label>
                      <input type="number" min={0} value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Rent Due Date (day)</label>
                      <input type="number" min={1} max={31} value={rentDueDate} onChange={(e) => setRentDueDate(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <input type="text" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="GCash 09XX, BDO 1234..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Maintenance Contact</label>
                    <input type="text" value={maintenanceContact} onChange={(e) => setMaintenanceContact(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Building Rules</label>
                    <textarea value={buildingRules} onChange={(e) => setBuildingRules(e.target.value)} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Extra Notes</label>
                <textarea
                  value={guideExtraNotes}
                  onChange={(e) => setGuideExtraNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
          )}
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Property'}
        </button>
      </form>
    </div>
  );
}
