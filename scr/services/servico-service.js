import { apiRequest } from './apiRequest-services';
import { mockServicoServiceBuscar, mockServicoServiceOpcoes, mockServicoServiceSalvar, mockServicoServiceExcluir } from '../utils/mocados';

export const buscarServicos = (container) => {
  //console.log("container buscarServicos", container);
  //return mockServicoServiceBuscar();
  try{
    return apiRequest('post', 'TfcConteinerInspecaoEvento/Buscar', container);
  }catch(err){
    console.error("Error", err);
    throw new Error(errorMessage);
  }
  
};

export const buscarOpcao = (container) => {
  //console.log("container buscarOpcao", container);
  return mockServicoServiceOpcoes();
  //return apiRequest('post', 'TfcConteinerInspecaoEvento/Opcao', container);
};

export const salvar = (container) => {
  /*
  return new Promise((resolve, reject) => {
    //console.log(container);
    // lógica para salvar os dados
    // Sucesso
    resolve(mockServicoServiceSalvar(container));

    // Ou, em caso de erro
    // reject(new Error("Erro ao salvar os dados"));
  });*/
  try{
    return apiRequest('post', 'TfcConteinerInspecaoEvento/Salvar', container);
  }catch(err){
    throw new Error(err);
  }
  
};

export const excluir = (container) => {
  try{
    return apiRequest('post', 'TfcConteinerInspecaoEvento/Excluir', container);
  }catch(err){
    throw new Error(err);
  }  
};
