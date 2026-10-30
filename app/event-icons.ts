import {
  AcademicCapIcon,
  BeakerIcon,
  BoltIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CakeIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  CloudIcon,
  CodeBracketIcon,
  CogIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  FireIcon,
  GlobeAltIcon,
  HeartIcon,
  HomeIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TrophyIcon,
  UserGroupIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";
import {
  eventIconLabel,
  isEventIconName,
  type EventIconName,
} from "@schellingboard/domain/event-icons";

export { eventIconLabel, isEventIconName };

export type HeroIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, "ref"> & {
    title?: string;
    titleId?: string;
  } & RefAttributes<SVGSVGElement>
>;

export const EVENT_ICONS: Record<string, HeroIcon> = {
  AcademicCapIcon,
  BeakerIcon,
  BoltIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CakeIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  CloudIcon,
  CodeBracketIcon,
  CogIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  FireIcon,
  GlobeAltIcon,
  HeartIcon,
  HomeIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TrophyIcon,
  UserGroupIcon,
  WrenchIcon,
} satisfies Record<EventIconName, HeroIcon>;

/**
 * Icons used to be stored as free text, so the DB may hold values outside
 * EVENT_ICONS. Those never rendered anywhere; treat them as "no icon" so
 * forms don't re-submit them and trip the server-side validation.
 */
export function normalizeEventIconName(
  name: string | null | undefined
): string {
  return name && isEventIconName(name) ? name : "";
}
