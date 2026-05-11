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

interface Props {
  markers: OSMMarker[];
  polyline?: OSMPolyline;
  /** Initial center if there are no markers */
  initialRegion?: { latitude: number; longitude: number; zoom?: number };
  onMarkerPress?: (id: string) => void;
  style?: any;
}

const TUNISIA_CENTER = { latitude: 34.0, longitude: 9.0, zoom: 6 };

const buildHtml = (
  markers: OSMMarker[],
  region: { latitude: number; longitude: number; zoom: number },
  polyline?: OSMPolyline
) => {
  // Escape the JSON safely for embedding in <script>
  const markersJson = JSON.stringify(markers).replace(/</g, '\\u003c');
  const polylineJson = JSON.stringify(polyline || null).replace(/</g, '\\u003c');
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

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      }

      send({ type: 'ready' });
    })();
  </script>
</body>
</html>`;
};

export default function OSMMapView({
  markers,
  polyline,
  initialRegion,
  onMarkerPress,
  style,
}: Props) {
  const ref = useRef<WebView>(null);
  const region = {
    latitude: initialRegion?.latitude ?? TUNISIA_CENTER.latitude,
    longitude: initialRegion?.longitude ?? TUNISIA_CENTER.longitude,
    zoom: initialRegion?.zoom ?? TUNISIA_CENTER.zoom,
  };

  const html = useMemo(
    () => buildHtml(markers, region, polyline),
    [markers, polyline, region.latitude, region.longitude, region.zoom]
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f0f4' },
  web: { flex: 1, backgroundColor: 'transparent' },
});
