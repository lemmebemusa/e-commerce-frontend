import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
];

export default function PillNav() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const containerRef = useRef(null);
  const tabRefs = useRef([]);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.href === activeTab);
    const activeTabEl = tabRefs.current[activeIndex];
    const container = containerRef.current;

    if (activeTabEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabEl.getBoundingClientRect();
      const containerStyles = getComputedStyle(container);
      const containerPadding = parseFloat(containerStyles.paddingLeft) || 4;

      setIndicatorStyle({
        width: `${tabRect.width}px`,
        height: `${tabRect.height}px`,
        transform: `translateX(${tabRect.left - containerRect.left}px)`,
        top: `${tabRect.top - containerRect.top}px`,
      });
    }
  }, [activeTab]);

  return (
    <nav className="bg-gray-100 rounded-full p-1">
      <div
        ref={containerRef}
        className="relative flex items-center"
      >
        <div
          className="absolute bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out"
          style={indicatorStyle}
        />
        {tabs.map((tab, index) => (
          <Link
            key={tab.href}
            to={tab.href}
            ref={el => tabRefs.current[index] = el}
            onClick={() => setActiveTab(tab.href)}
            className={`relative z-10 px-5 py-2 text-sm rounded-full transition-colors duration-200 ${
              activeTab === tab.href
                ? 'text-black font-medium'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}