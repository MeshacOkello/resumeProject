"use client";

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { ResumeData } from "@/types/resume";
import {
  defaultEducationEntry,
  defaultExperienceEntry,
  defaultProjectEntry,
  defaultLeadershipEntry,
  defaultSkillCategory,
} from "@/types/resume";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { RichTextInput } from "@/components/RichTextInput";
import { htmlToLatex } from "@/lib/richtext-latex";

type FormData = ResumeData;

const SYNC_DEBOUNCE_MS = 400;

export interface ResumeFormHandle {
  applyFormat: (type: "bold" | "italic" | "underline") => void;
}

type ActiveField = { path: string; element: HTMLDivElement; bulletIndex?: number };

export const ResumeForm = forwardRef<ResumeFormHandle, { data: FormData; onChange: (data: FormData) => void }>(
  function ResumeForm({ data, onChange }, ref) {
  const { register, watch, setValue, control, getValues } = useForm<FormData>({
    defaultValues: data,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const activeFieldRef = useRef<ActiveField | null>(null);

  dataRef.current = data;

  const education = useFieldArray({ control, name: "education" });
  const experience = useFieldArray({ control, name: "experience" });
  const projects = useFieldArray({ control, name: "projects" });
  const leadership = useFieldArray({ control, name: "leadership" });
  const skills = useFieldArray({ control, name: "skills" });

  const values = watch();

  const syncNow = () => {
    const formValues = getValues();
    const merged: FormData = { ...formValues, theme: dataRef.current.theme, sectionOrder: dataRef.current.sectionOrder };
    onChange(merged);
  };

  useImperativeHandle(ref, () => ({
    applyFormat(type: "bold" | "italic" | "underline") {
      const active = activeFieldRef.current;
      if (!active?.element) return;
      const el = active.element;
      const path = active.path;
      const bulletIndex = active.bulletIndex;

      el.focus();
      if (type === "bold") document.execCommand("bold");
      if (type === "italic") document.execCommand("italic");
      if (type === "underline") document.execCommand("underline");

      const newValue = htmlToLatex(el.innerHTML);
      if (bulletIndex !== undefined) {
        const arr = [...(getValues(path as keyof FormData) as string[])];
        arr[bulletIndex] = newValue;
        setValue(path as keyof FormData, arr as never);
      } else {
        setValue(path as keyof FormData, newValue as never);
      }
      syncNow();
    },
  }), [getValues, setValue, onChange]);

  const onFocusField = (path: string) => (e: React.FocusEvent<HTMLDivElement>) => {
    activeFieldRef.current = { path, element: e.currentTarget, bulletIndex: undefined };
  };
  const onFocusBullet = (path: string, index: number) => (e: React.FocusEvent<HTMLDivElement>) => {
    activeFieldRef.current = { path, element: e.currentTarget, bulletIndex: index };
  };

  useEffect(() => {
    const sub = watch((formValues) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        const merged: FormData = {
          ...(formValues as FormData),
          theme: dataRef.current.theme,
          sectionOrder: dataRef.current.sectionOrder,
        };
        onChange(merged);
      }, SYNC_DEBOUNCE_MS);
    });
    return () => {
      sub.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watch, onChange]);

  return (
    <form
      className="space-y-6 pb-8"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Personal */}
      <section className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-sky-800 mb-3">Personal</h3>
        <div className="grid gap-2">
          {(["fullName", "phone", "email", "linkedin", "github"] as const).map((key) => (
            <div key={key}>
              <input type="hidden" {...register(`personal.${key}`)} />
              <RichTextInput
                value={(values.personal as any)?.[key] ?? ""}
                onChange={(v) => setValue(`personal.${key}` as any, v)}
                onFocus={onFocusField(`personal.${key}`)}
                placeholder={key === "fullName" ? "Full name" : key}
                className="w-full rounded border border-sky-200 bg-white px-3 py-2 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sky-800">Education</h3>
          <button
            type="button"
            onClick={() => {
              education.append(defaultEducationEntry());
              syncNow();
            }}
            className="text-xs font-medium text-sky-800 hover:text-sky-600 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {education.fields.map((field, i) => (
            <div key={field.id} className="rounded border border-slate-200 bg-sky-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setValue(`education.${i}.visible`, !values.education[i].visible);
                    syncNow();
                  }}
                  className="text-sky-600 hover:text-sky-800"
                  title={values.education[i].visible ? "Hide" : "Show"}
                >
                  {values.education[i].visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <GripVertical className="w-4 h-4 text-sky-400" />
                <input type="hidden" {...register(`education.${i}.school`)} />
                <RichTextInput value={values.education?.[i]?.school ?? ""} onChange={(v) => setValue(`education.${i}.school` as any, v)} onFocus={onFocusField(`education.${i}.school`)} placeholder="School" className="flex-1 min-w-[140px] rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                <button type="button" onClick={() => { education.remove(i); syncNow(); }} className="text-sky-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <input type="hidden" {...register(`education.${i}.location`)} />
              <RichTextInput value={values.education?.[i]?.location ?? ""} onChange={(v) => setValue(`education.${i}.location` as any, v)} onFocus={onFocusField(`education.${i}.location`)} placeholder="Location" className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input type="hidden" {...register(`education.${i}.degree`)} />
              <RichTextInput value={values.education?.[i]?.degree ?? ""} onChange={(v) => setValue(`education.${i}.degree` as any, v)} onFocus={onFocusField(`education.${i}.degree`)} placeholder="Degree" className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 block mb-0.5">From</label>
                  <input
                    type="date"
                    {...register(`education.${i}.dateRangeStart`)}
                    className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 block mb-0.5">To</label>
                  <input
                    type="date"
                    {...register(`education.${i}.dateRangeEnd`)}
                    className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <input type="hidden" {...register(`education.${i}.relevantCourses`)} />
              <RichTextInput value={values.education?.[i]?.relevantCourses ?? ""} onChange={(v) => setValue(`education.${i}.relevantCourses` as any, v)} onFocus={onFocusField(`education.${i}.relevantCourses`)} placeholder="Relevant courses (e.g. Data Structures, Algorithms, ML)" className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sky-800">Experience</h3>
          <button
            type="button"
            onClick={() => { experience.append(defaultExperienceEntry()); syncNow(); }}
            className="text-xs font-medium text-sky-800 hover:text-sky-600 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {experience.fields.map((field, i) => (
            <div key={field.id} className="rounded border border-slate-200 bg-sky-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setValue(`experience.${i}.visible`, !values.experience[i].visible); syncNow(); }} className="text-sky-600 hover:text-sky-800">
                  {values.experience[i].visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <input type="hidden" {...register(`experience.${i}.role`)} />
                <RichTextInput value={values.experience?.[i]?.role ?? ""} onChange={(v) => setValue(`experience.${i}.role` as any, v)} onFocus={onFocusField(`experience.${i}.role`)} placeholder="Role" className="flex-1 min-w-[140px] rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                <button type="button" onClick={() => { experience.remove(i); syncNow(); }} className="text-sky-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 block mb-0.5">From</label>
                  <input
                    type="date"
                    {...register(`experience.${i}.dateRangeStart`)}
                    className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 block mb-0.5">To</label>
                  <input
                    type="date"
                    {...register(`experience.${i}.dateRangeEnd`)}
                    className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <input type="hidden" {...register(`experience.${i}.company`)} />
              <RichTextInput value={values.experience?.[i]?.company ?? ""} onChange={(v) => setValue(`experience.${i}.company` as any, v)} onFocus={onFocusField(`experience.${i}.company`)} placeholder="Company" className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input type="hidden" {...register(`experience.${i}.location`)} />
              <RichTextInput value={values.experience?.[i]?.location ?? ""} onChange={(v) => setValue(`experience.${i}.location` as any, v)} onFocus={onFocusField(`experience.${i}.location`)} placeholder="Location" className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <BulletList
                bullets={values.experience[i].bullets}
                bulletsPath={`experience.${i}.bullets`}
                onFocusBullet={onFocusBullet}
                onChange={(bullets) => { setValue(`experience.${i}.bullets` as any, bullets); syncNow(); }}
                placeholder="Achievement"
                onRefine={async (j) => {
                  const bullet = values.experience[i].bullets[j];
                  if (!bullet.trim()) return;
                  try {
                    const res = await fetch("/api/refine-bullet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullet }) });
                    const data = await res.json();
                    if (data.refined) {
                      const next = [...values.experience[i].bullets];
                      next[j] = data.refined;
                      setValue(`experience.${i}.bullets`, next);
                      syncNow();
                    }
                  } catch (_) {}
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sky-800">Projects</h3>
          <button type="button" onClick={() => { projects.append(defaultProjectEntry()); syncNow(); }} className="text-xs font-medium text-sky-800 hover:text-sky-600 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {projects.fields.map((field, i) => (
            <div key={field.id} className="rounded border border-slate-200 bg-sky-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setValue(`projects.${i}.visible`, !values.projects[i].visible); syncNow(); }} className="text-sky-600 hover:text-sky-800">
                  {values.projects[i].visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <input type="hidden" {...register(`projects.${i}.name`)} />
                <RichTextInput value={values.projects?.[i]?.name ?? ""} onChange={(v) => setValue(`projects.${i}.name` as any, v)} onFocus={onFocusField(`projects.${i}.name`)} placeholder="Project name" className="flex-1 min-w-[140px] rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                <button type="button" onClick={() => { projects.remove(i); syncNow(); }} className="text-sky-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <input
                {...register(`projects.${i}.link`)}
                placeholder="Link (e.g. https://github.com/...)"
                className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <input type="hidden" {...register(`projects.${i}.techStack`)} />
              <RichTextInput value={values.projects?.[i]?.techStack ?? ""} onChange={(v) => setValue(`projects.${i}.techStack` as any, v)} onFocus={onFocusField(`projects.${i}.techStack`)} placeholder="Tech stack" className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 block mb-0.5">From</label>
                  <input
                    type="date"
                    {...register(`projects.${i}.dateRangeStart`)}
                    className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 block mb-0.5">To</label>
                  <input
                    type="date"
                    {...register(`projects.${i}.dateRangeEnd`)}
                    className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <BulletList
                bullets={values.projects[i].bullets}
                bulletsPath={`projects.${i}.bullets`}
                onFocusBullet={onFocusBullet}
                onChange={(bullets) => { setValue(`projects.${i}.bullets` as any, bullets); syncNow(); }}
                placeholder="Detail"
                onRefine={async (j) => {
                  const bullet = values.projects[i].bullets[j];
                  if (!bullet.trim()) return;
                  try {
                    const res = await fetch("/api/refine-bullet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullet }) });
                    const data = await res.json();
                    if (data.refined) {
                      const next = [...values.projects[i].bullets];
                      next[j] = data.refined;
                      setValue(`projects.${i}.bullets`, next);
                      syncNow();
                    }
                  } catch (_) {}
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Leadership & Activities */}
      <section className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sky-800">Leadership & Activities</h3>
          <button
            type="button"
            onClick={() => { leadership.append(defaultLeadershipEntry()); syncNow(); }}
            className="text-xs font-medium text-sky-800 hover:text-sky-600 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {leadership.fields.map((field, i) => (
            <div key={field.id} className="rounded border border-slate-200 bg-sky-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setValue(`leadership.${i}.visible`, !values.leadership[i].visible); syncNow(); }} className="text-sky-600 hover:text-sky-800">
                  {values.leadership[i].visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <input type="hidden" {...register(`leadership.${i}.role`)} />
                <RichTextInput value={values.leadership?.[i]?.role ?? ""} onChange={(v) => setValue(`leadership.${i}.role` as any, v)} onFocus={onFocusField(`leadership.${i}.role`)} placeholder="Role" className="flex-1 min-w-[140px] rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                <button type="button" onClick={() => { leadership.remove(i); syncNow(); }} className="text-sky-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 block mb-0.5">From</label>
                  <input
                    type="date"
                    {...register(`leadership.${i}.dateRangeStart`)}
                    className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 block mb-0.5">To</label>
                  <input
                    type="date"
                    {...register(`leadership.${i}.dateRangeEnd`)}
                    className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <input type="hidden" {...register(`leadership.${i}.organization`)} />
              <RichTextInput value={values.leadership?.[i]?.organization ?? ""} onChange={(v) => setValue(`leadership.${i}.organization` as any, v)} onFocus={onFocusField(`leadership.${i}.organization`)} placeholder="Organization" className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input type="hidden" {...register(`leadership.${i}.location`)} />
              <RichTextInput value={values.leadership?.[i]?.location ?? ""} onChange={(v) => setValue(`leadership.${i}.location` as any, v)} onFocus={onFocusField(`leadership.${i}.location`)} placeholder="Location (optional)" className="w-full rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <BulletList
                bullets={values.leadership[i].bullets}
                bulletsPath={`leadership.${i}.bullets`}
                onFocusBullet={onFocusBullet}
                onChange={(bullets) => { setValue(`leadership.${i}.bullets` as any, bullets); syncNow(); }}
                placeholder="Detail"
                onRefine={async (j) => {
                  const bullet = values.leadership[i].bullets[j];
                  if (!bullet.trim()) return;
                  try {
                    const res = await fetch("/api/refine-bullet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullet }) });
                    const data = await res.json();
                    if (data.refined) {
                      const next = [...values.leadership[i].bullets];
                      next[j] = data.refined;
                      setValue(`leadership.${i}.bullets`, next);
                      syncNow();
                    }
                  } catch (_) {}
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Technical Skills */}
      <section className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sky-800">Technical Skills</h3>
          <button type="button" onClick={() => { skills.append(defaultSkillCategory()); syncNow(); }} className="text-xs font-medium text-sky-800 hover:text-sky-600 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add category
          </button>
        </div>
        <div className="space-y-2">
          {skills.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input type="hidden" {...register(`skills.${i}.category`)} />
              <RichTextInput value={values.skills?.[i]?.category ?? ""} onChange={(v) => setValue(`skills.${i}.category` as any, v)} onFocus={onFocusField(`skills.${i}.category`)} placeholder="Category" className="w-32 min-w-[100px] rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input type="hidden" {...register(`skills.${i}.items`)} />
              <RichTextInput value={values.skills?.[i]?.items ?? ""} onChange={(v) => setValue(`skills.${i}.items` as any, v)} onFocus={onFocusField(`skills.${i}.items`)} placeholder="Item1, Item2" className="flex-1 rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <button type="button" onClick={() => { skills.remove(i); syncNow(); }} className="text-sky-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
});

function BulletList({
  bullets,
  bulletsPath,
  onFocusBullet,
  onChange,
  placeholder,
  onRefine,
}: {
  bullets: string[];
  bulletsPath?: string;
  onFocusBullet?: (path: string, index: number) => (e: React.FocusEvent<HTMLDivElement>) => void;
  onChange: (b: string[]) => void;
  placeholder: string;
  onRefine?: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      {bullets.map((b, j) => (
        <div key={j} className="flex gap-2 items-start">
          <span className="text-sky-400 mt-2.5">•</span>
          <RichTextInput
            value={b}
            onFocus={bulletsPath && onFocusBullet ? onFocusBullet(bulletsPath, j) : undefined}
            onChange={(v) => {
              const next = [...bullets];
              next[j] = v;
              onChange(next);
            }}
            placeholder={placeholder}
            className="flex-1 rounded border border-sky-200 bg-white px-2 py-1.5 text-sm text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
          {onRefine && b.trim() && (
            <button
              type="button"
              onClick={() => onRefine(j)}
              className="shrink-0 rounded px-2 py-1 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500"
              title="Refine with AI"
            >
              Refine
            </button>
          )}
          <button type="button" onClick={() => onChange(bullets.filter((_, k) => k !== j))} className="text-sky-500 hover:text-red-600 shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...bullets, ""])} className="text-xs font-medium text-sky-800 hover:text-sky-600 flex items-center gap-1">
        <Plus className="w-3.5 h-3.5" /> Add bullet
      </button>
    </div>
  );
}
