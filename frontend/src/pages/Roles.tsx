import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { RoleList } from '@/components/role/RoleList';
import { RoleDetail } from '@/components/role/RoleDetail';
import { RoleCreationWizard } from '@/components/role/RoleCreationWizard';
import { Role } from '@/types/hub';
import { useI18n } from '@/hooks/useI18n';
import { getRoles, createRole, updateRole, deleteRole, Role as ApiRole } from '@/apis/role';

export default function Roles() {
  const { t } = useI18n();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [listCollapsed, setListCollapsed] = useState(false);

  const flattenToolConfig = (cfg?: ApiRole['tool_config']) => {
    if (!cfg) return [];
    const builtin = (cfg.builtin || []).filter(Boolean);
    const mcpUrls = (cfg.mcp || []).map(m => m.url).filter(Boolean);
    return Array.from(new Set([...builtin, ...mcpUrls]));
  };

  const mapApiRoleToRole = (r: ApiRole): Role => ({
    id: r.id,
    name: r.name,
    description: r.description,
    avatar: r.avatar || '🤖', // Prefer avatar, fallback to bot
    prompt: r.prompt || '',
    principle: r.principle,
    experience: [],
    tools: r.tool_config ? flattenToolConfig(r.tool_config) : (r.tools || []),
    tool_config: r.tool_config,
    updatedAt: new Date().toISOString()
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles({ page: 1, page_size: 100 });
      const apiRoles = res.list || [];
      
      const mappedRoles: Role[] = apiRoles.map(mapApiRoleToRole);
      
      setRoles(mappedRoles);
      if (mappedRoles.length > 0 && !selectedRole) {
        setSelectedRole(mappedRoles[0]);
      }
      return mappedRoles;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleRoleUpdate = async (updatedRole: Role) => {
    try {
      // Map frontend Role back to API partial role
      const apiUpdate: Partial<ApiRole> = {
        name: updatedRole.name,
        description: updatedRole.description,
        prompt: updatedRole.prompt,
        tools: updatedRole.tools,
        tool_config: updatedRole.tool_config,
        principle: updatedRole.principle,
        avatar: updatedRole.avatar
      };
      
      await updateRole(updatedRole.id, apiUpdate);
      
      // Update local state
      setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
      setSelectedRole(updatedRole);
      message.success(t('common.saved', 'Saved successfully'));
    } catch (error) {
      console.error('Failed to update role:', error);
      message.error(t('common.saveFailed', 'Failed to save changes'));
    }
  };

  const handleRoleDelete = (roleId: string) => {
    setRoleToDelete(roleId);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete);
      
      const newRoles = roles.filter(r => r.id !== roleToDelete);
      setRoles(newRoles);
      if (selectedRole?.id === roleToDelete && newRoles.length > 0) {
        setSelectedRole(newRoles[0]);
      } else if (newRoles.length === 0) {
        setSelectedRole(null);
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
    } finally {
      setRoleToDelete(null);
    }
  };

  const handleWizardConfirm = async (roleData: Partial<Role>) => {
    try {
      const newRoleData = {
        name: roleData.name || t('roles.new.name', 'New Role'),
        description: roleData.description || '',
        prompt: roleData.prompt || '',
        principle: roleData.principle || '',
        avatar: roleData.avatar || '🤖',
        tools: [],
        is_public: false
      };
      
      const createdApiRole = await createRole(newRoleData);
      
      // Refresh list to ensure consistency
      const updatedRoles = await fetchRoles();
      
      // Select the newly created role
      const newRole = updatedRoles.find(r => r.id === createdApiRole.id);
      if (newRole) {
        setSelectedRole(newRole);
      }
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error; // Let wizard handle error display
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[var(--body-bg)] overflow-hidden relative">
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${!listCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setListCollapsed(true)}
      />
      
      {/* Role List Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full z-50 transition-transform lg:relative lg:z-auto lg:translate-x-0
        ${listCollapsed ? '-translate-x-full' : 'translate-x-0'}
        lg:flex-shrink-0 w-full sm:w-80 lg:w-auto
      `}>
        <RoleList 
          roles={roles} 
          selectedRoleId={selectedRole?.id || null} 
          onSelectRole={(role) => {
            setSelectedRole(role);
            setListCollapsed(true);
          }}
          onAddRole={() => setIsWizardOpen(true)}
        />
      </div>
      
      {/* Main Content */}
      {selectedRole ? (
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          {listCollapsed && (
            <button
              onClick={() => setListCollapsed(false)}
              className="lg:hidden fixed top-3 left-3 z-30 p-2 sm:p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--item-hover-bg)] transition-colors shadow-md"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <RoleDetail 
            role={selectedRole} 
            onUpdate={handleRoleUpdate}
            onDelete={handleRoleDelete}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[var(--text-color-secondary)]">
          <div className="text-center px-4 sm:px-6">
            <p className="text-sm sm:text-base">{t('roles.select.placeholder', 'Select a role to view details')}</p>
          </div>
        </div>
      )}

      <RoleCreationWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onConfirm={handleWizardConfirm}
      />
      
      <Modal
        title={t('role.delete.confirmTitle', 'Delete Role')}
        open={!!roleToDelete}
        onOk={confirmDelete}
        onCancel={() => setRoleToDelete(null)}
        okText={t('common.confirm', 'Confirm')}
        cancelText={t('common.cancel', 'Cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('role.delete.confirmContent', 'Are you sure you want to delete this role? This action cannot be undone.')}</p>
      </Modal>
    </div>
  );
}
