export class TfcConteinerInspecaoLacre {
    constructor(
      TFCCONTEINERINSPECAOLACREID = null,
      TFCCONTEINERINSPECAOID = null,
      NUMERO = '',
      OCORRENCIA = new Date(),
      TIPO = null,
      OBSERVACAO = ''
    ) {
      this.TFCCONTEINERINSPECAOLACREID = TFCCONTEINERINSPECAOLACREID;
      this.TFCCONTEINERINSPECAOID = TFCCONTEINERINSPECAOID;
      this.NUMERO = NUMERO;
      this.OCORRENCIA = OCORRENCIA;
      this.TIPO = TIPO;
      this.OBSERVACAO = OBSERVACAO;
    }
  
    static fromJSON(data) {
      return new TfcConteinerInspecaoLacre(
        data.TFCCONTEINERINSPECAOLACREID,
        data.TFCCONTEINERINSPECAOID,
        data.NUMERO,
        new Date(data.OCORRENCIA),
        data.TIPO,
        data.OBSERVACAO
      );
    }
  
    toJSON() {
      return {
        TFCCONTEINERINSPECAOLACREID: this.TFCCONTEINERINSPECAOLACREID,
        TFCCONTEINERINSPECAOID: this.TFCCONTEINERINSPECAOID,
        NUMERO: this.NUMERO,
        OCORRENCIA: this.OCORRENCIA.toISOString(),
        TIPO: this.TIPO,
        OBSERVACAO: this.OBSERVACAO
      };
    }
  }
  