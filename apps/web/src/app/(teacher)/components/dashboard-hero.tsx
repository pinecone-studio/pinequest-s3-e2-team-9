import Image from "next/image";
import OwlIcon from "./icons/OwlIcon.png";
type DashboardHeroProps = {
  teacherName: string;
};

export function DashboardHero({ teacherName }: DashboardHeroProps) {
  return (
    <section className="relative h-[182px] w-[1120px] overflow-hidden rounded-[16px] border border-[#DFE1E5] bg-[linear-gradient(135deg,#6F90FF_0%,#2466D0_100%)] px-0 pb-12 pl-6 pt-12 text-white shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="relative z-10 w-[322px] space-y-2">
        <h1 className="text-[20px] font-semibold leading-[28px]">
          Өглөөний мэнд, {teacherName}
        </h1>
        <p className="text-[14px] leading-[20px] text-white/90">
          Өнөөдрийн шалгалтуудаа хялбар удирдаж, дүнг, үнэлгээгээ хялбар
          гаргаарай
        </p>
      </div>

      <div className="absolute left-[692px] top-[-58px] z-10 h-[325px] w-[487px]">
        <Image
          alt="Owl"
          className="h-full w-full object-contain"
          priority
          src={OwlIcon}
        />
      </div>
    </section>
  );
}
