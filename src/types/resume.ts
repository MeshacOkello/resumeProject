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
  relevantCourses: z.string().default(""),
  visible: z.boolean().default(true),
});

export const experienceEntrySchema = z.object({
  id: z.string(),
  role: z.string(),
  dateRange: z.string(),
  company: z.string(),
  location: z.string(),
  bullets: z.array(z.string()),
  visible: z.boolean().default(true),
});

export const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  techStack: z.string(),
  dateRange: z.string(),
  bullets: z.array(z.string()),
  visible: z.boolean().default(true),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string(),
  items: z.string(),
});

export const sectionOrderSchema = z.array(z.enum(["education", "experience", "projects", "skills"]));

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
  skills: z.array(skillCategorySchema),
  sectionOrder: sectionOrderSchema,
  theme: themeSchema,
});

export type Personal = z.infer<typeof personalSchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
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
  relevantCourses: "",
  visible: true,
});

export const defaultExperienceEntry = (): ExperienceEntry => ({
  id: id(),
  role: "",
  dateRange: "",
  company: "",
  location: "",
  bullets: [""],
  visible: true,
});

export const defaultProjectEntry = (): ProjectEntry => ({
  id: id(),
  name: "",
  techStack: "",
  dateRange: "",
  bullets: [""],
  visible: true,
});

export const defaultSkillCategory = (): SkillCategory => ({
  id: id(),
  category: "",
  items: "",
});

export const defaultSectionOrder: SectionOrder = ["education", "experience", "projects", "skills"];

export const defaultResume: ResumeData = {
  personal: { ...defaultPersonal },
  education: [defaultEducationEntry()],
  experience: [defaultExperienceEntry()],
  projects: [defaultProjectEntry()],
  skills: [
    { ...defaultSkillCategory(), category: "Languages", items: "" },
    { ...defaultSkillCategory(), category: "Frameworks", items: "" },
    { ...defaultSkillCategory(), category: "Developer Tools", items: "" },
    { ...defaultSkillCategory(), category: "Libraries", items: "" },
  ],
  sectionOrder: defaultSectionOrder,
  theme: { font: "default", topMargin: "-.5in", compactMode: false },
};
