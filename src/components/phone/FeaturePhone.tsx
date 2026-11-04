import { Delete, Phone, PhoneOff } from "lucide-react";
import { PhoneScreen } from "./PhoneScreen";
import type { PhoneState } from "./useUssdPhone";

const KEYS: { key: string; sub: string }[] = [
  { key: "1", sub: "" },
  { key: "2", sub: "abc" },
  { key: "3", sub: "def" },
  { key: "4", sub: "ghi" },
  { key: "5", sub: "jkl" },
  { key: "6", sub: "mno" },
  { key: "7", sub: "pqrs" },
  { key: "8", sub: "tuv" },
  { key: "9", sub: "wxyz" },
  { key: "*", sub: "" },
  { key: "0", sub: "+" },
  { key: "#", sub: "" },
];

const keyClass =
  "flex h-11 flex-col items-center justify-center rounded-[40%] bg-phone-key text-phone-key-foreground shadow-[0_2px_0_oklch(0_0_0/0.25)] transition-transform active:translate-y-px active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";

export function FeaturePhone({
  state,
  onKey,
  onCall,
  onEnd,
  onClear,
}: {
  state: PhoneState;
  onKey: (key: string) => void;
  onCall: () => void;
  onEnd: () => void;
  onClear: () => void;
}) {
  return (
    <div
      className="w-[290px] rounded-[2.75rem] border-4 border-phone-body-edge bg-phone-body px-5 pb-8 pt-6 shadow-phone"
      aria-label="Feature phone simulator"
      role="group"
    >
      <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-phone-body-edge" aria-hidden />
      <div className="rounded-xl bg-phone-body-edge p-2">
        <PhoneScreen state={state} />
      </div>

      <div className="mt-5 grid grid-cols-4 items-center gap-2">
        <button type="button" className={keyClass} onClick={onClear} aria-label="Clear">
          <Delete className="size-4" />
        </button>
        <button
          type="button"
          onClick={onCall}
          aria-label="Call / send"
          className="flex h-11 items-center justify-center rounded-full bg-phone-call text-primary-foreground shadow-[0_2px_0_oklch(0_0_0/0.3)] active:translate-y-px"
        >
          <Phone className="size-5" />
        </button>
        <button
          type="button"
          onClick={onEnd}
          aria-label="End"
          className="flex h-11 items-center justify-center rounded-full bg-phone-end text-primary-foreground shadow-[0_2px_0_oklch(0_0_0/0.3)] active:translate-y-px"
        >
          <PhoneOff className="size-5" />
        </button>
        <button type="button" className={keyClass} onClick={onCall} aria-label="Send">
          <span className="text-[10px] font-bold uppercase">OK</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {KEYS.map(({ key, sub }) => (
          <button key={key} type="button" className={keyClass} onClick={() => onKey(key)} aria-label={`Key ${key}`}>
            <span className="text-lg font-semibold leading-none">{key}</span>
            {sub && <span className="text-[9px] uppercase leading-none tracking-wider opacity-70">{sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
