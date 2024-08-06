export const _PAGE_INSPECAO_GATE_RECURSO_NOME = "Inspeção de Gate";
export const _PAGE_INSPECAO_PATIO_RECURSO_NOME = "Inspeção de Patio";
export const _PAGE_CONSULTA_AGENDAMENTO_RECURSO_NOME = "Consultar Agendamento";
export const _PAGE_TI_DESBLOQUEAR_USUARIO_RECURSO_NOME = "Desbloquear Usuario";
export const _PAGE_SERVICOS_RECURSO_NOME = "Serviços";
export const _PAGE_INSPECAO_FREEPOOL_RECURSO_NOME = "Inspeção FreePool";
export const _PAGE_PESAGEM_TPS_RECURSO_NOME = "Pesagem Tps";

export const _CAMERA_TARGET_WIDTH = 768;
export const _CAMERA_TARGET_HEIGHT = 1024;
// apos a conversao da DLL a imagem fica nessa medida
// 690 largura
// 515
export const _CAMERA_QUALITY = 35;

export const _AVARIA_PADRAO = "G:10";

/**
 * Foi adicionado para ignorar a visualização deste item, para manter o mesmo padrão da inspeção antiga
 *
 * 1-	O item P:14 está sendo removido da lista de visualização
 *      TfcConteinerInspecaoAvariaResumoDTORepository.cs
 * 2-	Quando vai editar uma avaria, é adicionado o item P:14 na listagem. Porém, não aparece na tela porque foi removido do item acima. Ai o erro aparece porque não tem nenhuma foto para este item.
 *      TfcConteinerInspecaoActivity.cs
 *      > incluirAvariaLacreDivergente
 */
export const _AVARIA_IGNORAR = "P:14";

//export const _URL_PADRAO = "https://api.dpworldsantos.com/";
export const _URL_PADRAO = "http://qa.embraportonline.com.br:8100/";
//export const _URL_PADRAO = "http://apiinterna.dpworldsantos.com:8100/";
//export const _URL_PADRAO = "http://www.embraportonline.com.br:8100/";
//export const _URL_PADRAO = "http://emb1sv079.embraport.net:8100/";
//export const _URL_PADRAO = "http://www.embraportonline.com.br:8095/";

//export const _URL_PADRAO = "http://localhost:53965/";
//export const _URL_PADRAO = "http://dpws1sva501:8100/";
//export const _URL_PADRAO = "http://www.embraportonline.com.br:8095/";
//export const _URL_PADRAO = "http://dpws1sva506:8100/"



export const _URL_CONFIG = [
    // { "ambiente": "DEV", "url": "http://localhost:53965/" },
    { "ambiente": "QA 8100", "url": "http://qa.embraportonline.com.br:8100/" }
    // { "ambiente": "QA 8107", "url": "http://www.embraportonline.com.br:8107/" },
    // { "ambiente": "PROD 8095", "url": "http://www.embraportonline.com.br:8095/" },
    // { "ambiente": "PROD 8100", "url": "http://www.embraportonline.com.br:8100/" },
    // { "ambiente": "PROD", "url": "http://sistemas.embraportonline.com.br:8100/" },
    // { "ambiente": "PROD", "url": "http://api.embraport.net:8100/" },
    // { "ambiente": "PROD", "url": "https://api.dpworldsantos.com/" },
    // { "ambiente": "PROD EXT", "url": "https://api.dpworldsantos.com/" }
];



