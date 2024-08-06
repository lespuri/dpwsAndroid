export class TfcConteinerInspecaoAvaria {
    constructor(
        TFCCONTEINERINSPECAOAVARIAID,
        TFCCONTEINERINSPECAOID,
        COMPONENTE,
        COMPONENTEDESCRICAO,
        OCORRENCIA,
        TIPO,
        TIPODESCRICAO,
        imagemL
    ) {
        this.TFCCONTEINERINSPECAOAVARIAID = TFCCONTEINERINSPECAOAVARIAID;
        this.TFCCONTEINERINSPECAOID = TFCCONTEINERINSPECAOID;
        this.COMPONENTE = COMPONENTE;
        this.COMPONENTEDESCRICAO = COMPONENTEDESCRICAO;
        this.OCORRENCIA = OCORRENCIA;
        this.TIPO = TIPO;
        this.TIPODESCRICAO = TIPODESCRICAO;
        this.imagemL = imagemL;
    }
}

// Exemplo de criação de um objeto da classe
const avaria = new TfcConteinerInspecaoAvaria(
    1,
    123,
    "Componente Exemplo",
    "Descrição do Componente",
    new Date(),
    "Tipo Exemplo",
    "Descrição do Tipo",
    []
);

export default TfcConteinerInspecaoAvaria;
