import React, { useState, useMemo } from 'react';
import { Users, Clock, Beef, Ham, Drumstick } from 'lucide-react';
import { dishes } from '@/constants';
import { getSupabase } from '../../lib/supabase';
import Toast from './Toast';
import SearchInput from './SearchInput';
import FilterButton from './FilterButton';

interface Guest {
  id: string;
  name: string;
  rsvp: boolean | null;
  menu?: 1 | 2 | 3 | null;
  updated_at?: string;
  invitation?: {
    id: string;
    title: string;
  } | null;
}

interface Props {
  initialGuests: Guest[];
}

type FilterType = 'all' | 'confirmed' | 'pending' | 'declined';

const MenuManager: React.FC<Props> = ({ initialGuests }) => {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const renderGuestCard = (guest: Guest) => {
    return (
      <div
        key={guest.id}
        className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
      >
        <p className="font-semibold text-gray-900">{guest.name}</p>
      </div>
    );
  };

  const sections = [
    {
      key: 'pending',
      title: 'Pending',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      guests: filteredGuests.filter((g) => !g.menu),
    },
    {
      key: '1',
      title: dishes[1].dish,
      icon: <Beef className="w-5 h-5 text-orange-600" />,
      guests: filteredGuests.filter((g) => g.menu === 1),
    },
    {
      key: '2',
      title: dishes[2].dish,
      icon: <Ham className="w-5 h-5 text-pink-600" />,
      guests: filteredGuests.filter((g) => g.menu === 2),
    },
    {
      key: '3',
      title: dishes[3].dish,
      icon: <Drumstick className="w-5 h-5 text-green-600" />,
      guests: filteredGuests.filter((g) => g.menu === 3),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Menu Manager
            </h1>
          </div>
          <p className="text-lg text-gray-600">Organize guests by their selected dishes.</p>
        </div>

        <div className="bg-white rounded-2xl border p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.map((section) => (
              <div key={section.key}>
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  {section.icon}
                  {section.title} ({section.guests.length})
                </h3>
                <ul className="space-y-3">
                  {section.guests.length > 0 ? (
                    section.guests.map((guest) => (
                      <li key={guest.id} className="flex flex-col">
                        <span>{guest.name}</span>
                        <span className='text-xs text-gray-400'>{guest.invitation?.title}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400 italic">No guests</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManager;
