import React, { useState } from 'react';
import InvitationManager from './InvitationManager';
import GuestManager from './GuestManager';
import MenuManager from './MenuManager';
import TableManager from './TableManager';
import DrinkManager from './DrinkManager';
import { MailOpen, Users, ChefHat, LayoutPanelTop, Wine } from 'lucide-react';

interface AdminTabsProps {
  initialInvitations: any[];
  initialStats: any;
  initialGuests: any[];
  guestStats: any;
}

const TABS = [
  {
    label: 'Invitations',
    key: 'invitations',
    icon: (
      <span className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
        <MailOpen className="w-8 h-8 text-white" />
      </span>
    ),
    title: 'Invitation Management',
    desc: 'Manage wedding invitations and track RSVPs with elegance and precision',
  },
  {
    label: 'Guests',
    key: 'guests',
    icon: (
      <span className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
        <Users className="w-8 h-8 text-white" />
      </span>
    ),
    title: 'Guest Management',
    desc: 'Manage individual guests and track their RSVPs with precision',
  },
  {
    label: 'Menu',
    key: 'menu',
    icon: (
      <span className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
        <ChefHat className="w-8 h-8 text-white" />
      </span>
    ),
    title: 'Menu Manager',
    desc: 'Organize guests by their selected dishes.',
  },
  {
    label: 'Drinks',
    key: 'drinks',
    icon: (
      <span className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
        <Wine className="w-8 h-8 text-white" />
      </span>
    ),
    title: 'Drink Manager',
    desc: 'Organize guests by their drinks.',
  },
  {
    label: 'Tables',
    key: 'tables',
    icon: (
      <span className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
        <LayoutPanelTop className="w-8 h-8 text-white" />
      </span>
    ),
    title: 'Table Assignments',
    desc: 'Guests organized by table and seat.',
  },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const AdminTabs: React.FC<AdminTabsProps> = ({
  initialInvitations,
  initialStats,
  initialGuests,
  guestStats,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('invitations');

  const activeTabMeta = TABS.find((tab) => tab.key === activeTab)!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-4">
          {activeTabMeta.icon}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {activeTabMeta.title}
            </h1>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{activeTabMeta.desc}</p>
      </div>
      {/* Tabs */}
      <div className="flex justify-center border-b mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`mx-2 px-6 py-2 -mb-px border-b-2 font-medium focus:outline-none transition-colors duration-200 rounded-t-lg ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 bg-white shadow'
                : 'border-transparent text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-white'
            }`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
            style={{ minWidth: 120 }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === 'invitations' && (
          <InvitationManager initialInvitations={initialInvitations} initialStats={initialStats} />
        )}
        {activeTab === 'guests' && (
          <GuestManager initialGuests={initialGuests} initialStats={guestStats} />
        )}
        {activeTab === 'menu' && <MenuManager initialGuests={initialGuests} />}
        {activeTab === 'drinks' && <DrinkManager initialGuests={initialGuests} />}
        {activeTab === 'tables' && <TableManager initialGuests={initialGuests} />}
      </div>
    </div>
  );
};

export default AdminTabs;
