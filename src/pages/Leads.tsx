// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from '@/components/ui/GlassComponents';
import Modal from '@/components/ui/Modal';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Add01Icon,
  Download01Icon,
  Delete02Icon,
  MoreVerticalIcon,
  Menu01Icon,
  StarIcon,
  Clock01Icon,
  UserGroupIcon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ArrowUpDownIcon,
  ViewIcon,
  PencilEdit01Icon,
  InboxIcon,
  SparklesIcon,
  FilterIcon,
  Note01Icon,
  CancelCircleIcon,
  UserAdd01Icon
} from '@hugeicons/core-free-icons';
import { useLeads, Lead } from '@/context/LeadContext';
import { useHeaderActions } from '@/context/HeaderActionContext';
import { formatCurrency } from '@/lib/utils';
import ImportExportLeads from '@/components/leads/ImportExportLeads';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';

// Enhanced Status Badge with icons
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    New: {
      bg: 'bg-obsidian-nested',
      text: 'text-obsidian-black/60',
      border: 'border-black/5',
      icon: <HugeiconsIcon icon={InboxIcon} size={10} />
    },
    Contacted: {
      bg: 'bg-obsidian-nested',
      text: 'text-obsidian-black/60',
      border: 'border-black/5',
      icon: <HugeiconsIcon icon={SparklesIcon} size={10} />
    },
    Qualified: {
      bg: 'bg-obsidian-black',
      text: 'text-white',
      border: 'border-obsidian-black',
      icon: <HugeiconsIcon icon={FilterIcon} size={10} />
    },
    Proposal: {
      bg: 'bg-obsidian-nested',
      text: 'text-obsidian-black/60',
      border: 'border-black/5',
      icon: <HugeiconsIcon icon={Note01Icon} size={10} />
    },
    Won: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      icon: <HugeiconsIcon icon={CheckmarkCircle02Icon} size={10} />
    },
    Lost: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
      icon: <HugeiconsIcon icon={CancelCircleIcon} size={10} />
    },
  };

  const style = config[status] || config.New;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border",
      style.bg, style.text, style.border
    )}>
      {style.icon}
      {status}
    </span>
  );
};

