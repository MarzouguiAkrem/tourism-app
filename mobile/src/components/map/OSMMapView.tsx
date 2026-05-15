import React, { useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface OSMMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  subtitle?: string;
  /** Optional 1-based label shown inside the marker (e.g., stop order) */
  label?: number | string;
}

export interface OSMPolyline {
  /** [latitude, longitude] pairs */
  coordinates: Array<[number, number]>;
  color?: string;
  weight?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  /** Accuracy radius in meters — drawn as a faint circle around the marker */
  accuracy?: number;
}

interface Props {
  markers: OSMMarker[];
  polyline?: OSMPolyline;
  /** Initial center if there are no markers */
  initialRegion?: { latitude: number; longitude: number; zoom?: number };
  userLocation?: UserLocation | null;
  onMarkerPress?: (id: string) => void;
  style?: any;
}

const TUNISIA_CENTER = { latitude: 34.0, longitude: 9.0, zoom: 6 };

const buildHtml = (
  markers: OSMMarker[],
  region: { latitude: number; longitude: number; zoom: number },
  polyline?: OSMPolyline,
  userLocation?: UserLocation | null
) => {
  // Escape the JSON safely for embedding in <script>
  const markersJson = JSON.stringify(markers).replace(/</g, '\\u003c');
  const polylineJson = JSON.stringify(polyline || null).replace(/</g, '\\u003c');
  const userLocationJson = JSON.stringify(userLocation || null).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #e8f0f4; }
    .leaflet-popup-content { font: 14px -apple-system, system-ui, sans-serif; margin: 8px 12px; }
    .leaflet-popup-content b { display: block; margin-bottom: 2px; color: #1B4D8E; }
    .leaflet-popup-content small { color: #6B7280; }
    .order-marker {
      width: 28px; height: 28px; border-radius: 14px; background: #1B4D8E;
      color: #fff; font: 700 14px -apple-system, system-ui, sans-serif;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.35);
      border: 2px solid #fff;
    }
    .user-dot {
      width: 18px; height: 18px; border-radius: 9px;
      background: #2563eb;
      border: 3px solid #fff;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35), 0 1px 4px rgba(0,0,0,0.35);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      var markers = ${markersJson};
      var map = L.map('map', { zoomControl: true, attributionControl: true })
        .setView([${region.latitude}, ${region.longitude}], ${region.zoom});

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      var send = function (payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      var polylineData = ${polylineJson};
      var userLoc = ${userLocationJson};
      var bounds = [];

      markers.forEach(function (m) {
        var marker;
        if (m.label !== undefined && m.label !== null) {
          var icon = L.divIcon({
            className: 'order-marker-wrap',
            html: '<div class="order-marker">' + m.label + '</div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          marker = L.marker([m.latitude, m.longitude], { icon: icon }).addTo(map);
        } else {
          marker = L.marker([m.latitude, m.longitude]).addTo(map);
        }
        var html = '';
        if (m.title) html += '<b>' + m.title + '</b>';
        if (m.subtitle) html += '<small>' + m.subtitle + '</small>';
        if (html) marker.bindPopup(html);
        marker.on('click', function () { send({ type: 'marker', id: m.id }); });
        bounds.push([m.latitude, m.longitude]);
      });

      if (polylineData && polylineData.coordinates && polylineData.coordinates.length > 1) {
        L.polyline(polylineData.coordinates, {
          color: polylineData.color || '#C75B39',
          weight: polylineData.weight || 4,
          opacity: 0.85,
          dashArray: '6, 8',
          lineCap: 'round'
        }).addTo(map);
      }

      if (userLoc) {
        var userIcon = L.divIcon({
          className: 'user-marker-wrap',
          html: '<div class="user-dot"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        L.marker([userLoc.latitude, userLoc.longitude], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup('<b>You are here</b>');
        if (userLoc.accuracy && userLoc.accuracy > 0) {
          L.circle([userLoc.latitude, userLoc.longitude], {
            radius: userLoc.accuracy,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.12,
            weight: 1
          }).addTo(map);
        }
        bounds.push([userLoc.latitude, userLoc.longitude]);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], userLoc ? 14 : 12);
      }

      // Listen for "centerOn" messages coming from React Native side
      document.addEventListener('message', function (e) {
        try {
          var data = JSON.parse(e.data);
          if (data && data.type === 'centerOn' && typeof data.lat === 'number') {
            map.setView([data.lat, data.lng], data.zoom || 14, { animate: true });
          }
        } catch (e) {}
      });
      window.addEventListener('message', function (e) {
        try {
          var data = JSON.parse(e.data);
          if (data && data.type === 'centerOn' && typeof data.lat === 'number') {
            map.setView([data.lat, data.lng], data.zoom || 14, { animate: true });
          }
        } catch (e) {}
      });

      send({ type: 'ready' });
    })();
  </script>
</body>
</html>`;
};

export interface OSMMapHandle {
  centerOn: (lat: number, lng: number, zoom?: number) => void;
}

const OSMMapView = React.forwardRef<OSMMapHandle, Props>(function OSMMapView(
  { markers, polyline, initialRegion, userLocation, onMarkerPress, style },
  forwardedRef
) {
  const ref = useRef<WebView>(null);
  const region = {
    latitude: initialRegion?.latitude ?? TUNISIA_CENTER.latitude,
    longitude: initialRegion?.longitude ?? TUNISIA_CENTER.longitude,
    zoom: initialRegion?.zoom ?? TUNISIA_CENTER.zoom,
  };

  React.useImperativeHandle(forwardedRef, () => ({
    centerOn: (lat: number, lng: number, zoom = 14) => {
      const payload = JSON.stringify({ type: 'centerOn', lat, lng, zoom });
      ref.current?.injectJavaScript(
        `window.postMessage(${JSON.stringify(payload)}, '*'); true;`
      );
    },
  }));

  const html = useMemo(
    () => buildHtml(markers, region, polyline, userLocation),
    [
      markers,
      polyline,
      userLocation?.latitude,
      userLocation?.longitude,
      userLocation?.accuracy,
      region.latitude,
      region.longitude,
      region.zoom,
    ]
  );

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'marker' && msg.id && onMarkerPress) {
        onMarkerPress(msg.id);
      }
    } catch {}
  };

  // On web, react-native-webview renders an iframe — works fine for our needs.
  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        // iOS scroll bounce off so the map gestures feel native
        bounces={false}
        scrollEnabled={false}
        // Allow Leaflet CDN and OSM tiles
        mixedContentMode={Platform.OS === 'android' ? 'always' : undefined}
      />
    </View>
  );
});

export default OSMMapView;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f0f4' },
  web: { flex: 1, backgroundColor: 'transparent' },
});
