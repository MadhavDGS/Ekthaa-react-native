import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapView, Marker, isMapSupported } from './MapViewWrapper';

interface MapComponentProps {
    latitude: number;
    longitude: number;
    editable?: boolean;
    onLocationChange?: (latitude: number, longitude: number) => void;
    style?: any;
}

/**
 * Hybrid Map Component
 * - iOS: Uses native MapView (Apple Maps)
 * - Android/Web: Uses OpenStreetMap via WebView
 */
export default function MapComponent({
    latitude,
    longitude,
    editable = false,
    onLocationChange,
    style
}: MapComponentProps) {

    if (Platform.OS === 'ios') {
        // iOS: Use native MapView
        return (
            <MapView
                style={style || styles.map}
                region={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
                scrollEnabled={editable}
                zoomEnabled={editable}
                onPress={editable ? (e) => {
                    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
                    onLocationChange?.(lat, lng);
                } : undefined}
            >
                <Marker coordinate={{ latitude, longitude }} />
            </MapView>
        );
    }

    // Android: Use OpenStreetMap via WebView
    if (Platform.OS === 'android') {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map').setView([${latitude}, ${longitude}], 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        var marker = L.marker([${latitude}, ${longitude}]).addTo(map);
        
        ${editable ? `
        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify({
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            }));
        });
        ` : ''}
    </script>
</body>
</html>
        `;

        return (
            <WebView
                style={style || styles.map}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                scrollEnabled={false}
                {...(editable && {
                    onMessage: (event) => {
                        try {
                            const data = JSON.parse(event.nativeEvent.data);
                            onLocationChange?.(data.latitude, data.longitude);
                        } catch (e) {
                            console.error('Failed to parse location data:', e);
                        }
                    }
                })}
            />
        );
    }

    // Web: Use OpenStreetMap Embed (Leaflet iframe)
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&marker=${latitude},${longitude}`;

    return (
        <iframe
            src={osmUrl}
            style={{
                ...(style || styles.map),
                border: 'none',
                borderRadius: 12,
            }}
            title="Map"
        />
    );
}

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
});
