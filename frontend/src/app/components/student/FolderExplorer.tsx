import type { GoalCategory, PaperType } from "../data/mockData";

export type FolderIconType =
  | "school" | "college" | "engineering" | "medical"
  | "by-subject" | "by-type" | "by-year"
  | "subject" | "year" | "paper-type"
  | "default";

export interface FolderNode {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  badge?: string;
  color?: string;
  iconType?: FolderIconType;
  emoji?: string;
  goalCategory?: GoalCategory;
  stream?: string;
  subject?: string;
  year?: number;
  paperType?: PaperType;
  children?: FolderNode[];
}

export const MAIN_FOLDERS: FolderNode[] = [
  // ── 1. School Board (Class 8 - 10) ──────────────────────────────────────────
  {
    id: "school",
    name: "School Board (Class 8 - 10)",
    description: "Maharashtra State Board SSC exams, unit tests, prelims & model papers",
    badge: "Class 8-10",
    color: "from-blue-600 to-indigo-700",
    iconType: "school",
    emoji: "🎓",
    children: [
      {
        id: "board-10",
        name: "Class 10 (SSC Board)",
        description: "Official SSC Board PYQs, Prelims, Model Sets & Unit Tests",
        goalCategory: "board-10",
        badge: "SSC Board",
        children: [
          // Folders by Subject
          {
            id: "b10-by-subject",
            name: "Folders by Subject",
            description: "Browse Class 10 papers categorized by subject",
            badge: "Subjects",
            iconType: "by-subject",
            emoji: "📐",
            goalCategory: "board-10",
            children: [
              {
                id: "b10-s-math",
                name: "Mathematics & Technology",
                subject: "Mathematics",
                iconType: "subject",
                goalCategory: "board-10",
                children: [
                  { id: "b10-sm-2025", name: "2025 Model Papers", subject: "Mathematics", year: 2025, iconType: "year", goalCategory: "board-10" },
                  { id: "b10-sm-2024", name: "2024 Official PYQ Papers", subject: "Mathematics", year: 2024, iconType: "year", goalCategory: "board-10" },
                  { id: "b10-sm-2023", name: "2023 Official PYQ Papers", subject: "Mathematics", year: 2023, iconType: "year", goalCategory: "board-10" },
                ]
              },
              {
                id: "b10-s-sci",
                name: "Science & Technology",
                subject: "Science & Technology",
                iconType: "subject",
                goalCategory: "board-10",
                children: [
                  { id: "b10-ss-2025", name: "2025 Model Papers", subject: "Science & Technology", year: 2025, iconType: "year", goalCategory: "board-10" },
                  { id: "b10-ss-2024", name: "2024 Official PYQ Papers", subject: "Science & Technology", year: 2024, iconType: "year", goalCategory: "board-10" },
                  { id: "b10-ss-2023", name: "2023 Official PYQ Papers", subject: "Science & Technology", year: 2023, iconType: "year", goalCategory: "board-10" },
                ]
              },
              { id: "b10-s-eng", name: "English Language", subject: "English", iconType: "subject", goalCategory: "board-10" },
              { id: "b10-s-mar", name: "Marathi Language", subject: "Marathi", iconType: "subject", goalCategory: "board-10" },
              { id: "b10-s-hist", name: "History & Political Science", subject: "History & Political Science", iconType: "subject", goalCategory: "board-10" },
              { id: "b10-s-geo", name: "Geography & Economics", subject: "Geography", iconType: "subject", goalCategory: "board-10" },
            ]
          },
          // Folders by Paper Type
          {
            id: "b10-by-type",
            name: "Folders by Paper Type",
            description: "Browse Board PYQs, Prelims, Model Papers & Sample Sets",
            badge: "Paper Types",
            iconType: "by-type",
            emoji: "📜",
            goalCategory: "board-10",
            children: [
              {
                id: "b10-pt-pyq",
                name: "Official Board PYQs",
                paperType: "pyq",
                iconType: "paper-type",
                emoji: "📜",
                goalCategory: "board-10",
                children: [
                  { id: "b10-pt-pyq-2025", name: "2025 Model & Upcoming Papers", year: 2025, paperType: "pyq", iconType: "year", emoji: "📅", goalCategory: "board-10" },
                  { id: "b10-pt-pyq-2024", name: "2024 Official Board Papers", year: 2024, paperType: "pyq", iconType: "year", emoji: "📅", goalCategory: "board-10" },
                  { id: "b10-pt-pyq-2023", name: "2023 Official Papers", year: 2023, paperType: "pyq", iconType: "year", emoji: "📅", goalCategory: "board-10" },
                  { id: "b10-pt-pyq-2022", name: "2022 Official Papers", year: 2022, paperType: "pyq", iconType: "year", emoji: "📅", goalCategory: "board-10" },
                  { id: "b10-pt-pyq-2021", name: "2021 & Archive Papers", year: 2021, paperType: "pyq", iconType: "year", emoji: "📅", goalCategory: "board-10" },
                ]
              },
              {
                id: "b10-pt-prelim",
                name: "School & Junior College Prelim Papers",
                paperType: "prelims",
                iconType: "paper-type",
                emoji: "📑",
                goalCategory: "board-10",
                children: [
                  { id: "b10-pt-prelim-2025", name: "2025 Prelim Papers", year: 2025, paperType: "prelims", iconType: "year", goalCategory: "board-10" },
                  { id: "b10-pt-prelim-2024", name: "2024 Prelim Papers", year: 2024, paperType: "prelims", iconType: "year", goalCategory: "board-10" },
                ]
              },
              {
                id: "b10-pt-model",
                name: "Model Practice Sets",
                paperType: "model",
                iconType: "paper-type",
                emoji: "📝",
                goalCategory: "board-10",
                children: [
                  { id: "b10-pt-model-2025", name: "2025 Model Practice Sets", year: 2025, paperType: "model", iconType: "year", goalCategory: "board-10" },
                  { id: "b10-pt-model-2024", name: "2024 Model Practice Sets", year: 2024, paperType: "model", iconType: "year", goalCategory: "board-10" },
                ]
              },
              {
                id: "b10-pt-sample",
                name: "Official Practice Papers",
                paperType: "practice",
                iconType: "paper-type",
                emoji: "📌",
                goalCategory: "board-10",
                children: [
                  { id: "b10-pt-sample-2025", name: "2025 Official Practice Sets", year: 2025, paperType: "practice", iconType: "year", goalCategory: "board-10" },
                  { id: "b10-pt-sample-2024", name: "2024 Official Practice Sets", year: 2024, paperType: "practice", iconType: "year", goalCategory: "board-10" },
                ]
              },
              {
                id: "b10-pt-unit",
                name: "Unit Test Papers",
                paperType: "unit-test",
                iconType: "paper-type",
                emoji: "🎯",
                goalCategory: "board-10",
                children: [
                  { id: "b10-pt-unit-2025", name: "2025 Unit Test Papers", year: 2025, paperType: "unit-test", iconType: "year", goalCategory: "board-10" },
                  { id: "b10-pt-unit-2024", name: "2024 Unit Test Papers", year: 2024, paperType: "unit-test", iconType: "year", goalCategory: "board-10" },
                ]
              }
            ]
          },
          // Folders by Year
          {
            id: "b10-by-year",
            name: "Folders by Year",
            description: "Year-wise archive from 2025 to 2021",
            badge: "2025-2021",
            iconType: "by-year",
            emoji: "📅",
            goalCategory: "board-10",
            children: [
              { id: "b10-y-2025", name: "2025 Model & Upcoming Papers", year: 2025, iconType: "year", goalCategory: "board-10" },
              { id: "b10-y-2024", name: "2024 Official Board Papers", year: 2024, iconType: "year", goalCategory: "board-10" },
              { id: "b10-y-2023", name: "2023 Official Papers", year: 2023, iconType: "year", goalCategory: "board-10" },
              { id: "b10-y-2022", name: "2022 Official Papers", year: 2022, iconType: "year", goalCategory: "board-10" },
              { id: "b10-y-2021", name: "2021 & Archive Papers", year: 2021, iconType: "year", goalCategory: "board-10" },
            ]
          }
        ]
      },
      {
        id: "board-9",
        name: "Class 9 (State Board)",
        description: "Comprehensive annual exams, semester papers & practice sets",
        goalCategory: "board-9",
        badge: "Class 9",
        children: [
          { id: "board-9-math", name: "Mathematics", subject: "Mathematics", iconType: "subject", goalCategory: "board-9" },
          { id: "board-9-sci", name: "Science & Technology", subject: "Science & Technology", iconType: "subject", goalCategory: "board-9" },
          { id: "board-9-eng", name: "English", subject: "English", iconType: "subject", goalCategory: "board-9" },
          { id: "board-9-pyq", name: "Previous Year Papers", paperType: "pyq", iconType: "paper-type", goalCategory: "board-9" },
          { id: "board-9-model", name: "Model Practice Sets", paperType: "model", iconType: "paper-type", goalCategory: "board-9" },
        ]
      },
      {
        id: "board-8",
        name: "Class 8 (State Board)",
        description: "Foundation building papers & quizzes",
        goalCategory: "board-8",
        badge: "Class 8",
        children: [
          { id: "board-8-math", name: "Mathematics", subject: "Mathematics", iconType: "subject", goalCategory: "board-8" },
          { id: "board-8-sci", name: "General Science", subject: "General Science", iconType: "subject", goalCategory: "board-8" },
          { id: "board-8-eng", name: "English Language", subject: "English", iconType: "subject", goalCategory: "board-8" },
        ]
      }
    ]
  },

  // ── 2. Junior College (Class 11 - 12) ───────────────────────────────────────
  {
    id: "college",
    name: "Junior College (Class 11 - 12)",
    description: "Maharashtra State Board HSC exams, Science, Commerce & Arts",
    badge: "Class 11-12",
    color: "from-sky-600 to-blue-700",
    iconType: "college",
    emoji: "🏫",
    children: [
      {
        id: "board-12-pcb",
        name: "Class 12 Science (PCB Group)",
        description: "Physics, Chemistry & Biology HSC Board papers",
        goalCategory: "board-12",
        stream: "pcb",
        badge: "HSC Science (PCB)",
        children: [
          {
            id: "b12-pcb-subjects",
            name: "Folders by Subject",
            description: "Physics, Chemistry & Biology (Botany + Zoology)",
            badge: "Subjects",
            iconType: "by-subject",
            emoji: "📐",
            goalCategory: "board-12",
            stream: "pcb",
            children: [
              { id: "b12-pcb-phy", name: "Physics HSC Papers", subject: "Physics", iconType: "subject", goalCategory: "board-12", stream: "pcb" },
              { id: "b12-pcb-chem", name: "Chemistry HSC Papers", subject: "Chemistry", iconType: "subject", goalCategory: "board-12", stream: "pcb" },
              { id: "b12-pcb-bio", name: "Biology (Botany + Zoology)", subject: "Biology", iconType: "subject", goalCategory: "board-12", stream: "pcb" },
              { id: "b12-pcb-eng", name: "English HSC Papers", subject: "English", iconType: "subject", goalCategory: "board-12", stream: "pcb" },
            ]
          },
          {
            id: "b12-pcb-types",
            name: "Folders by Paper Type",
            description: "Official HSC Board PYQs, Prelims & Model Sets",
            badge: "Paper Types",
            iconType: "by-type",
            emoji: "📜",
            goalCategory: "board-12",
            stream: "pcb",
            children: [
              {
                id: "b12-pcb-pt-pyq",
                name: "Official Board PYQs",
                paperType: "pyq",
                iconType: "paper-type",
                goalCategory: "board-12",
                stream: "pcb",
                children: [
                  { id: "b12-pcb-pyq-2024", name: "2024 Official Board Papers", year: 2024, paperType: "pyq", iconType: "year", goalCategory: "board-12", stream: "pcb" },
                  { id: "b12-pcb-pyq-2023", name: "2023 Official Papers", year: 2023, paperType: "pyq", iconType: "year", goalCategory: "board-12", stream: "pcb" },
                  { id: "b12-pcb-pyq-2022", name: "2022 Official Papers", year: 2022, paperType: "pyq", iconType: "year", goalCategory: "board-12", stream: "pcb" },
                ]
              },
              { id: "b12-pcb-pt-prelim", name: "School Prelim Papers", paperType: "prelims", iconType: "paper-type", goalCategory: "board-12", stream: "pcb" },
              { id: "b12-pcb-pt-model", name: "Model Practice Sets", paperType: "model", iconType: "paper-type", goalCategory: "board-12", stream: "pcb" },
              { id: "b12-pcb-pt-sample", name: "Official Sample Papers", paperType: "practice", iconType: "paper-type", goalCategory: "board-12", stream: "pcb" },
            ]
          }
        ]
      },
      {
        id: "board-12-pcm",
        name: "Class 12 Science (PCM Group)",
        description: "Physics, Chemistry & Mathematics HSC Board papers",
        goalCategory: "board-12",
        stream: "pcm",
        badge: "HSC Science (PCM)",
        children: [
          { id: "b12-pcm-math", name: "Mathematics & Statistics", subject: "Mathematics", iconType: "subject", goalCategory: "board-12", stream: "pcm" },
          { id: "b12-pcm-phy", name: "Physics HSC Papers", subject: "Physics", iconType: "subject", goalCategory: "board-12", stream: "pcm" },
          { id: "b12-pcm-chem", name: "Chemistry HSC Papers", subject: "Chemistry", iconType: "subject", goalCategory: "board-12", stream: "pcm" },
          { id: "b12-pcm-pyq", name: "Official Board PYQs", paperType: "pyq", iconType: "paper-type", goalCategory: "board-12", stream: "pcm" },
          { id: "b12-pcm-2024", name: "2024 Official Board Papers", year: 2024, iconType: "year", goalCategory: "board-12", stream: "pcm" },
        ]
      },
      {
        id: "board-11",
        name: "Class 11 Science (HSC)",
        description: "Annual & semester papers for Class 11",
        goalCategory: "board-11",
        badge: "Class 11",
        children: [
          { id: "b11-phy", name: "Physics", subject: "Physics", iconType: "subject", goalCategory: "board-11" },
          { id: "b11-chem", name: "Chemistry", subject: "Chemistry", iconType: "subject", goalCategory: "board-11" },
          { id: "b11-math", name: "Mathematics", subject: "Mathematics", iconType: "subject", goalCategory: "board-11" },
          { id: "b11-bio", name: "Biology", subject: "Biology", iconType: "subject", goalCategory: "board-11" },
        ]
      }
    ]
  },

  // ── 3. Engineering Entrance (MHT-CET & JEE) ─────────────────────────────────
  {
    id: "engineering",
    name: "Engineering Entrance (MHT-CET & JEE)",
    description: "JEE Mains, JEE Advanced & MHT-CET PCM Previous Year Papers",
    badge: "PCM Entrance",
    color: "from-purple-600 to-indigo-800",
    iconType: "engineering",
    emoji: "⚙️",
    children: [
      {
        id: "jee-mains",
        name: "JEE Mains (Official Shifts & PYQs)",
        description: "January & April Shift question papers with answer keys",
        goalCategory: "jee-mains",
        badge: "JEE Mains",
        children: [
          {
            id: "jee-m-by-type",
            name: "Folders by Paper Type",
            description: "Shift PYQs, Model Papers & Sample Sets",
            badge: "Paper Types",
            iconType: "by-type",
            emoji: "📜",
            goalCategory: "jee-mains",
            children: [
              {
                id: "jee-m-pyq",
                name: "Official Entrance PYQs",
                paperType: "pyq",
                iconType: "paper-type",
                goalCategory: "jee-mains",
                children: [
                  { id: "jee-m-2025", name: "2025 Model Papers", year: 2025, paperType: "pyq", iconType: "year", goalCategory: "jee-mains" },
                  { id: "jee-m-2024", name: "2024 Official Shift Papers", year: 2024, paperType: "pyq", iconType: "year", goalCategory: "jee-mains" },
                  { id: "jee-m-2023", name: "2023 Official Papers", year: 2023, paperType: "pyq", iconType: "year", goalCategory: "jee-mains" },
                  { id: "jee-m-2022", name: "2022 Official Papers", year: 2022, paperType: "pyq", iconType: "year", goalCategory: "jee-mains" },
                  { id: "jee-m-2021", name: "2021 & Archive Papers", year: 2021, paperType: "pyq", iconType: "year", goalCategory: "jee-mains" },
                ]
              },
              { id: "jee-m-model", name: "Model Practice Sets", paperType: "model", iconType: "paper-type", goalCategory: "jee-mains" },
              { id: "jee-m-sample", name: "Official Sample Papers", paperType: "practice", iconType: "paper-type", goalCategory: "jee-mains" },
            ]
          },
          {
            id: "jee-m-by-subject",
            name: "Folders by Subject",
            description: "Physics, Chemistry & Mathematics PYQs",
            badge: "Subjects",
            iconType: "by-subject",
            emoji: "📐",
            goalCategory: "jee-mains",
            children: [
              { id: "jee-m-phy", name: "Physics PYQs", subject: "Physics", iconType: "subject", goalCategory: "jee-mains" },
              { id: "jee-m-chem", name: "Chemistry PYQs", subject: "Chemistry", iconType: "subject", goalCategory: "jee-mains" },
              { id: "jee-m-math", name: "Mathematics PYQs", subject: "Mathematics", iconType: "subject", goalCategory: "jee-mains" },
            ]
          }
        ]
      },
      {
        id: "jee-advanced",
        name: "JEE Advanced (Paper 1 & Paper 2)",
        description: "High difficulty national level PYQs & Mock Tests",
        goalCategory: "jee-advanced",
        badge: "JEE Adv",
        children: [
          { id: "jee-a-2024", name: "2024 Official Papers", year: 2024, iconType: "year", goalCategory: "jee-advanced" },
          { id: "jee-a-2023", name: "2023 Official Papers", year: 2023, iconType: "year", goalCategory: "jee-advanced" },
          { id: "jee-a-phy", name: "Physics Advanced PYQs", subject: "Physics", iconType: "subject", goalCategory: "jee-advanced" },
          { id: "jee-a-chem", name: "Chemistry Advanced PYQs", subject: "Chemistry", iconType: "subject", goalCategory: "jee-advanced" },
          { id: "jee-a-math", name: "Mathematics Advanced PYQs", subject: "Mathematics", iconType: "subject", goalCategory: "jee-advanced" },
        ]
      },
      {
        id: "mht-cet-pcm",
        name: "MHT-CET Engineering (PCM Group)",
        description: "Maharashtra State CET PYQs for PCM aspirants",
        goalCategory: "mht-cet-pcm",
        badge: "CET PCM",
        children: [
          { id: "cet-pcm-2024", name: "2024 Official Shift Papers", year: 2024, iconType: "year", goalCategory: "mht-cet-pcm" },
          { id: "cet-pcm-2023", name: "2023 Official Papers", year: 2023, iconType: "year", goalCategory: "mht-cet-pcm" },
          { id: "cet-pcm-math", name: "Mathematics CET Papers", subject: "Mathematics", iconType: "subject", goalCategory: "mht-cet-pcm" },
          { id: "cet-pcm-phy", name: "Physics CET Papers", subject: "Physics", iconType: "subject", goalCategory: "mht-cet-pcm" },
          { id: "cet-pcm-chem", name: "Chemistry CET Papers", subject: "Chemistry", iconType: "subject", goalCategory: "mht-cet-pcm" },
        ]
      }
    ]
  },

  // ── 4. Medical Entrance (NEET UG & MHT-CET PCB) ─────────────────────────────
  {
    id: "medical",
    name: "Medical Entrance (NEET UG & MHT-CET PCB)",
    description: "NEET UG Official PYQs & MHT-CET PCB Biology Shift Papers",
    badge: "PCB Entrance",
    color: "from-emerald-600 to-teal-800",
    iconType: "medical",
    emoji: "🩺",
    children: [
      {
        id: "neet-ug",
        name: "NEET UG (Medical Entrance)",
        description: "720 Marks Full Length Official NEET Papers",
        goalCategory: "neet",
        badge: "NEET UG",
        children: [
          {
            id: "neet-by-type",
            name: "Folders by Paper Type",
            description: "Official NEET PYQs, Model Practice Sets & Sample Papers",
            badge: "Paper Types",
            iconType: "by-type",
            emoji: "📜",
            goalCategory: "neet",
            children: [
              {
                id: "neet-pyq",
                name: "Official Entrance PYQs",
                paperType: "pyq",
                iconType: "paper-type",
                goalCategory: "neet",
                children: [
                  { id: "neet-pyq-2025", name: "2025 Model Papers", year: 2025, paperType: "pyq", iconType: "year", goalCategory: "neet" },
                  { id: "neet-pyq-2024", name: "2024 Official Papers", year: 2024, paperType: "pyq", iconType: "year", goalCategory: "neet" },
                  { id: "neet-pyq-2023", name: "2023 Official Papers", year: 2023, paperType: "pyq", iconType: "year", goalCategory: "neet" },
                  { id: "neet-pyq-2022", name: "2022 Official Papers", year: 2022, paperType: "pyq", iconType: "year", goalCategory: "neet" },
                  { id: "neet-pyq-2021", name: "2021 & Archive Papers", year: 2021, paperType: "pyq", iconType: "year", goalCategory: "neet" },
                ]
              },
              { id: "neet-model", name: "Model Practice Sets", paperType: "model", iconType: "paper-type", goalCategory: "neet" },
              { id: "neet-sample", name: "Official Sample Papers", paperType: "practice", iconType: "paper-type", goalCategory: "neet" },
            ]
          },
          {
            id: "neet-by-subject",
            name: "Folders by Subject",
            description: "Biology, Physics & Chemistry NEET PYQs",
            badge: "Subjects",
            iconType: "by-subject",
            emoji: "📐",
            goalCategory: "neet",
            children: [
              { id: "neet-bio", name: "Biology Special PYQs (Botany + Zoology)", subject: "Biology", iconType: "subject", goalCategory: "neet" },
              { id: "neet-phy", name: "Physics Medical PYQs", subject: "Physics", iconType: "subject", goalCategory: "neet" },
              { id: "neet-chem", name: "Chemistry Medical PYQs", subject: "Chemistry", iconType: "subject", goalCategory: "neet" },
            ]
          }
        ]
      },
      {
        id: "mht-cet-pcb",
        name: "MHT-CET Pharmacy / Agri (PCB Group)",
        description: "Maharashtra State CET PCB Shift Papers",
        goalCategory: "mht-cet-pcb",
        badge: "CET PCB",
        children: [
          { id: "cet-pcb-2024", name: "2024 Official Shift Papers", year: 2024, iconType: "year", goalCategory: "mht-cet-pcb" },
          { id: "cet-pcb-bio", name: "Biology CET Shift Papers", subject: "Biology", iconType: "subject", goalCategory: "mht-cet-pcb" },
          { id: "cet-pcb-phy", name: "Physics CET Shift Papers", subject: "Physics", iconType: "subject", goalCategory: "mht-cet-pcb" },
          { id: "cet-pcb-chem", name: "Chemistry CET Shift Papers", subject: "Chemistry", iconType: "subject", goalCategory: "mht-cet-pcb" },
        ]
      }
    ]
  }
];
