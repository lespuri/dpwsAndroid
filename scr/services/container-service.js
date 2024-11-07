import { apiRequest } from './apiRequest-services';
import {mockConteinerServicePesquisar, mockConteinerServiceEditar } from '../utils/mocados'
import { Alert } from 'react-native';

export const pesquisar = (container) => {
  try{
    return apiRequest('post', 'TfcConteinerInspecao/Buscar', container);
   /*
    return {
      "aCoEntity": null,
      "alsUpdate": [],
      "TFCCONTEINERINSPECAOID": 0.0,
      "TFCCONTEINERINSPECAORIID": null,
      "TFCCONTEINEROPERACAOID": 17228514.0,
      "TFCCONTEINERGMPREVISAOID": null,
      "EXTERNALID": 4524844836.0,
      "NROCONTEINER": "CSNU6575403",
      "TICKET": "1234567",
      "CODIGOISO": "40DC",
      "CEALTURA": null,
      "CEDIREITA": null,
      "CEESQUERDA": null,
      "CEFRONTAL": null,
      "CESETTING": null,
      "CETRASEIRO": null,
      "CEVENTILACAO": null,
      "GENSET": "",
      "START_DATE": "2024-11-05T12:30",
      "END_DATE": "2024-11-05T13:29",
      "START_TOLERANCE": 10.0,
      "END_TOLERANCE": 130.0,
      "OCORRENCIA": "0001-01-01T00:00:00",
      "OCORRENCIA_STRING": "01/01/0001 00:00",
      "SAFEWEIGHT": 11561,
      "TARA": 3800,
      "TIPO": 0,
      "TIPO_DESCRIPTION": "Inspeção de Gate",
      "LONGARINA": null,
      "SEMLACRE": null,
      "TRA": null,
      "FREIGHTKIND": "FCL",
      "MODALIDADE": "IMPRT",
      "SIGLAMODALIDADE": "IMP",
      "SIGLAFREIGHTKIND": "CH",
      "FINALIZADO": null,
      "FINALIZADO_STRING": null,
      "SIGLATIPODOCUMENTO": null,
      "TEMPO_TRANSACAO": null,
      "USUARIO": "",
      "DAMAGEREPORT": null,
      "CPFMOTORISTA": null,
      "REMOTORISTA": null,
      "LANE": null,
      "ITVTRANSFERENCIA": null,
      "ITV": null,
      "TIPOENUM": 0,
      "LONGARINAENUM": null,
      "PLACADANIFICADA": false,
      "TFCVEICULOID": 0.0,
      "ISIMO": 0.0,
      "ISTRANSFERENCIA": 0,
      "NextAction": "",
      "PrevAction": "",
      "ActionReferenceId": 0.0,
      "_IOP": false,
      "UID": 0.0,
      "aCoMessageList": []
  }*/
  }  catch(err){
    throw new Error(err);
  }
  
};

export const iniciarGate = (container) => {
  return apiRequest('post', 'TfcConteinerInspecao/IniciarGate', container);
};

export const salvar = (container) => {
  try {            
    return apiRequest('post', 'TfcConteinerInspecao/Salvar', container);            

  }  catch (error) {
    console.error('Erro ao salvar inspecao', error.response || error.message);
  }
  
  
};


export const salvarOld = (container) => {
  return new Promise((resolve, reject) => {
    // lógica para salvar os dados
    // ...
    console.log(container);
    //return ;
    // Sucesso
    resolve(apiRequest('post', 'TfcConteinerInspecao/Salvar', container));

    // Ou, em caso de erro
     reject(new Error("Erro ao salvar os dados"));
  });
};
/*
export const salvar = (container) => {
  console.log(container);
  return true;
  //return apiRequest('post', 'TfcConteinerInspecao/Salvar', container);
};
*/
export const finalizar = (container, reservaJanelaId) => {
 // console.log("container",container);
  //console.log("reservaJanelaId",reservaJanelaId);
  console.log("finalizarAPi");
  return apiRequest('post', `TfcConteinerInspecao/Finalizar`, container);
};

export const editar = (container) => {
  try{
    return apiRequest('post', 'TfcConteinerInspecao/Editar', container);
  }catch(err){
    throw new Error(err);    
  }
  
};

export const salvarReefer = (container) => {
 try{
  return apiRequest('post', 'TfcExcessoReefer/SalvarReefer', container);
}catch(err){
  throw new Error(err);    
}
};

export const salvarExcesso = (container) => {
  //console.log("salvarExcesso", container);
  try{
    return apiRequest('post', 'TfcExcessoReefer/SalvarExcesso', container);
  }catch(err){
    throw new Error(err);    
  }
  
};

export const salvarEntrada = (container) => {
  const tfcPreGate = {
    PLACA: container.PLACA,
    TICKET: container.TICKET,
    GATE: container.GATE,
    DATAAGENDAMENTO: container.DTHRINIJANELA,
  };
 try{ 
  return apiRequest('post', 'TfcPreGate/GravarEntrada', tfcPreGate);
}catch(err){
  throw new Error(err);    
}
};

export const pesquisarEntradas = (container) => {
 try{ 
  return apiRequest('get', `TfcPreGate/VerificaTickets?placa=${container.PLACA}`);
}catch(err){
  throw new Error(err);    
}
};
