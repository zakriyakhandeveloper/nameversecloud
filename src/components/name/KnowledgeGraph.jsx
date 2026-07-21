/**
 * Knowledge Graph — Premium Knowledge Panel
 *
 * Compact, clean panel resembling Google's Knowledge Panel.
 * Sticky on desktop, provides a quick summary of the name's key facts.
 */

import { Hash, Heart, Volume2, Globe, Shield, BookOpen } from 'lucide-react';

function cleanText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function getReligionLabel(religion) {
  const r = cleanText(religion).toLowerCase();
  if (r === 'islamic') return 'Islamic';
  if (r === 'christian') return 'Christian';
  if (r === 'hindu') return 'Hindu';
  return cleanText(religion);
}

function getGenderLabel(gender) {
  const value = cleanText(gender).toLowerCase();
  if (value.includes('female')) return 'Girl';
  if (value.includes('male')) return 'Boy';
  if (value.includes('unisex') || value.includes('neutral')) return 'Unisex';
  return cleanText(gender) || 'Baby';
}

export default function KnowledgeGraph({ data, religion }) {
  const religionDisplay = getReligionLabel(religion || data.religion);
  const genderDisplay = getGenderLabel(data.gender);
  const pronunciation = data.pronunciation?.english || data.pronunciation?.ipa || '';
  const luckyNumber = data.lucky_number || data.luckyNumber || '';

  const items = [
    { label: 'Religion', value: religionDisplay, icon: Shield },
    { label: 'Gender', value: genderDisplay, icon: Heart },
    { label: 'Origin', value: data.origin || '—', icon: Globe },
    { label: 'Pronunciation', value: pronunciation || '—', icon: Volume2 },
    { label: 'Lucky Number', value: luckyNumber || '—', icon: Hash },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-[color:var(--nv-border)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--nv-accent-soft-bg)] text-[color:var(--nv-accent-soft-fg)]">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[color:var(--nv-ink)]">Knowledge Panel</h3>
          <p className="text-[11px] text-[color:var(--nv-muted)]">Quick facts about {data.name}</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-[color:var(--nv-surface)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--nv-surface)] text-[color:var(--nv-muted)]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--nv-muted)]">
                  {item.label}
                </p>
                <p className="truncate text-sm font-medium text-[color:var(--nv-ink)]">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick meaning snippet */}
      {data.short_meaning && (
        <div className="mt-3 rounded-xl bg-[color:var(--nv-surface)] p-3 text-sm leading-relaxed text-[color:var(--nv-muted)]">
          <span className="font-medium text-[color:var(--nv-ink)]">Meaning:</span> {data.short_meaning}
        </div>
      )}
    </div>
  );
}