import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  Trash2,
  Star,
  Calendar,
  XCircle,
  Edit,
  Save,
  X,
  Utensils,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import Toast from './Toast';
import StatCard from './StatCard';
import SearchInput from './SearchInput';
import FilterButton from './FilterButton';
import { dishes, drinks } from '@/constants';

interface Guest {
  id: string;
  name: string;
  rsvp: boolean | null;
  menu?: 1 | 2 | 3 | null;
  drink?: number | null;
  table?: number | null;
  table_seat?: number | null;
  created_at?: string;
  updated_at?: string;
  invitation?: {
    id: string;
    title: string;
    is_special_invitation: boolean;
    is_sent: boolean;
    created_at: string;
    updated_at: string;
    deadline: string;
  } | null;
}

interface Stats {
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
}

interface Props {
  initialGuests: Guest[];
  initialStats: Stats;
}

type FilterType = 'all' | 'confirmed' | 'pending' | 'declined';

const GuestManager: React.FC<Props> = ({ initialGuests, initialStats }) => {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [editingGuest, setEditingGuest] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // Track local changes for table, seat, drink per guest
  const [localAssignments, setLocalAssignments] = useState<Record<string, { table?: number|null, table_seat?: number|null, drink?: number|null }>>({});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.invitation?.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'confirmed' && guest.rsvp === true) ||
        (filterType === 'pending' && guest.rsvp === null) ||
        (filterType === 'declined' && guest.rsvp === false);

      return matchesSearch && matchesFilter;
    });
  }, [guests, searchTerm, filterType]);

  const handleUpdateRSVP = async (guestId: string, rsvp: boolean | null) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('guests')
        .update({ rsvp, updated_at: new Date().toISOString() })
        .eq('id', guestId);

      if (error) throw error;

      setGuests((prev) =>
        prev.map((guest) =>
          guest.id === guestId ? { ...guest, rsvp, updated_at: new Date().toISOString() } : guest
        )
      );

      // Update stats
      const updatedStats = { ...stats };
      const oldGuest = guests.find((g) => g.id === guestId);
      if (oldGuest) {
        if (oldGuest.rsvp === true) updatedStats.confirmedGuests--;
        else if (oldGuest.rsvp === false) updatedStats.declinedGuests--;
        else if (oldGuest.rsvp === null) updatedStats.pendingGuests--;
      }

      if (rsvp === true) updatedStats.confirmedGuests++;
      else if (rsvp === false) updatedStats.declinedGuests++;
      else if (rsvp === null) updatedStats.pendingGuests++;

      setStats(updatedStats);
      showToast('RSVP updated successfully!');
    } catch (error) {
      console.error('Error updating RSVP:', error);
      showToast('Error updating RSVP. Please try again.', 'error');
    }
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (
      !confirm(`Are you sure you want to delete "${guestName}"?\n\nThis action cannot be undone.`)
    ) {
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('guests').delete().eq('id', guestId);

      if (error) throw error;

      const deletedGuest = guests.find((g) => g.id === guestId);
      if (deletedGuest) {
        setGuests((prev) => prev.filter((g) => g.id !== guestId));

        // Update stats
        const updatedStats = { ...stats, totalGuests: stats.totalGuests - 1 };
        if (deletedGuest.rsvp === true) updatedStats.confirmedGuests--;
        else if (deletedGuest.rsvp === false) updatedStats.declinedGuests--;
        else if (deletedGuest.rsvp === null) updatedStats.pendingGuests--;

        setStats(updatedStats);
      }

      showToast(`Guest "${guestName}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting guest:', error);
      showToast('Error deleting guest. Please try again.', 'error');
    }
  };

  const handleEditGuest = async (guestId: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('guests')
        .update({ name: editName, updated_at: new Date().toISOString() })
        .eq('id', guestId);

      if (error) throw error;

      setGuests((prev) =>
        prev.map((guest) =>
          guest.id === guestId
            ? { ...guest, name: editName, updated_at: new Date().toISOString() }
            : guest
        )
      );

      setEditingGuest(null);
      setEditName('');
      showToast('Guest name updated successfully!');
    } catch (error) {
      console.error('Error updating guest:', error);
      showToast('Error updating guest. Please try again.', 'error');
    }
  };

  const startEditing = (guest: Guest) => {
    setEditingGuest(guest.id);
    setEditName(guest.name);
  };

  const cancelEditing = () => {
    setEditingGuest(null);
    setEditName('');
  };

  const handleFilterClick = (filter: FilterType) => {
    setFilterType(filter);
  };

  // Table and seat options
  const tableOptions = Array.from({ length: 9 }, (_, i) => i + 1);
  const seatOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const drinkOptions = Object.entries(drinks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search guests or invitations..."
              />
            </div>
            <div className="flex gap-2">
              <FilterButton
                isActive={filterType === 'all'}
                onClick={() => handleFilterClick('all')}
                label="All"
              />
              <FilterButton
                isActive={filterType === 'confirmed'}
                onClick={() => handleFilterClick('confirmed')}
                label="Confirmed"
              />
              <FilterButton
                isActive={filterType === 'pending'}
                onClick={() => handleFilterClick('pending')}
                label="Pending"
              />
              <FilterButton
                isActive={filterType === 'declined'}
                onClick={() => handleFilterClick('declined')}
                label="Declined"
              />
            </div>
          </div>
        </div>

        {/* Guests List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            {filteredGuests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No guests found</h3>
                <p className="text-gray-600">
                  {guests.length === 0
                    ? 'No guests have been added yet'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredGuests.map((guest) => {
                  const local = localAssignments[guest.id] || {};
                  const hasUnsaved =
                    local.table !== undefined && local.table !== guest.table ||
                    local.table_seat !== undefined && local.table_seat !== guest.table_seat ||
                    local.drink !== undefined && local.drink !== guest.drink;
                  return (
                    <GuestCard
                      key={guest.id}
                      guest={guest}
                      isEditing={editingGuest === guest.id}
                      editName={editName}
                      onEditNameChange={setEditName}
                      onStartEdit={() => startEditing(guest)}
                      onSaveEdit={() => handleEditGuest(guest.id)}
                      onCancelEdit={cancelEditing}
                      onUpdateRSVP={handleUpdateRSVP}
                      onDelete={() => handleDeleteGuest(guest.id, guest.name)}
                      tableOptions={tableOptions}
                      seatOptions={seatOptions}
                      drinkOptions={drinkOptions}
                      localTable={local.table ?? guest.table ?? ''}
                      localSeat={local.table_seat ?? guest.table_seat ?? ''}
                      localDrink={local.drink ?? guest.drink ?? ''}
                      onUpdateTable={(guestId, table) => {
                        setLocalAssignments(prev => ({
                          ...prev,
                          [guestId]: { ...prev[guestId], table }
                        }));
                      }}
                      onUpdateSeat={(guestId, table_seat) => {
                        setLocalAssignments(prev => ({
                          ...prev,
                          [guestId]: { ...prev[guestId], table_seat }
                        }));
                      }}
                      onUpdateDrink={(guestId, drink) => {
                        setLocalAssignments(prev => ({
                          ...prev,
                          [guestId]: { ...prev[guestId], drink }
                        }));
                      }}
                      hasUnsaved={hasUnsaved}
                      onSaveAssignments={async (guestId) => {
                        const update = localAssignments[guestId];
                        if (!update) return;
                        const supabase = getSupabase();
                        const { error } = await supabase.from('guests').update(update).eq('id', guestId);
                        if (!error) {
                          setGuests(prev => prev.map(g => g.id === guestId ? { ...g, ...update } : g));
                          setLocalAssignments(prev => {
                            const { [guestId]: _, ...rest } = prev;
                            return rest;
                          });
                          showToast('Assignments saved!');
                        } else {
                          showToast('Error saving assignments', 'error');
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        <Toast message={toast?.message || ''} type={toast?.type || 'success'} isVisible={!!toast} />
      </div>
    </div>
  );
};

interface GuestCardProps {
  guest: Guest;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (name: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onUpdateRSVP: (guestId: string, rsvp: boolean | null) => void;
  onDelete: () => void;
  tableOptions: number[];
  seatOptions: number[];
  drinkOptions: [string, any][];
  localTable: number | '';
  localSeat: number | '';
  localDrink: number | '';
  onUpdateTable: (guestId: string, table: number | null) => void;
  onUpdateSeat: (guestId: string, table_seat: number | null) => void;
  onUpdateDrink: (guestId: string, drink: number | null) => void;
  hasUnsaved: boolean;
  onSaveAssignments: (guestId: string) => void;
}

const GuestCard: React.FC<GuestCardProps> = ({
  guest,
  isEditing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onUpdateRSVP,
  onDelete,
  tableOptions,
  seatOptions,
  drinkOptions,
  localTable,
  localSeat,
  localDrink,
  onUpdateTable,
  onUpdateSeat,
  onUpdateDrink,
  hasUnsaved,
  onSaveAssignments,
}) => {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={onSaveEdit}
                  className="p-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all duration-200"
                  title="Save changes"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="p-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  title="Cancel editing"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{guest.name}</h3>
            )}
            {guest.invitation?.is_special_invitation && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-semibold rounded-full">
                <Star className="w-3 h-3" />
                Special
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateRSVP(guest.id, true)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                guest.rsvp === true
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'
              }`}
              title="Mark as confirmed"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateRSVP(guest.id, null)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                guest.rsvp === null
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-amber-50'
              }`}
              title="Mark as pending"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateRSVP(guest.id, false)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                guest.rsvp === false
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50'
              }`}
              title="Mark as declined"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onStartEdit}
              className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200"
              title="Edit guest name"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200"
              title="Delete guest"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Table, Seat, Drink Assignment */}
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Table</label>
              <select
                className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={localTable}
                onChange={e => onUpdateTable(guest.id, e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-</option>
                {tableOptions.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Seat</label>
              <select
                className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={localSeat}
                onChange={e => onUpdateSeat(guest.id, e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-</option>
                {seatOptions.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Drink</label>
              <select
                className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={localDrink}
                onChange={e => onUpdateDrink(guest.id, e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-</option>
                {drinkOptions.map(([key, val]) => (
                  <option key={key} value={key}>{val.drink}</option>
                ))}
              </select>
            </div>
            {hasUnsaved && (
              <button
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all duration-200"
                onClick={() => onSaveAssignments(guest.id)}
                type="button"
              >
                Save
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
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
                    <XCircle className="w-3 h-3" />
                    Declined
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    Pending
                  </>
                )}
              </span>
            </span>
            {guest.menu && (
              <span className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-orange-100 text-orange-700">
                  <Utensils className="w-3 h-3" />
                  {dishes[guest.menu].dish}
                </span>
              </span>
            )}
            {guest.invitation && (
              <span className="flex-1 text-gray-500 text-right">
                Invitation: {guest.invitation.title}
              </span>
            )}
          </div>

          {guest.updated_at && (
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Last updated: {new Date(guest.updated_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestManager;
