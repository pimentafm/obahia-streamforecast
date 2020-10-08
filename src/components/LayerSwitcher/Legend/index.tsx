import React, { useState, useEffect } from 'react';
import ReactHtmlParser from 'react-html-parser';

import { wms } from '../../../services';

import { Container } from './styles';

interface LegendProps {
  mapfile: string;
  name: string;
  isvisible: boolean;
}

const Legend: React.FC<LegendProps> = ({ mapfile, name, isvisible }) => {
  const [legendHTML, setlegendHTML] = useState([]);

  useEffect(() => {
    wms
      .get(`${mapfile}.map&mode=legend&layer=${name}`, {
        responseType: 'text',
      })
      .then(res => {
        let html = res.data;

        html = ReactHtmlParser(html);

        setlegendHTML(html);
      });
  }, [mapfile, name]);
  return (
    <Container id="layerswitcher" isvisible={isvisible}>
      {legendHTML}
    </Container>
  );
};

export default Legend;
