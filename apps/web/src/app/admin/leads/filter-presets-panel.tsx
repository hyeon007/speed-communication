import { formatStatus, type FilterPreset } from './types';

type FilterPresetsPanelProps = {
  presetNameDraft: string;
  presets: FilterPreset[];
  onPresetNameChange: (value: string) => void;
  onSavePreset: () => void;
  onApplyPreset: (preset: FilterPreset) => void;
  onDeletePreset: (presetId: string) => void;
};

export function FilterPresetsPanel({
  presetNameDraft,
  presets,
  onPresetNameChange,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}: FilterPresetsPanelProps) {
  return (
    <section className="border-t border-[#e5e0d8] pt-8 animate-fade-in-up-fast">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#1a1a1a]">필터 프리셋</p>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            현재 검색/필터/정렬 조건을 저장해 빠르게 재사용할 수 있습니다.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <input
            value={presetNameDraft}
            onChange={(event) => onPresetNameChange(event.target.value)}
            placeholder="예: 신규 접수만"
            className="w-full min-w-52 rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2 text-sm text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring sm:w-56"
          />
          <button
            type="button"
            onClick={onSavePreset}
            className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-2 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
          >
            현재 조건 저장
          </button>
        </div>
      </div>

      {presets.length ? (
        <ul className="mt-4 space-y-2">
          {presets.map((preset) => (
            <li
              key={preset.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-3 py-2"
            >
              <div>
                <p className="text-sm text-[#1a1a1a]">{preset.name}</p>
                <p className="mt-1 text-xs text-[#8a8a8a]">
                  검색: {preset.query.search ? preset.query.search : '없음'} · 상태:{' '}
                  {preset.query.status === 'all'
                    ? '전체'
                    : formatStatus(preset.query.status)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                  className="rounded-lg border border-[#e5e0d8] bg-[#faf9f7] px-3 py-1.5 text-xs text-[#5a5a5a] transition hover:bg-[#f5f3f0]"
                >
                  적용
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePreset(preset.id)}
                  className="rounded-lg border border-rose-300/40 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 transition hover:bg-rose-100"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-[#8a8a8a]">저장된 프리셋이 없습니다.</p>
      )}
    </section>
  );
}
