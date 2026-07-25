import { Reveal } from "@/components/Reveal";
import {
  homepageReviews,
  reviewPlatforms,
  sourceLabel,
  type ReviewQuote,
} from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="review-stars" aria-label={`${rating} von 5 Sternen`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < Math.round(rating) ? "is-on" : undefined}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

function GoogleMark() {
  return (
    <span className="review-platform-mark review-platform-mark--google" aria-hidden>
      G
    </span>
  );
}

function TripadvisorMark() {
  return (
    <span
      className="review-platform-mark review-platform-mark--ta"
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3.2a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zm-4.6 5.1a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zm9.2 0a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zM12 18.2c-2.1 0-3.9-1-5-2.5.9-.7 2.1-1.1 3.4-1.3.5.4 1 0.6 1.6.6s1.1-.2 1.6-.6c1.3.2 2.5.6 3.4 1.3-1.1 1.5-2.9 2.5-5 2.5z" />
      </svg>
    </span>
  );
}

function QuoteCard({ review }: { review: ReviewQuote }) {
  return (
    <blockquote className="review-quote">
      <Stars rating={review.rating} />
      <p className="review-quote-text">„{review.text}“</p>
      <footer className="review-quote-meta">
        <cite className="review-quote-author">{review.author}</cite>
        <span className="review-quote-source">
          {sourceLabel(review.source)} · {review.when}
        </span>
      </footer>
    </blockquote>
  );
}

/**
 * Homepage social proof: platform trust row + curated quotes.
 * Placed mid-page (not in hero) for a serious, high-trust impression.
 */
export function ReviewsSection() {
  return (
    <section
      className="reviews-section"
      aria-labelledby="reviews-heading"
      id="bewertungen"
    >
      <div className="mx-auto max-w-6xl px-5 py-[var(--section-y)] md:px-8">
        <Reveal>
          <p className="text-sm tracking-[0.2em] text-[color:var(--gold)] uppercase">
            Stimmen aus Landshut
          </p>
          <h2
            id="reviews-heading"
            className="font-display mt-3 max-w-xl text-3xl text-[color:var(--red)] md:text-4xl"
          >
            Gäste, die wiederkommen
          </h2>
          <p className="mt-4 max-w-lg text-[color:var(--muted)] leading-relaxed">
            Frisch, fair und zuverlässig — das hören wir oft. Lesen Sie
            unabhängige Bewertungen auf Google und Tripadvisor.
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="review-platforms" role="list">
            <a
              href={reviewPlatforms.google.href}
              target="_blank"
              rel="noreferrer"
              className="review-platform"
              role="listitem"
            >
              <GoogleMark />
              <span className="review-platform-copy">
                <span className="review-platform-name">Google</span>
                <span className="review-platform-score">
                  <Stars rating={reviewPlatforms.google.rating} />
                  <strong>{reviewPlatforms.google.rating.toFixed(1)}</strong>
                  <span>· {reviewPlatforms.google.count} Bewertungen</span>
                </span>
              </span>
              <span className="review-platform-go" aria-hidden>
                →
              </span>
            </a>

            <a
              href={reviewPlatforms.tripadvisor.href}
              target="_blank"
              rel="noreferrer"
              className="review-platform"
              role="listitem"
            >
              <TripadvisorMark />
              <span className="review-platform-copy">
                <span className="review-platform-name">Tripadvisor</span>
                <span className="review-platform-score">
                  Bewertungen &amp; Fotos ansehen
                </span>
              </span>
              <span className="review-platform-go" aria-hidden>
                →
              </span>
            </a>
          </div>
        </Reveal>

        <div className="review-quotes mt-12">
          {homepageReviews.map((review, index) => (
            <Reveal
              key={`${review.author}-${index}`}
              delay={(index % 3) as 0 | 1 | 2}
            >
              <QuoteCard review={review} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
