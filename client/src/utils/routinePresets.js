export const ROUTINE_BLOCKS = [
  {
    timeRange: '06:30 - 08:30 AM',
    title: 'Morning Momentum',
    description: 'Wake up, hydrate, Gym / physical workout, fresh breakfast.',
    category: 'Fitness',
    color: '#10B981',
    icon: 'Dumbbell'
  },
  {
    timeRange: '08:30 - 09:30 AM',
    title: 'Pre-Work Study / DSA',
    description: 'Fresh mind session: 1-2 DSA problems or Core Java revision.',
    category: 'Technical Study',
    color: '#3B82F6',
    icon: 'Code2'
  },
  {
    timeRange: '10:00 AM - 07:00 PM',
    title: 'Office / Full-Time Job',
    description: 'Deep work at job, engineering responsibilities, professional growth.',
    category: 'Job & Career',
    color: '#8B5CF6',
    icon: 'Briefcase'
  },
  {
    timeRange: '07:30 - 08:30 PM',
    title: 'Evening Refresh & Chores',
    description: 'Travel back, buy eggs/groceries, healthy dinner, freshen up.',
    category: 'Groceries & Shopping',
    color: '#EC4899',
    icon: 'ShoppingCart'
  },
  {
    timeRange: '08:30 - 10:30 PM',
    title: 'Targeted Deep Study',
    description: 'MERN stack projects, SSC CGL Quant & Reasoning, or technical prep.',
    category: 'Government Exam',
    color: '#F59E0B',
    icon: 'BookOpen'
  },
  {
    timeRange: '10:30 - 11:00 PM',
    title: 'Review & Plan Tomorrow',
    description: 'Room chores, pack bag/clothes, plan tomorrow in DayTrack, sleep.',
    category: 'Planning & Miscellaneous',
    color: '#6366F1',
    icon: 'CalendarClock'
  }
];

export const QUICK_TASK_TEMPLATES = [
  { title: 'Study Java for 45 minutes', categoryName: 'Technical Study', priority: 'high', duration: 45 },
  { title: 'Solve 3 DSA problems', categoryName: 'Technical Study', priority: 'high', duration: 60 },
  { title: 'Revise SSC CGL Mathematics', categoryName: 'Government Exam', priority: 'medium', duration: 45 },
  { title: 'SSC CGL Reasoning practice', categoryName: 'Government Exam', priority: 'medium', duration: 30 },
  { title: 'Go to the Gym (Chest & Triceps)', categoryName: 'Fitness', priority: 'high', duration: 60 },
  { title: 'Buy eggs, bananas & veggies', categoryName: 'Groceries & Shopping', priority: 'medium', duration: 20 },
  { title: 'Prepare tomorrow breakfast & lunch', categoryName: 'Room & Personal Chores', priority: 'medium', duration: 30 },
  { title: 'Clean rented room & organize desk', categoryName: 'Room & Personal Chores', priority: 'low', duration: 25 },
  { title: 'Prepare clothes & bag for tomorrow', categoryName: 'Room & Personal Chores', priority: 'low', duration: 15 },
  { title: 'Revise React & Node.js concepts', categoryName: 'Technical Study', priority: 'medium', duration: 45 }
];
