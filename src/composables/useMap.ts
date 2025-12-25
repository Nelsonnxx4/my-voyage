// import { ref, onUnmounted, onMounted, computed } from "vue";
// import maplibregl, {
//   type Map,
//   type Marker,
//   type LngLatLike,
// } from "maplibre-gl";
// import "maplibre-gl/dist/maplibre-gl.css";
// import { usePremium } from "@/composables/usePremium";
// import { debounce } from "@/utils/debounce";
// import type { LocationSuggestion, SelectedLocation } from "@/types/mapTypes";

// export const useMap = () => {
//   const { limits } = usePremium();
//   const maxPinnedLocations = computed(() => limits.maxPinnedLocations ?? 3);

//   const map = ref<Map | null>(null);
//   const mapContainer = ref<HTMLDivElement | null>(null);
//   const isMapInitialized = ref(false);
//   const selectedLocation = ref<SelectedLocation>(null);
//   const locationMarker = ref<Marker | null>(null);
//   const locationSearch = ref("");
//   const locationSuggestions = ref<LocationSuggestion[]>([]);
//   const isSearching = ref(false);

//   // Multi-pin state
//   const markers = ref<Marker[]>([]);
//   const pins = ref<{ display_name: string; lat: number; lon: number }[]>([]);

//   const initMap = async (
//     container: HTMLDivElement,
//     options = { center: [0, 20], zoom: 2 }
//   ) => {
//     try {
//       map.value = new maplibregl.Map({
//         container: container,
//         style: "https://demotiles.maplibre.org/style.json",
//         center: options.center as [number, number],
//         zoom: options.zoom,
//       });

//       // Add default controls
//       // map.value.addControl(new maplibregl.NavigationControl(), "top-right");
//       // map.value.addControl(new maplibregl.ScaleControl(), "bottom-left");

//       map.value.on("load", () => {
//         isMapInitialized.value = true;
//       });

//       // Set up click handler
//       map.value.on("click", (e) => {
//         handleMapClick(e.lngLat);
//       });

//       // return map.value;
//     } catch (error) {
//       console.error("Failed to initialize map:", error);
//       throw error;
//     }
//   };

//   const debouncedSearchLocation = debounce(async () => {
//     await searchLocation();
//   }, 300);

//   const searchLocation = async () => {
//     const query = locationSearch.value.trim();

//     if (query.length < 2) {
//       locationSuggestions.value = [];
//       isSearching.value = false;
//       return;
//     }

//     isSearching.value = true;

