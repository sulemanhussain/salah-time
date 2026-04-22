import type { MosqueDetails } from './mosque-details';

const BASE_URL = '';

export enum ReportReason {
  IncorrectAdhan = 0,
  IncorrectCongregation = 1,
  MissingTiming = 2,
  OutdatedSchedule = 3,
  DetailsMismatch = 4,
  Other = 5,
}

export enum ReportStatus {
  Pending = 0,
  Resolved = 1,
  Dismissed = 2,
}

export interface TimingReport {
  id?: string;
  mosqueId?: string;
  reportedBy?: string;
  reason?: ReportReason;
  details?: string | null;
  status?: ReportStatus;
  reviewedBy?: string | null;
  reviewedDate?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
  mosqueDetails?: MosqueDetails | null;
}

export async function getTimingReports(): Promise<TimingReport[]> {
  const response = await fetch(`${BASE_URL}/api/TimingReport`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch timing reports: ${response.status}`);
  return response.json();
}

export async function getTimingReportById(id: string): Promise<TimingReport> {
  const response = await fetch(`${BASE_URL}/api/TimingReport/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch timing report: ${response.status}`);
  return response.json();
}

export async function getTimingReportsByReporterId(reporterId: string): Promise<TimingReport[]> {
  const response = await fetch(`${BASE_URL}/api/TimingReportByReporterId/${reporterId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch timing reports by reporter: ${response.status}`);
  return response.json();
}

export async function createTimingReport(report: TimingReport): Promise<TimingReport> {
  const response = await fetch(`${BASE_URL}/api/TimingReport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (!response.ok) throw new Error(`Failed to create timing report: ${response.status}`);
  return response.json();
}

export async function patchTimingReportStatus(id: string, status: ReportStatus): Promise<void> {
  const params = new URLSearchParams({ id, status: String(status) });
  const response = await fetch(`${BASE_URL}/api/TimingReport?${params}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to patch timing report status: ${response.status}`);
}
