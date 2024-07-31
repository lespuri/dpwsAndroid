import GateIMOPage from '../screens/inspecaoGate/GateIMOScreen';
import GateLacresPage from '../screens/inspecaoGate/GateLacresScreen';
import GateDadosPage from '../screens/inspecaoGate/GateDadosScreen';
import GateAvariasPage from '../screens/inspecaoGate/GateAvariasScreen';
import GateReeferPage from '../screens/inspecaoGate/GateReeferScreen';
import GateServicosPage from '../screens/inspecaoGate/GateServicosScreen';
import GateTransferenciaPage from '../screens/inspecaoGate/GateTransferenciaScreen';
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
  "GateTransferenciaPage": GateTransferenciaPage
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
      { page: 'GateLacres', name: 'Lacres do Gate' },
      { page: 'GateAvariasScreen', name: 'Avarias do Gate' },
      { page: 'GateReeferScreen', name: 'Reefer do Gate' },
      // adicione outras páginas conforme necessário
    ]
  },
  kdInspecaoPatio: {
    menuL: [
      { page: 'PatioDadosPage', name: 'Dados do Pátio' },
      { page: 'PatioLacresPage', name: 'Lacres do Pátio' },
      { page: 'PatioAvariasPage', name: 'Avarias do Pátio' },
      { page: 'PatioIMOPage', name: 'IMO do Pátio' },
      // adicione outras páginas conforme necessário
    ]
  },
  // adicione outros tipos de inspeção conforme necessário
};