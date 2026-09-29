import Slider from "react-slick";
import { useNavigate } from "react-router";
import getFormattedNumber from "../hooks/get-formatted-number";

const SLIDER_SETTINGS = {
  dots: true,
  infinite: true,
  speed: 400,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3500,
  pauseOnHover: true,
  pauseOnFocus: true,
  arrows: false,
  swipe: true,
  draggable: true,
  touchMove: true,
  dotsClass: "slick-dots sidebar-promo-dots",
};

function PromoCard({
  gradientClass,
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
  buttonClassName = "text-purple-600",
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 shadow-lg bg-linear-to-br ${gradientClass}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />

      <div className="relative z-10">
        <div className="text-white/90 text-xs font-semibold mb-1">{title}</div>
        <div className="text-white font-bold text-sm mb-3">{subtitle}</div>
        <button
          type="button"
          onClick={onButtonClick}
          className={`w-full bg-white font-semibold text-sm py-2 px-4 rounded-xl hover:bg-white/90 transition-all shadow-md ${buttonClassName}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export function SidebarPromoSlider({
  isAuthenticated,
  checkedInToday,
  todayPoints,
  onDailyBonusClick,
}) {
  const navigate = useNavigate();

  const dailySubtitle = isAuthenticated
    ? `Get ${getFormattedNumber(todayPoints || 0, 0)} points today`
    : "Get 500 points today";

  const dailyButtonLabel =
    isAuthenticated && checkedInToday ? "Claimed" : "Claim";

  return (
    <div className="sidebar-promo-slider w-full">
      <style>{`
        .sidebar-promo-slider .slick-list {
          overflow: hidden;
        }

        .sidebar-promo-slider .slick-track {
          display: flex;
          align-items: stretch;
        }

        .sidebar-promo-slider .slick-slide {
          height: auto;
        }

        .sidebar-promo-slider .slick-slide > div {
          height: 100%;
        }

        .sidebar-promo-slider .sidebar-promo-dots {
          position: static;
          margin: 10px 0 0;
          line-height: 0;
        }

        .sidebar-promo-slider .sidebar-promo-dots li {
          margin: 0 4px;
          width: 6px;
          height: 6px;
        }

        .sidebar-promo-slider .sidebar-promo-dots li button {
          width: 6px;
          height: 6px;
          padding: 0;
        }

        .sidebar-promo-slider .sidebar-promo-dots li button:before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(107, 114, 128, 0.35);
          opacity: 1;
          top: 0;
          left: 0;
        }

        .sidebar-promo-slider .sidebar-promo-dots li.slick-active button:before {
          background: rgb(31 41 55);
          width: 1rem;
          border-radius: 9999px;
        }
      `}</style>

      <Slider {...SLIDER_SETTINGS}>
       
        <div>
          <PromoCard
            gradientClass="from-emerald-500 via-teal-500 to-cyan-600"
            title="Referral Program"
            subtitle="Earn up to $100 per referral"
            buttonLabel="Invite Friends"
            onButtonClick={() => navigate("/referrals")}
            buttonClassName="text-teal-600"
          />
        </div>
        <div>
          <PromoCard
            gradientClass="from-purple-500 via-blue-500 to-purple-600"
            title="Daily Bonus"
            subtitle={dailySubtitle}
            buttonLabel={dailyButtonLabel}
            onButtonClick={onDailyBonusClick}
            buttonClassName="text-purple-600"
          />
        </div>
      </Slider>
    </div>
  );
}
