export type MapProvider = 'google' | 'waze' | 'apple';
export type CopyResult = 'success' | 'error';

export type MapAction = {
  provider: MapProvider;
  href: string;
};

export type MapMenuState = {
  open: boolean;
  feedback: CopyResult | null;
};

export type MapMenuAction =
  | { type: 'toggle' }
  | { type: 'dismiss' }
  | { type: 'copied'; result: CopyResult }
  | { type: 'clear-feedback' };

export function createMapMenuState(): MapMenuState {
  return { open: false, feedback: null };
}

export function reduceMapMenuState(
  state: MapMenuState,
  action: MapMenuAction
): MapMenuState {
  switch (action.type) {
    case 'toggle':
      return { ...state, open: !state.open };
    case 'dismiss':
      return { ...state, open: false };
    case 'copied':
      return {
        open: action.result === 'error',
        feedback: action.result
      };
    case 'clear-feedback':
      return { ...state, feedback: null };
  }
}

export function getNextMapMenuItemIndex(
  key: string,
  currentIndex: number,
  itemCount: number
): number | null {
  if (itemCount <= 0) return null;

  switch (key) {
    case 'ArrowDown':
      return (currentIndex + 1) % itemCount;
    case 'ArrowUp':
      return currentIndex <= 0 ? itemCount - 1 : currentIndex - 1;
    case 'Home':
      return 0;
    case 'End':
      return itemCount - 1;
    default:
      return null;
  }
}

export function buildMapActions(address: string): MapAction[] {
  const google = new URL('https://www.google.com/maps/dir/');
  google.searchParams.set('api', '1');
  google.searchParams.set('destination', address);

  const waze = new URL('https://waze.com/ul');
  waze.searchParams.set('q', address);
  waze.searchParams.set('navigate', 'yes');

  const apple = new URL('https://maps.apple.com/');
  apple.searchParams.set('daddr', address);

  return [
    { provider: 'google', href: google.toString() },
    { provider: 'waze', href: waze.toString() },
    { provider: 'apple', href: apple.toString() }
  ];
}

export async function copyMapAddress(
  address: string,
  writeText: (value: string) => Promise<void>
): Promise<CopyResult> {
  try {
    await writeText(address);
    return 'success';
  } catch {
    return 'error';
  }
}
