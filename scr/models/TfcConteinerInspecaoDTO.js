export class TfcConteinerInspecaoDTO {
  constructor() {
    this.LONGARINA = null;
    this.LONGARINAENUM = '';
    this.TIPO = '';
    this.SEMLACRE = 0;
    this.TRA = '';
    this.FREIGHTKIND = '';
    this.MODALIDADE = '';
    this.SIGLAMODALIDADE = '';
    this.SIGLAFREIGHTKIND = '';
    this.FINALIZADO = null;
    this.SIGLATIPODOCUMENTO = '';
    this.DAMAGEREPORT = '';
    this.TARA = 0;
    this.CPFMOTORISTA = '';
    this.REMOTORISTA = '';
    this.LANE = '';
    this.ITVTRANSFERENCIA = '';
    this.ITV = '';
    this.TIPOENUM = '';
    this.NextAction = '';
    this.PrevAction = '';
    this.USUARIO = '';
    this.SAFEWEIGHT = 0;
    this.OCORRENCIA = null;
    this.GENSET = '';
    this.TFCCONTEINERINSPECAOID = null;
    this.TFCCONTEINERINSPECAORIID = null;
    this.TFCCONTEINEROPERACAOID = null;
    this.TFCCONTEINERGMPREVISAOID = null;
    this.ActionReferenceId = 0;
    this.NROCONTEINER = '';
    this.CODIGOISO = '';
    this.EXTERNALID = 0;
    this.CEDIREITA = 0;
    this.CEESQUERDA = 0;
    this.CEFRONTAL = 0;
    this.CESETTING = '';
    this.CETRASEIRO = 0;
    this.CEVENTILACAO = 0;
    this.CEALTURA = 0;
    this._IOP = false;
    this.PLACADANIFICADA = false;
    this.ISIMO = 0;
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
