import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, Share2, Check, Trash2 } from 'lucide-react';
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
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your rental properties</p>
        </div>
        {!upgradeReason && (
          <Link
            to="/properties/add"
            className="btn-primary flex items-center gap-2"
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
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              !typeFilter ? 'bg-foreground text-background border-foreground' : 'border-border text-foreground hover:border-foreground'
            }`}
          >
            All
          </button>
          {uniqueTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors capitalize ${
                typeFilter === t ? 'bg-foreground text-background border-foreground' : 'border-border text-foreground hover:border-foreground'
              }`}
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
        <div className="rounded-2xl border border-border bg-card p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#C4A574]/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-[#C4A574]" />
          </div>
          <h3 className="font-semibold text-lg">No properties yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            {properties.length > 0 ? 'No properties match this filter.' : 'Add your first property to start tracking bookings.'}
          </p>
          {!upgradeReason && properties.length === 0 && (
            <Link
              to="/properties/add"
              className="btn-primary inline-flex items-center gap-2 mt-6"
            >
              <Plus size={16} /> Add Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <div key={property.id} className="airbnb-card rounded-2xl border border-border bg-card overflow-hidden">
              {/* Photo / placeholder */}
              <div className="relative w-full h-44 bg-gradient-to-br from-muted to-muted/50">
                {property.photos.length > 0 ? (
                  <img
                    src={property.photos[0]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <span className="absolute top-3 left-3 text-xs rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2.5 py-1 font-medium capitalize shadow-sm">
                  {property.type}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{property.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground truncate">{property.address}</p>
                <p className="text-sm text-muted-foreground">
                  {property.bedrooms} bed · {property.bathrooms} bath · ₱{property.defaultRate.toLocaleString()}/{property.type === 'apartment' ? 'mo' : 'night'}
                </p>
              </div>

              <div className="px-4 pb-4 flex items-center gap-2 border-t border-border pt-3">
                {property.guide && (
                  <button
                    onClick={() => shareMutation.mutate(property)}
                    disabled={shareMutation.isPending}
                    className="flex items-center gap-1.5 text-sm font-medium text-[#C4A574] hover:underline"
                  >
                    {copiedLink === property.id
                      ? <><Check size={13} /> Copied!</>
                      : <><Share2 size={13} /> Share Guide</>}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete "${property.name}"? This cannot be undone.`)) {
                      deleteMutation.mutate(property.id);
                    }
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors ml-auto"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
