import { useCallback, useEffect, useRef, useState } from "react";
import { dial, isEnd, respond, stripPrefix, type UssdIncidentEffect, type UssdSession } from "@/lib/ussd";

export type PhoneState =
  | { mode: "idle"; buffer: string }
  | { mode: "running"; buffer: string }
  | { mode: "session"; session: UssdSession; message: string; buffer: string }
  | { mode: "ended"; message: string };

export interface GatewayLogEntry {
  id: number;
  direction: "in" | "out";
  text: string;
}

const MULTI_TAP: Record<string, string> = {
  "2": "ABC2",
  "3": "DEF3",
  "4": "GHI4",
  "5": "JKL5",
  "6": "MNO6",
  "7": "PQRS7",
  "8": "TUV8",
  "9": "WXYZ9",
};
const MULTI_TAP_WINDOW_MS = 900;
const NETWORK_DELAY_MS = 650;

export function isTextStep(state: PhoneState) {
  return state.mode === "session" && state.session.step.endsWith("_postcode");
}

export function useUssdPhone(onIncident: (incident: UssdIncidentEffect) => void) {
  const [state, setState] = useState<PhoneState>({ mode: "idle", buffer: "" });
  const [log, setLog] = useState<GatewayLogEntry[]>([]);
  const [multiTapActive, setMultiTapActive] = useState(false);
  const lastTap = useRef<{ key: string; at: number; index: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const logId = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const pushLog = (direction: GatewayLogEntry["direction"], text: string) =>
    setLog((l) => [...l.slice(-30), { id: ++logId.current, direction, text }]);

  const resetTap = () => {
    lastTap.current = null;
    setMultiTapActive(false);
  };

  const pressKey = useCallback(
    (key: string) => {
      setState((s) => {
        if (s.mode === "ended") return { mode: "idle", buffer: "" };
        if (s.mode === "running") return s;
        if (s.mode === "session" && isTextStep(s) && MULTI_TAP[key]) {
          const chars = MULTI_TAP[key];
          const now = Date.now();
          const prev = lastTap.current;
          if (prev && prev.key === key && now - prev.at < MULTI_TAP_WINDOW_MS) {
            const index = (prev.index + 1) % chars.length;
            lastTap.current = { key, at: now, index };
            return { ...s, buffer: s.buffer.slice(0, -1) + chars[index] };
          }
          lastTap.current = { key, at: now, index: 0 };
          return { ...s, buffer: s.buffer + chars[0] };
        }
        lastTap.current = null;
        return { ...s, buffer: s.buffer + key };
      });
      setMultiTapActive(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(resetTap, MULTI_TAP_WINDOW_MS);
    },
    [],
  );

  /** Append raw text (physical keyboard or sample chips) without multi-tap. */
  const typeText = useCallback((text: string) => {
    resetTap();
    setState((s) => (s.mode === "idle" || s.mode === "session" ? { ...s, buffer: s.buffer + text } : s));
  }, []);

  const setBuffer = useCallback((text: string) => {
    resetTap();
    setState((s) => (s.mode === "session" ? { ...s, buffer: text } : s.mode === "idle" ? { mode: "idle", buffer: text } : s));
  }, []);

  const clear = useCallback(() => {
    resetTap();
    setState((s) => (s.mode === "idle" || s.mode === "session" ? { ...s, buffer: s.buffer.slice(0, -1) } : s));
  }, []);

  const end = useCallback(() => {
    resetTap();
    setState((s) => {
      if (s.mode === "session") pushLog("in", "[session cancelled by user]");
      return { mode: "idle", buffer: "" };
    });
  }, []);

  const call = useCallback(() => {
    resetTap();
    const s = state;
    if (s.mode === "ended") return setState({ mode: "idle", buffer: "" });
    if (s.mode === "running") return;
    if (s.mode === "idle" && !s.buffer) return;

    const input = s.buffer;
    const session = s.mode === "session" ? s.session : null;
    pushLog("out", session ? input || "(empty)" : `DIAL ${input}`);
    setState({ mode: "running", buffer: "" });

    setTimeout(() => {
      const reply = session ? respond(session, input) : dial(input);
      pushLog("in", reply.response);
      if (reply.incident) onIncident(reply.incident);
      if (isEnd(reply.response) || !reply.session) {
        setState({ mode: "ended", message: stripPrefix(reply.response) });
      } else {
        setState({ mode: "session", session: reply.session, message: stripPrefix(reply.response), buffer: "" });
      }
    }, NETWORK_DELAY_MS);
  }, [state, onIncident]);

  return { state, log, multiTapActive, pressKey, typeText, setBuffer, clear, end, call };
}
