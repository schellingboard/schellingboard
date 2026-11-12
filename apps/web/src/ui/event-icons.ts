import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { EventIconName } from "@schellingboard/domain/event-icons";
import type { ComponentType, SVGProps } from "react";

import {
  AcademicCapOutlineIcon,
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
  GlobeAltOutlineIcon,
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
} from "./icons";

export const EVENT_ICONS: Record<
  EventIconName,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  AcademicCapIcon: AcademicCapOutlineIcon,
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
  GlobeAltIcon: GlobeAltOutlineIcon,
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
};

const EVENT_ICON_LABELS: Record<EventIconName, MessageDescriptor> = {
  AcademicCapIcon: msg({
    message: "Academic Cap",
    comment: "Name of an event icon",
  }),
  BeakerIcon: msg({ message: "Beaker", comment: "Name of an event icon" }),
  BoltIcon: msg({ message: "Bolt", comment: "Name of an event icon" }),
  BookOpenIcon: msg({ message: "Book Open", comment: "Name of an event icon" }),
  BriefcaseIcon: msg({
    message: "Briefcase",
    comment: "Name of an event icon",
  }),
  BuildingOfficeIcon: msg({
    message: "Building Office",
    comment: "Name of an event icon",
  }),
  CakeIcon: msg({ message: "Cake", comment: "Name of an event icon" }),
  CalendarIcon: msg({ message: "Calendar", comment: "Name of an event icon" }),
  ChatBubbleLeftIcon: msg({
    message: "Chat Bubble Left",
    comment: "Name of an event icon",
  }),
  CloudIcon: msg({ message: "Cloud", comment: "Name of an event icon" }),
  CodeBracketIcon: msg({
    message: "Code Bracket",
    comment: "Name of an event icon",
  }),
  CogIcon: msg({ message: "Cog", comment: "Name of an event icon" }),
  CommandLineIcon: msg({
    message: "Command Line",
    comment: "Name of an event icon",
  }),
  ComputerDesktopIcon: msg({
    message: "Computer Desktop",
    comment: "Name of an event icon",
  }),
  CpuChipIcon: msg({ message: "Cpu Chip", comment: "Name of an event icon" }),
  FireIcon: msg({ message: "Fire", comment: "Name of an event icon" }),
  GlobeAltIcon: msg({ message: "Globe Alt", comment: "Name of an event icon" }),
  HeartIcon: msg({ message: "Heart", comment: "Name of an event icon" }),
  HomeIcon: msg({ message: "Home", comment: "Name of an event icon" }),
  MicrophoneIcon: msg({
    message: "Microphone",
    comment: "Name of an event icon",
  }),
  MusicalNoteIcon: msg({
    message: "Musical Note",
    comment: "Name of an event icon",
  }),
  PaintBrushIcon: msg({
    message: "Paint Brush",
    comment: "Name of an event icon",
  }),
  RocketLaunchIcon: msg({
    message: "Rocket Launch",
    comment: "Name of an event icon",
  }),
  SparklesIcon: msg({ message: "Sparkles", comment: "Name of an event icon" }),
  StarIcon: msg({ message: "Star", comment: "Name of an event icon" }),
  SunIcon: msg({ message: "Sun", comment: "Name of an event icon" }),
  TrophyIcon: msg({ message: "Trophy", comment: "Name of an event icon" }),
  UserGroupIcon: msg({
    message: "User Group",
    comment: "Name of an event icon",
  }),
  WrenchIcon: msg({ message: "Wrench", comment: "Name of an event icon" }),
};

export const eventIconLabel = (name: EventIconName) =>
  i18n._(EVENT_ICON_LABELS[name]);
