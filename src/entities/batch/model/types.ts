/**
 * Spring Batch JobInstance 도메인.
 * 출처: /admin/batch/*
 */

/** BatchStatus — Spring Batch 표준 값 */
export const BatchStatus = {
  COMPLETED: "COMPLETED",
  STARTING: "STARTING",
  STARTED: "STARTED",
  STOPPING: "STOPPING",
  STOPPED: "STOPPED",
  FAILED: "FAILED",
  ABANDONED: "ABANDONED",
  UNKNOWN: "UNKNOWN",
} as const;
export type BatchStatus = (typeof BatchStatus)[keyof typeof BatchStatus];

/** GET /admin/batch/job-instances 응답 항목 */
export interface JobInstanceSummary {
  jobInstanceId: number;
  jobName: string;
  /** 가장 최근 JobExecution 의 BatchStatus (문자열 그대로) */
  status: string;
  jobExecutionId: number | null;
  startTime: string | null;
  /** 아직 끝나지 않았으면 null */
  endTime: string | null;
}

/** POST /admin/batch/job-instances/{id}/restart 응답 */
export interface JobRestartResult {
  jobInstanceId: number;
  jobName: string;
  jobExecutionId: number;
}

/** 실행 중이거나 이미 완료된 Job 은 재실행할 수 없다 (서버가 400) */
const NON_RESTARTABLE_STATUSES: readonly string[] = [
  BatchStatus.COMPLETED,
  BatchStatus.STARTING,
  BatchStatus.STARTED,
  BatchStatus.STOPPING,
];

export function isRestartable(status: string): boolean {
  return !NON_RESTARTABLE_STATUSES.includes(status);
}
