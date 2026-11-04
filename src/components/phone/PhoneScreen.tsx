import { isTextStep, type PhoneState } from "./useUssdPhone";

function StatusBar() {
  return (
    <div className="flex items-center justify-between text-[10px] font-semibold">
      <span className="flex items-end gap-px" aria-hidden>
        {[3, 5, 7, 9].map((h) => (
          <span key={h} className="w-[3px] bg-phone-screen-ink" style={{ height: h }} />
        ))}
      </span>
      <span>NG-TEL</span>
      <span className="flex items-center gap-0.5" aria-hidden>
        <span className="h-2 w-4 rounded-[1px] border border-phone-screen-ink p-px">
          <span className="block h-full w-3/4 bg-phone-screen-ink" />
        </span>
      </span>
    </div>
  );
}

export function PhoneScreen({ state }: { state: PhoneState }) {
  const textMode = isTextStep(state);
  const left = state.mode === "session" || state.mode === "idle" ? "Clear" : "";
  const right =
    state.mode === "ended"
      ? "OK"
      : state.mode === "session"
        ? "Send"
        : state.mode === "idle" && state.buffer
          ? "Call"
          : "";

  return (
    <div className="lcd-text flex h-56 flex-col rounded-md bg-phone-screen px-3 py-2 text-[12px] leading-snug shadow-[inset_0_2px_6px_oklch(0_0_0/0.25)]">
      <StatusBar />
      <div className="mt-2 flex-1 overflow-hidden" aria-live="polite">
        {state.mode === "idle" &&
          (state.buffer ? (
            <p className="mt-10 break-all text-right text-2xl font-semibold tracking-wider">
              {state.buffer}
            </p>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-base font-semibold">TrustPost</p>
              <p className="mt-1 opacity-75">Dial *384# for help</p>
            </div>
          ))}

        {state.mode === "running" && (
          <p className="mt-12 text-center">
            USSD code running
            <span className="animate-blink">…</span>
          </p>
        )}

        {state.mode === "session" && (
          <div className="flex h-full flex-col">
            <p className="whitespace-pre-line">{state.message}</p>
            <div className="mt-auto flex items-center gap-1 border-t border-phone-screen-ink/30 pt-1">
              <span className="break-all font-semibold">
                {state.buffer}
                <span className="animate-blink">_</span>
              </span>
              {textMode && (
                <span className="ml-auto rounded-sm border border-phone-screen-ink px-1 text-[9px]">
                  ABC
                </span>
              )}
            </div>
          </div>
        )}

        {state.mode === "ended" && <p className="whitespace-pre-line">{state.message}</p>}
      </div>
      <div className="flex justify-between text-[10px] font-semibold uppercase">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
