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
        // url: './maps/google/{z}/{x}/{y}.png',
        url: 'https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        crossOrigin: null
      }),
      displayName: 'COSM',
      visible: false
    },
    {
      projection: 'EPSG:3857',
      source: new ol.source.OSM({
        // url: './maps/openStreetMap/{z}/{x}/{y}.png',

        url: 'https://b.tile.cyclestreets.net/mapnik/{z}/{x}/{y}.png',
        crossOrigin: null
      }),
      displayName: 'OSM',
      visible: true,
    },
    {
      projection: 'EPSG:3857',
      source: new ol.source.OSM({
        // url: './maps/openStreetMap/{z}/{x}/{y}.png',

        url: 'https://3.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?apiKey=t_kKKAHgEZ-SCa-v08N8xCchEK_wxxp7dFAmEOpi9hs',
        crossOrigin: null
      }),
      displayName: 'HERE',
      visible: false,
    }
  ],
  markersColors: [
    {
      id: 'green',
      displayName: 'Зел',
      colorClass: 'm-green',
      selected: true
    },
    {
      id: 'yellow',
      displayName: 'Жов',
      colorClass: 'm-yellow'
    },
    {
      id: 'red',
      displayName: 'Чер',
      colorClass: 'm-red',
    },
  ],
  center: [30.54, 50.45],
  zoom: 10,
}