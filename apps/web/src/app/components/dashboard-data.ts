import type { ReactElement } from "react";
import type { IconProps } from "./icons";
import { BookIcon, CheckIcon, PlusIcon, UsersIcon } from "./icons";

type IconComponent = (props: IconProps) => ReactElement;

export type NavItem = {
  label: string;
  href: string;
  iconSrc: string;
};
export type QuickAction = {
  label: string;
  tone: string;
  icon: IconComponent;
};

export const navItems: NavItem[] = [
  { label: "Нүүр", href: "/", iconSrc: "/icons/home.svg" },
  { label: "Миний шалгалтууд", href: "/my-exams", iconSrc: "/icons/assignment.svg" },
  { label: "Ангиуд", href: "/classes", iconSrc: "/icons/people.svg" },
  { label: "Асуултын сан", href: "/question-bank", iconSrc: "/icons/menu_book.svg" },
  { label: "Community", href: "/community", iconSrc: "/icons/language.svg" },
  { label: "Үнэлгээ", href: "/assessment", iconSrc: "/icons/check_circle_outline.svg" },
];

export const quickActions: QuickAction[] = [
  {
    label: "Шалгалт үүсгэх",
    tone: "bg-[#00267F] text-white border-transparent",
    icon: PlusIcon,
  },
  {
    label: "Анги үүсгэх",
    tone: "bg-[#FAFAFA] text-[#0F1216] border-[#DFE1E5]",
    icon: UsersIcon,
  },
  {
    label: "Шалгах хэсэг рүү орох",
    tone: "bg-[#FAFAFA] text-[#0F1216] border-[#DFE1E5]",
    icon: CheckIcon,
  },
  {
    label: "Асуултын сан руу орох",
    tone: "bg-[#FAFAFA] text-[#0F1216] border-[#DFE1E5]",
    icon: BookIcon,
  },
];
