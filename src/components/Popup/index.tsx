import React, { useState, useCallback, useEffect } from 'react';

import OlMap from 'ol/Map';
import TileWMS from 'ol/source/TileWMS';
import axios from 'axios';

import Overlay from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';

import { createStringXY } from 'ol/coordinate';

import { FiXCircle } from 'react-icons/fi';

import { Container } from './styles';
import HtmlParser from 'react-html-parser';

import { useTranslation } from 'react-i18next';

interface PopupProps {
  map: OlMap;
  source: Array<TileWMS>;
}

const Popup: React.FC<PopupProps> = ({ map, source }) => {
  const { t } = useTranslation();

  const [popcoords, setPopCoords] = useState<string>();
  const [stations, setStations] = useState<string>();
  const [thickness, setThickness] = useState<string>();
  const [head, setHead] = useState<string>();

  const closePopUp = useCallback(() => {
    setStations(undefined);
    setThickness(undefined);
    setHead(undefined);

    const element: HTMLElement = document.getElementById(
      'popup-class',
    ) as HTMLElement;

    element.style.display = 'none';
  }, []);

  useEffect(() => {
    map.on('pointermove', function (evt) {
      if (evt.dragging) {
        return;
      }

      let hit = map.forEachLayerAtPixel(
        evt.pixel,
        (_, rgba) => {
          return true;
        },
        { layerFilter: layer => layer.getClassName() !== 'ol-layer' },
      );

      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    map.on('singleclick', evt => {
      setStations(undefined);
      setThickness(undefined);
      setHead(undefined);

      let res = map.getView().getResolution();
      let proj = map.getView().getProjection();

      const stringifyFunc = createStringXY(5);

      map.forEachLayerAtPixel(
        evt.pixel,
        (layer, rgba) => {
          let source = layer.getProperties().source;

          let url = source.getFeatureInfoUrl(evt.coordinate, res, proj, {
            INFO_FORMAT: 'text/html',
            VERSION: '1.3.0',
          });

          let layerName = layer.getProperties().name;
          let varName = layerName.split('_')[1];

          // console.log(varName.charAt(0).toUpperCase() + varName.slice(1));

          axios.get(url).then(response => {
            let data = response.data;
            if (varName === 'stations') {
              setStations(data);
            } else if (varName === 'thickness') {
              setThickness(data);
            } else {
              setHead(data);
            }
          });
        },
        { layerFilter: layer => layer.getClassName() !== 'ol-layer' },
      );

      setPopCoords(stringifyFunc(evt.coordinate));

      const element: HTMLElement = document.getElementById(
        'popup-class',
      ) as HTMLElement;

      const popup = new Overlay({
        position: evt.coordinate,
        element: element,
        positioning: OverlayPositioning.BOTTOM_LEFT,
        autoPan: true,
        autoPanAnimation: {
          duration: 500,
        },
      });

      element.style.display = 'unset';

      map.addOverlay(popup);
    });
  }, [map, source]);

  let tableInfoStations = (
    <tr
      style={{
        background: '#fff',
      }}
    >
      <td style={{ padding: `2px 5px` }}>{t('label_stations')}</td>
      <td id="popup-value" style={{ padding: `2px 5px` }}>
        {stations ? HtmlParser(stations) : 'Fora da camada'}
      </td>
    </tr>
  );

  let tableInfoThickness = (
    <tr style={{ background: '#fff' }}>
      <td style={{ padding: `2px 5px` }}>{t('label_thickness')}</td>
      <td id="popup-value" style={{ padding: `2px 5px` }}>
        {thickness ? HtmlParser(thickness) : 'Fora da camada'}
      </td>
    </tr>
  );

  let tableInfoHead = (
    <tr style={{ background: '#fff' }}>
      <td style={{ padding: `2px 5px` }}>{t('label_head')}</td>
      <td id="popup-value" style={{ padding: `2px 5px` }}>
        {head ? HtmlParser(head) : 'Fora da camada'}
      </td>
    </tr>
  );

  return (
    <Container>
      <tbody
        id="popup-class"
        className="popup-class"
        style={{
          boxShadow: `0px 2px 3px rgba(0, 0, 0, 0.13), 1px 2px 2px rgba(0, 0, 0, 0.1),
      -1px -2px 2px rgba(0, 0, 0, 0.05)`,
        }}
      >
        <tr className="table-header">
          <th
            colSpan={2}
            style={{ background: '#1f5582', borderRadius: '2px 2px 0px 0px' }}
          >
            <FiXCircle
              id="close-popup"
              type="close"
              onClick={closePopUp}
              style={{
                display: 'flex',
                color: '#fff',
                fontSize: '25px',
                padding: '2px',
                float: 'right',
                cursor: 'pointer',
              }}
            />
          </th>
        </tr>
        {tableInfoStations && stations ? tableInfoStations : <></>}
        {tableInfoThickness && thickness ? tableInfoThickness : <></>}
        {tableInfoHead && head ? tableInfoHead : <></>}
        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px`, borderRadius: `0px 0px 0px 2px` }}>
            LON, LAT
          </td>
          <td
            id="popup-coords"
            style={{ padding: `2px 5px`, borderRadius: `0px 0px 2px 0px` }}
          >
            {popcoords ? popcoords : 'Clique no mapa'}
          </td>
        </tr>
      </tbody>
    </Container>
  );
};

export default Popup;
