export class DamageType {
    constructor(id, description, damageReport) {
      this.GKEY = null;
      this.ID = id;
      this.REFERENCE_SET = null;
      this.DESCRIPTION = description;
      this.EQ_CLASS = null;
      this.CREATED = null;
      this.LIFE_CYCLE_STATE = null;
      this.CUSTDFF_REPORTDAMAGE = damageReport;
  
      this.IDDESCRIPTION = `${this.ID} - ${this.DESCRIPTION}`;
    }
  
    static fromJSON(data) {
      const instance = new DamageType(data.ID, data.DESCRIPTION, data.CUSTDFF_REPORTDAMAGE);
      instance.GKEY = data.GKEY;
      instance.REFERENCE_SET = data.REFERENCE_SET;
      instance.EQ_CLASS = data.EQ_CLASS;
      instance.CREATED = new Date(data.CREATED);
      instance.LIFE_CYCLE_STATE = data.LIFE_CYCLE_STATE;
      return instance;
    }
  
    toJSON() {
      return {
        GKEY: this.GKEY,
        ID: this.ID,
        REFERENCE_SET: this.REFERENCE_SET,
        DESCRIPTION: this.DESCRIPTION,
        EQ_CLASS: this.EQ_CLASS,
        CREATED: this.CREATED ? this.CREATED.toISOString() : null,
        LIFE_CYCLE_STATE: this.LIFE_CYCLE_STATE,
        CUSTDFF_REPORTDAMAGE: this.CUSTDFF_REPORTDAMAGE,
        IDDESCRIPTION: this.IDDESCRIPTION
      };
    }
  }
  