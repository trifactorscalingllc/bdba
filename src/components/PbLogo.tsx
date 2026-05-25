import logo from '@/assets/pb-logo.png';

type Props = {
  className?: string;
  alt?: string;
};

/**
 * Profitable Barbers logo with an animated diagonal light sweep
 * clipped to the logo's own alpha (via CSS mask-image).
 *
 * Pass sizing classes via `className` — they're applied to the inner <img>
 * exactly like the bare <img> usage it replaces.
 */
export default function PbLogo({ className = '', alt = 'Profitable Barbers' }: Props) {
  return (
    <span className="relative inline-block leading-[0]">
      <img src={logo} alt={alt} draggable={false} className={className} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 pb-logo-shimmer"
        style={{
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
        }}
      />
    </span>
  );
}
