import { TEACHER_COMMON_TEXT } from "../teacher-ui";

export function CommunitySection() {
  return (
    <section className="mx-auto w-full max-w-[1120px] space-y-6">
      <div>
        <h1 className="text-[24px] font-semibold text-[#0F1216]">
          {TEACHER_COMMON_TEXT.community}
        </h1>
        <p className="mt-1 text-[14px] text-[#52555B]">
          Багш нар туршлага солилцож, санаа авч, асуулт хариултаа хуваалцах хэсэг.
        </p>
      </div>

      <div className="rounded-2xl border border-[#DFE1E5] bg-white px-6 py-10 text-center shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
        <h2 className="text-[20px] font-semibold text-[#0F1216]">
          Нийгэмлэгийн хэсэг удахгүй нээгдэнэ
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#52555B]">
          Энд багш нар хичээлийн санаа, шалгалтын туршлага, асуултын сангийн зөвлөмжөө хоорондоо хуваалцах боломжтой болно.
        </p>
      </div>
    </section>
  );
}
