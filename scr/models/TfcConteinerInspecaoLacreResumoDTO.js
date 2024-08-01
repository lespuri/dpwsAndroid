import { TfcConteinerInspecaoDTO } from "./TfcConteinerInspecaoDTO";
import { DamageType } from "./DamageType";
import { ComponentModel } from "./ComponentModel";

export class TfcConteinerInspecaoAvariaResumoDTO {
  constructor(
    TFCCONTEINERINSPECAOAVARIAID,
    TFCCONTEINERINSPECAOID,
    TFCCONTEINERINSPECAODTO,
    AVARIAS,
    isOPENTOP,
    COMPONENTS,
    TYPES,
    NextAction,
    PrevAction,
    ActionReferenceId
  ) {
    this.TFCCONTEINERINSPECAOAVARIAID = TFCCONTEINERINSPECAOAVARIAID;
    this.TFCCONTEINERINSPECAOID = TFCCONTEINERINSPECAOID;
    this.TFCCONTEINERINSPECAODTO = TFCCONTEINERINSPECAODTO;
    this.AVARIAS = AVARIAS;
    this.isOPENTOP = isOPENTOP;
    this.COMPONENTS = COMPONENTS;
    this.TYPES = TYPES;
    this.NextAction = NextAction;
    this.PrevAction = PrevAction;
    this.ActionReferenceId = ActionReferenceId;
  }

  static fromJSON(data) {
    return new TfcConteinerInspecaoAvariaResumoDTO(
      data.TFCCONTEINERINSPECAOAVARIAID,
      data.TFCCONTEINERINSPECAOID,
      TfcConteinerInspecaoDTO.fromJSON(data.TFCCONTEINERINSPECAODTO),
      data.AVARIAS,
      data.isOPENTOP,
      data.COMPONENTS.map(component => ComponentModel.fromJSON(component)),
      data.TYPES.map(type => DamageType.fromJSON(type)),
      data.NextAction,
      data.PrevAction,
      data.ActionReferenceId
    );
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
