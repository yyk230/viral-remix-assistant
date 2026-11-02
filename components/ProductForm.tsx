import { DEFAULT_PRODUCT } from "@/lib/samples";
import { INPUT_LIMITS, STYLES, TARGET_DURATIONS, type ProductInput } from "@/lib/types";

interface Props {
  product: ProductInput;
  errors: Record<string, string>;
  onChange: (product: ProductInput) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 disabled:bg-slate-50";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;
}

export function ProductForm({ product, errors, onChange, onSubmit, loading, disabled }: Props) {
  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => onChange({ ...product, [key]: value });

  const setPoint = (index: number, value: string) =>
    set(
      "sellingPoints",
      product.sellingPoints.map((p, i) => (i === index ? value : p)),
    );

  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">把这个结构用到我的产品上</h2>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(structuredClone(DEFAULT_PRODUCT))}
          className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50"
        >
          填入示例产品
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-medium">产品名</span>
        <input
          className={`${inputClass} mt-1`}
          value={product.name}
          maxLength={INPUT_LIMITS.name}
          disabled={disabled}
          placeholder="例如：低糖全麦贝果"
          onChange={(e) => set("name", e.target.value)}
        />
        <FieldError message={errors.name} />
      </label>

      <div>
        <span className="text-sm font-medium">卖点（1 到 3 条）</span>
        <div className="mt-1 space-y-2">
          {product.sellingPoints.map((point, i) => (
            <div key={i}>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={point}
                  maxLength={INPUT_LIMITS.sellingPoint}
                  disabled={disabled}
                  placeholder={`卖点 ${i + 1}`}
                  onChange={(e) => setPoint(i, e.target.value)}
                />
                {product.sellingPoints.length > 1 && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      set(
                        "sellingPoints",
                        product.sellingPoints.filter((_, j) => j !== i),
                      )
                    }
                    className="shrink-0 rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100"
                  >
                    删除
                  </button>
                )}
              </div>
              <FieldError message={errors[`sellingPoints.${i}`]} />
            </div>
          ))}
        </div>
        {product.sellingPoints.length < INPUT_LIMITS.sellingPointsMax && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => set("sellingPoints", [...product.sellingPoints, ""])}
            className="mt-2 text-xs text-rose-600 hover:underline"
          >
            + 添加卖点
          </button>
        )}
        <FieldError message={errors.sellingPoints} />
      </div>

      <label className="block">
        <span className="text-sm font-medium">目标人群</span>
        <input
          className={`${inputClass} mt-1`}
          value={product.audience}
          maxLength={INPUT_LIMITS.audience}
          disabled={disabled}
          placeholder="例如：控糖的上班族"
          onChange={(e) => set("audience", e.target.value)}
        />
        <FieldError message={errors.audience} />
      </label>

      <div>
        <span className="text-sm font-medium">风格</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {STYLES.map((style) => (
            <label
              key={style}
              className={`flex cursor-pointer items-center justify-center rounded-lg border py-2 text-sm ${
                product.style === style ? "border-rose-400 bg-rose-50 text-rose-600" : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="style"
                className="sr-only"
                checked={product.style === style}
                disabled={disabled}
                onChange={() => set("style", style)}
              />
              {style}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm font-medium">拍摄条件</span>
        <div className="mt-1 flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={product.solo}
              disabled={disabled}
              onChange={(e) => set("solo", e.target.checked)}
            />
            一个人拍
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={product.onCamera}
              disabled={disabled}
              onChange={(e) => set("onCamera", e.target.checked)}
            />
            本人出镜
          </label>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium">拍摄场地</span>
        <input
          className={`${inputClass} mt-1`}
          value={product.location}
          maxLength={INPUT_LIMITS.location}
          disabled={disabled}
          placeholder="例如：店内操作台"
          onChange={(e) => set("location", e.target.value)}
        />
        <FieldError message={errors.location} />
      </label>

      <div>
        <span className="text-sm font-medium">目标时长</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {TARGET_DURATIONS.map((duration) => (
            <label
              key={duration}
              className={`flex cursor-pointer items-center justify-center rounded-lg border py-2 text-sm ${
                product.targetDurationSec === duration ? "border-rose-400 bg-rose-50 text-rose-600" : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="duration"
                className="sr-only"
                checked={product.targetDurationSec === duration}
                disabled={disabled}
                onChange={() => set("targetDurationSec", duration)}
              />
              {duration} 秒
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
      >
        {loading ? "正在生成分镜脚本…" : "生成我的脚本"}
      </button>
    </section>
  );
}
