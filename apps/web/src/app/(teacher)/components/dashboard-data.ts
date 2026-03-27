import type { ReactElement } from "react";
import type { IconProps } from "./icons";
import {
  BookIcon,
  CheckIcon,
  CheckCircleIcon,
  ClipboardIcon,
  GlobeIcon,
  HomeIcon,
  PlusIcon,
  UsersIcon,
} from "./icons";
import { TEACHER_COMMON_TEXT } from "./teacher-ui";
type IconComponent = (props: IconProps) => ReactElement;

export type NavItem = {
  label: string;
  href?: string;
  disabled?: boolean;
  icon: IconComponent;
};
export type QuickAction = {
  label: string;
  tone: string;
  icon: IconComponent;
};

export const navItems: NavItem[] = [
  { label: "Нүүр", href: "/", icon: HomeIcon },
  { label: "Миний шалгалтууд", href: "/my-exams", icon: ClipboardIcon },
  { label: "Ангиуд", href: "/classes", icon: UsersIcon },
  { label: "Асуултын сан", href: "/question-bank", icon: BookIcon },
  { label: TEACHER_COMMON_TEXT.community, href: "/community", icon: GlobeIcon },
  { label: "Үнэлгээ", href: "/evaluation", icon: CheckCircleIcon },
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
