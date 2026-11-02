export type Step = 1 | 2 | 3;

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: "参考文案" },
  { step: 2, label: "拆解与产品" },
  { step: 3, label: "分镜脚本" },
];

interface Props {
  current: Step;
  enabled: Record<Step, boolean>;
  disabled: boolean;
  onChange: (step: Step) => void;
}

export function StepBar({ current, enabled, disabled, onChange }: Props) {
  return (
    <nav className="flex gap-2">
      {STEPS.map(({ step, label }) => {
        const active = step === current;
        const clickable = enabled[step] && !disabled && !active;
        return (
          <button
            key={step}
            type="button"
            disabled={!clickable}
            onClick={() => onChange(step)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-1 py-2 text-xs whitespace-nowrap transition sm:text-sm ${
              active
                ? "bg-rose-500 font-semibold text-white"
                : enabled[step]
                  ? "bg-white text-slate-700 hover:bg-rose-50 disabled:opacity-60"
                  : "bg-slate-200 text-slate-400"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                active ? "bg-white text-rose-500" : "bg-slate-100"
              }`}
            >
              {step}
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
