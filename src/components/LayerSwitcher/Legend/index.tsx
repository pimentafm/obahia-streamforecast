import React, { useState, useEffect } from 'react';
import ReactHtmlParser from 'react-html-parser';

import { wms } from '../../../services';

import { Container } from './styles';

import { useTranslation } from 'react-i18next';

interface LegendProps {
  mapfile: string;
  name: string;
  isvisible: boolean;
}

const Legend: React.FC<LegendProps> = ({ mapfile, name, isvisible }) => {
  const { t } = useTranslation();

  const [legendHTML, setlegendHTML] = useState([]);

  useEffect(() => {
    wms
      .get(`${mapfile}.map&mode=legend&layer=${name}`, {
        responseType: 'text',
      })
      .then(res => {
        let html = res.data;

        html = html
          .replace('Com previsão', t('label_withforecast'))
          .replace('Sem previsão', t('label_withoutforecast'));

        html = ReactHtmlParser(html);

        setlegendHTML(html);
      });
  }, [mapfile, name, t]);
  return (
    <Container id="layerswitcher" isvisible={isvisible}>
      {legendHTML}
    </Container>
  );
};

export default Legend;
