import { apiRequest } from './apiRequest-services';
import {mockConteinerServicePesquisar, mockConteinerServiceEditar } from '../utils/mocados'
import { Alert } from 'react-native';

export const pesquisar = (container) => {
  try{
    return apiRequest('post', 'TfcConteinerInspecao/Buscar', container);
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
  console.log("editar", container);
  //return  mockConteinerServiceEditar(container);
  return apiRequest('post', 'TfcConteinerInspecao/Editar', container);
};

export const salvarReefer = (container) => {
  return apiRequest('post', 'TfcExcessoReefer/SalvarReefer', container);
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
  return apiRequest('post', 'TfcPreGate/GravarEntrada', tfcPreGate);
};

export const pesquisarEntradas = (container) => {
  return apiRequest('get', `TfcPreGate/VerificaTickets?placa=${container.PLACA}`);
};
