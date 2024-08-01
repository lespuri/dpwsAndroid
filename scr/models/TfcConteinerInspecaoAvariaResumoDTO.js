import { TfcConteinerInspecaoDTO } from './TfcConteinerInspecaoDTO';
import { DamageType } from './DamageType';
import { ComponentModel } from './ComponentModel';

export class TfcConteinerInspecaoAvariaResumoDTO {
  constructor() {
    this.TFCCONTEINERINSPECAOAVARIAID = null;
    this.TFCCONTEINERINSPECAOID = null;
    this.TFCCONTEINERINSPECAODTO = new TfcConteinerInspecaoDTO();
    this.AVARIAS = '';
    this.isOPENTOP = false;
    this.COMPONENTS = [];
    this.TYPES = [];
    this.NextAction = '';
    this.PrevAction = '';
    this.ActionReferenceId = null;
  }

  static fromJSON(data) {
    const instance = new TfcConteinerInspecaoAvariaResumoDTO();
    instance.TFCCONTEINERINSPECAOAVARIAID = data.TFCCONTEINERINSPECAOAVARIAID;
    instance.TFCCONTEINERINSPECAOID = data.TFCCONTEINERINSPECAOID;
    instance.TFCCONTEINERINSPECAODTO = TfcConteinerInspecaoDTO.fromJSON(data.TFCCONTEINERINSPECAODTO);
    instance.AVARIAS = data.AVARIAS;
    instance.isOPENTOP = data.isOPENTOP;
    instance.COMPONENTS = data.COMPONENTS.map(component => ComponentModel.fromJSON(component));
    instance.TYPES = data.TYPES.map(type => DamageType.fromJSON(type));
    instance.NextAction = data.NextAction;
    instance.PrevAction = data.PrevAction;
    instance.ActionReferenceId = data.ActionReferenceId;
    return instance;
  }

  toJSON() {
    return {
      TFCCONTEINERINSPECAOAVARIAID: this.TFCCONTEINERINSPECAOAVARIAID,
      TFCCONTEINERINSPECAOID: this.TFCCONTEINERINSPECAOID,
      TFCCONTEINERINSPECAODTO: this.TFCCONTEINERINSPECAODTO.toJSON(),
      AVARIAS: this.AVARIAS,
      isOPENTOP: this.isOPENTOP,
      COMPONENTS: this.COMPONENTS.map(component => component.toJSON()),
      TYPES: this.TYPES.map(type => type.toJSON()),
      NextAction: this.NextAction,
      PrevAction: this.PrevAction,
      ActionReferenceId: this.ActionReferenceId
    };
  }
}
