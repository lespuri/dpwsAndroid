import { TfcConteinerInspecaoDTO } from "./TfcConteinerInspecaoDTO";
import { TfcConteinerInspecaoLacreDTO } from "./TfcConteinerInspecaoLacreDTO";

export class TfcConteinerInspecaoLacreResumoDTO {
  constructor() {
    this.NextAction = '';
    this.OBSERVACOES = new TfcConteinerInspecaoLacreDTO();
    this.LACREEMBRAPORT = '';
    this.PREENCHERLACREEMBRAPORT = false;
    this.SEMLACRE = 0;
    this.INSPECAOFINALIZADA = false;
    this.CONFIRMALACRECOLOCADO = false;
    this.COLOCADOS = '';
    this.NOVOS = '';
    this.CONFIRMADOS = '';
    this.PREVISTOS = '';
    this.OBSERVACAO = '';
    this.TFCCONTEINERINSPECAODTO = new TfcConteinerInspecaoDTO();
    this.TFCCONTEINERINSPECAOID = 0;
    this.PrevAction = '';
    this.ActionReferenceId = 0;
  }

  static fromJSON(data) {
    const instance = new TfcConteinerInspecaoLacreResumoDTO();
    instance.NextAction = data.NextAction || '';
    instance.OBSERVACOES = data.OBSERVACOES ? TfcConteinerInspecaoLacreDTO.fromJSON(data.OBSERVACOES) : new TfcConteinerInspecaoLacreDTO();
    instance.LACREEMBRAPORT = data.LACREEMBRAPORT || '';
    instance.PREENCHERLACREEMBRAPORT = data.PREENCHERLACREEMBRAPORT || false;
    instance.SEMLACRE = data.SEMLACRE || 0;
    instance.INSPECAOFINALIZADA = data.INSPECAOFINALIZADA || false;
    instance.CONFIRMALACRECOLOCADO = data.CONFIRMALACRECOLOCADO || false;
    instance.COLOCADOS = data.COLOCADOS || '';
    instance.NOVOS = data.NOVOS || '';
    instance.CONFIRMADOS = data.CONFIRMADOS || '';
    instance.PREVISTOS = data.PREVISTOS || '';
    instance.OBSERVACAO = data.OBSERVACAO || '';
    instance.TFCCONTEINERINSPECAODTO = data.TFCCONTEINERINSPECAODTO ? TfcConteinerInspecaoDTO.fromJSON(data.TFCCONTEINERINSPECAODTO) : new TfcConteinerInspecaoDTO();
    instance.TFCCONTEINERINSPECAOID = data.TFCCONTEINERINSPECAOID || 0;
    instance.PrevAction = data.PrevAction || '';
    instance.ActionReferenceId = data.ActionReferenceId || 0;
    return instance;
  }

  toJSON() {
    return {
      NextAction: this.NextAction,
      OBSERVACOES: this.OBSERVACOES ? this.OBSERVACOES.toJSON() : null,
      LACREEMBRAPORT: this.LACREEMBRAPORT,
      PREENCHERLACREEMBRAPORT: this.PREENCHERLACREEMBRAPORT,
      SEMLACRE: this.SEMLACRE,
      INSPECAOFINALIZADA: this.INSPECAOFINALIZADA,
      CONFIRMALACRECOLOCADO: this.CONFIRMALACRECOLOCADO,
      COLOCADOS: this.COLOCADOS,
      NOVOS: this.NOVOS,
      CONFIRMADOS: this.CONFIRMADOS,
      PREVISTOS: this.PREVISTOS,
      OBSERVACAO: this.OBSERVACAO,
      TFCCONTEINERINSPECAODTO: this.TFCCONTEINERINSPECAODTO ? this.TFCCONTEINERINSPECAODTO.toJSON() : null,
      TFCCONTEINERINSPECAOID: this.TFCCONTEINERINSPECAOID,
      PrevAction: this.PrevAction,
      ActionReferenceId: this.ActionReferenceId
    };
  }
}

export default TfcConteinerInspecaoLacreResumoDTO;
