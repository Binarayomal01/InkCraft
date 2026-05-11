import React, { useEffect, useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../context/ThemeContext';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const { loading, error, request, clearError } = useApi();
  const { isDark } = useTheme();

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'user', label: 'Users' },
    { value: 'admin', label: 'Admins' }
  ];

  const timeFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const fetchUsers = async () => {
    try {
      const response = await request(() => adminService.getUsers({
        timeFilter: selectedTimeFilter
      }));
      if (response?.data?.data) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
      }
    } catch (fetchError) {
      console.error('Failed to load users:', fetchError);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedTimeFilter]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      if (selectedRole !== 'all' && user.role !== selectedRole) {
        return false;
      }

      if (!query) return true;

      return [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [users, searchQuery, selectedRole]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gold-300' : 'text-gray-600'}`}>
            Review all registered users and roles
          </p>
        </div>
        <div className={`text-sm ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
          {filteredUsers.length} users
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={clearError}>
          {typeof error === 'string' ? error : 'An error occurred while loading users'}
        </Alert>
      )}

      <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
          <Input
            label="Search Users"
            placeholder="Search by name, email, or role"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <Select
            label="Filter by Role"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            options={roleOptions}
          />
          <Select
            label="Filter by Time"
            value={selectedTimeFilter}
            onChange={(event) => setSelectedTimeFilter(event.target.value)}
            options={timeFilterOptions}
          />
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('all');
                setSelectedTimeFilter('all');
                fetchUsers();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className={`rounded-lg shadow ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-200'}`}>
              <thead className={isDark ? 'bg-dark-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                    Role
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gold-400' : 'text-gray-500'}`}>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-dark-700 bg-dark-900' : 'divide-gray-200 bg-white'}`}>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className={isDark ? 'hover:bg-dark-800' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.name || 'Unknown'}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                        {user.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === 'admin'
                          ? isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                          : isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gold-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a4 4 0 110 8 4 4 0 010-8zm0 10c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No users found
            </h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-gold-300' : 'text-gray-500'}`}>
              Try adjusting your filters or refreshing the list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
