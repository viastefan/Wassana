import Link from "next/link";

type Crumb = { name: string; path: string };

/**
 * Visible breadcrumb trail — must match JsonLdBreadcrumbs for rich results.
 * Hidden on single-item (home-only) trails.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;

  return (
    <nav className="breadcrumbs" aria-label="Brotkrumen">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className="breadcrumbs-item">
              {last ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
