"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * 외부 값(URL 쿼리 / 서버 응답)을 기준으로 하되, 사용자가 로컬에서 편집할 수 있는 상태.
 * 외부 값이 바뀌면 렌더 중에 로컬 값을 맞춘다.
 *
 * useEffect + setState 로 동기화하면 렌더가 한 번 더 도는 cascading render 가 생기고
 * `react-hooks/set-state-in-effect` 에도 걸린다 — React 가 권장하는 "렌더 중 상태 조정" 패턴.
 */
export function useSyncedState<T>(external: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(external);
  const [prevExternal, setPrevExternal] = useState(external);

  if (external !== prevExternal) {
    setPrevExternal(external);
    setValue(external);
  }

  return [value, setValue];
}
