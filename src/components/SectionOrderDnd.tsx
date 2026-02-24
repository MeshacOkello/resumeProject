"use client";

import React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SectionOrder } from "@/types/resume";
import { GripVertical } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  leadership: "Leadership & Activities",
  skills: "Technical Skills",
};

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const label = SECTION_LABELS[id] ?? id;
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded border border-sky-200 bg-white px-2 py-1.5">
      <button type="button" className="touch-none cursor-grab active:cursor-grabbing text-sky-400" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="text-sm text-sky-700">{label}</span>
    </div>
  );
}

export function SectionOrderDnd({ order, onChange }: { order: SectionOrder; onChange: (order: SectionOrder) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: { active: { id: unknown }; over: { id: unknown } | null }) => {
    if (!event.over || event.active.id === event.over.id) return;
    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const oldIndex = order.indexOf(activeId as SectionOrder[0]);
    const newIndex = order.indexOf(overId as SectionOrder[0]);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(order, oldIndex, newIndex) as SectionOrder);
  };

  return (
    <div className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-sky-800 mb-2">Section order</h3>
      <p className="text-xs text-sky-500 mb-2">Drag to reorder sections in the PDF.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {order.map((id) => (
              <SortableItem key={id} id={id}>
                {id}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
