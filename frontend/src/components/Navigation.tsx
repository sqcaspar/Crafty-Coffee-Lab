import { ActiveTab } from '../App';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

interface TabItem {
  id: ActiveTab;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Dashboard',
    icon: (
      <svg className="icon-mono" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    id: 'input',
    label: 'Brew Journal',
    description: 'Create recipe',
    icon: (
      <svg className="icon-mono" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    id: 'recipes',
    label: 'My Brews',
    description: 'All recipes',
    icon: (
      <svg className="icon-mono" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    id: 'favorites',
    label: 'Top Picks',
    description: 'Favorites',
    icon: (
      <svg className="icon-mono" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  }
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="nav-mono fixed top-0 left-0 right-0 z-40 bg-mono-white/90 backdrop-blur-md">
      <div className="container-mono">
        <div className="flex space-x-0">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                nav-item-mono flex-1 px-6 py-4 text-center relative group
                focus-mono transition-all duration-300 ease-in-out
                ${activeTab === tab.id
                  ? 'nav-item-mono active text-mono-900 bg-mono-50 border-mono-900'
                  : 'text-mono-600 hover:text-mono-900 hover:bg-mono-50'
                }
              `}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
            >
              <div className="flex flex-col items-center space-y-2 relative">
                {/* Icon with hover animation */}
                <div className={`
                  transition-all duration-200 group-hover:scale-110
                  ${activeTab === tab.id ? 'text-mono-900' : 'text-mono-500 group-hover:text-mono-800'}
                `}>
                  {tab.icon}
                </div>
                
                {/* Label */}
                <span className={`
                  font-medium text-sm transition-all duration-200
                  ${activeTab === tab.id ? 'text-mono-900' : 'text-mono-600 group-hover:text-mono-900'}
                `}>
                  {tab.label}
                </span>
                
                {/* Description */}
                <span className={`
                  text-xs transition-all duration-200 uppercase tracking-wide
                  ${activeTab === tab.id ? 'text-mono-600' : 'text-mono-400 group-hover:text-mono-600'}
                `}>
                  {tab.description}
                </span>

                {/* Active indicator dot */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-mono-900 rounded-full animate-scale-up"></div>
                  </div>
                )}

                {/* Hover indicator */}
                <div className={`
                  absolute inset-0 bg-mono-100 rounded-xl opacity-0 transition-opacity duration-200
                  group-hover:opacity-50 pointer-events-none
                  ${activeTab === tab.id ? 'opacity-30' : ''}
                `}></div>
              </div>

              {/* Tab separator */}
              {index < tabs.length - 1 && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-px bg-mono-200"></div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Navigation shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mono-200 to-transparent"></div>
    </nav>
  );
}