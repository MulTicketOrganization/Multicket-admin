"use client";

import { useEffect, useState } from "react";

/**
 * value 가 변경된 후 delay 만큼 흐른 뒤의 stable value 반환.
 * 검색 입력처럼 키 입력마다 즉시 fetch 하지 않고 디바운스할 때 사용.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
