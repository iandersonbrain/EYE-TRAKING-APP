/**
 * Minimal ambient type declarations for the "webgazer" package.
 * WebGazer.js does not ship official TypeScript types, so we declare
 * only the surface area this project actually uses.
 */
declare module "webgazer" {
  export interface GazeData {
    x: number;
    y: number;
  }

  interface WebGazerInstance {
    setRegression(type: string): WebGazerInstance;
    setTracker(type: string): WebGazerInstance;
    setGazeListener(
      listener: (data: GazeData | null, elapsedTime: number) => void
    ): WebGazerInstance;
    clearGazeListener(): WebGazerInstance;
    begin(): Promise<WebGazerInstance>;
    pause(): WebGazerInstance;
    resume(): WebGazerInstance;
    end(): WebGazerInstance;
    showVideo(show: boolean): WebGazerInstance;
    showFaceOverlay(show: boolean): WebGazerInstance;
    showFaceFeedbackBox(show: boolean): WebGazerInstance;
    showPredictionPoints(show: boolean): WebGazerInstance;
    recordScreenPosition(
      x: number,
      y: number,
      eventType?: "click" | "move"
    ): WebGazerInstance;
    clearData(): WebGazerInstance;
    saveDataAcrossSessions(save: boolean): WebGazerInstance;
    isReady(): boolean;
    getCurrentPrediction(): Promise<GazeData | null>;
    removeMouseEventListeners(): WebGazerInstance;
    addMouseEventListeners(): WebGazerInstance;
    params: Record<string, unknown>;
  }

  const webgazer: WebGazerInstance;
  export default webgazer;
}
