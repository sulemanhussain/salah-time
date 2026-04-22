const BASE_URL = '';

export interface MosqueDetails {
  id?: string;
  googlePlaceId?: string;
  name: string;
  vicinity?: string | null;
  latitude?: number;
  longitude?: number;
  placeTypes?: string | null;
  isActive?: boolean;
  lastFetchAt?: string | null;
  createdDate?: string | null;
  modifedDate?: string | null;
}

export async function getMosques(): Promise<MosqueDetails[]> {
  const response = await fetch(`${BASE_URL}/api/MosqueDetails`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch mosques: ${response.status}`);
  return response.json();
}

export async function getMosqueByPlaceId(placeId: string): Promise<MosqueDetails | null> {
  const response = await fetch(`${BASE_URL}/api/MosqueDetailsByPlaceId/${encodeURIComponent(placeId)}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch mosque by place ID: ${response.status}`);
  return response.json();
}

export async function getMosqueById(id: string): Promise<MosqueDetails> {
  const response = await fetch(`${BASE_URL}/api/MosqueDetails/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch mosque: ${response.status}`);
  return response.json();
}

export async function createMosque(mosque: MosqueDetails): Promise<MosqueDetails> {
  const response = await fetch(`${BASE_URL}/api/MosqueDetails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mosque),
  });
  if (!response.ok) throw new Error(`Failed to create mosque: ${response.status}`);
  return response.json();
}

export async function createMosquesBatch(mosques: MosqueDetails[]): Promise<void> {
  console.log('Creating mosques batch:', mosques);
  const response = await fetch(`${BASE_URL}/api/MosqueDetailsBatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mosques),
  });
  if (!response.ok) throw new Error(`Failed to batch create mosques: ${response.status}`);
}

export async function updateMosque(id: string, mosque: MosqueDetails): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/MosqueDetails/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mosque),
  });
  if (!response.ok) throw new Error(`Failed to update mosque: ${response.status}`);
}

export async function deleteMosque(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/MosqueDetails/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to delete mosque: ${response.status}`);
}
