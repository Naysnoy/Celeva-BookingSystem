import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  BookOpen,
  TrendingUp,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  CheckCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markNotificationRead, markAllRead } from '@/services/notificationService';
import { formatDate } from '@/utils';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/properties', label: 'Properties',  icon: Building2 },
  { to: '/bookings',   label: 'Bookings',    icon: BookOpen },
  { to: '/calendar',   label: 'Calendar',    icon: CalendarDays },
  { to: '/revenue',    label: 'Revenue',     icon: TrendingUp },
  { to: '/expenses',   label: 'Expenses',    icon: Receipt },
  { to: '/settings',   label: 'Settings',    icon: Settings },
];

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const { hostUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotifCount', hostUser?.id],
    queryFn: () => getUnreadCount(hostUser!.id),
    enabled: !!hostUser,
    refetchInterval: 30000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', hostUser?.id],
    queryFn: () => getNotifications(hostUser!.id),
    enabled: !!hostUser && notifOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: ({ nId }: { nId: string }) => markNotificationRead(hostUser!.id, nId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifCount'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllRead(hostUser!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifCount'] });
    },
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = hostUser?.displayName
    ? hostUser.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const planBadgeColor =
    hostUser?.plan === 'pro'
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      : hostUser?.plan === 'starter'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex h-[68px] items-center justify-between px-5 border-b border-border shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #C4A574 0%, #8A6840 100%)' }}
            >
              <span
                className="text-xl text-white leading-none select-none"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                B
              </span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">BookingHosts</span>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#C4A574]/10 text-[#C4A574]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${isActive ? 'text-[#C4A574]' : 'text-muted-foreground group-hover:text-foreground'}`}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-[#C4A574] opacity-60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => navigate('/settings')}
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #C4A574 0%, #8A6840 100%)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{hostUser?.displayName}</p>
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize mt-0.5 ${planBadgeColor}`}>
                {hostUser?.plan} plan
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/8 hover:text-destructive transition-all duration-150"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* â”€â”€ Main Area â”€â”€ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6 z-30">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C4A574 0%, #8A6840 100%)' }}
            >
              <span className="text-sm text-white" style={{ fontFamily: "'Great Vibes', cursive" }}>B</span>
            </div>
            <span className="text-base font-bold">BookingHosts</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#C4A574] text-[9px] font-bold text-white flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border bg-card shadow-xl slide-down overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllMutation.mutate()}
                          className="flex items-center gap-1 text-xs text-[#C4A574] hover:underline font-medium"
                        >
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                          <p className="text-sm text-muted-foreground">You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.slice(0, 20).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => { if (!n.read) markReadMutation.mutate({ nId: n.id }); }}
                            className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${!n.read ? 'bg-[#C4A574]/4' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-[#C4A574] shrink-0" />}
                              <div className={!n.read ? '' : 'ml-4'}>
                                <p className="text-sm font-semibold">{n.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                                {n.createdAt && (
                                  <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(n.createdAt.toDate())}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Avatar (desktop quick access) */}
            <div
              className="hidden lg:flex h-8 w-8 rounded-full items-center justify-center text-xs font-bold text-white cursor-pointer ml-1 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C4A574 0%, #8A6840 100%)' }}
              onClick={() => navigate('/settings')}
              title={hostUser?.displayName}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8 page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
