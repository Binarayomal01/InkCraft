import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApi } from '../../hooks/useApi';
import { adminService, bookingService } from '../../services/api';
import Alert from '../../components/UI/Alert';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Select from '../../components/UI/Select';

const rangeOptions = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'all', label: 'All Time' }
];

const getRangeStart = (range) => {
  const now = new Date();
  if (range === 'all') return null;

  const start = new Date(now);
  if (range === 'week') start.setDate(now.getDate() - 7);
  if (range === 'month') start.setMonth(now.getMonth() - 1);
  if (range === 'quarter') start.setMonth(now.getMonth() - 3);
  return start;
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatPercent = (value) => `${Math.round(value)}%`;

const getLastActiveAt = (user) => user.lastActiveAt || user.updatedAt || user.createdAt;

const UserAnalytics = () => {
  const { isDark } = useTheme();
  const [selectedRange, setSelectedRange] = useState('month');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const { loading, error, request, clearError } = useApi();

  const fetchData = async () => {
    try {
      const response = await request(async () => {
        const [usersResponse, bookingsResponse] = await Promise.all([
          adminService.getUsers({ timeFilter: 'all' }),
          bookingService.getAll({ limit: 1000 })
        ]);

        return {
          data: {
            users: usersResponse.data,
            bookings: bookingsResponse.data
          }
        };
      });

      const nextUsers = response?.data?.users?.data || [];
      const nextBookings = response?.data?.bookings?.data?.bookings || [];
      setUsers(nextUsers);
      setBookings(nextBookings);
    } catch (fetchError) {
      console.error('Failed to load analytics data:', fetchError);
      setUsers([]);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { filteredUsers, stats, trendBuckets, topActiveUsers, maxTrendCount } = useMemo(() => {
    const activeWindowDays = 30;
    const inactiveWindowDays = 90;
    const startDate = getRangeStart(selectedRange);
    const rangeUsers = startDate
      ? users.filter((user) => new Date(user.createdAt) >= startDate)
      : users;

    const rangeBookings = startDate
      ? bookings.filter((booking) => new Date(booking.createdAt) >= startDate)
      : bookings;

    const aiLinkedBookings = rangeBookings.filter(
      (booking) => booking.tattooDesignId && booking.tattooDesignId.aiGenerated === true
    ).length;
    const nonAiBookings = rangeBookings.filter(
      (booking) => !booking.tattooDesignId || booking.tattooDesignId.aiGenerated !== true
    ).length;
    const totalBookings = aiLinkedBookings + nonAiBookings || 1;

    const totalUsers = users.length;
    const newUsers = rangeUsers.length;

    const activeWindow = new Date();
    activeWindow.setDate(activeWindow.getDate() - activeWindowDays);
    const activeUsers = users.filter((user) => new Date(getLastActiveAt(user)) >= activeWindow).length;

    const inactiveWindow = new Date();
    inactiveWindow.setDate(inactiveWindow.getDate() - inactiveWindowDays);
    const inactiveUsers = users.filter((user) => new Date(getLastActiveAt(user)) < inactiveWindow).length;

    const roleCounts = rangeUsers.reduce((acc, user) => {
      const roleKey = user.role || 'user';
      acc[roleKey] = (acc[roleKey] || 0) + 1;
      return acc;
    }, {});

    const genderCounts = rangeUsers.reduce((acc, user) => {
      const genderKey = (user.gender || 'Other').toLowerCase();
      acc[genderKey] = (acc[genderKey] || 0) + 1;
      return acc;
    }, {});

    const adminCount = roleCounts.admin || 0;
    const userCount = roleCounts.user || 0;
    const roleTotal = adminCount + userCount || 1;

    const maleCount = genderCounts.male || 0;
    const femaleCount = genderCounts.female || 0;
    const otherCount = genderCounts.other || 0;
    const genderTotal = maleCount + femaleCount + otherCount || 1;

    const rangeDays = selectedRange === 'week' ? 7
      : selectedRange === 'month' ? 30
        : selectedRange === 'quarter' ? 90
          : 180;
    const weeksToShow = Math.max(4, Math.ceil(rangeDays / 7));
    const weekCounts = Array.from({ length: weeksToShow }).map(() => 0);
    const today = new Date();

    rangeUsers.forEach((user) => {
      const createdAt = new Date(user.createdAt);
      const diffDays = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
      const index = Math.floor(diffDays / 7);
      if (index >= 0 && index < weeksToShow) {
        weekCounts[weeksToShow - 1 - index] += 1;
      }
    });

    const trend = weekCounts.map((count, index) => ({
      label: `W-${weeksToShow - index}`,
      count
    }));

    const maxTrend = Math.max(...weekCounts, 1);

    const sortedActive = [...users]
      .sort((a, b) => new Date(getLastActiveAt(b)) - new Date(getLastActiveAt(a)))
      .slice(0, 6);

    return {
      filteredUsers: rangeUsers,
      stats: {
        totalUsers,
        newUsers,
        activeUsers,
        inactiveUsers,
        activeShare: totalUsers ? activeUsers / totalUsers : 0,
        inactiveShare: totalUsers ? inactiveUsers / totalUsers : 0,
        adminShare: adminCount / roleTotal,
        userShare: userCount / roleTotal,
        maleShare: maleCount / genderTotal,
        femaleShare: femaleCount / genderTotal,
        otherShare: otherCount / genderTotal,
        aiLinkedBookings,
        nonAiBookings,
        aiShare: aiLinkedBookings / totalBookings,
        nonAiShare: nonAiBookings / totalBookings,
        activeWindowDays,
        inactiveWindowDays
      },
      trendBuckets: trend,
      topActiveUsers: sortedActive,
      maxTrendCount: maxTrend
    };
  }, [selectedRange, users, bookings]);

  const cardClass = `rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`;
  const textMuted = isDark ? 'text-gold-300' : 'text-gray-500';
  const textHeading = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-display font-bold ${textHeading}`}>
            User Analytics
          </h1>
          <p className={`mt-1 ${textMuted}`}>
            Track user growth, activity, and role distribution
          </p>
        </div>
        <div className="w-full max-w-[240px]">
          <Select
            value={selectedRange}
            onChange={(event) => setSelectedRange(event.target.value)}
            options={rangeOptions}
          />
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={clearError}>
          {typeof error === 'string' ? error : 'An error occurred while loading user analytics'}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className={`${cardClass} xl:col-span-2`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-display font-semibold ${textHeading}`}>
                  Weekly New Users
                </h2>
                <span className={`text-xs ${textMuted}`}>Range buckets</span>
              </div>
              <div className="mt-6 flex items-end gap-3">
                {trendBuckets.map((bucket) => (
                  <div key={bucket.label} className="flex-1 min-w-[10px] flex flex-col items-center gap-2">
                    <div className={`w-full rounded-md ${isDark ? 'bg-dark-700' : 'bg-gray-200'} h-36 flex items-end`}>
                      <div
                        className={`${isDark ? 'bg-gold-500/80' : 'bg-primary-600'} w-full rounded-md transition-all`}
                        style={{ height: `${Math.max(8, (bucket.count / maxTrendCount) * 100)}%` }}
                        title={`${bucket.count} signups`}
                      />
                    </div>
                    <span className={`text-xs ${textMuted}`}>{bucket.label}</span>
                  </div>
                ))}
              </div>
              <p className={`mt-4 text-xs ${textMuted}`}>Last active is estimated from the last profile update.</p>
            </div>

            <div className={cardClass}>
              <h2 className={`text-lg font-display font-semibold ${textHeading}`}>
                Gender Mix
              </h2>
              <div className="mt-6 flex items-center gap-6">
                <div
                  className="h-28 w-28 rounded-full"
                  style={{
                    background: `conic-gradient(${isDark ? '#14b8a6' : '#0f766e'} 0 ${stats.maleShare * 100}%, ${isDark ? '#f59e0b' : '#f59e0b'} ${stats.maleShare * 100}% ${(stats.maleShare + stats.femaleShare) * 100}%, ${isDark ? '#60a5fa' : '#2563eb'} ${(stats.maleShare + stats.femaleShare) * 100}% 100%)`
                  }}
                />
                <div className="space-y-3">
                  <div>
                    <div className={`text-xs ${textMuted}`}>Male</div>
                    <div className={`text-lg font-semibold ${textHeading}`}>{formatPercent(stats.maleShare * 100)}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textMuted}`}>Female</div>
                    <div className={`text-lg font-semibold ${textHeading}`}>{formatPercent(stats.femaleShare * 100)}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textMuted}`}>Other</div>
                    <div className={`text-lg font-semibold ${textHeading}`}>{formatPercent(stats.otherShare * 100)}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? '#14b8a6' : '#0f766e' }} />
                  <span className={textMuted}>Male</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                  <span className={textMuted}>Female</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? '#60a5fa' : '#2563eb' }} />
                  <span className={textMuted}>Other</span>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={`text-lg font-display font-semibold ${textHeading}`}>
                AI Booking Split
              </h2>
              <div className="mt-6 flex items-center gap-6">
                <div
                  className="h-24 w-24 rounded-full"
                  style={{
                    background: `conic-gradient(${isDark ? '#38bdf8' : '#0ea5e9'} 0 ${stats.aiShare * 100}%, ${isDark ? '#334155' : '#e2e8f0'} ${stats.aiShare * 100}% 100%)`
                  }}
                />
                <div className="space-y-3">
                  <div>
                    <div className={`text-xs ${textMuted}`}>AI-linked</div>
                    <div className={`text-lg font-semibold ${textHeading}`}>{formatPercent(stats.aiShare * 100)}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textMuted}`}>Non-AI</div>
                    <div className={`text-lg font-semibold ${textHeading}`}>{formatPercent(stats.nonAiShare * 100)}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? '#38bdf8' : '#0ea5e9' }} />
                  <span className={textMuted}>AI-linked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />
                  <span className={textMuted}>Non-AI</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className={cardClass}>
              <p className={`text-sm font-medium ${textMuted}`}>Total Users</p>
              <p className={`mt-2 text-3xl font-bold ${textHeading}`}>{stats.totalUsers}</p>
            </div>
            <div className={cardClass}>
              <p className={`text-sm font-medium ${textMuted}`}>New Users</p>
              <p className={`mt-2 text-3xl font-bold ${textHeading}`}>{stats.newUsers}</p>
              <p className={`mt-1 text-xs ${textMuted}`}>In selected range</p>
            </div>
            <div className={cardClass}>
              <p className={`text-sm font-medium ${textMuted}`}>Active ({stats.activeWindowDays}d)</p>
              <p className={`mt-2 text-3xl font-bold ${textHeading}`}>{stats.activeUsers}</p>
            </div>
            <div className={cardClass}>
              <p className={`text-sm font-medium ${textMuted}`}>Inactive ({stats.inactiveWindowDays}d)</p>
              <p className={`mt-2 text-3xl font-bold ${textHeading}`}>{stats.inactiveUsers}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className={`${cardClass} lg:col-span-2`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-display font-semibold ${textHeading}`}>
                  Activity Split
                </h2>
                <span className={`text-xs ${textMuted}`}>Active vs inactive</span>
              </div>
              <div className="mt-6">
                <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                  <div
                    className={`${isDark ? 'bg-emerald-400' : 'bg-emerald-500'} h-3`}
                    style={{ width: `${stats.activeShare * 100}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? '#34d399' : '#10b981' }} />
                    <span className={textMuted}>Active</span>
                    <span className={textHeading}>{formatPercent(stats.activeShare * 100)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                    <span className={textMuted}>Inactive</span>
                    <span className={textHeading}>{formatPercent(stats.inactiveShare * 100)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={`text-lg font-display font-semibold ${textHeading}`}>
                Top Active Users
              </h2>
              <div className="mt-4 space-y-3">
                {topActiveUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${textHeading}`}>{user.name || 'Unknown'}</p>
                      <p className={`text-xs ${textMuted}`}>{user.email || 'No email'}</p>
                    </div>
                    <div className={`text-xs ${textMuted}`}>{formatDate(getLastActiveAt(user))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserAnalytics;
