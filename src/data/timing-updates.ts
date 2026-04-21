const BASE_URL = '';

export enum Prayer {
  Fajr = 0,
  Dhuhr = 1,
  Asr = 2,
  Maghrib = 3,
  Isha = 4,
}

export enum TimingUpdateStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface TimingUpdate {
  id?: string;
  mosqueId?: string;
  submittedBy?: string;
  prayer?: Prayer;
  aadhan?: string;
  congregation?: string;
  status?: TimingUpdateStatus;
  reviewerNotes?: string | null;
  reviewedBy?: string;
  reviewedAt?: string;
  createdDate?: string;
  modifiedDate?: string;
}

export async function getTimingUpdates(): Promise<TimingUpdate[]> {
  const response = await fetch(`${BASE_URL}/api/TimingUpdate`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch timing updates: ${response.status}`);
  return response.json();
}

export async function getTimingUpdatesByMosqueId(mosqueId: string): Promise<TimingUpdate[]> {
  const response = await fetch(`${BASE_URL}/api/TimingUpdateByMosqueId/${mosqueId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch timing updates for mosque: ${response.status}`);
  return response.json();
}

export async function getTimingUpdateById(id: string): Promise<TimingUpdate> {
  const response = await fetch(`${BASE_URL}/api/TimingUpdate/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch timing update: ${response.status}`);
  return response.json();
}

export async function createTimingUpdate(update: TimingUpdate): Promise<TimingUpdate> {
  console.log('Creating timing update:', update);
  const response = await fetch(`${BASE_URL}/api/TimingUpdate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!response.ok) throw new Error(`Failed to create timing update: ${response.status}`);
  return response.json();
}

export async function updateTimingUpdate(id: string, update: TimingUpdate): Promise<void> {
  console.log('Updating timing update:', update);

  const response = await fetch(`${BASE_URL}/api/TimingUpdate/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!response.ok) throw new Error(`Failed to update timing update: ${response.status}`);
}

export async function upsertTimingUpdatesBatch(updates: TimingUpdate[]): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/TimingUpdateBatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error(`Failed to batch upsert timing updates: ${response.status}`);
}

export async function createTimingUpdatesBulk(updates: TimingUpdate[]): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/TimingUpdateBatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error(`Failed to create timing updates: ${response.status}`);
}

export async function deleteTimingUpdate(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/TimingUpdate/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to delete timing update: ${response.status}`);
}
