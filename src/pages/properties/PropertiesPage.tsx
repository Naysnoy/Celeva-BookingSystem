import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, Share2, Copy, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, deleteProperty } from '@/services/propertyService';
import { createCheckInLink } from '@/services/guideService';
import { APP_CONFIG } from '@/shared';
import { Property } from '@/types';

export function PropertiesPage() {
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const queryClient = useQueryClient();
  const [copiedLink, setCopiedLink] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', hostUser?.id],
    queryFn: () => getProperties(hostUser!.id),
    enabled: !!hostUser,
  });

  const filtered = typeFilter ? properties.filter((p) => p.type === typeFilter) : properties;

  const upgradeReason = subscription.getUpgradeReason({
    type: 'addProperty',
    currentCount: properties.length,
    propertyType: 'airbnb',
  });

  const shareMutation = useMutation({
    mutationFn: async (property: Property) => {
      if (!hostUser) throw new Error('Not authenticated');
      const token = await createCheckInLink(hostUser.id, property);
      const url = `${APP_CONFIG.appUrl}/guide/${token}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(property.id);
      setTimeout(() => setCopiedLink(''), 3000);
      return url;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!hostUser) throw new Error('Not authenticated');
      await deleteProperty(hostUser.id, propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const uniqueTypes = [...new Set(properties.map((p) => p.type))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your rental properties</p>
        </div>
        {!upgradeReason && (
          <Link
            to="/properties/add"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add Property
          </Link>
        )}
      </div>

      {upgradeReason && (
        <div className="mb-6">
          <UpgradePrompt message={upgradeReason} />
        </div>
      )}

      {/* Type filter */}
      {uniqueTypes.length > 1 && (
        <div className="flex gap-1 rounded-lg bg-muted p-1 mb-4 w-fit">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!typeFilter ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All
          </button>
          {uniqueTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${typeFilter === t ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No properties yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {properties.length > 0 ? 'No properties match this filter.' : 'Add your first property to start tracking bookings.'}
          </p>
          {!upgradeReason && properties.length === 0 && (
            <Link
              to="/properties/add"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} /> Add Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <div key={property.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
              {/* Photo preview */}
              {property.photos.length > 0 && (
                <img
                  src={property.photos[0]}
                  alt={property.name}
                  className="w-full h-36 rounded-lg object-cover"
                />
              )}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{property.name}</h3>
                <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 capitalize shrink-0">
                  {property.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{property.address}</p>
              <p className="text-sm">
                {property.bedrooms} bed · {property.bathrooms} bath · ₱{property.defaultRate.toLocaleString()}/{property.type === 'apartment' ? 'mo' : 'night'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                {property.guide && (
                  <button
                    onClick={() => shareMutation.mutate(property)}
                    disabled={shareMutation.isPending}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    {copiedLink === property.id ? <><Check size={12} /> Copied!</> : <><Share2 size={12} /> Share Guide</>}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete "${property.name}"? This cannot be undone.`)) {
                      deleteMutation.mutate(property.id);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-destructive hover:underline ml-auto"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
