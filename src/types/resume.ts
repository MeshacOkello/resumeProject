import { z } from "zod";

/** Single-source schema: maps to LaTeX \resumeSubheading, \resumeItem, etc. */
export const personalSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
  linkedin: z.string(),
  github: z.string(),
});

export const educationEntrySchema = z.object({
  id: z.string(),
  school: z.string(),
  location: z.string(),
  degree: z.string(),
  dateRange: z.string(),
  dateRangeStart: z.string().default(""),
  dateRangeEnd: z.string().default(""),
  relevantCourses: z.string().default(""),
  visible: z.boolean().default(true),
});

export const experienceEntrySchema = z.object({
  id: z.string(),
  role: z.string(),
  dateRange: z.string(),
  dateRangeStart: z.string().default(""),
  dateRangeEnd: z.string().default(""),
  company: z.string(),
  location: z.string(),
  bullets: z.array(z.string()),
  visible: z.boolean().default(true),
});

export const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string().default(""),
  techStack: z.string(),
  dateRange: z.string(),
  dateRangeStart: z.string().default(""),
  dateRangeEnd: z.string().default(""),
  bullets: z.array(z.string()),
  visible: z.boolean().default(true),
});

export const leadershipEntrySchema = z.object({
  id: z.string(),
  role: z.string(),
  organization: z.string(),
  location: z.string().default(""),
  dateRange: z.string(),
  dateRangeStart: z.string().default(""),
  dateRangeEnd: z.string().default(""),
  bullets: z.array(z.string()),
  visible: z.boolean().default(true),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string(),
  items: z.string(),
});

export const sectionOrderSchema = z.array(z.enum(["education", "experience", "projects", "leadership", "skills"]));

export const themeSchema = z.object({
  font: z.enum(["default", "roboto", "sourcesanspro"]).default("default"),
  topMargin: z.string().default("-.5in"),
  compactMode: z.boolean().default(false),
});

export const resumeSchema = z.object({
  personal: personalSchema,
  education: z.array(educationEntrySchema),
  experience: z.array(experienceEntrySchema),
  projects: z.array(projectEntrySchema),
  leadership: z.array(leadershipEntrySchema),
  skills: z.array(skillCategorySchema),
  sectionOrder: sectionOrderSchema,
  theme: themeSchema,
});

export type Personal = z.infer<typeof personalSchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type LeadershipEntry = z.infer<typeof leadershipEntrySchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type SectionOrder = z.infer<typeof sectionOrderSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type ResumeData = z.infer<typeof resumeSchema>;

const id = () => crypto.randomUUID();

export const defaultPersonal: Personal = {
  fullName: "",
  phone: "",
  email: "",
  linkedin: "",
  github: "",
};

export const defaultEducationEntry = (): EducationEntry => ({
  id: id(),
  school: "",
  location: "",
  degree: "",
  dateRange: "",
  dateRangeStart: "",
  dateRangeEnd: "",
  relevantCourses: "",
  visible: true,
});

export const defaultExperienceEntry = (): ExperienceEntry => ({
  id: id(),
  role: "",
  dateRange: "",
  dateRangeStart: "",
  dateRangeEnd: "",
  company: "",
  location: "",
  bullets: [""],
  visible: true,
});

export const defaultProjectEntry = (): ProjectEntry => ({
  id: id(),
  name: "",
  link: "",
  techStack: "",
  dateRange: "",
  dateRangeStart: "",
  dateRangeEnd: "",
  bullets: [""],
  visible: true,
});

export const defaultLeadershipEntry = (): LeadershipEntry => ({
  id: id(),
  role: "",
  organization: "",
  location: "",
  dateRange: "",
  dateRangeStart: "",
  dateRangeEnd: "",
  bullets: [""],
  visible: true,
});

export const defaultSkillCategory = (): SkillCategory => ({
  id: id(),
  category: "",
  items: "",
});

export const defaultSectionOrder: SectionOrder = ["education", "experience", "projects", "leadership", "skills"];

export const defaultResume: ResumeData = {
  personal: { ...defaultPersonal },
  education: [defaultEducationEntry()],
  experience: [defaultExperienceEntry()],
  projects: [defaultProjectEntry()],
  leadership: [],
  skills: [
    { ...defaultSkillCategory(), category: "Languages", items: "" },
    { ...defaultSkillCategory(), category: "Frameworks", items: "" },
    { ...defaultSkillCategory(), category: "Developer Tools", items: "" },
    { ...defaultSkillCategory(), category: "Libraries", items: "" },
  ],
  sectionOrder: defaultSectionOrder,
  theme: { font: "default", topMargin: "-.5in", compactMode: false },
};
