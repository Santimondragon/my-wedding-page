// components/InvitationManager.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Users,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Copy,
  Trash2,
  Star,
  Calendar,
  MailOpen,
  Save,
  ChevronDown,
  ChevronUp,
  Send,
  Filter,
  Sparkles,
  Eye,
  EyeOff,
  XCircle,
  StarIcon,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import StatCard from './StatCard';

interface Guest {
  id: string;
  name: string;
  rsvp: boolean | null;
  menu?: string;
}

interface Invitation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_special_invitation: boolean;
  is_sent: boolean;
  deadline: string;
  guests: Guest[];
}

interface Stats {
  totalInvitations: number;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
}

interface Props {
  initialInvitations: Invitation[];
  initialStats: Stats;
}

const InvitationManager: React.FC<Props> = ({ initialInvitations, initialStats }) => {
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSent, setFilterSent] = useState<'all' | 'sent' | 'unsent'>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    guestNames: '',
    deadline: '',
    isSpecial: false,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredInvitations = useMemo(() => {
    return invitations.filter((invitation) => {
      const matchesSearch =
        invitation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invitation.guests.some((guest) =>
          guest.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesFilter =
        filterSent === 'all' ||
        (filterSent === 'sent' && invitation.is_sent) ||
        (filterSent === 'unsent' && !invitation.is_sent);

      return matchesSearch && matchesFilter;
    });
  }, [invitations, searchTerm, filterSent]);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const guestNames = formData.guestNames
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name);

    if (guestNames.length === 0) {
      showToast('Please enter at least one guest name', 'error');
      setIsCreating(false);
      return;
    }

    try {
      const supabase = getSupabase();

      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .insert({
          title: formData.title,
          is_special_invitation: formData.isSpecial,
          deadline: formData.deadline,
        })
        .select()
        .single();

      if (invitationError) throw invitationError;

      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .insert(
          guestNames.map((name) => ({
            invitation_id: invitation.id,
            name,
          }))
        )
        .select();

      if (guestsError) {
        await supabase.from('invitations').delete().eq('id', invitation.id);
        throw guestsError;
      }

      const newInvitation = { ...invitation, guests: guests || [] };
      setInvitations((prev) => [newInvitation, ...prev]);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalInvitations: prev.totalInvitations + 1,
        totalGuests: prev.totalGuests + guestNames.length,
        pendingGuests: prev.pendingGuests + guestNames.length,
      }));

      setFormData({ title: '', guestNames: '', deadline: '', isSpecial: false });
      showToast(`Invitation "${invitation.title}" created successfully!`);
    } catch (error) {
      console.error('Error creating invitation:', error);
      showToast('Error creating invitation. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async (invitationId: string) => {
    const link = `*¡Elige tu plato!* 🥂✨

Para que todo sea perfecto, queremos pedirles que elijan el plato que quieran. *¡Es muy importante que lo hagan antes del 20 de septiembre!*

https://www.auraysantisecasan.com/invitation/${invitationId}

_Si tienen alguna alergia o restricción alimenticia, por favor, dejame saber por este medio para que tenerlo en cuenta._

¡Gracias por ser parte de nuestra celebración!`;

    try {
      await navigator.clipboard.writeText(link);
      showToast('Invitation link copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleDeleteInvitation = async (invitationId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('invitations').delete().eq('id', invitationId);

      if (error) throw error;

      const deletedInvitation = invitations.find((inv) => inv.id === invitationId);
      if (deletedInvitation) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
        setStats((prev) => ({
          ...prev,
          totalInvitations: prev.totalInvitations - 1,
          totalGuests: prev.totalGuests - deletedInvitation.guests.length,
          confirmedGuests:
            prev.confirmedGuests - deletedInvitation.guests.filter((g) => g.rsvp === true).length,
          pendingGuests:
            prev.pendingGuests - deletedInvitation.guests.filter((g) => g.rsvp === null).length,
        }));
      }

      showToast(`Invitation "${title}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting invitation:', error);
      showToast('Error deleting invitation. Please try again.', 'error');
    }
  };

  const handleMarkAsSent = async (invitationId: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('invitations')
        .update({ is_sent: true })
        .eq('id', invitationId);

      if (error) throw error;

      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, is_sent: true } : inv))
      );

      showToast('Invitation marked as sent!');
    } catch (error) {
      console.error('Error updating invitation:', error);
      showToast('Error updating invitation status', 'error');
    }
  };

  const handleMakeSpecial = async (invitationId: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('invitations')
        .update({ is_special_invitation: true })
        .eq('id', invitationId);

      if (error) throw error;

      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, is_special_invitation: true } : inv))
      );

      showToast('Invitation marked as special!');
    } catch (error) {
      console.error('Error updating invitation:', error);
      showToast('Error updating invitation status', 'error');
    }
  };

  const toggleCardExpansion = (invitationId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(invitationId)) {
        newSet.delete(invitationId);
      } else {
        newSet.add(invitationId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <MailOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Invitation Management
              </h1>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage wedding invitations and track RSVPs with elegance and precision
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Mail}
            value={stats.totalInvitations}
            label="Total Invitations"
            color="gray"
          />
          <StatCard
            icon={Users}
            value={stats.totalGuests}
            label="Total Guests"
            color="blue"
            href="/admin/guests"
          />
          <StatCard
            icon={CheckCircle}
            value={stats.confirmedGuests}
            label="Confirmed"
            color="emerald"
          />
          <StatCard icon={Clock} value={stats.pendingGuests} label="Declined" color="red" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Create Invitation Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Create New Invitation</h2>
                    <p className="text-sm text-gray-600">Add a new invitation with guest details</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateInvitation} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Invitation Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Smith Family"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Guest Names <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      One name per line
                    </span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.guestNames}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, guestNames: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Invitation Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 10 de Julio"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="special-invitation"
                    checked={formData.isSpecial}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isSpecial: e.target.checked }))
                    }
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor="special-invitation"
                    className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    <Star className="w-4 h-4 text-amber-500" />
                    Mark as Special Invitation
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Invitation
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Invitations List */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-8 py-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Existing Invitations</h2>
                      <p className="text-sm text-gray-600">
                        {filteredInvitations.length} invitations
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <select
                        value={filterSent}
                        onChange={(e) => setFilterSent(e.target.value as 'all' | 'sent' | 'unsent')}
                        className="appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Invitations</option>
                        <option value="sent">Sent</option>
                        <option value="unsent">Not Sent</option>
                      </select>
                      <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search invitations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {filteredInvitations.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MailOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No invitations found
                    </h3>
                    <p className="text-gray-600">
                      {invitations.length === 0
                        ? 'Create your first invitation to get started'
                        : 'Try adjusting your search or filter criteria'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {filteredInvitations.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        isExpanded={expandedCards.has(invitation.id)}
                        onToggleExpansion={() => toggleCardExpansion(invitation.id)}
                        onCopyLink={() => handleCopyLink(invitation.custom_id)}
                        onDelete={() => handleDeleteInvitation(invitation.id, invitation.title)}
                        onMarkAsSent={() => handleMarkAsSent(invitation.id)}
                        onMarkAsSpecial={() => handleMakeSpecial(invitation.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-lg text-white font-medium transition-all duration-300 z-50 ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                : 'bg-gradient-to-r from-red-500 to-rose-500'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

interface InvitationCardProps {
  invitation: Invitation;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
  onMarkAsSent: () => void;
  onMarkAsSpecial: () => void;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  isExpanded,
  onToggleExpansion,
  onCopyLink,
  onDelete,
  onMarkAsSent,
  onMarkAsSpecial,
}) => {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{invitation.title}</h3>
            {invitation.is_special_invitation && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-semibold rounded-full">
                <Star className="w-3 h-3" />
                Special
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAsSent}
              disabled={invitation.is_sent}
              className={`p-2 rounded-xl transition-all duration-200 ${
                invitation.is_sent
                  ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={invitation.is_sent ? 'Invitation has been sent' : 'Mark as sent'}
            >
              <Send className="w-4 h-4" />
            </button>

            <button
              onClick={onCopyLink}
              className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200"
              title="Copy invitation link"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={onMarkAsSpecial}
              disabled={invitation.is_special_invitation}
              className={`p-2 rounded-xl transition-all duration-200 ${
                invitation.is_special_invitation
                  ? 'bg-orange-100 text-orange-600 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={invitation.is_special_invitation ? 'Invitation is special' : 'Mark as special'}
            >
              <StarIcon className="w-4 h-4" />
            </button>

            <button
              onClick={onDelete}
              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200"
              title="Delete invitation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleExpansion}
              className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200"
              title="Toggle details"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Invitation Link
              </label>
              <div className="bg-gray-100 rounded-xl p-3 font-mono text-sm text-gray-700 border">
                auraysantisecasan.com/{invitation.id}
              </div>
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
                <Users className="w-4 h-4" />
                Guests ({invitation.guests.length})
              </h4>
              <div className="space-y-2">
                {invitation.guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${
                          guest.rsvp === true
                            ? 'bg-emerald-100 text-emerald-700'
                            : guest.rsvp === false
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {guest.rsvp === true ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Confirmed
                          </>
                        ) : guest.rsvp === false ? (
                          <>
                            <Trash2 className="w-3 h-3" />
                            Declined
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Pending
                          </>
                        )}
                      </span>
                      <span className="font-medium text-gray-900">{guest.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Deadline: {invitation.deadline}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {new Date(invitation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationManager;
