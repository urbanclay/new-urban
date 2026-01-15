import { get, set, del } from 'idb-keyval';

export async function getRaw(hash: string): Promise<string | undefined> {
  const v = await get<string>(`raw:${hash}`);
  return v ?? undefined;
}

export async function setRaw(hash: string, raw: string): Promise<void> {
  await set(`raw:${hash}`, raw);
}

export async function removeRaw(hash: string): Promise<void> {
  await del(`raw:${hash}`);
}
