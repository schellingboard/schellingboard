export const EVENT_ICON_NAMES = [
  "AcademicCapIcon",
  "BeakerIcon",
  "BoltIcon",
  "BookOpenIcon",
  "BriefcaseIcon",
  "BuildingOfficeIcon",
  "CakeIcon",
  "CalendarIcon",
  "ChatBubbleLeftIcon",
  "CloudIcon",
  "CodeBracketIcon",
  "CogIcon",
  "CommandLineIcon",
  "ComputerDesktopIcon",
  "CpuChipIcon",
  "FireIcon",
  "GlobeAltIcon",
  "HeartIcon",
  "HomeIcon",
  "MicrophoneIcon",
  "MusicalNoteIcon",
  "PaintBrushIcon",
  "RocketLaunchIcon",
  "SparklesIcon",
  "StarIcon",
  "SunIcon",
  "TrophyIcon",
  "UserGroupIcon",
  "WrenchIcon",
] as const;

export type EventIconName = (typeof EVENT_ICON_NAMES)[number];

export function isEventIconName(name: string): name is EventIconName {
  return (EVENT_ICON_NAMES as readonly string[]).includes(name);
}

/** "AcademicCapIcon" -> "Academic Cap" */
export function eventIconLabel(name: string): string {
  return name
    .replace(/Icon$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
}
