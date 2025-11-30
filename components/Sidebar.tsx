import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { name: 'Home', icon: 'fa-home', active: false },
    { name: 'All Emojis', icon: 'fa-icons', active: false },
    { name: 'Favorites', icon: 'fa-heart', active: false },
    { name: 'Recent', icon: 'fa-clock', active: false },
    { name: 'AI Enhancer', icon: 'fa-wand-magic-sparkles', active: true }, // Active page
    { name: 'Collections', icon: 'fa-layer-group', active: false },
  ];

  const categories = [
    { name: 'Activities', icon: 'fa-futbol' },
    { name: 'Animals & Nature', icon: 'fa-cat' },
    { name: 'Flags', icon: 'fa-flag' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen z-30
          w-64 bg-white dark:bg-dark-sidebar border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
            <i className="fa-solid fa-face-grin-tongue-wink"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight">EmojiHub</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href="#"
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${item.active 
                        ? 'bg-primary/10 text-primary dark:text-primary-light' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
                    `}
                  >
                    <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Categories
            </h3>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
                  >
                    <i className={`fa-solid ${cat.icon} w-5 text-center text-xs opacity-70`}></i>
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <i className="fa-solid fa-gear w-5 text-center"></i>
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;