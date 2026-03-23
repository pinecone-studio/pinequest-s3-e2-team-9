import type { ReactNode } from "react";

type SpotlightCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function SpotlightCard({
  eyebrow,
  title,
  description,
  children,
}: SpotlightCardProps) {
  return (
    <section className="spotlight-card">
      <p className="spotlight-eyebrow">{eyebrow}</p>
      <h1 className="spotlight-title">{title}</h1>
      <p className="spotlight-description">{description}</p>
      {children ? <div className="spotlight-actions">{children}</div> : null}
    </section>
  );
}
