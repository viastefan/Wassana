import type { ReactNode } from "react";

type IconProps = {
  className?: string;
  filled?: boolean;
};

function Svg({
  className,
  filled,
  children,
}: {
  className?: string;
  filled?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconHome({ className, filled }: IconProps) {
  return (
    <Svg className={className} filled={filled}>
      <path d="M4 10.5 12 4l8 6.5V20a1.6 1.6 0 0 1-1.6 1.6h-4.6v-6.4h-3.6v6.4H5.6A1.6 1.6 0 0 1 4 20V10.5Z" />
    </Svg>
  );
}

export function IconCourse({ className, filled }: IconProps) {
  return (
    <Svg className={className} filled={filled}>
      <path d="M6 4.5h12a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V6A1.5 1.5 0 0 1 6 4.5Zm2.5 5h7v1.6h-7V9.5Zm0 3.4h5.5v1.6H8.5V12.9Z" />
    </Svg>
  );
}

export function IconInbox({ className, filled }: IconProps) {
  return (
    <Svg className={className} filled={filled}>
      <path d="M4.2 6.4 12 12.1l7.8-5.7A1.7 1.7 0 0 0 18.4 5H5.6a1.7 1.7 0 0 0-1.4 1.4ZM20 8.6l-8 5.8-8-5.8V17.5A1.7 1.7 0 0 0 5.7 19h12.6A1.7 1.7 0 0 0 20 17.5V8.6Z" />
    </Svg>
  );
}

export function IconBanner({ className, filled }: IconProps) {
  return (
    <Svg className={className} filled={filled}>
      <path d="M4.5 5h15v4.4h-15V5Zm1.8 7.2h11.4v1.5H6.3v-1.5Zm0 3.2h8.2v1.5H6.3V15.4Z" />
    </Svg>
  );
}

export function IconTexts({ className, filled }: IconProps) {
  return (
    <Svg className={className} filled={filled}>
      <path d="M5 4.5h14v3.2H5V4.5Zm0 5.2h14v2.1H5V9.7Zm0 4.1h10.5v2.1H5v-2.1Zm0 4.1h7.2V20H5v-2.1Z" />
    </Svg>
  );
}

export function IconMenu({ className, filled }: IconProps) {
  return (
    <Svg className={className} filled={filled}>
      <path d="M4.5 6.2h15v2.1h-15V6.2Zm0 4.75h15v2.1h-15v-2.1Zm0 4.75h11.2v2.1H4.5v-2.1Z" />
    </Svg>
  );
}

export function IconSettings({ className, filled }: IconProps) {
  return (
    <Svg className={className} filled={filled}>
      <path d="M10.1 3.4h3.8l.4 2.3 2 .9 2.1-1.1 1.9 3.3-1.7 1.6v2l1.7 1.6-1.9 3.3-2.1-1.1-2 .9-.4 2.3h-3.8l-.4-2.3-2-.9-2.1 1.1-1.9-3.3 1.7-1.6v-2L3.7 8.8 5.6 5.5l2.1 1.1 2-.9.4-2.3ZM12 9.2A2.8 2.8 0 1 0 12 14.8 2.8 2.8 0 0 0 12 9.2Z" />
    </Svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
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
