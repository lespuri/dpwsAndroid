import GateIMOPage from '../screens/inspecaoGate/GateIMOScreen';
import GateLacresPage from '../screens/inspecaoGate/GateLacresScreen';
import GateDadosPage from '../screens/inspecaoGate/GateDadosScreen';
import GateAvariasPage from '../screens/inspecaoGate/GateAvariasScreen';
import GateReeferPage from '../screens/inspecaoGate/GateReeferScreen';
import GateServicosPage from '../screens/inspecaoGate/GateServicosScreen';
import GateTransferenciaPage from '../screens/inspecaoGate/GateTransferenciaScreen';
import PatioAvariasPage from '../screens/inspecaoPatio/PatioAvariasScreen';
import PatioIMOPage from '../screens/inspecaoPatio/PatioImoScreen';
/*
import PatioAvariasPage from '../pages/inspecao-patio/PatioAvariasPage';
import PatioLacresPage from '../pages/inspecao-patio/PatioLacresPage';
import PatioIMOPage from '../pages/inspecao-patio/PatioIMOPage';
import PatioServicosPage from '../pages/inspecao-patio/PatioServicosPage';
import PatioDadosPage from '../pages/inspecao-patio/PatioDadosPage';
import ServicosExcessoPage from '../pages/servicos/ServicosExcessoPage';
import LacresColocadosPage from '../pages/servicos/LacresColocadosPage';
*/
export const INSPECAO_PAGE_CONFIG = {
  "GateDadosPage": GateDadosPage,
  "GateIMOPage": GateIMOPage,
  "GateLacresPage": GateLacresPage,
  "GateAvariasPage": GateAvariasPage,
  "GateReeferPage": GateReeferPage,
  "GateServicosPage": GateServicosPage,
  "GateTransferenciaPage": GateTransferenciaPage,
  "PatioAvariasPage" : PatioAvariasPage,
  "PatioImoPage" : PatioIMOPage
  /*
  "PatioAvariasPage": PatioAvariasPage,
  "PatioLacresPage": PatioLacresPage,
  "PatioIMOPage": PatioIMOPage,
  "LacresColocadosPage": LacresColocadosPage,
  "PatioServicosPage": PatioServicosPage,
  "PatioDadosPage": PatioDadosPage,
  "ServicosExcessoPage": ServicosExcessoPage
  */
};

export const INSPECAO_CHECKLIST = {
  kdInspecaoGate: {
    menuL: [
      { page: 'GateDados', name: 'Dados do Gate' },
      { page: 'GateDados', name: 'Dados do IMO' },
      { page: 'GateLacres', name: 'Lacres do Gate' },
      { page: 'GateLacresColocados', name: 'Lacres Colocados' },
      { page: 'GateAvarias', name: 'Avarias do Gate' },
      { page: 'GateReefer', name: 'Reefer do Gate' },
      { page: 'ServicoExcesso', name: 'Excesso' },
      { page: 'GateServicos', name: 'Serviços' }
      // adicione outras páginas conforme necessário
    ]
  },
  kdInspecaoPatio: {
    menuL: [
      { page: 'PatioAvarias', name: 'Avarias' },
      { page: 'PatioLacres', name: 'Lacres do Pátio' },
      { page: 'PatioIMO', name: 'IMO do Pátio' },
      { page: 'LacresColocadosPage', name: 'Lacres Colocados' },
      { page: 'PatioServicosPage', name: 'Serviços' },
      { page: 'ServicosExcessoPage', name: 'Excesso' },
      { page: 'PatioServicos', name: 'Serviços' }

      // adicione outras páginas conforme necessário
    ]
  },
  // adicione outros tipos de inspeção conforme necessário
};