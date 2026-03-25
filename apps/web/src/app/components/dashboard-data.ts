import type { ReactElement } from "react";
import type { IconProps } from "./icons";
import {
  AlertIcon,
  ArchiveIcon,
  BookIcon,
  CalendarIcon,
  ChartIcon,
  CheckIcon,
  ClipboardIcon,
  GridIcon,
  HomeIcon,
  MonitorIcon,
  PlusIcon,
  UsersIcon,
  WarningIcon,
} from "./icons";

type IconComponent = (props: IconProps) => ReactElement;

export type NavItem = { label: string; active: boolean; icon: IconComponent };
export type AttentionCard = {
  value: string;
  label: string;
  tone: string;
  icon: IconComponent;
};
export type QuickAction = {
  label: string;
  tone: string;
  icon: IconComponent;
};

export const navItems: NavItem[] = [
  { label: "Нүүр", active: true, icon: HomeIcon },
  { label: "Шалгалт үүсгэх", active: false, icon: GridIcon },
  { label: "Миний шалгалтууд", active: false, icon: ClipboardIcon },
  { label: "Ангиуд", active: false, icon: UsersIcon },
  { label: "Асуултын сан", active: false, icon: BookIcon },
  { label: "Үнэлгээ", active: false, icon: ChartIcon },
  { label: "Шалгалтын хяналт", active: false, icon: MonitorIcon },
];

export const attentionCards: AttentionCard[] = [
  {
    value: "3",
    label: "Шалгах хариултууд",
    tone: "bg-[#EAB5321A] text-[#EAB532]",
    icon: AlertIcon,
  },
  {
    value: "0",
    label: "Удахгүй болох шалгалт",
    tone: "bg-[#F0F2F5] text-[#52555B]",
    icon: CalendarIcon,
  },
  {
    value: "1",
    label: "Архив (нийтлэгдээгүй)",
    tone: "bg-[#F0F2F5] text-[#52555B]",
    icon: ArchiveIcon,
  },
  {
    value: "1",
    label: "Сэжигтэй үйлдэл илэрсэн",
    tone: "bg-[#D409241A] text-[#D40924]",
    icon: WarningIcon,
  },
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
