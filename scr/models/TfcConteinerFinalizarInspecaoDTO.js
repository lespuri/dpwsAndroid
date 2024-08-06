import { TfcConteinerInspecaoAvariaResumoDTO } from './TfcConteinerInspecaoAvariaResumoDTO';
import { TfcConteinerInspecaoLacreResumoDTO } from './TfcConteinerInspecaoLacreResumoDTO';

export class TfcConteinerFinalizarInspecaoDTO {
  constructor() {    
    this.TFCCONTEINERINSPECAOAVARIARESUMODTO = null;
    this.TFCCONTEINERINSPECAOLACRERESUMODTO = null;
    this.ORDEM_INSPECAO = null;
    this.NextAction = null;
    this.PrevAction = null;
    this.ActionReferenceId = null;
  }

  static fromJSON(data) {
    
    const instance = new TfcConteinerFinalizarInspecaoDTO();
    
    instance.TFCCONTEINERINSPECAOAVARIARESUMODTO = data.TFCCONTEINERINSPECAOAVARIARESUMODTO ? TfcConteinerInspecaoAvariaResumoDTO.fromJSON(data.TFCCONTEINERINSPECAOAVARIARESUMODTO) : null;    
    instance.TFCCONTEINERINSPECAOLACRERESUMODTO = data.TFCCONTEINERINSPECAOLACRERESUMODTO ? TfcConteinerInspecaoLacreResumoDTO.fromJSON(data.TFCCONTEINERINSPECAOLACRERESUMODTO) : null;    
    instance.ORDEM_INSPECAO = data.ORDEM_INSPECAO;
    instance.NextAction = data.NextAction;
    instance.PrevAction = data.PrevAction;
    instance.ActionReferenceId = data.ActionReferenceId;
    return instance;
  }

  toJSON() {
    return {
      TFCCONTEINERINSPECAOAVARIARESUMODTO: this.TFCCONTEINERINSPECAOAVARIARESUMODTO ? this.TFCCONTEINERINSPECAOAVARIARESUMODTO.toJSON() : null,
      TFCCONTEINERINSPECAOLACRERESUMODTO: this.TFCCONTEINERINSPECAOLACRERESUMODTO ? this.TFCCONTEINERINSPECAOLACRERESUMODTO.toJSON() : null,
      ORDEM_INSPECAO: this.ORDEM_INSPECAO,
      NextAction: this.NextAction,
      PrevAction: this.PrevAction,
      ActionReferenceId: this.ActionReferenceId
    };
  }
}
