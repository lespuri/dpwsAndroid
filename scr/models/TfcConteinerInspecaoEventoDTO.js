class TfcConteinerInspecaoEventoDTO {
    constructor({
      TFCCONTEINERINSPECAOEVENTOID = 0,
      TFCCONTEINERINSPECAOID = 0,
      TFCTIPOEVENTOINSPECAOID = 0,
      EVENTO = '',
      EVENTODESCRICAO = '',
      TIPO = 0,
      NROCONTEINER = '',
      ActionReferenceId = 0
    } = {}) {
      this.TFCCONTEINERINSPECAOEVENTOID = TFCCONTEINERINSPECAOEVENTOID;
      this.TFCCONTEINERINSPECAOID = TFCCONTEINERINSPECAOID;
      this.TFCTIPOEVENTOINSPECAOID = TFCTIPOEVENTOINSPECAOID;
      this.EVENTO = EVENTO;
      this.EVENTODESCRICAO = EVENTODESCRICAO;
      this.TIPO = TIPO;
      this.NROCONTEINER = NROCONTEINER;
      this.ActionReferenceId = ActionReferenceId;
    }
  }
  
  export default TfcConteinerInspecaoEventoDTO;
  