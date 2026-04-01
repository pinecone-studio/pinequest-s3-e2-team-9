import type { ReactElement } from "react";
import type { IconProps } from "@/app/(teacher)/components/icons";
import {
  CheckCirclesIcon,
  ClipboardIcon,
  HomeIcon,
} from "@/app/(teacher)/components/icons";

type IconComponent = (props: IconProps) => ReactElement;

export type StudentNavItem = {
  label: string;
  href: string;
  icon: IconComponent;
  exact?: boolean;
};

export const studentNavItems: StudentNavItem[] = [
  { label: "Нүүр", href: "/student", icon: HomeIcon, exact: true },
  { label: "Миний шалгалтууд", href: "/student/my-exams", icon: ClipboardIcon },
  { label: "Үнэлгээ", href: "/student/results", icon: CheckCirclesIcon },
];
