export class TfcConteinerInspecaoLacreDTO {
    constructor() {
      this.TFCCONTEINERINSPECAOLACREID = 0;
      this.TFCCONTEINERINSPECAOID = 0;
      this.NUMERO = '';
      this.OCORRENCIA = new Date();
      this.TIPO = 0;
      this.OBSERVACAO = '';
      this.NextAction = '';
      this.PrevAction = '';
      this.ActionReferenceId = 0;
    }
  
    static fromJSON(data) {
      const instance = new TfcConteinerInspecaoLacreDTO();
      instance.TFCCONTEINERINSPECAOLACREID = data.TFCCONTEINERINSPECAOLACREID || 0;
      instance.TFCCONTEINERINSPECAOID = data.TFCCONTEINERINSPECAOID || 0;
      instance.NUMERO = data.NUMERO || '';
      instance.OCORRENCIA = data.OCORRENCIA ? new Date(data.OCORRENCIA) : new Date();
      instance.TIPO = data.TIPO || 0;
      instance.OBSERVACAO = data.OBSERVACAO || '';
      instance.NextAction = data.NextAction || '';
      instance.PrevAction = data.PrevAction || '';
      instance.ActionReferenceId = data.ActionReferenceId || 0;
      return instance;
    }
  
    toJSON() {
      return {
        TFCCONTEINERINSPECAOLACREID: this.TFCCONTEINERINSPECAOLACREID,
        TFCCONTEINERINSPECAOID: this.TFCCONTEINERINSPECAOID,
        NUMERO: this.NUMERO,
        OCORRENCIA: this.OCORRENCIA.toISOString(),
        TIPO: this.TIPO,
        OBSERVACAO: this.OBSERVACAO,
        NextAction: this.NextAction,
        PrevAction: this.PrevAction,
        ActionReferenceId: this.ActionReferenceId,
      };
    }
  }
  
  export default TfcConteinerInspecaoLacreDTO;
  