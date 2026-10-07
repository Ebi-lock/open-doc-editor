import type { ReactNode, SVGProps } from 'react';

// 線画アイコン (24px グリッド・currentColor)
function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const AlignLeftIcon = () => (
  <Icon>
    <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />
  </Icon>
);

export const AlignCenterIcon = () => (
  <Icon>
    <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />
  </Icon>
);

export const AlignRightIcon = () => (
  <Icon>
    <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />
  </Icon>
);

export const ImageIcon = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M21 16l-5-5-9 9" />
  </Icon>
);

export const TableIcon = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M9 4v16M15 4v16" />
  </Icon>
);

export const IndentIcon = () => (
  <Icon>
    <path d="M4 6h16M10 12h10M4 18h16M4 9l3 3-3 3" />
  </Icon>
);

export const ListIcon = () => (
  <Icon>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" />
  </Icon>
);

export const OrderedListIcon = () => (
  <Icon>
    <path d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M3.5 14.5a1.5 1.5 0 1 1 2.6 1L3.5 19H6.5" />
  </Icon>
);

export const UndoIcon = () => (
  <Icon>
    <path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-4" />
  </Icon>
);

export const RedoIcon = () => (
  <Icon>
    <path d="M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h4" />
  </Icon>
);
