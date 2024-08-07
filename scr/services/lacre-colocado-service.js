import { TfcConteinerInspecaoDTO } from '../../models/TfcConteinerInspecaoDTO';
import { TfcConteinerInspecaoLacreResumoDTO } from '../../models/TfcConteinerInspecaoLacreResumoDTO';
import { apiRequest } from './apiRequest-services';
import { mockBuscarLacreColocado, mockConteinerServicePesquisar } from '../utils/mocados'

export const buscarLacreColocado = (container) => {    
    return  mockBuscarLacreColocado(container);
    //return apiRequest('post', 'TfcConteinerInspecaoLacreResumo/BuscarColocado', container);
  };
  
  export const salvarLacreColocado = (container) => {
    console.log("salvarLacreColocado", container);
    return  true;
    //return apiRequest('post', 'TfcConteinerInspecaoLacreResumo/BuscarColocado', container);
  };
