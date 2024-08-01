export class GedDocumento {
    constructor(
      GEDDOCUMENTOID,
      GEDTIPODOCUMENTOID,
      GEDPASTAID,
      CAMINHO,
      REVISAO,
      STATUS,
      DTHRINSERT,
      DTHRUPDATE,
      LOGININSERT,
      LOGINUPDATE
    ) {
      this.GEDDOCUMENTOID = GEDDOCUMENTOID;
      this.GEDTIPODOCUMENTOID = GEDTIPODOCUMENTOID;
      this.GEDPASTAID = GEDPASTAID;
      this.CAMINHO = CAMINHO;
      this.REVISAO = REVISAO;
      this.STATUS = STATUS;
      this.DTHRINSERT = DTHRINSERT;
      this.DTHRUPDATE = DTHRUPDATE;
      this.LOGININSERT = LOGININSERT;
      this.LOGINUPDATE = LOGINUPDATE;
    }
  
    static fromJSON(data) {
      return new GedDocumento(
        data.GEDDOCUMENTOID,
        data.GEDTIPODOCUMENTOID,
        data.GEDPASTAID,
        data.CAMINHO,
        data.REVISAO,
        data.STATUS,
        new Date(data.DTHRINSERT),
        new Date(data.DTHRUPDATE),
        data.LOGININSERT,
        data.LOGINUPDATE
      );
    }
  
    toJSON() {
      return {
        GEDDOCUMENTOID: this.GEDDOCUMENTOID,
        GEDTIPODOCUMENTOID: this.GEDTIPODOCUMENTOID,
        GEDPASTAID: this.GEDPASTAID,
        CAMINHO: this.CAMINHO,
        REVISAO: this.REVISAO,
        STATUS: this.STATUS,
        DTHRINSERT: this.DTHRINSERT.toISOString(),
        DTHRUPDATE: this.DTHRUPDATE.toISOString(),
        LOGININSERT: this.LOGININSERT,
        LOGINUPDATE: this.LOGINUPDATE,
      };
    }
  }
  