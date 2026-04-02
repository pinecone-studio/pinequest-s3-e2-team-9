import type { ReactElement } from "react";
import type { IconProps } from "./icons";
import {
  AssignmentIcon,
  CheckCirclesIcon,
  HexagonIcon,
  CommunityButtonIcon,
  MenuIcon,
  PeopleAltIcon,
  PlusIcon,
  HomesIcon,
  UsersIcon,
} from "./icons";
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
  { label: "Нүүр", href: "/", icon: HomesIcon },
  { label: "Миний шалгалтууд", href: "/my-exams", icon: AssignmentIcon },
  { label: "Шалгалт авах", href: "/create-exam", icon: HexagonIcon },
  { label: "Ангиуд", href: "/classes", icon: PeopleAltIcon },
  { label: "Асуултын сан", href: "/question-bank", icon: MenuIcon },
  { label: "Нийгэмлэг", href: "/community", icon: CommunityButtonIcon },
  { label: "Үнэлгээ", href: "/evaluation", icon: CheckCirclesIcon },
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
    icon: CheckCirclesIcon,
  },
  {
    label: "Асуултын сан руу орох",
    tone: "bg-[#FAFAFA] text-[#0F1216] border-[#DFE1E5]",
    icon: MenuIcon,
  },
];
