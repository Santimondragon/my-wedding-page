import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
// TableSeat component for empty seats and menu/drink assignment

import { dishes, kidsDishes, drinks } from '@/constants';

interface Guest {
  id: string;
  name: string;
  rsvp: boolean | null;
  menu: 1 | 2 | 3 | null;
  drink: number | null;
  table: number | null;
  table_seat: number | null;
  is_kid_menu?: boolean;
  created_at: string;
  updated_at: string;
  invitation?: { id: string; title: string } | null;
}

interface TableManagerProps {
  initialGuests: Guest[];
}

const TableSeat: React.FC<{
  seatNum: number;
  eligibleGuests: Guest[];
  onAssign: (guestId: string) => Promise<void>;
  guest?: Guest;
  onMenuChange?: (guestId: string, menu: 1 | 2 | 3) => Promise<void>;
  onDrinkChange?: (guestId: string, drink: number) => Promise<void>;
}> = ({ seatNum, eligibleGuests, onAssign, guest, onMenuChange, onDrinkChange }) => {
  const [assigning, setAssigning] = useState(false);
  const [menu, setMenu] = useState<1 | 2 | 3 | ''>(guest?.menu ?? '');
  const [drink, setDrink] = useState<number | ''>(guest?.drink ?? '');
  const [saving, setSaving] = useState(false);

  // For empty seat: assign guest
  if (!guest) {
    return (
      <li className="flex items-center gap-2 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm text-gray-300 italic">
        <span className="ml-auto text-xs text-gray-400">{seatNum}</span>
        <select
          className="flex-1 text-sm font-thin italic text-gray-700 border-none bg-none"
          disabled={assigning}
          defaultValue=""
          onChange={async (e) => {
            const guestId = e.target.value;
            if (!guestId) return;
            setAssigning(true);
            await onAssign(guestId);
            setAssigning(false);
          }}
        >
          <option value="">Assign guest...</option>
          {eligibleGuests.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </li>
    );
  }

  // For guest with missing menu or drink
  const needsMenu = guest.menu == null;
  const needsDrink = guest.drink == null;
  if (needsMenu || needsDrink) {
    // Only show save if a change is made
    const menuChanged = needsMenu && menu !== '' && menu !== guest.menu;
    const drinkChanged = needsDrink && drink !== '' && drink !== guest.drink;
    const showSave = menuChanged || drinkChanged;
    return (
      <li className="flex items-center gap-2 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
        <span className="ml-auto text-xs text-gray-400">{seatNum}</span>
        <span className="flex-1 font-semibold text-gray-900">{guest.name}</span>
        {needsMenu && (
          <select
            className="text-sm font-thin italic text-gray-700 border-none bg-none w-16"
            value={menu}
            onChange={(e) => setMenu(Number(e.target.value) as 1 | 2 | 3)}
          >
            <option value="">menu</option>
            {Object.entries(guest.is_kid_menu ? kidsDishes : dishes).map(([key, val]) => (
              <option key={key} value={key}>
                {val.dish}
              </option>
            ))}
          </select>
        )}
        {needsDrink && (
          <select
            className="text-sm font-thin italic text-gray-700 border-none bg-none w-16"
            value={drink}
            onChange={(e) => setDrink(Number(e.target.value))}
          >
            <option value="">drink</option>
            {Object.entries(drinks).map(([key, val]) => (
              <option key={key} value={key}>
                {val.drink}
              </option>
            ))}
          </select>
        )}
        {showSave && (
          <button
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all duration-200"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              if (menuChanged) await onMenuChange?.(guest.id, menu as 1 | 2 | 3);
              if (drinkChanged) await onDrinkChange?.(guest.id, drink as number);
              setSaving(false);
            }}
            type="button"
          >
            Save
          </button>
        )}
      </li>
    );
  }
  return null;
};

