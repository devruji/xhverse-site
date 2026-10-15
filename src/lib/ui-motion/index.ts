/** Internal public UI motion. State changes remain owned by the calling UI. */
export const motionEase = "cubic-bezier(0.23, 1, 0.32, 1)";

export function createUiMotion(enabled: boolean, preference: MediaQueryList) {
  const active = new Map<HTMLElement, { animation: Animation; settle?: () => void }>();
  let disposed = false;

  function cancel(element: HTMLElement, settle = false): void {
    const entry = active.get(element);
    if (!entry) return;
    active.delete(element);
    entry.animation.onfinish = null;
    entry.animation.cancel();
    if (settle) entry.settle?.();
  }

  function cancelAll(settle = false): void {
    for (const element of active.keys()) cancel(element, settle);
  }

  function eligible(event?: Event): boolean {
    return enabled && !disposed && !preference.matches && event instanceof MouseEvent && event.detail > 0;
  }

  function animate(
    element: HTMLElement,
    frames: [Keyframe, Keyframe],
    duration: number,
    pointer: boolean,
    settle?: () => void,
    hold = false,
  ): void {
    // Sample before cancellation so repeated actions continue from their current position.
    const first = { ...frames[0] };
    if (active.has(element)) {
      const computed = getComputedStyle(element);
      for (const property of Object.keys(first)) {
        first[property] = computed.getPropertyValue(property);
      }
    }
    cancel(element);
    if (!enabled || disposed || preference.matches || !pointer || typeof element.animate !== "function") {
      settle?.();
      return;
    }
    const animation = element.animate([first, frames[1]], { duration, easing: motionEase, fill: "forwards" });
    active.set(element, { animation, settle });
    animation.onfinish = () => {
      if (active.get(element)?.animation !== animation) return;
      if (hold) return;
      cancel(element);
      settle?.();
    };
  }

  const onPreferenceChange = () => { if (preference.matches) cancelAll(true); };
  preference.addEventListener("change", onPreferenceChange);

  return {
    eligible, animate, cancel, cancelAll,
    dispose(): void {
      cancelAll(true);
      disposed = true;
      preference.removeEventListener("change", onPreferenceChange);
    },
  };
}
