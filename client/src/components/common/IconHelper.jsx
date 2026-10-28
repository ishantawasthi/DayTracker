import React from 'react';
import {
  Code2,
  BookOpen,
  Briefcase,
  Dumbbell,
  Salad,
  ShoppingCart,
  Home,
  CalendarClock,
  CheckCircle,
  Folder,
  Flame,
  Clock,
  Sparkles,
  Award,
  Calendar,
  Layers,
  Tag
} from 'lucide-react';

const ICON_MAP = {
  Code2,
  BookOpen,
  Briefcase,
  Dumbbell,
  Salad,
  ShoppingCart,
  Home,
  CalendarClock,
  CheckCircle,
  Folder,
  Flame,
  Clock,
  Sparkles,
  Award,
  Calendar,
  Layers,
  Tag
};

export const IconHelper = ({ name, className = 'w-5 h-5', style }) => {
  const Component = ICON_MAP[name] || Folder;
  return <Component className={className} style={style} />;
};
