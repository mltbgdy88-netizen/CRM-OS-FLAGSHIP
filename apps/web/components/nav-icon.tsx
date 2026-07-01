interface NavIconProps {
  name: string;
  className?: string;
}

/** Line icons aligned with Premium Dark mockups (20×20, stroke). */
export function NavIcon({ name, className = 'nav-icon' }: NavIconProps) {
  const common = {
    className,
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case 'customers':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
        </svg>
      );
    case 'leads':
      return (
        <svg {...common}>
          <path d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.7L12 16.5 6.4 20.5l2.1-6.7L3 9.8h6.8L12 3z" />
        </svg>
      );
    case 'pipeline':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h10M4 18h6" />
          <circle cx="18" cy="12" r="2" />
          <circle cx="14" cy="18" r="2" />
        </svg>
      );
    case 'quotes':
      return (
        <svg {...common}>
          <path d="M7 4h10v16H7z" />
          <path d="M9 8h6M9 12h4" />
        </svg>
      );
    case 'orders':
      return (
        <svg {...common}>
          <path d="M6 6h15l-1.5 9H7.5L6 6z" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="17" cy="19" r="1.5" />
        </svg>
      );
    case 'tasks':
      return (
        <svg {...common}>
          <path d="M9 11l2 2 4-4" />
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="M4 8l8 5 8-5" />
        </svg>
      );
    case 'tickets':
      return (
        <svg {...common}>
          <path d="M4 8h16v8H4z" />
          <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common}>
          <path d="M6 18V10M12 18V6M18 18v-8" />
        </svg>
      );
    case 'ai':
      return (
        <svg {...common}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
  }
}
