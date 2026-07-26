import { describe, expect, it } from 'vitest';
import {
  buildMapActions,
  copyMapAddress,
  createMapMenuState,
  reduceMapMenuState
} from '../src/lib/map-app-selector';

const ADDRESS = 'Saha-Loo tee 36, Iru, 74206';

describe('buildMapActions', () => {
  it('returns map providers in the required order', () => {
    expect(buildMapActions(ADDRESS).map((action) => action.provider)).toEqual([
      'google',
      'waze',
      'apple'
    ]);
  });

  it('builds an encoded Google Maps destination', () => {
    expect(buildMapActions(ADDRESS)[0].href).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Saha-Loo+tee+36%2C+Iru%2C+74206'
    );
  });

  it('builds an encoded Waze navigation destination', () => {
    expect(buildMapActions(ADDRESS)[1].href).toBe(
      'https://waze.com/ul?q=Saha-Loo+tee+36%2C+Iru%2C+74206&navigate=yes'
    );
  });

  it('builds an encoded Apple Maps destination', () => {
    expect(buildMapActions(ADDRESS)[2].href).toBe(
      'https://maps.apple.com/?daddr=Saha-Loo+tee+36%2C+Iru%2C+74206'
    );
  });
});

describe('copyMapAddress', () => {
  it('writes the unchanged address and returns success', async () => {
    let copiedValue = '';
    const result = await copyMapAddress(ADDRESS, async (value) => {
      copiedValue = value;
    });

    expect(copiedValue).toBe(ADDRESS);
    expect(result).toBe('success');
  });

  it('returns error when clipboard access fails', async () => {
    const result = await copyMapAddress(ADDRESS, async () => {
      throw new Error('clipboard denied');
    });

    expect(result).toBe('error');
  });
});

describe('reduceMapMenuState', () => {
  it('opens a closed menu when toggled', () => {
    expect(reduceMapMenuState(createMapMenuState(), { type: 'toggle' })).toEqual({
      open: true,
      feedback: null
    });
  });

  it('closes an open menu when toggled', () => {
    expect(
      reduceMapMenuState({ open: true, feedback: null }, { type: 'toggle' })
    ).toEqual({ open: false, feedback: null });
  });

  it('dismisses an open menu without changing feedback', () => {
    expect(
      reduceMapMenuState({ open: true, feedback: 'error' }, { type: 'dismiss' })
    ).toEqual({ open: false, feedback: 'error' });
  });

  it.each(['success', 'error'] as const)(
    'closes the menu with %s clipboard feedback',
    (result) => {
      expect(
        reduceMapMenuState(
          { open: true, feedback: null },
          { type: 'copied', result }
        )
      ).toEqual({ open: false, feedback: result });
    }
  );

  it('clears transient clipboard feedback', () => {
    expect(
      reduceMapMenuState(
        { open: false, feedback: 'success' },
        { type: 'clear-feedback' }
      )
    ).toEqual({ open: false, feedback: null });
  });
});
