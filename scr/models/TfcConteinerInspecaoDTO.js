export class TfcConteinerInspecaoDTO {
  constructor() {
    this.NROCONTEINER = '';
    this.TIPO = '';
    this.ISTRANSFERENCIA = 0;
  }

  static fromJSON(data) {
    const instance = new TfcConteinerInspecaoDTO();
    instance.NROCONTEINER = data.NROCONTEINER || '';
    instance.TIPO = data.TIPO || '';
    instance.ISTRANSFERENCIA = data.ISTRANSFERENCIA || 0;
    return instance;
  }

  toJSON() {
    return {
      NROCONTEINER: this.NROCONTEINER,
      TIPO: this.TIPO,
      ISTRANSFERENCIA: this.ISTRANSFERENCIA,
    };
  }
}

export default TfcConteinerInspecaoDTO;
