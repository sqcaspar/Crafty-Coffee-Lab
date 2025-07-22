import { ActiveTab } from '../App';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

interface TabItem {
  id: ActiveTab;
  label: string;
  description: string;
  icon: string;
}

const tabs: TabItem[] = [
  {
    id: 'input',
    label: 'Create',
    description: 'New recipe',
    icon: '✏️'
  },
  {
    id: 'recipes',
    label: 'Recipes',
    description: 'Browse all',
    icon: '☕'
  },
  {
    id: 'collections',
    label: 'Collections',
    description: 'Organize',
    icon: '📁'
  },
  {
    id: 'favorites',
    label: 'Favorites',
    description: 'Top picks',
    icon: '⭐'
  }
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-200">
      <div className="flex space-x-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 px-6 py-4 text-center border-b-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg" role="img" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="font-medium text-sm">
                {tab.label}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {tab.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}