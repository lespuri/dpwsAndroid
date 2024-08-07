import { apiRequest } from './apiRequest-services';
import {mockConteinerServicePesquisar, mockConteinerServiceEditar } from '../utils/mocados'

export const pesquisar = (container) => {
  console.log("container pesquisa", container);
  return  mockConteinerServicePesquisar();
  //return apiRequest('post', 'TfcConteinerInspecao/Buscar', container);
};

export const iniciarGate = (container) => {
  return apiRequest('post', 'TfcConteinerInspecao/IniciarGate', container);
};

export const salvar = (container) => {
  return new Promise((resolve, reject) => {
    // lógica para salvar os dados
    // ...
    console.log(container);
    //return apiRequest('post', 'TfcConteinerInspecao/Salvar', container);
    // Sucesso
    resolve();

    // Ou, em caso de erro
    // reject(new Error("Erro ao salvar os dados"));
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
  return apiRequest('post', `TfcConteinerInspecao/Finalizar?reservaJanelaId=${reservaJanelaId}`, container);
};

export const editar = (container) => {
  console.log("editar", container);
  return  mockConteinerServiceEditar(container);
  //return apiRequest('post', 'TfcConteinerInspecao/Editar', container);
};

export const salvarReefer = (container) => {
  return apiRequest('post', 'TfcExcessoReefer/SalvarReefer', container);
};

export const salvarExcesso = (container) => {
  return apiRequest('post', 'TfcExcessoReefer/SalvarExcesso', container);
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
