import React, { useState } from 'react';
import { UserAccount, UserRole, UserCapabilities } from '../../types';
import { Sheet } from '../common/Primitives';
import {
  Users,
  Shield,
  Check,
  X,
  Search,
  Plus,
  Filter,
  ShieldCheck,
  Building2,
  Mail,
  UserCheck,
} from 'lucide-react';

interface UserManagementViewProps {
  accounts: UserAccount[];
  onUpdateAccount: (account: UserAccount) => void;
  onAddAccount: (account: UserAccount) => void;
  onSwitchToUser: (account: UserAccount) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  accounts,
  onUpdateAccount,
  onAddAccount,
  onSwitchToUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New account form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('household');
  const [newCaps, setNewCaps] = useState<UserCapabilities>({
    canUseFridgeToPlate: true,
    canUseSurplusDonor: false,
    canUseFoodBankInbox: false,
    canUseImpactDashboard: true,
    canAccessAdminConsole: false,
  });

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleCapability = (acc: UserAccount, capKey: keyof UserCapabilities) => {
    const updated: UserAccount = {
      ...acc,
      capabilities: {
        ...acc.capabilities,
        [capKey]: !acc.capabilities[capKey],
      },
    };
    onUpdateAccount(updated);
  };

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const created: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      organization: newOrg.trim() || 'Independent Organization',
      capabilities: newCaps,
      status: 'active',
      createdAt: 'Just now',
      lastLogin: 'Never',
    };

    onAddAccount(created);
    setNewName('');
    setNewEmail('');
    setNewOrg('');
    setShowAddModal(false);
  };

  const roleFilterTabs = [
    { id: 'all', label: 'All' },
    { id: 'household', label: 'Household' },
    { id: 'donor_store', label: 'Store Donor' },
    { id: 'foodbank_coordinator', label: 'Food Bank' },
    { id: 'dual_user', label: 'Dual Role' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Admin Console Header */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[26px] border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            <span className="w-2 h-2 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" aria-hidden="true" />
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Access Control</span>
            <span aria-hidden="true">·</span>
            <span>Role-Based Permissions</span>
          </div>

          <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            User Management &amp; Access Matrix
          </h2>

          <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] max-w-xl leading-relaxed">
            Configure permissions and preview the platform as any simulated organization or role.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[20px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-1">
          <div className="text-[11px] font-medium text-[#6E6E73] dark:text-[#86868B]">Total Users</div>
          <div className="text-[26px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">{accounts.length}</div>
          <div className="text-[11px] text-[#86868B]">Across all active roles</div>
        </div>

        <div className="p-4 rounded-[20px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-1">
          <div className="text-[11px] font-medium text-[#6E6E73] dark:text-[#86868B]">Household Kitchens</div>
          <div className="text-[26px] font-semibold text-[#1F7A4D] dark:text-[#34C77B] tracking-tight">
            {accounts.filter((a) => a.capabilities.canUseFridgeToPlate).length}
          </div>
          <div className="text-[11px] text-[#86868B]">Fridge to Plate enabled</div>
        </div>

        <div className="p-4 rounded-[20px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-1">
          <div className="text-[11px] font-medium text-[#6E6E73] dark:text-[#86868B]">Grocery Donors</div>
          <div className="text-[26px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {accounts.filter((a) => a.capabilities.canUseSurplusDonor).length}
          </div>
          <div className="text-[11px] text-[#86868B]">POS &amp; lots forecasting</div>
        </div>

        <div className="p-4 rounded-[20px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-1">
          <div className="text-[11px] font-medium text-[#6E6E73] dark:text-[#86868B]">Food Bank Hubs</div>
          <div className="text-[26px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {accounts.filter((a) => a.capabilities.canUseFoodBankInbox).length}
          </div>
          <div className="text-[11px] text-[#86868B]">Intake &amp; cold custody</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-black/[0.06] dark:border-white/[0.08]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search name, email, or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-[#F5F5F7] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
          {roleFilterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setRoleFilter(t.id)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                roleFilter === t.id
                  ? 'bg-[#1D1D1F] text-white dark:bg-white dark:text-[#1D1D1F]'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F5F5F7] dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#86868B] text-[11px] font-medium">
              <tr>
                <th className="py-3 px-5">User &amp; Organization</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Kitchen</th>
                <th className="py-3 px-4 text-center">Store</th>
                <th className="py-3 px-4 text-center">Food Bank</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[14px]">{acc.name}</div>
                    <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">{acc.email}</div>
                    <div className="text-[11px] text-[#86868B] mt-0.5">{acc.organization}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F5F5F7] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] capitalize">
                      {acc.role.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Toggle 1: Fridge to Plate */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleCapability(acc, 'canUseFridgeToPlate')}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-colors cursor-pointer ${
                        acc.capabilities.canUseFridgeToPlate
                          ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] dark:bg-[#34C77B]/15 dark:text-[#34C77B]'
                          : 'bg-black/[0.04] text-[#86868B] dark:bg-white/[0.06] opacity-40 hover:opacity-100'
                      }`}
                      title="Toggle Kitchen capability"
                    >
                      {acc.capabilities.canUseFridgeToPlate ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Toggle 2: Surplus Donor */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleCapability(acc, 'canUseSurplusDonor')}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-colors cursor-pointer ${
                        acc.capabilities.canUseSurplusDonor
                          ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] dark:bg-[#34C77B]/15 dark:text-[#34C77B]'
                          : 'bg-black/[0.04] text-[#86868B] dark:bg-white/[0.06] opacity-40 hover:opacity-100'
                      }`}
                      title="Toggle Store Donor capability"
                    >
                      {acc.capabilities.canUseSurplusDonor ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Toggle 3: Food Bank Inbox */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleCapability(acc, 'canUseFoodBankInbox')}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-colors cursor-pointer ${
                        acc.capabilities.canUseFoodBankInbox
                          ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] dark:bg-[#34C77B]/15 dark:text-[#34C77B]'
                          : 'bg-black/[0.04] text-[#86868B] dark:bg-white/[0.06] opacity-40 hover:opacity-100'
                      }`}
                      title="Toggle Food Bank Inbox capability"
                    >
                      {acc.capabilities.canUseFoodBankInbox ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Toggle 4: Admin */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleCapability(acc, 'canAccessAdminConsole')}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-colors cursor-pointer ${
                        acc.capabilities.canAccessAdminConsole
                          ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] dark:bg-[#34C77B]/15 dark:text-[#34C77B]'
                          : 'bg-black/[0.04] text-[#86868B] dark:bg-white/[0.06] opacity-40 hover:opacity-100'
                      }`}
                      title="Toggle Admin Console capability"
                    >
                      {acc.capabilities.canAccessAdminConsole ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Actions: Switch to role */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => onSwitchToUser(acc)}
                      className="px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[12px] transition-colors cursor-pointer"
                      title="Simulate this user experience"
                    >
                      Sign In As
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New User Sheet */}
      {showAddModal && (
        <Sheet
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Provision New User"
          description="Create a mock user profile and configure role capabilities."
          maxWidth="md"
        >
          <form onSubmit={handleSaveNewUser} className="space-y-4 text-[13px]">
            <div>
              <label className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Jordan Patel"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
                required
              />
            </div>

            <div>
              <label className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="jordan@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
                required
              />
            </div>

            <div>
              <label className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">Organization / Department</label>
              <input
                type="text"
                placeholder="e.g. Metro Food Hub, Whole Pantry, or Patel Kitchen"
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">Primary Role</label>
              <select
                value={newRole}
                onChange={(e: any) => {
                  const r = e.target.value as UserRole;
                  setNewRole(r);
                  if (r === 'household') {
                    setNewCaps({ canUseFridgeToPlate: true, canUseSurplusDonor: false, canUseFoodBankInbox: false, canUseImpactDashboard: true, canAccessAdminConsole: false });
                  } else if (r === 'donor_store') {
                    setNewCaps({ canUseFridgeToPlate: false, canUseSurplusDonor: true, canUseFoodBankInbox: false, canUseImpactDashboard: true, canAccessAdminConsole: false });
                  } else if (r === 'foodbank_coordinator') {
                    setNewCaps({ canUseFridgeToPlate: false, canUseSurplusDonor: false, canUseFoodBankInbox: true, canUseImpactDashboard: true, canAccessAdminConsole: false });
                  } else if (r === 'dual_user') {
                    setNewCaps({ canUseFridgeToPlate: true, canUseSurplusDonor: true, canUseFoodBankInbox: false, canUseImpactDashboard: true, canAccessAdminConsole: false });
                  } else if (r === 'admin') {
                    setNewCaps({ canUseFridgeToPlate: true, canUseSurplusDonor: true, canUseFoodBankInbox: true, canUseImpactDashboard: true, canAccessAdminConsole: true });
                  }
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
              >
                <option value="household">Household (Fridge to Plate)</option>
                <option value="donor_store">Store Donor (Surplus Forecasting)</option>
                <option value="foodbank_coordinator">Food Bank (Surplus Intake)</option>
                <option value="dual_user">Dual User (Household + Donor)</option>
                <option value="admin">System Administrator (Full Access)</option>
              </select>
            </div>

            <div className="space-y-2.5 p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04]">
              <div className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] text-[12px]">Granted Capabilities:</div>
              <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                <input
                  type="checkbox"
                  checked={newCaps.canUseFridgeToPlate}
                  onChange={(e) => setNewCaps({ ...newCaps, canUseFridgeToPlate: e.target.checked })}
                  className="rounded text-[#1F7A4D] accent-[#1F7A4D]"
                />
                <span>Can use Fridge to Plate (Photo Scan &amp; Recipes)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                <input
                  type="checkbox"
                  checked={newCaps.canUseSurplusDonor}
                  onChange={(e) => setNewCaps({ ...newCaps, canUseSurplusDonor: e.target.checked })}
                  className="rounded text-[#1F7A4D] accent-[#1F7A4D]"
                />
                <span>Can use Surplus Rescue Store (Forecast Lots)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                <input
                  type="checkbox"
                  checked={newCaps.canUseFoodBankInbox}
                  onChange={(e) => setNewCaps({ ...newCaps, canUseFoodBankInbox: e.target.checked })}
                  className="rounded text-[#1F7A4D] accent-[#1F7A4D]"
                />
                <span>Can use Food Bank Intake Hub (Accept Lots &amp; Routes)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                <input
                  type="checkbox"
                  checked={newCaps.canAccessAdminConsole}
                  onChange={(e) => setNewCaps({ ...newCaps, canAccessAdminConsole: e.target.checked })}
                  className="rounded text-[#1F7A4D] accent-[#1F7A4D]"
                />
                <span>Can access Admin Console (User Management)</span>
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm cursor-pointer"
              >
                Provision User
              </button>
            </div>
          </form>
        </Sheet>
      )}
    </div>
  );
};
