import { apiRequest } from './apiRequest-services';
import { mockServicoServiceBuscar, mockServicoServiceOpcoes, mockServicoServiceSalvar, mockServicoServiceExcluir } from '../utils/mocados';

export const buscarServicos = (container) => {
  console.log("container buscarServicos", container);
  return mockServicoServiceBuscar();
  //return apiRequest('post', 'TfcConteinerInspecaoEvento/Buscar', container);
};

export const buscarOpcao = (container) => {
  console.log("container buscarOpcao", container);
  return mockServicoServiceOpcoes();
  //return apiRequest('post', 'TfcConteinerInspecaoEvento/Opcao', container);
};

export const salvar = (container) => {
  return new Promise((resolve, reject) => {
    console.log(container);
    // lógica para salvar os dados
    // Sucesso
    resolve(mockServicoServiceSalvar(container));

    // Ou, em caso de erro
    // reject(new Error("Erro ao salvar os dados"));
  });
  //return apiRequest('post', 'TfcConteinerInspecaoEvento/Salvar', container);
};

export const excluir = (container) => {
  return new Promise((resolve, reject) => {
    console.log("excluir", container);
    // lógica para excluir os dados
    // Sucesso
    resolve(mockServicoServiceExcluir(container));

    // Ou, em caso de erro
    // reject(new Error("Erro ao excluir os dados"));
  });
  //return apiRequest('post', 'TfcConteinerInspecaoEvento/Excluir', container);
};
