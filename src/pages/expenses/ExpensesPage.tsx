import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/paywall/UpgradePrompt';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, createExpense } from '@/services/expenseService';
import { getProperties } from '@/services/propertyService';
import { uploadReceipt } from '@/services/storageService';
import { EXPENSE_CATEGORY_OPTIONS } from '@/shared';
import { ExpenseCategory } from '@/types';
import { formatDate, formatCurrency } from '@/utils';
import { Timestamp } from 'firebase/firestore';
import { Plus, Receipt, X } from 'lucide-react';

export function ExpensesPage() {
  const { hostUser } = useAuth();
  const subscription = useSubscription();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');

  // Form state
  const [expPropertyId, setExpPropertyId] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('maintenance');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDescription, setExpDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', hostUser?.id, categoryFilter, propertyFilter],
    queryFn: () =>
      getExpenses(hostUser!.id, {
        category: categoryFilter ? (categoryFilter as ExpenseCategory) : undefined,
        propertyId: propertyFilter || undefined,
      }),
    enabled: !!hostUser,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', hostUser?.id],
    queryFn: () => getProperties(hostUser!.id),
    enabled: !!hostUser,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!hostUser) throw new Error('Not authenticated');
      const selectedProp = properties.find((p) => p.id === expPropertyId);

      const expenseId = await createExpense(hostUser.id, {
        propertyId: expPropertyId || null,
        propertyName: selectedProp?.name || null,
        category: expCategory,
        amount: Number(expAmount) || 0,
        date: Timestamp.fromDate(new Date(expDate)),
        description: expDescription,
        receiptUrl: null,
      });

      if (subscription.canUploadPhotos && receiptFile) {
        const url = await uploadReceipt(hostUser.id, expenseId, receiptFile);
        const { updateExpense } = await import('@/services/expenseService');
        await updateExpense(hostUser.id, expenseId, { receiptUrl: url });
      }

      return expenseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      resetForm();
    },
    onError: (err: Error) => setError(err.message),
  });

  function resetForm() {
    setShowForm(false);
    setExpPropertyId('');
    setExpCategory('maintenance');
    setExpAmount('');
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpDescription('');
    setReceiptFile(null);
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) return setError('Amount is required');
    if (!expDescription.trim()) return setError('Description is required');
    setError('');
    createMutation.mutate();
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track property and general expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <p className="text-sm text-muted-foreground">Total Expenses</p>
        <p className="text-2xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All categories</option>
          {EXPENSE_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Expense list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No expenses yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Track your property costs by adding expenses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{expense.description}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{expense.category}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {expense.propertyName || 'General'} · {formatDate(expense.date.toDate())}
                </p>
              </div>
              <p className="font-semibold text-destructive">{formatCurrency(expense.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => resetForm()}>
          <div className="rounded-xl bg-card border border-border p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Expense</h3>
              <button onClick={() => resetForm()} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>

            {error && <div className="mb-3 rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property (optional)</label>
                <select value={expPropertyId} onChange={(e) => setExpPropertyId(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">General expense</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {EXPENSE_CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (₱)</label>
                  <input type="number" min={0} value={expAmount} onChange={(e) => setExpAmount(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={expDescription} onChange={(e) => setExpDescription(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {subscription.canUploadPhotos && (
                <div>
                  <label className="block text-sm font-medium mb-1">Receipt Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20" />
                </div>
              )}
              <button type="submit" disabled={createMutation.isPending} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {createMutation.isPending ? 'Saving...' : 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
