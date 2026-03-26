import type { ReactElement } from "react";
import type { IconProps } from "./icons";
import {
  ChartIcon,
  CheckIcon,
  ClipboardIcon,
  GridIcon,
  HomeIcon,
  MonitorIcon,
  PlusIcon,
  UsersIcon,
} from "./icons";
import { ClassesIcon, QuestionBox } from "./icons-svg";
type IconComponent = (props: IconProps) => ReactElement;

export type NavItem = {
  label: string;
  href: string;
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
  { label: "Ангиуд", href: "/classes", icon: ClassesIcon },
  { label: "Асуултын сан", href: "/question-bank", icon: QuestionBox },
  { label: "Шалгалт үүсгэх", href: "/create-exam", icon: GridIcon },
  { label: "Үнэлгээ", href: "/my-exams", icon: ChartIcon },
  { label: "Хяналт", href: "/my-exams", icon: MonitorIcon },
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
    icon: QuestionBox,
  },
];
