const config = {
  layers: [{
      projection: 'EPSG:3857',
      source: new ol.source.OSM({
        // url: './maps/google/{z}/{x}/{y}.png',
        url: 'https://khms0.googleapis.com/kh?v=917&hl=en-US&x={x}&y={y}&z={z}',
        crossOrigin: null
      }),
      displayName: 'GS',
      visible: false
    },
    {
      projection: 'EPSG:3857',
      source: new ol.source.OSM({
        // url: './maps/openStreetMap/{z}/{x}/{y}.png',

        url: 'http://tile.openstreetmap.org/{z}/{x}/{y}.png',
        crossOrigin: null
      }),
      displayName: 'OSM',
      visible: true,
    }
  ],
  markersColors: [
    {
      id: 'green',
      displayName: 'Зелений',
      colorClass: 'm-green',
      selected: true
    },
    {
      id: 'yellow',
      displayName: 'Жовтий',
      colorClass: 'm-yellow'
    },
    {
      id: 'red',
      displayName: 'Червоний',
      colorClass: 'm-red',
    },
  ],
  center: [30.54, 50.45],
  zoom: 10,
}