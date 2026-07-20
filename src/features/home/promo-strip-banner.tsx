import Image from "next/image";
import Link from "next/link";

type PromoStripBannerProps = {
  href?: string;
  alt?: string;
};

export function PromoStripBanner({
  href = "/shop?filter=on-sale",
  alt = "ROOTORA flash sale — limited time offers",
}: PromoStripBannerProps) {
  return (
    <section
      className="bg-surface py-3 sm:py-4"
      aria-label="Promotional offer"
    >
      <div className="container-rootora">
        <Link
          href={href}
          className="group relative block h-[100px] overflow-hidden rounded sm:h-[120px] md:h-[130px]"
        >
          <Image
            src="/images/promo-strip-sale.png"
            alt={alt}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority={false}
          />
        </Link>
      </div>
    </section>
  );
}
