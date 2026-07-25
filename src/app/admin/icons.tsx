import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function Svg({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-9.5Z" />
    </Svg>
  );
}

export function IconCourse({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7.5h16" />
      <path d="M6.5 7.5v9.5a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V7.5" />
      <path d="M9 11h6M9 14.5h4" />
    </Svg>
  );
}

export function IconInbox({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8.5 12 13l8-4.5" />
      <path d="M5 6h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
    </Svg>
  );
}

export function IconBanner({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 5.5h14v4.2H5z" />
      <path d="M7 12.5h10M7 15.5h7" />
      <path d="M5 18.5h14" />
    </Svg>
  );
}

export function IconTexts({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 6.5h12" />
      <path d="M8 10.5h8M8 14h8M8 17.5h5" />
    </Svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 7h14M5 12h14M5 17h10" />
    </Svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" />
    </Svg>
  );
}

export function IconPulse({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 12h3.2l2.1-5.2L12.5 18l2.4-6H21" />
    </Svg>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 19V10M10.5 19V5M16 19v-7M21 19H3" />
    </Svg>
  );
}

export const ADMIN_TAB_ICONS = {
  home: IconHome,
  course: IconCourse,
  inbox: IconInbox,
  banner: IconBanner,
  content: IconTexts,
  menu: IconMenu,
  settings: IconSettings,
} as const;
