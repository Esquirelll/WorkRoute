import { describe, expect, it } from 'vitest';
import { emptyProfile } from '../domain/employerProfile';
import { DEMO_NEEDS, deleteAccount, getCurrentUser, logIn, logOut, signUp, startDemoPersona } from './auth';
import { getEmployerProfile, saveEmployerProfile } from './employerProfile';
import { getNeeds, saveNeeds } from './needs';
import { getSavedIds, toggleSaved } from './savedJobs';
import { describeKey } from './storageRegistry';
import { listStoredKeys } from './storage';

const carlo = { accountType: 'employer', name: 'Carlo Reyes', email: 'carlo@example.com', password: 'a long enough phrase' };

describe('demo persona (Maria)', () => {
  it('logs in with one call and starts with her needs already chosen', () => {
    const user = startDemoPersona();
    expect(user.isDemo).toBe(true);
    expect(getCurrentUser()?.id).toBe(user.id);
    expect(getNeeds(user.id)).toEqual(DEMO_NEEDS);
  });

  it('resets to the same starting point every time', () => {
    const user = startDemoPersona();
    toggleSaved(user.id, 'j1');
    saveNeeds(user.id, ['quiet-workspace']);
    startDemoPersona();
    expect(getSavedIds(user.id)).toEqual([]);
    expect(getNeeds(user.id)).toEqual(DEMO_NEEDS);
  });

  it('has NO password: the log-in form can never open her account', async () => {
    startDemoPersona();
    logOut();
    for (const password of ['', 'password', 'maria', '123456']) {
      const result = await logIn('maria@demo.workroute.sample', password);
      expect(result.ok).toBe(false);
    }
    expect(getCurrentUser()).toBeNull();
  });
});

describe('deleting an account', () => {
  it('removes the account, all saved data and the session, and the person cannot log in again', async () => {
    const result = await signUp(carlo);
    expect(result.ok).toBe(true);
    const id = getCurrentUser()!.id;
    saveEmployerProfile(id, { ...emptyProfile(), workplaceName: 'Made-up Works', area: 'Pasig' });
    saveNeeds(id, ['wheelchair']);
    toggleSaved(id, 'j2');

    expect(deleteAccount()).toEqual({ ok: true });
    expect(getCurrentUser()).toBeNull();
    expect(getEmployerProfile(id)).toBeNull();
    expect(getNeeds(id)).toEqual([]);
    expect(getSavedIds(id)).toEqual([]);
    expect(listStoredKeys().some((k) => k.key.endsWith(id))).toBe(false); // nothing left under that id
    expect((await logIn('carlo@example.com', 'a long enough phrase')).ok).toBe(false);
  });

  it('lets the same email sign up again afterwards', async () => {
    expect((await signUp(carlo)).ok).toBe(true);
    logOut();
  });

  it('does nothing when nobody is logged in', () => {
    logOut();
    expect(deleteAccount()).toEqual({ ok: false, reason: 'not-logged-in' });
  });

  it('refuses to delete the built-in demo admin and the demo persona', async () => {
    await logIn('admin', '123456');
    expect(deleteAccount()).toEqual({ ok: false, reason: 'protected' });
    logOut();
    startDemoPersona();
    expect(deleteAccount()).toEqual({ ok: false, reason: 'protected' });
    logOut();
  });
});

describe('the "what is stored" list is complete', () => {
  it('describes every key the app has created, so the Method page cannot go out of date', async () => {
    // Do (almost) everything the app can do ...
    await signUp({ accountType: 'seeker', name: 'Zed', email: 'zed@example.com', password: 'a long enough phrase' });
    const id = getCurrentUser()!.id;
    saveNeeds(id, ['wheelchair']);
    toggleSaved(id, 'j1');
    saveEmployerProfile(id, { ...emptyProfile(), workplaceName: 'Made-up Works', area: 'Pasig' });
    startDemoPersona();
    await logIn('admin', '123456');

    // ... then every key left behind must be described in the registry.
    const keys = listStoredKeys().map((k) => k.key);
    expect(keys.length).toBeGreaterThan(3);
    const undescribed = keys.filter((k) => describeKey(k) === null);
    expect(undescribed).toEqual([]);
  });
});
