import type { ElementType, HTMLAttributes, ReactNode } from "react";

/** Marks a public text node as clickable in admin preview mode. */
export function EditableText({
  path,
  as: Tag = "span",
  className = "",
  children,
  ...rest
}: {
  path: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={className} {...rest} data-content-path={path}>
      {children}
    </Tag>
  );
}
