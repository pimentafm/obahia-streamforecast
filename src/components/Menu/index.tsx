import React, { useState, useEffect, useCallback } from 'react';

import MathJax from 'react-mathjax2';

import HtmlParser from 'react-html-parser';

import { Modal, Popover, Button } from 'antd';

import OlMap from 'ol/Map';

import 'antd/dist/antd.css';
import { FiMenu } from 'react-icons/fi';
import { FaInfoCircle } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';

import ChangeLanguage from './ChangeLanguage';

import ToolsMenu from './ToolsMenu';
import ZoomControl from './ZoomControl';
import Scalebar from './ScaleBar';

import StaticLayerSwitcher from '../StaticLayerSwitcher';
import LayerSwitcher from '../LayerSwitcher';

import { Container, Header, Footer, Content } from './styles';

import { useTranslation } from 'react-i18next';

interface MenuProps {
  ishidden: number;
  map: OlMap;
}

const Menu: React.FC<MenuProps> = ({ ishidden, map, ...rest }) => {
  const { t } = useTranslation();
  document.title = t('appname');

  const tex = `
    \\begin{equation}
      Q = Q_0 e^{\\alpha (t-t_0)}
      \\label{eq:sample}
    \\end{equation}`;

  const [hidden, setHidden] = useState(ishidden);
  const [termsOfUseModal, setTermsOfUseModal] = useState<boolean>(false);
  const [metadataModal, setMetadataModal] = useState<boolean>(false);

  const [downloadURL, setDownloadURL] = useState('');

  const termsOfUse = HtmlParser(
    `<span style="color: #1f5582; font-weight: 600; font-size: 16px;">OBahia</span><span> ${t(
      'modal_terms_title',
    )}</span>`,
  );

  const additionalInformation = HtmlParser(
    `<span style="color: #1f5582; font-weight: 600; font-size: 16px;">OBahia</span><span> ${t(
      'modal_info_title',
    )}</span>`,
  );

  const showTermsOfUseModal = () => {
    setTermsOfUseModal(true);
  };

  const showMetadataModal = () => {
    setMetadataModal(true);
  };

  const handleOk = () => {
    setTermsOfUseModal(false);
    setMetadataModal(false);
  };

  const handleCancel = () => {
    setTermsOfUseModal(false);
    setMetadataModal(false);
  };

  const handleMenu = useCallback(() => {
    if (hidden === 0) {
      setHidden(1);
    } else {
      setHidden(0);
    }
  }, [hidden]);

  const handleLayerVisibility = useCallback(
    (e, id) => {
      const lyr_name = id;

      map.getLayers().forEach(lyr => {
        if (lyr.get('name') === lyr_name) {
          lyr.setVisible(e);
        }
      });
    },
    [map],
  );

  const handleLayerOpacity = useCallback(
    (opacity, lyr_name) => {
      map.getLayers().forEach(lyr => {
        if (lyr.get('name') === lyr_name) {
          lyr.setOpacity(opacity);
        }
      });
    },
    [map],
  );

  useEffect(() => {
    setDownloadURL(`ftp://obahia.dea.ufv.br/modflow/shapefiles/`);
  }, []);

  return (
    <Container id="menu" ishidden={hidden}>
      <ChangeLanguage ishidden={hidden} />
      <ToolsMenu ishidden={hidden} />
      <ZoomControl ishidden={hidden} map={map} />
      <Scalebar id="scalebar" map={map} />

      <Header ishidden={hidden}>
        <a href="http://obahia.dea.ufv.br">
          <img
            src="http://obahia.dea.ufv.br/static/geonode/img/logo.png"
            alt="Obahia"
          />
        </a>

        <Popover placement="right" content={t('tooltip_menu')}>
          <FiMenu
            id="handleMenu"
            type="menu"
            className="nav_icon"
            style={{ fontSize: '20px', color: '#000' }}
            onClick={handleMenu}
          />
        </Popover>
      </Header>

      <Content>
        <div className="card-menu">
          <span>{t('appname')}</span>
        </div>

        <div className="static-layers">
          <span className="span-text">
            <label>{t('description_title')}</label> {t('description_start')}
            <Popover
              placement="right"
              content="MODFLOW 2005: USGS Three-Dimensional Finite-Difference Ground-Water Model"
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.ana.gov.br/"
              >
                ANA
              </a>
            </Popover>
            {t('description_end')}{' '}
            <FaInfoCircle
              className="text-icon"
              style={{ fontSize: '12px', color: '#1f5582', cursor: 'pointer' }}
              onClick={showMetadataModal}
            />
            . {t('description_terms')}{' '}
            <GoAlert
              className="text-icon"
              style={{ fontSize: '12px', color: '#1f5582', cursor: 'pointer' }}
              onClick={showTermsOfUseModal}
            />
            .
          </span>
        </div>

        <LayerSwitcher
          mapfile="telemetryStations"
          name="stations"
          label={t('label_stations')}
          handleLayerOpacity={handleLayerOpacity}
          handleLayerVisibility={handleLayerVisibility}
          layerIsVisible={true}
          legendIsVisible={true}
          layerInfoIsVisible={false}
          switchColor="#1f5582"
          downloadURL={downloadURL + ''}
        />

        <div className="static-layers">
          <StaticLayerSwitcher
            name="hidrography"
            label={t('label_hidrography')}
            handleLayerVisibility={handleLayerVisibility}
            layerIsVisible={true}
            legendIsVisible={false}
            layerInfoIsVisible={false}
            switchColor="#0000ff"
          />
          <StaticLayerSwitcher
            name="highways"
            label={t('label_highways')}
            handleLayerVisibility={handleLayerVisibility}
            layerIsVisible={false}
            legendIsVisible={false}
            layerInfoIsVisible={false}
            switchColor="#800000"
          />

          <StaticLayerSwitcher
            name="counties"
            label={t('label_counties')}
            handleLayerVisibility={handleLayerVisibility}
            layerIsVisible={false}
            legendIsVisible={false}
            layerInfoIsVisible={false}
            switchColor="#696969"
          />

          <StaticLayerSwitcher
            name="watersheds"
            label={t('label_watersheds')}
            handleLayerVisibility={handleLayerVisibility}
            layerIsVisible={true}
            legendIsVisible={false}
            layerInfoIsVisible={false}
            switchColor="#000000"
          />
        </div>
        <div className="final-space"></div>
      </Content>

      <Footer ishidden={hidden}>
        <Popover placement="right" content={t('tooltip_terms')}>
          <GoAlert
            className="footer_icon"
            style={{ fontSize: '20px', color: '#fff', cursor: 'pointer' }}
            onClick={showTermsOfUseModal}
          />
        </Popover>
        <Popover placement="right" content={t('tooltip_info')}>
          <FaInfoCircle
            className="footer_icon"
            style={{ fontSize: '20px', color: '#fff', cursor: 'pointer' }}
            onClick={showMetadataModal}
          />
        </Popover>
      </Footer>

      <Modal
        title={termsOfUse}
        style={{ top: 20 }}
        visible={termsOfUseModal}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            style={{
              background: '#1f5582',
              color: '#fff',
              borderColor: '#fff',
            }}
            onClick={handleOk}
          >
            Continue
          </Button>,
        ]}
      >
        <p style={{ textAlign: 'justify' }}>{t('terms_of_use')}</p>
      </Modal>

      <MathJax.Context
        input="tex"
        options={{
          TeX: { equationNumbers: { autoNumber: 'AMS' } },
        }}
      >
        <Modal
          title={additionalInformation}
          width={800}
          style={{ top: 20 }}
          visible={metadataModal}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button
              key="submit"
              style={{
                background: '#1f5582',
                color: '#fff',
                borderColor: '#fff',
              }}
              onClick={handleOk}
            >
              Continue
            </Button>,
          ]}
        >
          <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph01')}</p>
          <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph02')}</p>
          <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph03')}</p>

          {<MathJax.Node>{tex}</MathJax.Node>}

          <p style={{ textAlign: 'justify' }}>
            {HtmlParser(t('modal_info_paraghaph04'))}
          </p>
          <p style={{ textAlign: 'justify' }}>
            {HtmlParser(t('modal_info_paraghaph05'))}
          </p>
          <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph06')}</p>
          <p style={{ textAlign: 'justify' }}>
            {HtmlParser(t('modal_info_paraghaph07'))}
          </p>

          <p>
            <li>{HtmlParser(t('modal_info_li01'))}</li>
            <li>{HtmlParser(t('modal_info_li02'))}</li>
            <li>{HtmlParser(t('modal_info_li03'))}</li>
          </p>

          <p style={{ textAlign: 'justify' }}>
            {HtmlParser(t('modal_info_paraghaph08'))}
          </p>
        </Modal>
      </MathJax.Context>
    </Container>
  );
};

export default Menu;
