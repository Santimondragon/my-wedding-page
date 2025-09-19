import React, { useState, useMemo } from 'react';
import { Clock, Beef, Ham, Drumstick } from 'lucide-react';
import { drinks } from '@/constants';

interface Guest {
  id: string;
  name: string;
  rsvp: boolean | null;
  drink?: 1 | 2 | 3 | 4 | null;
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

const DrinkManager: React.FC<Props> = ({ initialGuests }) => {
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

  const sections = [
    {
      key: 'pending',
      title: 'Pending',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      guests: filteredGuests.filter((g) => g.rsvp && !g.drink),
    },
    {
      key: '1',
      title: drinks[1].drink,
      icon: React.createElement(drinks[1].icon, { className: "w-5 h-5 text-orange-600" }),
      guests: filteredGuests.filter((g) => g.drink === 1),
    },
    {
      key: '2',
      title: drinks[2].drink,
      icon: React.createElement(drinks[2].icon, { className: "w-5 h-5 text-pink-600" }),
      guests: filteredGuests.filter((g) => g.drink === 2),
    },
    {
      key: '3',
      title: drinks[3].drink,
      icon: React.createElement(drinks[3].icon, { className: "w-5 h-5 text-green-600" }),
      guests: filteredGuests.filter((g) => g.drink === 3),
    },
    {
      key: '4',
      title: drinks[4].drink,
      icon: React.createElement(drinks[4].icon, { className: "w-5 h-5 text-green-600" }),
      guests: filteredGuests.filter((g) => g.drink === 4),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl border p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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

export default DrinkManager;
