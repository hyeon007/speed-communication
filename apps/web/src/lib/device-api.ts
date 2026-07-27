import { buildApiUrl } from '@/lib/api';
import type { Device } from '@/lib/device-catalog';

type DeviceApiResponse = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  colors: string[];
  storageOptions: string[];
  highlights: string[];
};

function toDevice(device: DeviceApiResponse): Device {
  return {
    slug: device.slug,
    name: device.name,
    highlight: device.tagline,
    imageUrl: device.imageUrl ?? undefined,
    sourcePage: device.sourceUrl ?? '#',
    description: device.description,
    colors: device.colors,
    storageOptions: device.storageOptions,
    highlights: device.highlights,
  };
}

async function readResponse(response: Response): Promise<DeviceApiResponse | DeviceApiResponse[]> {
  if (!response.ok) {
    throw new Error('Device catalog request failed.');
  }

  return response.json() as Promise<DeviceApiResponse | DeviceApiResponse[]>;
}

export async function fetchPublishedDevices(): Promise<Device[]> {
  const response = await fetch(buildApiUrl('/api/v1/devices'), {
    cache: 'no-store',
  });
  const payload = await readResponse(response);

  if (!Array.isArray(payload)) {
    throw new Error('Unexpected device catalog response.');
  }

  return payload.map(toDevice);
}

export async function fetchPublishedDevice(slug: string): Promise<Device> {
  const response = await fetch(
    buildApiUrl(`/api/v1/devices/${encodeURIComponent(slug)}`),
    { cache: 'no-store' },
  );
  const payload = await readResponse(response);

  if (Array.isArray(payload)) {
    throw new Error('Unexpected device detail response.');
  }

  return toDevice(payload);
}