// Avatar with consistent colors
const LeadAvatar = ({ name, company }: { name: string; company: string }) => {
  return (
    <div className="w-10 h-10 rounded-lg bg-obsidian-nested flex items-center justify-center font-bold text-sm border border-black/5 text-obsidian-black">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="py-16 text-left"
  >
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center mb-6 shadow-inner">
      <HugeiconsIcon icon={UserAdd01Icon} size={40} className="text-gray-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts yet</h3>
    <p className="text-sm text-gray-400 max-w-[300px] mb-6 leading-relaxed">
      Start building your contact list by adding your first lead.
    </p>
    <GlassButton variant="primary" onClick={onAdd} className="px-6 py-2.5">
      <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" /> Add First Lead
    </GlassButton>
  </motion.div>
);

export default function Leads() {
  const { leads, addLead, deleteLead, updateLead, lists, createList } = useLeads();
  const { setPrimaryAction, setSecondaryAction, searchQuery } = useHeaderActions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<string>('all');
  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', value: '' });
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [newListName, setNewListName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Register actions with TopNavbar
  useEffect(() => {
    setPrimaryAction({
      label: 'Add Lead',
      icon: Add01Icon,
      onClick: () => setIsModalOpen(true)
    });
    setSecondaryAction({
      label: 'Export',
      icon: Download01Icon,
      onClick: () => setIsImportOpen(true)
    });

    return () => {
      setPrimaryAction(null);
      setSecondaryAction(null);
    };
  }, [setPrimaryAction, setSecondaryAction]);

  const handleAddLead = async () => {
    const res = await addLead({
      name: newLead.name,
      email: newLead.email,
      company: newLead.company,
      value: Number(newLead.value),
      stage: 'new',
    });
    if (res) {
      setIsModalOpen(false);
      setNewLead({ name: '', email: '', company: '', value: '' });
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await createList(newListName);
    setNewListName('');
    setIsListModalOpen(false);
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;
    await updateLead(editingLead.id, {
      name: editingLead.name,
      email: editingLead.email,
      company: editingLead.company,
      value: Number(editingLead.value)
    });
    setIsEditModalOpen(false);
    setEditingLead(null);
  };

  const handleConfirmDelete = async () => {
    if (leadToDelete) {
      await deleteLead(leadToDelete.id);
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      (lead.name?.toLowerCase() || '').includes(query) ||
      (lead.email?.toLowerCase() || '').includes(query) ||
      (lead.company?.toLowerCase() || '').includes(query) ||
      (lead.phone?.toLowerCase() || '').includes(query) ||
      (lead.notes?.toLowerCase() || '').includes(query);

    // Filter by list
    if (selectedList === 'all') return matchesSearch;
    if (selectedList === 'won') return matchesSearch && lead.stage === 'won';
    return matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirmBulkDelete = async () => {
    await Promise.all(selectedIds.map(id => deleteLead(id)));
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header (Title Only) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] font-semibold text-obsidian-black tracking-tight">Contacts</h1>
            <span className="px-2.5 py-0.5 bg-obsidian-nested text-obsidian-black/60 text-[10px] font-bold uppercase tracking-wider rounded-full border border-black/5">
              {leads.length} Total
            </span>
          </div>
          <p className="text-[14px] font-normal text-obsidian-black/50">
            {searchQuery
              ? `Found ${filteredLeads.length} ${filteredLeads.length === 1 ? 'contact' : 'contacts'} matching "${searchQuery}"`
              : "Manage your relationships and contact information."}
          </p>
        </div>
      </div>

      {isImportOpen && <ImportExportLeads onClose={() => setIsImportOpen(false)} />}

      <div className="bg-white rounded-xl border border-black/5 shadow-obsidian-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FFFFFF] border-b border-black/5">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-obsidian-black/30 tracking-[0.1em]">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-obsidian-black transition-colors">
                    Contact
                    <HugeiconsIcon icon={ArrowUpDownIcon} size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-obsidian-black/30 tracking-[0.1em]">Company</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-obsidian-black/30 tracking-[0.1em] text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-obsidian-black/30 tracking-[0.1em]">Value</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-obsidian-black/30 tracking-[0.1em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              <AnimatePresence>
                {filteredLeads.map((lead, index) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      "group hover:bg-obsidian-warm/30 transition-colors",
                      selectedIds.includes(lead.id) && "bg-obsidian-nested"
                    )}
                  >
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={selectedIds.includes(lead.id)}
                          onCheckedChange={() => toggleSelectOne(lead.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <LeadAvatar name={lead.name} company={lead.company} />
                        <div className="min-w-0">
                          <p className="font-semibold text-obsidian-black text-[14px] truncate">{lead.name}</p>
                          <p className="text-[12px] text-obsidian-black/40 truncate">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-obsidian-black/70 text-[14px]">{lead.company}</td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={lead.status || 'New'} />
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-obsidian-black text-[14px]">{formatCurrency(lead.value)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-obsidian-nested text-obsidian-black/40 hover:text-obsidian-black transition-colors" title="View">
                          <HugeiconsIcon icon={ViewIcon} size={14} />
                        </button>
                        <button
                          onClick={() => { setEditingLead(lead); setIsEditModalOpen(true); }}
                          className="p-2 rounded-lg hover:bg-obsidian-nested text-obsidian-black/40 hover:text-obsidian-black transition-colors"
                          title="Edit"
                        >
                          <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-obsidian-black/40 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredLeads.length === 0 && !searchQuery && (
            <EmptyState onAdd={() => setIsModalOpen(true)} />
          )}

          {filteredLeads.length === 0 && searchQuery && (
            <div className="py-16 text-left">
              <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                <HugeiconsIcon icon={Search01Icon} size={24} className="text-gray-300" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No results found</h3>
              <p className="text-sm text-gray-400">Try adjusting your search terms</p>
            </div>
          )}
        </div>

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl z-50"
            >
              <div className="flex items-center gap-3 pr-4 border-r border-white/20">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 text-[10px] font-bold">
                  {selectedIds.length}
                </span>
                <span className="text-sm font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 text-sm font-medium transition-all"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} /> Delete
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white text-sm font-medium transition-all"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} /> Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Lead Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Lead">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm"
              placeholder="e.g. John Doe"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm"
                placeholder="john@example.com"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Value ($)</label>
              <input
                type="number"
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm"
                placeholder="5000"
                value={newLead.value}
                onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm"
              placeholder="ACME Corp"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <GlassButton variant="outline" onClick={() => setIsModalOpen(false)} className="px-5 py-2">Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleAddLead} className="px-5 py-2">Create Lead</GlassButton>
          </div>
        </div>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Contact">
        {editingLead && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 text-sm transition-all shadow-sm"
                value={editingLead.name}
                onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 text-sm transition-all shadow-sm"
                  value={editingLead.email || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Value ($)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 text-sm transition-all shadow-sm"
                  value={editingLead.value}
                  onChange={(e) => setEditingLead({ ...editingLead, value: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Company</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 text-sm transition-all shadow-sm"
                value={editingLead.company}
                onChange={(e) => setEditingLead({ ...editingLead, company: e.target.value })}
              />
            </div>
            <div className="pt-6 flex justify-end gap-3 border-t border-black/5 mt-4">
              <GlassButton variant="outline" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5">Cancel</GlassButton>
              <GlassButton variant="primary" onClick={handleUpdateLead} className="px-8 py-2.5">Save Changes</GlassButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Contact">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
              <HugeiconsIcon icon={Delete02Icon} size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-900">Are you absolutely sure?</p>
              <p className="text-xs text-rose-700/70 mt-0.5">This action cannot be undone. All data for <span className="font-bold text-rose-900">{leadToDelete?.name}</span> will be permanently removed.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2.5">
              Keep Contact
            </GlassButton>
            <button
              onClick={handleConfirmDelete}
              className="px-8 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-100"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
      {/* Bulk Delete Confirmation Modal */}
      <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Bulk Delete Contacts">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
              <HugeiconsIcon icon={Delete02Icon} size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-900">Delete {selectedIds.length} contacts?</p>
              <p className="text-xs text-rose-700/70 mt-0.5">This will permanently remove all selected contacts. This action cannot be undone.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)} className="px-6 py-2.5">
              Cancel
            </GlassButton>
            <button
              onClick={handleConfirmBulkDelete}
              className="px-8 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-100"
            >
              Delete {selectedIds.length} Contacts
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