const TableManager: React.FC<TableManagerProps> = ({ initialGuests }) => {
  // Group guests by table
  const tables = Array.from({ length: 9 }, (_, i) => i + 1);
  const guestsByTable: Record<number, Guest[]> = {};
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  tables.forEach((table) => {
    guestsByTable[table] = guests
      .filter((g) => g.table === table)
      .sort((a, b) => (a.table_seat || 0) - (b.table_seat || 0));
  });

  // Find eligible guests for assignment (RSVP true, no table/seat)
  const eligibleGuests = guests.filter(
    (g) => g.rsvp === true && (g.table == null || g.table_seat == null)
  );

  // DB update helpers
  const assignGuestToSeat = async (guestId: string, table: number, seatNum: number) => {
    const supabase = (await import('../../lib/supabase')).getSupabase();
    await supabase.from('guests').update({ table, table_seat: seatNum }).eq('id', guestId);
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, table, table_seat: seatNum } : g))
    );
  };
  const updateMenu = async (guestId: string, menu: 1 | 2 | 3) => {
    const supabase = (await import('../../lib/supabase')).getSupabase();
    await supabase.from('guests').update({ menu }).eq('id', guestId);
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, menu } : g)));
  };
  const updateDrink = async (guestId: string, drink: number) => {
    const supabase = (await import('../../lib/supabase')).getSupabase();
    await supabase.from('guests').update({ drink }).eq('id', guestId);
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, drink } : g)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl border p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div key={table}>
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  <span className="text-blue-600">Table {table}</span>
                  <span className="ml-2 text-gray-500 text-sm">({guestsByTable[table].length} guests)</span>
                </h3>
                <ul className="space-y-3">
                  {Array.from({ length: 10 }, (_, seatIdx) => {
                    const seatNum = seatIdx + 1;
                    const guest = guestsByTable[table][seatIdx];
                    // If no guest, render TableSeat for assignment
                    if (!guest) {
                      return (
                        <TableSeat
                          key={`empty-seat-${table}-${seatNum}`}
                          seatNum={seatNum}
                          eligibleGuests={eligibleGuests}
                          onAssign={async (guestId) => assignGuestToSeat(guestId, table, seatNum)}
                        />
                      );
                    }
                    // Otherwise, render TableSeat for menu/drink selection if needed
                    if (guest.menu == null || guest.drink == null) {
                      return (
                        <TableSeat
                          key={guest.id}
                          seatNum={seatNum}
                          eligibleGuests={eligibleGuests}
                          guest={guest}
                          onMenuChange={async (guestId, menu) => updateMenu(guestId, menu)}
                          onDrinkChange={async (guestId, drink) => updateDrink(guestId, drink)}
                          onAssign={async () => {}}
                        />
                      );
                    }
                    // Always render menu and drink icons if either is selected
                    let dishLabel = '';
                    let DishIcon: React.ElementType = Utensils;
                    if (guest.menu) {
                      if (guest.is_kid_menu) {
                        if (kidsDishes[guest.menu as keyof typeof kidsDishes]) {
                          dishLabel = kidsDishes[guest.menu as keyof typeof kidsDishes].dish;
                        }
                        // No icon for kids dishes, fallback to Utensils
                      } else {
                        if (dishes[guest.menu as keyof typeof dishes]) {
                          dishLabel = dishes[guest.menu as keyof typeof dishes].dish;
                          DishIcon = dishes[guest.menu as keyof typeof dishes].icon || Utensils;
                        }
                      }
                    }
                    let drinkLabel = '';
                    let DrinkIcon: React.ElementType | null = null;
                    if (guest.drink && drinks[guest.drink as keyof typeof drinks]) {
                      drinkLabel = drinks[guest.drink as keyof typeof drinks].drink;
                      DrinkIcon = drinks[guest.drink as keyof typeof drinks].icon;
                    }
                    return (
                      <li
                        key={guest.id}
                        className="flex items-center gap-2 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm"
                      >
                        <span className="ml-auto text-xs text-gray-400">{seatNum}</span>
                        <span className="flex-1 font-semibold text-gray-900">
                          {guest.name}
                        </span>
                        {/* Dish Icon with tooltip */}
                        {guest.menu ? (
                          <span className="relative group ml-2 mr-1">
                            <DishIcon className="w-5 h-5 text-orange-600" />
                            <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap shadow-lg">
                              {dishLabel}
                            </span>
                          </span>
                        ) : null}
                        {/* Drink Icon with tooltip */}
                        {guest.drink ? (
                          DrinkIcon ? (
                            <span className="relative group">
                              <DrinkIcon className="mr-1 w-5 h-5 text-blue-600" />
                              <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap shadow-lg">
                                {drinkLabel}
                              </span>
                            </span>
                          ) : (
                            <span className="mr-1 text-lg relative group">
                              {drinkLabel}
                              <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap shadow-lg">
                                {drinkLabel}
                              </span>
                            </span>
                          )
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableManager;
