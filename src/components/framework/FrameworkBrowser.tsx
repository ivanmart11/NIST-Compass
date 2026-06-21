"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  FrameworkFunction,
  FrameworkCategory,
  FrameworkSubcategory,
} from "@/types/db";

export function FrameworkBrowser({
  functions,
  categories,
  subcategories,
  coveredSubIds,
}: {
  functions: FrameworkFunction[];
  categories: FrameworkCategory[];
  subcategories: FrameworkSubcategory[];
  coveredSubIds: string[];
}) {
  const [activeFn, setActiveFn] = useState(functions[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const covered = useMemo(() => new Set(coveredSubIds), [coveredSubIds]);

  const subsByCat = useMemo(() => {
    const map = new Map<string, FrameworkSubcategory[]>();
    for (const s of subcategories) {
      const arr = map.get(s.category_id) ?? [];
      arr.push(s);
      map.set(s.category_id, arr);
    }
    return map;
  }, [subcategories]);

  const q = query.trim().toLowerCase();
  const visibleCats = useMemo(() => {
    let cats = categories.filter((c) => c.function_id === activeFn);
    if (q) {
      // When searching, show categories across all functions that match.
      cats = categories.filter((c) => {
        const subs = subsByCat.get(c.id) ?? [];
        return (
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          subs.some(
            (s) =>
              s.code.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q)
          )
        );
      });
    }
    return cats;
  }, [categories, activeFn, q, subsByCat]);

  function toggle(catId: string) {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {functions.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFn(f.id);
                setQuery("");
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium",
                activeFn === f.id && !q
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
        <input
          className="input ml-auto max-w-xs"
          placeholder="Search subcategories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {visibleCats.map((cat) => {
          const subs = (subsByCat.get(cat.id) ?? []).filter(
            (s) =>
              !q ||
              s.code.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q)
          );
          const open = openCats.has(cat.id) || !!q;
          return (
            <div key={cat.id} className="card overflow-hidden">
              <button
                onClick={() => toggle(cat.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              >
                <span>
                  <span className="font-medium text-gray-900">{cat.code}</span>
                  <span className="ml-2 text-gray-600">{cat.name}</span>
                </span>
                <span className="text-xs text-gray-400">
                  {(subsByCat.get(cat.id) ?? []).length} subcategories
                </span>
              </button>
              {open && (
                <ul className="divide-y divide-gray-100 border-t border-gray-100">
                  {subs.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-start justify-between gap-4 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-brand-700">
                            {s.code}
                          </span>
                          {covered.has(s.id) && (
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-500" title="Gap exists" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-600">
                          {s.description}
                        </p>
                      </div>
                      <Link
                        href={`/gaps/new?subcategory=${s.id}`}
                        className="shrink-0 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        + Gap
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {visibleCats.length === 0 && (
          <p className="card p-6 text-center text-sm text-gray-400">
            No matches.
          </p>
        )}
      </div>
    </div>
  );
}
