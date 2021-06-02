import React, { useState, useCallback, useEffect } from 'react';
import { format, getYear, isAfter, isBefore } from 'date-fns';

import OlMap from 'ol/Map';
import TileWMS from 'ol/source/TileWMS';
import axios from 'axios';

import Overlay from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';

import { createStringXY } from 'ol/coordinate';

import { FiXCircle } from 'react-icons/fi';

import { Container } from './styles';

import { useTranslation } from 'react-i18next';
import { FaCircle } from 'react-icons/fa';

interface PopupProps {
  map: OlMap;
  source: Array<TileWMS>;
}

const Popup: React.FC<PopupProps> = ({ map, source }) => {
  const { t } = useTranslation();

  const [popcoords, setPopCoords] = useState<string>();
  const [stations, setStations] = useState<string[]>();

  const [forecastDate, setForecastDate] = useState(new Date(Date.now()));

  const closePopUp = useCallback(() => {
    setStations(undefined);

    const element: HTMLElement = document.getElementById(
      'popup-class',
    ) as HTMLElement;

    element.style.display = 'none';
  }, []);

  const getStationStatus = useCallback(
    (qsup, qmin) => {
      if (qmin === 0) {
        return t('label_withoutforecast');
      }

      if (qsup <= 0.7 * qmin) {
        return (
          <>
            <FaCircle color="#00B157" />
            <span> {qmin} m³/s</span>
          </>
        );
      } else if (0.7 * qmin < qsup && qsup <= qmin) {
        return (
          <>
            <FaCircle color="#FFBE2C" />
            <span> {qmin} m³/s</span>
          </>
        );
      } else {
        return (
          <>
            <FaCircle color="#ff0004" />
            <span> {qmin} m³/s</span>
          </>
        );
      }
    },
    [t],
  );

  useEffect(() => {
    const currentDate = new Date(Date.now());
    if (
      isAfter(currentDate, new Date(getYear(currentDate), 5, 1)) &&
      isBefore(currentDate, new Date(getYear(currentDate), 6, 1))
    ) {
      setForecastDate(new Date(getYear(currentDate), 5, 1));
    } else if (
      isAfter(currentDate, new Date(getYear(currentDate), 6, 1)) &&
      isBefore(currentDate, new Date(getYear(currentDate), 7, 1))
    ) {
      setForecastDate(new Date(getYear(currentDate), 5, 1));
    } else {
      setForecastDate(new Date(getYear(currentDate), 7, 1));
    }

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

          axios.get(url).then(response => {
            let data = response.data;

            data = data.split('|');

            setStations(data);
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
            <span
              style={{ fontWeight: 600, color: '#ffffff', paddingLeft: '5px' }}
            >
              {t('popup_window_title')}
            </span>
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

        <tr
          style={{
            background: '#fff',
          }}
        >
          <td style={{ fontWeight: 600, padding: `2px 5px` }}>
            {t('popup_info')}
          </td>
          <td id="popup-value" style={{ padding: `2px 5px` }}></td>
        </tr>

        <tr
          style={{
            background: '#fff',
          }}
        >
          <td style={{ padding: `2px 5px` }}>{t('popup_station')}</td>
          <td id="popup-value" style={{ padding: `2px 5px` }}>
            {stations ? stations[0] : t('popup_clickout')}
          </td>
        </tr>

        <tr
          style={{
            background: '#fff',
          }}
        >
          <td style={{ padding: `2px 5px` }}>{t('popup_location')}</td>
          <td id="popup-value" style={{ padding: `2px 5px` }}>
            {stations ? stations[1] : t('popup_clickout')}
          </td>
        </tr>

        <tr
          style={{
            background: '#fff',
          }}
        >
          <td style={{ padding: `2px 5px` }}>{t('popup_qsup')} (Qsup)</td>
          <td id="popup-value" style={{ padding: `2px 5px` }}>
            {stations ? `${stations[2]}  m³/s` : t('popup_clickout')}
          </td>
        </tr>

        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px`, borderRadius: `0px 0px 0px 2px` }}>
            LON, LAT
          </td>
          <td
            id="popup-coords"
            style={{ padding: `2px 5px`, borderRadius: `0px 0px 2px 0px` }}
          >
            {popcoords ? popcoords : t('popup_clickout')}
          </td>
        </tr>

        <tr
          style={{
            background: '#fff',
          }}
        >
          <td style={{ fontWeight: 600, padding: `2px 5px` }}>
            {t('popup_qmin')}
          </td>
          <td id="popup-value" style={{ padding: `2px 5px` }}></td>
        </tr>

        <tr
          style={{
            background: '#fff',
          }}
        >
          <td style={{ padding: `2px 5px` }}>
            {t('popup_forecast')} {format(forecastDate, 'dd/MM/yyyy')} (Qmin)
          </td>
          <td id="popup-value" style={{ padding: `2px 5px` }}>
            {stations
              ? getStationStatus(Number(stations[2]), Number(stations[3]))
              : t('popup_clickout')}
          </td>
        </tr>

        <tr
          style={{
            background: '#fff',
          }}
        >
          <td style={{ fontWeight: 600, padding: `2px 5px` }}>
            {t('popup_status')}
          </td>
          <td id="popup-value" style={{ padding: `2px 5px` }}></td>
        </tr>

        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px`, borderRadius: `0px 0px 0px 2px` }}>
            <FaCircle color="#00B157" /> {t('popup_status_low')}
          </td>
          <td
            id="popup-coords"
            style={{ padding: `2px 5px`, borderRadius: `0px 0px 2px 0px` }}
          >
            Qsup &le; 0.7Qmin
          </td>
        </tr>

        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px`, borderRadius: `0px 0px 0px 2px` }}>
            <FaCircle color="#FFBE2C" /> {t('popup_status_moderate')}
          </td>
          <td
            id="popup-coords"
            style={{ padding: `2px 5px`, borderRadius: `0px 0px 2px 0px` }}
          >
            0.7Qmin &lt; Qsup &le; Qmin
          </td>
        </tr>

        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px`, borderRadius: `0px 0px 0px 2px` }}>
            <FaCircle color="#ff0004" /> {t('popup_status_high')}
          </td>
          <td
            id="popup-coords"
            style={{ padding: `2px 5px`, borderRadius: `0px 0px 2px 0px` }}
          >
            Qsup &ge; Qmin
          </td>
        </tr>
      </tbody>
    </Container>
  );
};

export default Popup;
