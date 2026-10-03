"use client";

type Room = { id: string; name: string };

export function RoomCheckboxes({
  legend,
  rooms,
  selectedIds,
  onChange,
}: {
  legend: string;
  rooms: Room[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const allSelected = rooms.every((r) => selectedIds.includes(r.id));
  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-sm text-fg-muted">{legend}</legend>
      {rooms.length > 1 && (
        <label className="flex items-center gap-2 text-sm font-medium text-fg-muted">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onChange(allSelected ? [] : rooms.map((r) => r.id))}
            className="h-4 w-4 cursor-pointer"
          />
          All locations
        </label>
      )}
      {rooms.map((r) => (
        <label
          key={r.id}
          className="flex items-center gap-2 text-sm text-fg-muted"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(r.id)}
            onChange={() => toggle(r.id)}
            className="h-4 w-4 cursor-pointer"
          />
          {r.name}
        </label>
      ))}
    </fieldset>
  );
}
