import { afterEach, describe, expect, it, vi } from "vitest";
import { createUiMotion, motionEase } from "./index";

class TestMouseEvent extends Event {
  constructor(public detail: number) { super("click"); }
}
function fixture(enabled = true, reduced = false, api = true) {
  const media = new EventTarget() as MediaQueryList;
  Object.defineProperty(media, "matches", { value: reduced, writable: true });
  const animation = { cancel: vi.fn(), onfinish: null as (() => void) | null };
  const animate = vi.fn((_frames: Keyframe[], _options: KeyframeAnimationOptions) => animation);
  const element = { animate: api ? animate : undefined } as unknown as HTMLElement;
  vi.stubGlobal("MouseEvent", TestMouseEvent);
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: (property: string) => property === "opacity" ? "0.5" : "matrix(1, 0, 0, 1, 0, 3)" }));
  const controller = createUiMotion(enabled, media);
  const frames: [Keyframe, Keyframe] = [{ opacity: 0.85, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }];
  return { media, animation, animate, element, controller, frames };
}
afterEach(() => vi.unstubAllGlobals());

describe("public UI motion", () => {
  it("requires an enabled pointer action and an unchanged motion preference", () => {
    const { controller } = fixture();
    expect(controller.eligible()).toBe(false);
    expect(controller.eligible(new Event("keydown"))).toBe(false);
    expect(controller.eligible(new TestMouseEvent(0))).toBe(false);
    expect(controller.eligible(new TestMouseEvent(1))).toBe(true);
    controller.dispose();
    expect(controller.eligible(new TestMouseEvent(1))).toBe(false);
    expect(fixture(false).controller.eligible(new TestMouseEvent(1))).toBe(false);
    expect(fixture(true, true).controller.eligible(new TestMouseEvent(1))).toBe(false);
  });
  it.each([[false, false, true, true], [true, true, true, true], [true, false, false, true], [true, false, true, false]])("settles immediately without eligible motion %j", (enabled, reduced, api, pointer) => {
    const { controller, element, frames, animate } = fixture(enabled, reduced, api);
    const settle = vi.fn();
    controller.animate(element, frames, 180, pointer, settle);
    expect(settle).toHaveBeenCalledOnce();
    expect(animate).not.toHaveBeenCalled();
    controller.animate(element, frames, 180, pointer);
  });
  it("uses specified timing and cancels the visual fill on completion", () => {
    const { controller, element, frames, animation, animate } = fixture();
    const settle = vi.fn();
    controller.animate(element, frames, 180, true, settle);
    expect(animate).toHaveBeenCalledWith(frames, { duration: 180, easing: motionEase, fill: "forwards" });
    animation.onfinish!();
    expect(animation.cancel).toHaveBeenCalledOnce();
    expect(settle).toHaveBeenCalledOnce();
    controller.cancel(element);
    expect(animation.cancel).toHaveBeenCalledOnce();
    controller.animate(element, frames, 180, true);
    animation.onfinish!();
  });
  it("retargets from computed current state and prevents stale completion", () => {
    const { controller, element, frames, animation, animate } = fixture();
    const stale = vi.fn();
    controller.animate(element, frames, 180, true, stale);
    const oldFinish = animation.onfinish!;
    controller.cancel(element);
    oldFinish();
    controller.animate(element, frames, 180, true, stale);
    controller.animate(element, frames, 120, true);
    expect(animate.mock.calls[2]?.[0]).toEqual([{ opacity: "0.5", transform: "matrix(1, 0, 0, 1, 0, 3)" }, frames[1]]);
    expect(stale).not.toHaveBeenCalled();
    controller.cancelAll();
    expect(animation.onfinish).toBeNull();
    expect(stale).not.toHaveBeenCalled();
  });
  it("holds press feedback until release and settles on runtime reduced motion", () => {
    const { controller, element, frames, animation, media } = fixture();
    const settle = vi.fn();
    controller.animate(element, frames, 160, true, settle, true);
    animation.onfinish!();
    expect(animation.cancel).not.toHaveBeenCalled();
    media.dispatchEvent(new Event("change"));
    expect(animation.cancel).not.toHaveBeenCalled();
    Object.defineProperty(media, "matches", { value: true });
    media.dispatchEvent(new Event("change"));
    expect(animation.cancel).toHaveBeenCalledOnce();
    expect(settle).toHaveBeenCalledOnce();
    controller.animate(element, frames, 160, true);
    controller.dispose();
    media.dispatchEvent(new Event("change"));
  });
  it("disposes all surfaces, settles pending closures, and refuses later animations", () => {
    const { controller, element, frames, animation } = fixture();
    const settle = vi.fn();
    controller.animate(element, frames, 140, true, settle);
    controller.dispose();
    expect(animation.cancel).toHaveBeenCalledOnce();
    expect(settle).toHaveBeenCalledOnce();
    controller.animate(element, frames, 140, true, settle);
    expect(settle).toHaveBeenCalledTimes(2);
    const held = fixture();
    held.controller.animate(held.element, frames, 160, true);
    held.controller.cancelAll(true);
  });
});
