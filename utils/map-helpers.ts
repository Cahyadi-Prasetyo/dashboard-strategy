// ~/utils/map-helpers.js

export const isFloat = (n) => n % 1 !== 0;

export const safeRemoveLayer = (mapInstance, layer) => {
  if (mapInstance && layer && mapInstance.hasLayer(layer)) {
    try {
      mapInstance.removeLayer(layer);
    } catch (e) {
      console.warn("Leaflet cleanup warning:", e);
    }
  }
};

export const updateLabelVisibility = (mapInstance, layerGroup, minZoom) => {
  if (!mapInstance || !layerGroup || mapInstance._map === null) return;
  const currentZoom = mapInstance.getZoom();

  if (currentZoom >= minZoom) {
    if (!mapInstance.hasLayer(layerGroup)) {
      mapInstance.addLayer(layerGroup);
    }
  } else {
    if (mapInstance.hasLayer(layerGroup)) {
      mapInstance.removeLayer(layerGroup);
    }
  }
};

export const formatDateIndo = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
};
