import React, { useEffect, useState } from 'react';
import { User as UserType, createUser, deleteUser, getUsers, updateUser } from '@/apis/user';
import { User, Plus, Search, Mail, Clock, Trash2, Save, X, Shield } from 'lucide-react';
import clsx from 'clsx';
import { useI18n } from '@/hooks/useI18n';
import dayjs from 'dayjs';
import { message, Popconfirm } from 'antd';
import { AvatarSelector } from '@/components/role/AvatarSelector';
import { Avatar } from '@/components/role/Avatar';

export default function Users() {
  const { t } = useI18n();
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [listCollapsed, setListCollapsed] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<UserType> & { password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res);
      // Select first user if none selected and list is not empty
      if (!selectedUserId && res.length > 0) {
        // Don't auto select for now, let user choose. 
        // Or maybe auto-select first one like Roles?
        // Let's not auto-select to allow "empty state".
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectUser = (user: UserType) => {
    setSelectedUserId(user.id);
    setFormData({ ...user, password: '' }); // Clear password field
  };

  const handleAddUser = () => {
    setSelectedUserId('new');
    setFormData({
      username: '',
      email: '',
      password: '',
      avatar_url: '',
    });
  };

  const handleSave = async () => {
    if (!formData.username) {
      message.error(t('common.required', 'Please fill in required fields'));
      return;
    }

    try {
      setLoading(true);
      if (selectedUserId === 'new') {
        if (!formData.password) {
          message.error(t('common.passwordRequired', 'Password is required for new users'));
          return;
        }
        await createUser({
          username: formData.username,
          email: formData.email || '',
          password: formData.password,
          avatar_url: formData.avatar_url,
          role: formData.role,
        });
        message.success(t('common.createSuccess', 'User created successfully'));
      } else if (selectedUserId) {
        await updateUser(selectedUserId, {
          id: selectedUserId,
          username: formData.username,
          email: formData.email || '',
          password: formData.password || undefined,
          avatar_url: formData.avatar_url,
          role: formData.role,
        });
        message.success(t('common.updateSuccess', 'User updated successfully'));
      }
      
      await fetchUsers();
      if (selectedUserId === 'new') {
        setSelectedUserId(null); // Reset selection or select the new one (complex logic needed to find ID)
      }
    } catch (error) {
      message.error(t('common.error', 'Operation failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId || selectedUserId === 'new') return;
    
    try {
      setLoading(true);
      await deleteUser(selectedUserId);
      message.success(t('common.deleteSuccess', 'User deleted successfully'));
      setSelectedUserId(null);
      await fetchUsers();
    } catch (error) {
      message.error(t('common.deleteFailed', 'Failed to delete user'));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCreating = selectedUserId === 'new';

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[var(--body-bg)] overflow-hidden relative">
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${!listCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setListCollapsed(true)}
      />
      
      {/* Sidebar List */}
      <div className={`
        fixed left-0 top-0 h-full z-50 transition-transform lg:relative lg:z-auto lg:translate-x-0
        ${listCollapsed ? '-translate-x-full' : 'translate-x-0'}
        flex flex-col w-full sm:w-80 lg:w-64 xl:w-80 border-r border-[var(--border-color)] bg-[var(--sider-bg)] flex-shrink-0 shadow-lg lg:shadow-none
      `}>
        <div className="p-3 sm:p-4 border-b border-[var(--border-color)] flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-color)]">{t('users.title', 'Users')}</h2>
            <button 
              onClick={handleAddUser}
              className="p-1.5 sm:p-2 rounded-md hover:bg-[var(--item-hover-bg)] text-indigo-600 dark:text-indigo-400 transition-all hover:scale-110"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 sm:top-2.5 text-[var(--text-color-secondary)] pointer-events-none" size={14} />
            <input 
              type="text" 
              placeholder={t('users.search', 'Search users...')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-[var(--body-bg)] border border-[var(--border-color)] rounded-lg text-xs sm:text-sm text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-[var(--text-color-secondary)]"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                handleSelectUser(user);
                setListCollapsed(true);
              }}
              className={clsx(
                'flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all border border-transparent hover:scale-[1.02]',
                selectedUserId === user.id
                  ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]'
                  : 'hover:bg-[var(--item-hover-bg)] hover:border-[var(--border-color)]'
              )}
            >
              <div className={clsx(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                selectedUserId === user.id ? "ring-2 ring-white/30" : ""
              )}>
                <Avatar 
                  avatar={user.avatar_url} 
                  name={user.username} 
                  size={36} 
                  className={selectedUserId === user.id ? "" : "bg-gray-400 dark:bg-gray-600 text-white"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={clsx(
                  "text-sm sm:text-base font-medium truncate",
                  selectedUserId === user.id ? "text-white" : "text-[var(--text-color)]"
                )}>
                  {user.username}
                </h3>
                <p className={clsx(
                  "text-xs truncate",
                  selectedUserId === user.id ? "text-indigo-100" : "text-[var(--text-color-secondary)]"
                )}>
                  {user.email}
                </p>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-[var(--text-color-secondary)] text-sm">
              {t('common.noData', 'No users found')}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--body-bg)]">
        {selectedUserId ? (
          <>
            {/* Header */}
            <div className="bg-[var(--header-bg)] border-b border-[var(--border-color)] px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm z-10 gap-3 sm:gap-0">
              <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
                {listCollapsed && (
                  <button
                    onClick={() => setListCollapsed(false)}
                    className="lg:hidden p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--item-hover-bg)] transition-colors shadow-sm flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-[var(--text-color)] flex items-center gap-2 truncate">
                    <User className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={20} />
                    {isCreating ? t('users.create', 'Create New User') : formData.username}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {!isCreating && (
                  <Popconfirm
                    title={t('common.deleteConfirm', 'Are you sure to delete?')}
                    onConfirm={handleDelete}
                    okText="Yes"
                    cancelText="No"
                  >
                    <button 
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-initial"
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">{t('common.delete', 'Delete')}</span>
                    </button>
                  </Popconfirm>
                )}
                <button 
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium shadow-sm flex-1 sm:flex-initial"
                  disabled={loading}
                >
                  <Save size={14} />
                  {t('common.save', 'Save')}
                </button>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                
                {/* Avatar Section */}
                <div className="flex justify-center mb-6 sm:mb-8">
                  <AvatarSelector 
                    value={formData.avatar_url} 
                    onChange={(val) => setFormData({ ...formData, avatar_url: val })}
                    size={80}
                    className="sm:w-24 sm:h-24"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-color-secondary)]">
                      {t('users.username', 'Username')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.username || ''}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Enter username"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-color-secondary)]">
                      {t('users.email', 'Email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-color-secondary)]">
                      {t('users.password', 'Password')}
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder={isCreating ? "Set initial password" : "Leave blank to keep unchanged"}
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-color-secondary)]">
                      {t('users.role', 'Role')}
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <select
                        value={formData.role || 'user'}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Read-only Info */}
                  {!isCreating && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-[var(--border-color)]">
                      <div className="space-y-1">
                        <span className="text-xs text-[var(--text-color-secondary)] flex items-center gap-1">
                          <Clock size={12} /> Created At
                        </span>
                        <p className="text-sm text-[var(--text-color)]">
                          {dayjs(formData.created_at).format('YYYY-MM-DD HH:mm')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-[var(--text-color-secondary)] flex items-center gap-1">
                          <Clock size={12} /> Updated At
                        </span>
                        <p className="text-sm text-[var(--text-color)]">
                          {dayjs(formData.updated_at).format('YYYY-MM-DD HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-color-secondary)] px-4 relative">
            {listCollapsed && (
              <button
                onClick={() => setListCollapsed(false)}
                className="lg:hidden absolute top-3 left-3 p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--item-hover-bg)] transition-colors shadow-md"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <User size={48} className="sm:w-16 sm:h-16 mb-3 sm:mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-base sm:text-lg font-medium text-center">{t('users.select', 'Select a user to manage')}</p>
            <p className="text-xs sm:text-sm opacity-60 mt-2 text-center">{t('users.hint', 'Or create a new one using the + button')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
