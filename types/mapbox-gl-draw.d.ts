declare module "@mapbox/mapbox-gl-draw" {
  import type { Map as MapboxMap } from "mapbox-gl";

  interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: {
      point?: boolean;
      line_string?: boolean;
      polygon?: boolean;
      trash?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
    };
    styles?: object[];
    clickBuffer?: number;
    touchBuffer?: number;
    boxSelect?: boolean;
    keybindings?: boolean;
    defaultMode?: string;
    modes?: Record<string, object>;
  }

  interface FeatureCollection {
    type: "FeatureCollection";
    features: GeoJSON.Feature[];
  }

  class MapboxDraw {
    constructor(options?: DrawOptions);

    add(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): string[];
    get(featureId: string): GeoJSON.Feature | undefined;
    getFeatureIdsAt(point: { x: number; y: number }): string[];
    getSelectedIds(): string[];
    getSelected(): FeatureCollection;
    getSelectedPoints(): FeatureCollection;
    getAll(): FeatureCollection;
    delete(ids: string | string[]): this;
    deleteAll(): this;
    set(featureCollection: GeoJSON.FeatureCollection): string[];
    trash(): this;
    combineFeatures(): this;
    uncombineFeatures(): this;
    setFeatureProperty(
      featureId: string,
      property: string,
      value: unknown
    ): this;
    changeMode(mode: string, options?: Record<string, unknown>): this;

    // Used by Mapbox GL
    onAdd(map: MapboxMap): HTMLElement;
    onRemove(map: MapboxMap): void;
    getDefaultPosition(): string;
  }

  export default MapboxDraw;

  // Draw modes
  export const modes: {
    SIMPLE_SELECT: "simple_select";
    DIRECT_SELECT: "direct_select";
    DRAW_LINE_STRING: "draw_line_string";
    DRAW_POLYGON: "draw_polygon";
    DRAW_POINT: "draw_point";
  };

  // Event types
  export interface DrawCreateEvent {
    type: "draw.create";
    features: GeoJSON.Feature[];
  }

  export interface DrawUpdateEvent {
    type: "draw.update";
    features: GeoJSON.Feature[];
    action: string;
  }

  export interface DrawDeleteEvent {
    type: "draw.delete";
    features: GeoJSON.Feature[];
  }

  export interface DrawSelectionChangeEvent {
    type: "draw.selectionchange";
    features: GeoJSON.Feature[];
  }

  export interface DrawModeChangeEvent {
    type: "draw.modechange";
    mode: string;
  }

  export interface DrawRenderEvent {
    type: "draw.render";
  }

  export interface DrawActionableEvent {
    type: "draw.actionable";
    actions: {
      trash: boolean;
      combineFeatures: boolean;
      uncombineFeatures: boolean;
    };
  }
}
