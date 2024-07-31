import { Alert } from 'react-native';
import { apiRequest } from './apiRequest-services';

 const mockContainerData = {
  TFCCONTEINERINSPECAOID: 12345,
  TFCCONTEINERINSPECAORIID: 12346,
  TFCCONTEINEROPERACAOID: 12347,
  TFCCONTEINERGMPREVISAOID: 12348,
  EXTERNALID: 12349,
  NROCONTEINER: "ABC1234567",
  CODIGOISO: "ISO1234",
  CEALTURA: 10,
  CEDIREITA: 5,
  CEESQUERDA: 5,
  CEFRONTAL: 5,
  CESETTING: 2,
  CETRASEIRO: 5,
  CEVENTILACAO: 1,
  GENSET: "GenSet123",
  OCORRENCIA: "2024-07-30T12:34:56",
  OCORRENCIA_STRING: "30/07/2024 12:34",
  SAFEWEIGHT: 30000,
  TARA: 5000,
  TIPO: 0,
  TIPO_DESCRIPTION: "Inspeção de Gate",
  LONGARINA: 1,
  SEMLACRE: 0,
  TRA: "TRA123",
  FREIGHTKIND: "Cheio",
  MODALIDADE: "Exportação",
  SIGLAMODALIDADE: "EXP",
  SIGLAFREIGHTKIND: "CH",
  FINALIZADO: "2024-07-30T14:34:56",
  FINALIZADO_STRING: "30/07/2024 14:34",
  SIGLATIPODOCUMENTO: "DOC123",
  TEMPO_TRANSACAO: "2 horas",
  USUARIO: "usuarioteste",
  DAMAGEREPORT: "Dano123",
  CPFMOTORISTA: "12345678900",
  REMOTORISTA: "Motorista123",
  LANE: "Lane123",
  ITVTRANSFERENCIA: "ITV123",
  ITV: "123",
  PLACADANIFICADA: false,
  TFCVEICULOID: 123456,
  ISIMO: 1,
  ISTRANSFERENCIA: 0,
  NextAction: "Ação Próxima",
  PrevAction: "Ação Anterior",
  ActionReferenceId: 1234567,
  _IOP: true
};

export const mockConteinerServicePesquisar = async () => {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockContainerData;
};

export const mockConteinerServiceEditar = async (container) => {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  return container;
  
};

