$(function() {
  proj4.defs("EPSG:28405","+proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=5500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22vv +units=m +no_defs");
  proj4.defs("EPSG:28406","+proj=tmerc +lat_0=0 +lon_0=33 +k=1 +x_0=6500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs");
  proj4.defs("EPSG:28407","+proj=tmerc +lat_0=0 +lon_0=39 +k=1 +x_0=7500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs");

  class MapFront {
    constructor(config) {
      this.layers = config.layers.map(layer => new ol.layer.Tile(layer));
      this.center = config.center;
      this.defaultZoom = config.zoom;

      this.init();
    }

    init() {
      this.map = new ol.Map({
        target: 'map',
        layers: this.layers,
        controls: [
          new ol.control.FullScreen({
            tipLabel: "На веcь екран"
          }),
          new ol.control.Zoom({
            zoomInTipLabel: "Більше",
            zoomOutTipLabel: "Меньше"
          }),
          new ol.control.ScaleLine(),
        ],
        view: new ol.View({
          center: ol.proj.transform(this.center, 'EPSG:4326', 'EPSG:3857'),
          zoom: this.defaultZoom
        })
      });


      $('.ol-zoom-in, .ol-zoom-out').tooltip({
        placement: 'right',
        container: '#map',
      });

      return this.map;
    }

    getProjectionForCK42(coords) {
      if (coords[0] <= 30.01) {
        return 'EPSG:28405'
      }

      if (coords[0] > 30.01 && coords[0] <= 36.0) {
        return 'EPSG:28406'
      }

      if (coords[0] > 36.0) {
        return 'EPSG:28407'
      }
    }

    mapToWgs84(coords) {
      const projection = this.map.getView().getProjection().et;
      return ol.proj.getTransform(projection, 'EPSG:4326')(coords)
    }

    mapToCK42(coords) {
      const coordsWgs84 = this.mapToWgs84(coords);
      const projectionTo = this.getProjectionForCK42(coordsWgs84);
      return proj4('EPSG:4326', projectionTo).forward(coordsWgs84);
    }

    addControl(elem) {
      this.map.addControl(
        new ol.control.Control({
          element: elem
        })
      );
    }

    onMouseMove(callback) {
      this.map.on('pointermove', callback);
    }

    onClick(callback) {
      this.map.on('singleclick', callback);
    }

    onMoveEnd(callback) {
      this.map.on('moveend', callback);
    }

    onMoveStart(callback) {
      this.map.on('movestart', callback);
    }

    setLayer(index) {
      _.forEach(this.layers, function(layer) { layer.setVisible(false); });
      this.layers[index].setVisible(true);
    }

    createMarker(el, coords) {
      const marker = new ol.Overlay({
        element: el,
        position: coords,
        positioning: 'center-center',
        offset: [0,0],
      });
      this.map.addOverlay(marker);

      return marker;
    }

    removeMarker(marker) {
      this.map.removeOverlay(marker);
    }
  }

  class MapControls {
    constructor(mapFront, markers, config) {
      this.mapFront = mapFront;
      this.markers = markers;

      this.render();
    }

    __getLayerDisplayName(layer) {
      return layer.A.displayName;
    }

    render() {
      const controlsBar = $('.controls-bar');
      controlsBar.append(`
        <div class="ctrl btn-group layers-control" id="change-layer" data-toggle="buttons">
        </div>

        <div class="ctrl btn-group layers-control">
          <button type="button" id="show" class="btn btn-primary btn-sm">Показати</button>
          <button type="button" id="hide" class="btn btn-primary btn-sm">Приховати</button>
          <button type="button" id="clear" class="btn btn-primary btn-sm">Видалити</button>
        </div>

        <div>
          <div class="input-group input-group-sm mb-3 positions sk-42">
            <span class="input-group-text">CK42 lon</span>
            <input type="text" class="form-control" id="lonArmy" placeholder="0кв 0м">
          </div>

          <div class="input-group input-group-sm mb-3 positions sk-42">
            <span class="input-group-text">CK42 lat</span>
            <input type="text" class="form-control" id="latArmy" placeholder="0кв 0м">
          </div>

          <div class="input-group input-group-sm mb-3 positions">
            <span class="input-group-text">Lon</span>
            <input type="text" class="form-control" id="lon" placeholder="lon">
          </div>

          <div class="input-group input-group-sm mb-3 positions">
            <span class="input-group-text">Lat</span>
            <input type="text" class="form-control" id="lat" placeholder="lat">
          </div>
        </div>

        <div class="ctrl btn-group marker-color-control" id="change-marker-color" data-toggle="buttons">
        </div>
      `);

      _.forEach(this.markers.colors, (markerColor, index) => {
        let checked = '';
        if (markerColor.selected) {
          checked = 'checked'
        }
        $('.marker-color-control#change-marker-color').append(`
          <label class="btn btn-primary change-marker-color btn-sm">
            <input type="radio" name="marker-colors" id="${index}" ${checked}> ${markerColor.displayName}
          </label>
        `)
      });

      _.forEach(this.mapFront.layers, (layer, index) => {
        let checked = '';
        if (layer.getVisible()) {
          checked = 'checked'
        }
        $('.layers-control#change-layer').append(`
          <label class="btn btn-primary change-layer btn-sm">
            <input type="radio" name="layers" id="${index}" ${checked}> ${this.__getLayerDisplayName(layer)}
          </label>
        `)
      });

      this.mapFront.addControl(controlsBar[0]);
      this.addEvents();
    }

    addEvents() {
      $('.layers-control#change-layer label').on('click', this.changeLayer.bind(this));
      $('.marker-color-control#change-marker-color label').on('click', this.changeMarkerColor.bind(this));
      $('.ctrl #clear').on('click', this.clearAllMarkers.bind(this));
      $('.ctrl #show').on('click', this.showAllMarkers);
      $('.ctrl #hide').on('click', this.hideAllMarkers.bind(this));

      this.mapFront.onMouseMove(this.renderCoords.bind(this));
    }

    hideAllMarkers() {
      this.markers.hideAllPopovers(true);
    }

    clearAllMarkers() {
      if (confirm("Ви впевненні?!")) {
        this.markers.removeAllMarkers();
        return true;
      } else {
        return false;
      }
    }

    changeMarkerColor(event) {
      const elem = $(event.currentTarget);
      const markerColorIndex = parseInt(elem.find('input').attr('id'))
      this.markers.setColor(markerColorIndex);
    }

    changeLayer(event) {
      const elem = $(event.currentTarget);
      const layerId = parseInt(elem.find('input').attr('id'))
      this.mapFront.setLayer(layerId);
    }

    renderCoords(event) {
      const coords = event.coordinate;

      const coordsWgs84 = this.mapFront.mapToWgs84(coords);
      const coordsCK42 = this.mapFront.mapToCK42(coords);

      this.renderWgs84(coordsWgs84);
      this.renderCK42(coordsCK42);
    }

    renderWgs84(coords) {
      $('#lon').val(coords[0]);
      $('#lat').val(coords[1]);
    }

    prepareCK42(coords) {
      coords = _.map(coords, function(val) { return val.toFixed().substring(2,7) });
      coords = _.map(coords, function(val) { return val.substring(0,2) + 'кв ' + val.substring(2,5) + 'м' });

      return coords;
    }

    renderCK42(coords) {
      coords = this.prepareCK42(coords);

      $('#lonArmy').val(coords[0]);
      $('#latArmy').val(coords[1]);
    }
  }


  class Markers {
    LOCAL_STORAGE_KEY = 'maps-markers';

    constructor(mapFront, config) {
      this.markers = [];

      this.mapFront = mapFront;
      this.colors = config.markersColors;
      this.selectedColor = this.colors.find(markerColor => markerColor.selected);

      this.addEvents();
      this.render();

      const markers = this.getFromLocalStorage();
      _.forEach(markers, (marker) => {
        this.createMarker(marker);
      });
    }

    render() {
      $('body').append(`
        <div style="display: none;">
          <div id="marker" class="marker" title="Marker"></div>
        </div>
      `)
    }

    addEvents() {
      this.mapFront.onClick(this.addMarkerAfterClick.bind(this));
      this.mapFront.onMoveEnd(this.showAllPopovers.bind(this));
      this.mapFront.onMoveStart(this.hideAllPopovers.bind(this));


      $('body').on('click', '.popover-header', this.popoverHeaderClick.bind(this));
      $('body').on('click', '.popover-content', this.popoverHeaderClick.bind(this));


      $('body').on('click', '.popover-controls .cancel', ((e) => {
        const marker = this.getMarkerByPopoverEvent(e);
        this.setNoneEditMode(marker);
      }).bind(this));

      $('body').on('click', '.popover-controls .save', ((e) => {
        const marker = this.getMarkerByPopoverEvent(e);
        this.saveMarkerPopover(marker);
        this.addPopover(marker, true);
        this.setNoneEditMode(marker);
      }).bind(this));


      $('body').on('click', '.popover-controls .hide-popover', ((e) => {
        const marker = this.getMarkerByPopoverEvent(e);
        this.hidePopover(marker);
      }).bind(this));

      $('body').on('click', '.popover-controls .remove-marker', ((e) => {
        const marker = this.getMarkerByPopoverEvent(e);
        this.removeMarker(marker);
        this.disposePopover(marker);
      }).bind(this));

      $('body').on('click', '.popover-controls .edit-popover', ((e) => {
        const marker = this.getMarkerByPopoverEvent(e);
        this.setEditMode(marker);
      }).bind(this));
    }

    saveMarkerPopover(marker) {
      const popoverContent = $(`#${marker.id}.popover-content`);
      const popoverEl = popoverContent.parents('.popover');

      const title = popoverEl.find('.popover-header input').val();
      const content = popoverEl.find('.popover-content-top textarea').val();

      marker.title = title;
      marker.content = content;

      this.saveToLocalStorage();
    }

    setEditMode(marker) {
      marker.isEditMode = true;

      const popoverContent = $(`#${marker.id}.popover-content`);
      const popoverEl = popoverContent.parents('.popover');

      popoverEl.find('.popover-content-top').html(`<textarea>${marker.content || ''}</textarea>`);
      popoverEl.find('.popover-header').html(`<input type='text' value='${marker.title || ''}'>`);

      popoverEl.find('.edit-mode').show();
      popoverEl.find('.non-edit-mode').hide();
    }

    setNoneEditMode(marker) {
      marker.isEditMode = false;

      const popoverContent = $(`#${marker.id}.popover-content`);
      const popoverEl = popoverContent.parents('.popover');

      popoverEl.find('.popover-content-top').html(`${marker.content || 'Ввeдіть контент'}`);
      popoverEl.find('.popover-header').html(`${marker.title || 'Ввeдіть тайтл'}`);

      popoverEl.find('.edit-mode').hide();
      popoverEl.find('.non-edit-mode').show();
    }

    getMarkerByPopoverEvent(e) {
      const markerId = $(e.currentTarget).parents('.popover').find('.popover-id').attr('id');
      const marker = _.find(this.markers, marker => marker.id == markerId);

      return marker;
    }

    popoverHeaderClick(e) {
      const marker = this.getMarkerByPopoverEvent(e);

      if (!marker.isEditMode) {
        this.hidePopover(marker);
        this.showPopover(marker);
      }
    }

    hideAllPopovers(stateChange = false) {
      if (!_.isBoolean(stateChange) && stateChange) {
        stateChange = false;
      }
      _.forEach(this.markers, (marker) => {
        if (marker.isPopoverShowed) {
          this.hidePopover(marker, stateChange);
        }
      });
    }

    showAllPopovers() {
      _.forEach(this.markers, (marker) => {
        if (marker.isPopoverShowed) {
          this.showPopover(marker);
        }
      });
    }

    addMarkerAfterClick(event) {
      const coords = event.coordinate;
      this.createMarker({ coords, colorId: this.selectedColor.id });
    }

    showMarker(coords, colorId) {
      const jEl = $('#marker').clone().removeAttr('id');
      let color = this.selectedColor;

      if (colorId) {
        color = _.find(this.colors, c => c.id == colorId);
      }

      jEl.addClass(color.colorClass);

      const el = jEl[0];
      const markerMap = this.mapFront.createMarker(el, coords);

      return markerMap;
    }

    createMarker(options, isSaved) {
      const markerMap = this.showMarker(options.coords, options.colorId);
      const marker = {
        id: uuid.v4(),
        coords: options.coords,
        colorId: options.colorId,
        title: options.title,
        content: options.content,
        markerMap,
      };

      this.markers.push(marker);
      this.addPopover(marker);

      if (!isSaved) {
        this.saveToLocalStorage();
      }
    }

    prepareCK42(coords) {
      coords = _.map(coords, function(val) { return val.toFixed().substring(2,7) });
      coords = _.map(coords, function(val) { return val.substring(0,2) + 'кв ' + val.substring(2,5) + 'м' });

      return coords;
    }

    addPopover(marker, isShowImmediately) {
      const markerMapElement = marker.markerMap.getElement();

      const coordsWgs84 = this.mapFront.mapToWgs84(marker.coords);
      let coordsCK42 = this.mapFront.mapToCK42(marker.coords);
      coordsCK42 = this.prepareCK42(coordsCK42);

      const content = `
        <div id='${marker.id}' class='popover-id popover-content'>
          <div class='popover-content-top'>
            ${marker.content || 'Ввeдіть контент'}
          </div>
          <div class='popover-content-bottom'>
            <hr>
            <b> ${coordsCK42[0]} : ${coordsCK42[1]} </b>
            <br/>
            <b> ${coordsWgs84[0].toString().substring(0, 8)} : ${coordsWgs84[1].toString().substring(0, 8)} </b>
            <br/>
          </div>

        </div>
        <div class='popover-controls'>
          <div class='non-edit-mode'>
            <a class='remove-marker'> Видалити </a>
            <a class='hide-popover'> Приховати </a>
            <a class='edit-popover'> Редагувати </a>
          </div>
          <div class='edit-mode'>
            <a class='save'> Зберегти </a>
            <a class='cancel'> Відмінити </a>
          </div>
        </div>
      `;

      this.disposePopover(marker);

      $(markerMapElement).popover({
        container: '#map',
        placement: 'auto',
        animation: false,
        html: true,
        trigger: 'manual',
        content: content,
      });

      if (isShowImmediately) {
        this.showPopover(marker);
      }

      $(markerMapElement).attr('data-bs-original-title', marker.title || 'Ввeдіть тайтл');
      $(markerMapElement).on('click', (function(e) {
        this.showPopover(marker);
      }).bind(this));
    }

    showPopover(marker) {
      $(marker.markerMap.getElement()).popover('show');
      marker.isPopoverShowed = true;
    }

    disposePopover(marker) {
      $(marker.markerMap.getElement()).popover('dispose');
      marker.isPopoverShowed = false;
    }

    hidePopover(marker, changeState = true) {
      $(marker.markerMap.getElement()).popover('hide');
      if (changeState) {
        marker.isPopoverShowed = false;
      }
    }

    updatePopover(marker) {
      $(marker.markerMap.getElement()).popover('update');
    }

    removeMarker(marker) {
      this.mapFront.removeMarker(marker.markerMap);

      _.remove(this.markers, m => m === marker);

      this.saveToLocalStorage();
    }

    saveToLocalStorage() {
      const markersForSave = _.map(this.markers, (marker) => {
        return {
          id: marker.id,
          coords: marker.coords,
          colorId: marker.colorId,
          title: marker.title,
          content: marker.content,
        }
      });
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(markersForSave));
    }

    getFromLocalStorage() {
      let markers = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (markers) {
        markers = JSON.parse(markers);
      }

      return markers || [];
    }

    removeAllMarkers() {
      _.forEach(this.markers, (marker) => {
        this.disposePopover(marker);
        this.mapFront.removeMarker(marker.markerMap);
      });
      this.markers = [];
      this.saveToLocalStorage();
    }

    setColor(index) {
      _.forEach(this.colors, color => color.selected = false);
      this.colors[index].selected = true;
      this.selectedColor = this.colors[index];
    }
  }

  const mapFront = new MapFront(config);

  const markers = new Markers(mapFront, config);
  new MapControls(mapFront, markers, config);
});
