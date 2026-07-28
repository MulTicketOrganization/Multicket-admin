import { apiFetch } from "@/shared/api";
import type { JobInstanceSummary, JobRestartResult } from "../model/types";

/**
 * GET /admin/batch/job-instances
 * onlyIncomplete=true (기본) 면 COMPLETED 가 아닌 것만 반환한다.
 */
export async function getJobInstances(
  onlyIncomplete: boolean,
): Promise<JobInstanceSummary[]> {
  const res = await apiFetch<JobInstanceSummary[] | JobInstanceSummary | null>(
    "/admin/batch/job-instances",
    { method: "GET", query: { onlyIncomplete } },
  );
  if (res == null) return [];
  return Array.isArray(res) ? res : [res];
}

/**
 * POST /admin/batch/job-instances/{id}/restart
 * 같은 JobInstance 에 새 JobExecution 을 이어붙인다 (ExecutionContext 복원).
 */
export async function restartJobInstance(
  jobInstanceId: number,
): Promise<JobRestartResult> {
  return apiFetch<JobRestartResult>(
    `/admin/batch/job-instances/${jobInstanceId}/restart`,
    { method: "POST" },
  );
}