//     try {
//       const response = await fetch(
//         `https://photon.komoot.io/api/?q=${encodeURIComponent(
//           query
//         )}&limit=8&lang=en`
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       type PhotonFeature = {
//         properties: {
//           name?: string;
//           street?: string;
//           city?: string;
//           country?: string;
//           osm_id?: string | number;
//           osm_type?: string;
//         };
//         geometry: {
//           coordinates: [number, number];
//         };
//       };

//       locationSuggestions.value = (data.features || []).map(
//         (feature: PhotonFeature) => ({
//           display_name:
//             feature.properties.name ||
//             feature.properties.street ||
//             feature.properties.city ||
//             feature.properties.country ||
//             "Unknown location",
//           lat: feature.geometry.coordinates[1],
//           lon: feature.geometry.coordinates[0],
//           osm_id: feature.properties.osm_id,
//           osm_type: feature.properties.osm_type,
//           place_id: feature.properties.osm_id,
//         })
//       );
//     } catch (error) {
//       console.error("Location search error:", error);
//       locationSuggestions.value = [];

//       if (query.length > 2) {
//         locationSuggestions.value = [
//           {
//             display_name: `Search for "${query}"`,
//             lat: 0,
//             lon: 0,
//             place_id: "fallback",
//           },
//         ];
//       }
//     } finally {
//       isSearching.value = false;
//     }
//   };

//   // Handle location selection from search results
//   const selectSuggestion = (suggestion: LocationSuggestion) => {
//     const lat = suggestion.lat;
//     const lon = suggestion.lon;

//     selectedLocation.value = {
//       display_name: suggestion.display_name,
//       lat,
//       lon,
//     };

//     flyTo([lon, lat], 14);
//     updateMarker([lon, lat], suggestion.display_name);
//     clearSuggestions();
//     locationSearch.value = suggestion.display_name;
//   };

//   // Handle map click to select location
//   const handleMapClick = async (lngLat: { lng: number; lat: number }) => {
//     try {
//       // Use Photon for reverse geocoding
//       const response = await fetch(
//         `https://photon.komoot.io/reverse?lat=${lngLat.lat}&lon=${lngLat.lng}&lang=en`
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       const feature = data.features?.[0];

//       if (feature) {
//         const displayName =
//           feature.properties.name ||
//           feature.properties.street ||
//           feature.properties.city ||
//           feature.properties.country ||
//           `${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`;

//         selectedLocation.value = {
//           display_name: displayName,
//           lat: lngLat.lat,
//           lon: lngLat.lng,
//         };

//         updateMarker([lngLat.lng, lngLat.lat], displayName);
//       }
//     } catch (error) {
//       console.error("Error reverse geocoding:", error);
//       const displayName = `${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`;
//       selectedLocation.value = {
//         display_name: displayName,
//         lat: lngLat.lat,
//         lon: lngLat.lng,
//       };
//       updateMarker([lngLat.lng, lngLat.lat], displayName);
//     }
//   };

//   // Add a marker to the map
//   const addMarker = (
//     lngLat: LngLatLike,
//     options?: {
//       color?: string;
//       popup?: string;
//       title?: string;
//     }
//   ): Marker => {
//     if (!map.value) {
//       throw new Error("Map not initialized. Call initMap first.");
//     }

//     // Create custom marker element
//     const el = document.createElement("div");
//     el.className = "custom-marker-container";
//     el.innerHTML = `
//     <div class="custom-marker" style="background-color: ${
//       options?.color || "#006E63"
//     }">
//       <div class="marker-dot"></div>
//       ${
//         options?.title ? `<div class="marker-label">${options.title}</div>` : ""
//       }
//     </div>
//   `;

//     const marker = new maplibregl.Marker({
//       element: el,
//       anchor: "bottom",
//       offset: [0, -10],
//     }).setLngLat(lngLat);

//     if (map.value) {
//       // marker.addTo(map.value);
//     }

//     if (options?.popup) {
//       const popup = new maplibregl.Popup({
//         offset: [0, -30],
//         closeOnClick: false,
//         className: "custom-marker-popup",
//         maxWidth: "300px",
//       }).setHTML(options.popup);

//       marker.setPopup(popup);

//       el.addEventListener("click", (e) => {
//         e.stopPropagation();
//         marker.togglePopup();
//       });
//     }

//     return marker;
//   };

//   const updateMarker = (coordinates: [number, number], title: string) => {
//     if (locationMarker.value) {
//       locationMarker.value.remove();
//     }
//     locationMarker.value = addMarker(coordinates, {
//       color: "#006E63",
//       title: title,
//       popup: `
//       <div class="marker-popup-content">
//         <h3 class="font-medium text-base">${title}</h3>
//         <p class="text-sm text-gray-600 mt-1">
//           ${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}
//         </p>
//       </div>
//     `,
//     });
//   };

//   // const closeAllPopups = () => {
//   //   document
//   //     .querySelectorAll(".custom-marker-container")
//   //     .forEach((markerEl) => {
//   //       const marker = [...markers.value].find(
//   //         (m: Marker) => m.getElement() === markerEl
//   //       );
//   //       marker?.getPopup()?.remove();
//   //     });
//   // };

//   // Fly to a location
//   const flyTo = (target: LngLatLike, zoom: number = 12) => {
//     if (!map.value) return;
//     map.value.flyTo({
//       center: target,
//       zoom,
//       essential: true,
//     });
//   };

//   // Use current geolocation
//   const useCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Geolocation is not supported by your browser");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         handleMapClick({ lat: latitude, lng: longitude });
//         flyTo([longitude, latitude], 14);
//       },
//       (error) => {
//         console.error("Error getting location:", error);
//         alert("Unable to retrieve your location");
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // Clear selected location
//   const clearLocation = () => {
//     selectedLocation.value = null;
//     locationSearch.value = "";
//     if (locationMarker.value) {
//       locationMarker.value.remove();
//       locationMarker.value = null;
//     }
//     clearSuggestions();
//   };

//   // Clear search suggestions
//   const clearSuggestions = () => {
//     locationSuggestions.value = [];
//   };

//   // Zoom controls
//   const zoomIn = () => {
//     if (!map.value) return;
//     map.value.zoomIn();
//   };

//   const zoomOut = () => {
//     if (!map.value) return;
//     map.value.zoomOut();
//   };

//   // Pin management
//   const addPin = (pin: { display_name: string; lat: number; lon: number }) => {
//     if (pins.value.length >= maxPinnedLocations.value) return false;
//     pins.value.push(pin);
//     const marker = addMarker([pin.lon, pin.lat], {
//       color: "#0ea5e9",
//       title: pin.display_name,
//       popup: `
//       <div class="marker-popup-content">
//         <h3 class="font-medium text-base">${pin.display_name}</h3>
//         <p class="text-sm text-gray-600 mt-1">${pin.lat.toFixed(
//           4
//         )}, ${pin.lon.toFixed(4)}</p>
//       </div>
//       `,
//     });
//     markers.value.push(marker);
//     return true;
//   };

//   const removePinAt = (index: number) => {
//     if (index < 0 || index >= pins.value.length) return;
//     pins.value.splice(index, 1);
//     const marker = markers.value.splice(index, 1)[0];
//     marker?.remove();
//   };

//   const clearPins = () => {
//     pins.value = [];
//     markers.value.forEach((m) => m.remove());
//     markers.value = [];
//   };

//   onUnmounted(() => {
//     if (locationMarker.value) {
//       locationMarker.value.remove();
//     }
//     markers.value.forEach((m) => m.remove());
//     map.value?.remove();
//   });

//   onMounted(async () => {
//     if (mapContainer.value) {
//       await initMap(mapContainer.value);
//     }
//   });
//   return {
//     map,
//     mapContainer,
//     isMapInitialized,
//     selectedLocation,
//     locationSearch,
//     locationSuggestions,
//     isSearching,

//     initMap,
//     searchLocation: debouncedSearchLocation, // Use debounced version
//     selectSuggestion,
//     useCurrentLocation,
//     clearLocation,
//     zoomIn,
//     zoomOut,

//     // For form integration
//     getLocationData: () => ({
//       location: selectedLocation.value?.display_name || "",
//       latitude: selectedLocation.value?.lat || null,
//       longitude: selectedLocation.value?.lon || null,
//     }),

//     // For editing existing voyages
//     setLocation: (locationData: {
//       display_name: string;
//       lat: number;
//       lon: number;
//     }) => {
//       selectedLocation.value = locationData;
//       locationSearch.value = locationData.display_name;
//       flyTo([locationData.lon, locationData.lat], 12);
//       updateMarker(
//         [locationData.lon, locationData.lat],
//         locationData.display_name
//       );
//     },

//     // Pins API
//     pins,
//     addPin,
//     removePinAt,
//     clearPins,
//     maxPinnedLocations,
//   };
// };
