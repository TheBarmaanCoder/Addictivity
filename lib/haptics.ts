/**
 * Central haptics helper. Uses @capacitor/haptics in native context; no-ops on web.
 * Fire-and-forget: callers do not need to await.
 */
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

function safeHaptic(fn: () => Promise<void>): void {
  if (!Capacitor.isNativePlatform()) return;
  fn().catch(() => {});
}

export function impactLight(): void {
  safeHaptic(() => Haptics.impact({ style: ImpactStyle.Light }));
}

export function impactMedium(): void {
  safeHaptic(() => Haptics.impact({ style: ImpactStyle.Medium }));
}

export function impactHeavy(): void {
  safeHaptic(() => Haptics.impact({ style: ImpactStyle.Heavy }));
}

export function selectionChanged(): void {
  safeHaptic(() => Haptics.selectionChanged());
}

export function notificationSuccess(): void {
  safeHaptic(() => Haptics.notification({ type: NotificationType.Success }));
}

export function notificationWarning(): void {
  safeHaptic(() => Haptics.notification({ type: NotificationType.Warning }));
}
