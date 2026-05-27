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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markNotificationRead, markAllRead } from '@/services/notificationService';
import { formatDate } from '@/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/bookings', label: 'Bookings', icon: BookOpen },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/revenue', label: 'Revenue', icon: TrendingUp },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/settings', label: 'Settings', icon: Settings },
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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'hsl(45 40% 98.5%)' }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl shadow-sm shrink-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 58% 62%) 0%, hsl(38 55% 52%) 100%)',
                }}
              >
                <span
                  className="text-lg text-white leading-none"
                  style={{ fontFamily: "'Great Vibes', cursive" }}
                >
                  B
                </span>
              </div>
              <h1
                className="text-[1.25rem] leading-tight text-foreground"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
              >
                BookingHosts
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/12 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-primary' : ''} />
                    {label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User info + logout */}
          <div
            className="border-t border-border p-4"
            style={{ background: 'hsl(45 30% 96%)' }}
          >
            <div className="flex items-center gap-3 mb-3 px-1">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center shadow-sm shrink-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 58% 62%) 0%, hsl(38 55% 52%) 100%)',
                }}
              >
                <span className="text-sm font-bold text-white">
                  {hostUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{hostUser?.displayName}</p>
                <span
                  className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize"
                  style={{ background: 'hsl(45 58% 59% / 0.15)', color: 'hsl(45 58% 40%)' }}
                >
                  {hostUser?.plan} plan
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header
          className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-6"
          style={{ background: 'hsl(45 40% 98.5%)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllMutation.mutate()}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-muted-foreground text-center">No notifications</p>
                      ) : (
                        notifications.slice(0, 20).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              if (!n.read) markReadMutation.mutate({ nId: n.id });
                            }}
                            className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors ${
                              !n.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            {n.createdAt && (
                              <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt.toDate())}</p>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
