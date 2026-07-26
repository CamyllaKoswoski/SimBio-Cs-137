/**
 * ============================================================================
 * MÓDULO DE FÓRMULAS — Simulador Biocinético e Radiotoxicológico de Césio-137
 * ============================================================================
 *
 * Este arquivo contém EXCLUSIVAMENTE as fórmulas matemáticas e constantes
 * físicas/biológicas utilizadas no simulador. Ele foi separado para que
 * especialistas possam auditar e validar a corretude das equações.
 *
 * REFERÊNCIAS:
 * - ICRP Publication 56 (1989) — Age-dependent Doses to Members of the Public
 * - ICRP Publication 67 (1993) — Age-dependent Doses — Ingestion
 * - ICRP Publication 134 (2016) — Occupational Intakes of Radionuclides Part 2
 * - Leggett, R.W. (2003) — Reliable biokinetic models for Cs
 * - Melo et al. (2006) — Azul da Prússia como agente quelante
 * ============================================================================
 */

"use strict";

// ============================================================================
// CONSTANTES FÍSICAS E BIOLÓGICAS
// ============================================================================

const CONSTANTES = Object.freeze({

    // --- Césio-137 ---
    MEIA_VIDA_FISICA_DIAS: 30.17 * 365.25,          // ~11019.7 dias (30.17 anos)
    ENERGIA_GAMMA_MEV: 0.662,                         // Energia do fóton gama (MeV) - Ba-137m
    ENERGIA_BETA_MAX_MEV: 0.514,                      // Energia máxima do beta (MeV)

    // --- Constante de decaimento físico ---
    // λ_f = ln(2) / T_½_física
    LAMBDA_FISICO: Math.LN2 / (30.17 * 365.25),     // dia⁻¹

    // --- Meias-vidas biológicas por faixa etária (dias) ---
    // Modelo bicompartimental (ICRP 56/67):
    //   Compartimento rápido (fração a₁, T₁) + Compartimento lento (fração a₂, T₂)
    // Formato: { fracao1, meiaVida1, fracao2, meiaVida2 }
    BIOCINETICA_POR_IDADE: {
        "neonato":    { fracao1: 0.45, meiaVida1: 2,   fracao2: 0.55, meiaVida2: 16  },
        "1_ano":      { fracao1: 0.45, meiaVida1: 5,   fracao2: 0.55, meiaVida2: 38  },
        "5_anos":     { fracao1: 0.30, meiaVida1: 6,   fracao2: 0.70, meiaVida2: 50  },
        "10_anos":    { fracao1: 0.30, meiaVida1: 7,   fracao2: 0.70, meiaVida2: 70  },
        "15_anos":    { fracao1: 0.20, meiaVida1: 8,   fracao2: 0.80, meiaVida2: 93  },
        "adulto":     { fracao1: 0.10, meiaVida1: 2,   fracao2: 0.90, meiaVida2: 110 },
    },

    // --- Fator de absorção GI (fração absorvida pelo trato gastrointestinal) ---
    FRACAO_ABSORCAO_GI: {
        "ingestao": 1.0,     // Cs é quase 100% absorvido pelo TGI (f₁ = 1.0)
        "inalacao": 0.99,    // Para forma solúvel (Tipo F), ~99% é absorvido
        "dermica":  0.10,    // Absorção dérmica estimada ~10% (conservador)
    },

    // --- Fatores de dose (Sv/Bq) — Dose efetiva comprometida por ingestão ---
    // ICRP 119, Tabela A.1
    FATOR_DOSE_EFETIVA: {
        "neonato":   2.1e-8,   // Sv/Bq (3 meses)
        "1_ano":     1.2e-8,   // Sv/Bq
        "5_anos":    9.6e-9,   // Sv/Bq
        "10_anos":   1.0e-8,   // Sv/Bq
        "15_anos":   1.3e-8,   // Sv/Bq
        "adulto":    1.3e-8,   // Sv/Bq
    },

    // --- Limiares da Síndrome Aguda da Radiação (SAR) ---
    // Doses absorvidas de corpo inteiro (Gy ou Sv para radiação gama)
    SAR_LIMIARES: {
        LEVE:     1.0,    // Sv — Sintomas leves (náusea, fadiga)
        MODERADA: 2.0,    // Sv — Síndrome hematopoiética
        SEVERA:   4.0,    // Sv — Risco significativo de morte (~50% sem tratamento)
        LETAL:    6.0,    // Sv — Dose geralmente letal (>90% mortalidade)
    },

    // --- Azul da Prússia (Ferrocianeto Férrico) ---
    // Reduz a meia-vida biológica efetiva em ~50-66% (WHO/IAEA)
    FATOR_REDUCAO_AZUL_PRUSSIA: 0.40,   // Fator multiplicativo na meia-vida biológica
    // Ou seja: T_bio_com_AP = T_bio_sem_AP × 0.40

    // --- Peso de referência por faixa etária (kg) — ICRP 89 ---
    PESO_REFERENCIA: {
        "neonato":   3.5,
        "1_ano":     10,
        "5_anos":    19,
        "10_anos":   32,
        "15_anos":   56,
        "adulto":    70,
    },
});


// ============================================================================
// FUNÇÕES — EQUAÇÕES DIFERENCIAIS E MODELOS BIOCINÉTICOS
// ============================================================================

/**
 * Calcula a constante de decaimento (λ) a partir da meia-vida.
 *
 * Fórmula:
 *   λ = ln(2) / T_½
 *
 * @param {number} meiaVida — Meia-vida em dias
 * @returns {number} — Constante de decaimento (dia⁻¹)
 */
function calcularLambda(meiaVida) {
    return Math.LN2 / meiaVida;
}


/**
 * Calcula a meia-vida efetiva combinando decaimento físico e eliminação biológica.
 *
 * Fórmula:
 *   1/T_ef = 1/T_física + 1/T_biológica
 *   ∴ T_ef = (T_f × T_b) / (T_f + T_b)
 *
 * @param {number} meiaVidaFisica    — Meia-vida física (dias)
 * @param {number} meiaVidaBiologica — Meia-vida biológica (dias)
 * @returns {number} — Meia-vida efetiva (dias)
 */
function calcularMeiaVidaEfetiva(meiaVidaFisica, meiaVidaBiologica) {
    return (meiaVidaFisica * meiaVidaBiologica) / (meiaVidaFisica + meiaVidaBiologica);
}


/**
 * Modelo bicompartimental de retenção de Césio-137 no corpo.
 *
 * O corpo é modelado com dois compartimentos:
 *   - Compartimento 1 (rápido): fração a₁, meia-vida biológica T₁
 *   - Compartimento 2 (lento):  fração a₂, meia-vida biológica T₂
 *
 * Equação de retenção corporal total R(t):
 *
 *   R(t) = A₀ × [ a₁ × exp(-λ_ef1 × t) + a₂ × exp(-λ_ef2 × t) ]
 *
 * Onde:
 *   λ_ef_i = ln(2)/T_ef_i = ln(2)/T_f + ln(2)/T_bio_i
 *   A₀ = atividade inicial incorporada (Bq)
 *   t = tempo em dias
 *
 * @param {number} A0             — Atividade inicial incorporada (Bq)
 * @param {number} t              — Tempo decorrido (dias)
 * @param {object} biocinetica    — Parâmetros biocinéticos { fracao1, meiaVida1, fracao2, meiaVida2 }
 * @param {boolean} comAzulPrussia — Se o Azul da Prússia está sendo administrado
 * @returns {number} — Atividade retida no corpo (Bq) no tempo t
 */
function retencaoCorporal(A0, t, biocinetica, comAzulPrussia = false) {
    let T1 = biocinetica.meiaVida1;
    let T2 = biocinetica.meiaVida2;

    // Se Azul da Prússia está sendo administrado, reduzir meias-vidas biológicas
    if (comAzulPrussia) {
        T1 *= CONSTANTES.FATOR_REDUCAO_AZUL_PRUSSIA;
        T2 *= CONSTANTES.FATOR_REDUCAO_AZUL_PRUSSIA;
    }

    const lambdaFisico = CONSTANTES.LAMBDA_FISICO;

    // λ_efetivo = λ_físico + λ_biológico
    const lambdaEf1 = lambdaFisico + calcularLambda(T1);
    const lambdaEf2 = lambdaFisico + calcularLambda(T2);

    // R(t) = A₀ × [a₁ × e^(-λ_ef1 × t) + a₂ × e^(-λ_ef2 × t)]
    const retencao = A0 * (
        biocinetica.fracao1 * Math.exp(-lambdaEf1 * t) +
        biocinetica.fracao2 * Math.exp(-lambdaEf2 * t)
    );

    return retencao;
}


/**
 * Calcula a excreção acumulada até o tempo t.
 *
 * Fórmula:
 *   E(t) = A₀ - R(t)
 *
 * Onde R(t) é a retenção corporal no tempo t.
 *
 * @param {number} A0             — Atividade inicial (Bq)
 * @param {number} t              — Tempo decorrido (dias)
 * @param {object} biocinetica    — Parâmetros biocinéticos
 * @param {boolean} comAzulPrussia — Uso de Azul da Prússia
 * @returns {number} — Atividade excretada acumulada (Bq)
 */
function excrecaoAcumulada(A0, t, biocinetica, comAzulPrussia = false) {
    return A0 - retencaoCorporal(A0, t, biocinetica, comAzulPrussia);
}


/**
 * Calcula a taxa de excreção instantânea (derivada da excreção).
 *
 * Fórmula:
 *   dE/dt = -dR/dt = A₀ × [ a₁ × λ_ef1 × e^(-λ_ef1 × t) + a₂ × λ_ef2 × e^(-λ_ef2 × t) ]
 *
 * @param {number} A0             — Atividade inicial (Bq)
 * @param {number} t              — Tempo decorrido (dias)
 * @param {object} biocinetica    — Parâmetros biocinéticos
 * @param {boolean} comAzulPrussia — Uso de Azul da Prússia
 * @returns {number} — Taxa de excreção (Bq/dia)
 */
function taxaExcrecao(A0, t, biocinetica, comAzulPrussia = false) {
    let T1 = biocinetica.meiaVida1;
    let T2 = biocinetica.meiaVida2;

    if (comAzulPrussia) {
        T1 *= CONSTANTES.FATOR_REDUCAO_AZUL_PRUSSIA;
        T2 *= CONSTANTES.FATOR_REDUCAO_AZUL_PRUSSIA;
    }

    const lambdaFisico = CONSTANTES.LAMBDA_FISICO;
    const lambdaEf1 = lambdaFisico + calcularLambda(T1);
    const lambdaEf2 = lambdaFisico + calcularLambda(T2);

    return A0 * (
        biocinetica.fracao1 * lambdaEf1 * Math.exp(-lambdaEf1 * t) +
        biocinetica.fracao2 * lambdaEf2 * Math.exp(-lambdaEf2 * t)
    );
}


/**
 * Calcula a dose efetiva comprometida (E₅₀) a partir da atividade incorporada.
 *
 * Fórmula:
 *   E₅₀ = A₀ × e(g)
 *
 * Onde:
 *   A₀  = atividade incorporada (Bq)
 *   e(g) = coeficiente de dose efetiva comprometida para a faixa etária g (Sv/Bq)
 *
 * @param {number} atividadeBq — Atividade incorporada (Bq)
 * @param {string} faixaEtaria — Faixa etária (chave em FATOR_DOSE_EFETIVA)
 * @returns {number} — Dose efetiva comprometida (Sv)
 */
function calcularDoseEfetiva(atividadeBq, faixaEtaria) {
    const fator = CONSTANTES.FATOR_DOSE_EFETIVA[faixaEtaria];
    return atividadeBq * fator;
}


/**
 * Converte atividade (Bq) para dose absorvida considerando a massa do corpo.
 *
 * Fórmula simplificada (aproximação para irradiação uniforme de corpo inteiro):
 *   D(t) = (A_acum × E_média × 1.6e-13) / m
 *
 * Onde:
 *   A_acum = atividade acumulada integral ∫₀ᵗ R(τ)dτ (Bq·dia)
 *   E_média = energia média depositada por desintegração (MeV)
 *   1.6e-13 = fator de conversão MeV → Joule
 *   m = massa do corpo (kg)
 *   86400 = segundos por dia
 *
 * Para Cs-137: E_média ≈ 0.57 MeV (beta + gama ponderados)
 *
 * @param {number} atividadeAcumuladaBqDia — Integral da atividade (Bq·dia)
 * @param {number} massaKg                 — Massa corporal (kg)
 * @returns {number} — Dose absorvida (Gy)
 */
function calcularDoseAbsorvida(atividadeAcumuladaBqDia, massaKg) {
    const E_MEDIA_MEV = 0.57;                             // MeV por desintegração
    const MEV_PARA_JOULE = 1.602e-13;                     // J/MeV
    const SEGUNDOS_POR_DIA = 86400;

    // D = (Ã × E × conv × seg/dia) / m
    return (atividadeAcumuladaBqDia * SEGUNDOS_POR_DIA * E_MEDIA_MEV * MEV_PARA_JOULE) / massaKg;
}


/**
 * Calcula a integral numérica da atividade retida (Ã) usando regra do trapézio.
 *
 * Fórmula:
 *   Ã = ∫₀ᵗ R(τ) dτ ≈ Σᵢ [(R(τᵢ) + R(τᵢ₊₁)) / 2] × Δτ
 *
 * @param {number} A0             — Atividade inicial (Bq)
 * @param {number} tMax           — Tempo máximo (dias)
 * @param {object} biocinetica    — Parâmetros biocinéticos
 * @param {boolean} comAzulPrussia — Uso de Azul da Prússia
 * @param {number} passos         — Número de passos para integração
 * @returns {number} — Atividade acumulada (Bq·dia)
 */
function integralAtividade(A0, tMax, biocinetica, comAzulPrussia = false, passos = 1000) {
    const dt = tMax / passos;
    let integral = 0;

    for (let i = 0; i < passos; i++) {
        const t1 = i * dt;
        const t2 = (i + 1) * dt;
        const R1 = retencaoCorporal(A0, t1, biocinetica, comAzulPrussia);
        const R2 = retencaoCorporal(A0, t2, biocinetica, comAzulPrussia);
        integral += (R1 + R2) / 2 * dt;
    }

    return integral;
}


/**
 * Classifica o nível de risco da Síndrome Aguda da Radiação (SAR).
 *
 * Sistema semafórico:
 *   🟢 VERDE:    D < 1 Sv  — Sem síndrome aguda esperada
 *   🟡 AMARELO:  1 ≤ D < 2 Sv — Síndrome leve (náusea, linfopenia)
 *   🟠 LARANJA:  2 ≤ D < 4 Sv — Síndrome hematopoiética
 *   🔴 VERMELHO: 4 ≤ D < 6 Sv — Risco significativo de morte
 *   ⚫ CRÍTICO:  D ≥ 6 Sv     — Dose geralmente letal
 *
 * @param {number} doseSv — Dose efetiva ou absorvida (Sv ou Gy)
 * @returns {object} — { nivel, cor, descricao, mortalidade }
 */
function classificarSAR(doseSv) {
    const limiares = CONSTANTES.SAR_LIMIARES;

    if (doseSv < limiares.LEVE) {
        return {
            nivel: 0,
            cor: "verde",
            titulo: "Sem SAR",
            descricao: "Dose abaixo do limiar para Síndrome Aguda da Radiação. Possíveis efeitos estocásticos a longo prazo.",
            mortalidade: "< 1%"
        };
    } else if (doseSv < limiares.MODERADA) {
        return {
            nivel: 1,
            cor: "amarelo",
            titulo: "SAR Leve",
            descricao: "Síndrome prodrômica: náusea, vômito, fadiga. Linfopenia detectável. Recuperação esperada.",
            mortalidade: "< 5%"
        };
    } else if (doseSv < limiares.SEVERA) {
        return {
            nivel: 2,
            cor: "laranja",
            titulo: "SAR Moderada",
            descricao: "Síndrome hematopoiética. Queda significativa de leucócitos e plaquetas. Tratamento médico intensivo necessário.",
            mortalidade: "5 – 50%"
        };
    } else if (doseSv < limiares.LETAL) {
        return {
            nivel: 3,
            cor: "vermelho",
            titulo: "SAR Severa",
            descricao: "Falência da medula óssea provável. Hemorragias e infecções graves. Risco elevado de morte sem transplante.",
            mortalidade: "50 – 90%"
        };
    } else {
        return {
            nivel: 4,
            cor: "critico",
            titulo: "Dose Letal",
            descricao: "Síndrome gastrointestinal e/ou cerebrovascular. Prognóstico extremamente reservado mesmo com tratamento.",
            mortalidade: "> 90%"
        };
    }
}


/**
 * Gera a curva temporal completa de retenção corporal.
 *
 * Retorna um array de pontos {t, retencao, excrecao, doseAcumulada}
 * para plotagem de gráficos.
 *
 * @param {number} A0              — Atividade inicial (Bq)
 * @param {number} duracaoDias     — Duração total da simulação (dias)
 * @param {object} biocinetica     — Parâmetros biocinéticos
 * @param {boolean} comAzulPrussia — Uso de Azul da Prússia
 * @param {number} massaKg         — Massa corporal (kg)
 * @param {number} pontos          — Número de pontos da curva
 * @returns {Array} — Array de objetos { t, retencao, excrecao, doseSv }
 */
function gerarCurvaTemporal(A0, duracaoDias, biocinetica, comAzulPrussia, massaKg, pontos = 500) {
    const dt = duracaoDias / pontos;
    const curva = [];
    let integralAcum = 0;

    for (let i = 0; i <= pontos; i++) {
        const t = i * dt;
        const ret = retencaoCorporal(A0, t, biocinetica, comAzulPrussia);
        const exc = excrecaoAcumulada(A0, t, biocinetica, comAzulPrussia);

        // Integração trapezoidal incremental
        if (i > 0) {
            const retAnterior = retencaoCorporal(A0, (i - 1) * dt, biocinetica, comAzulPrussia);
            integralAcum += (retAnterior + ret) / 2 * dt;
        }

        const dose = calcularDoseAbsorvida(integralAcum, massaKg);

        curva.push({
            t: t,
            retencaoBq: ret,
            retencaoPct: (ret / A0) * 100,
            excrecaoBq: exc,
            excrecaoPct: (exc / A0) * 100,
            doseSv: dose,
        });
    }

    return curva;
}


/**
 * Calcula a atividade incorporada a partir de uma dose de exposição.
 *
 * Fórmula:
 *   A₀ = dose_externa × f_absorção / fator_dose
 *
 * Nota: para simplificação, usamos a relação inversa do fator de dose.
 * Em cenários reais, a atividade seria medida diretamente (Bq).
 *
 * @param {number} doseMBq       — Atividade da fonte (MBq)
 * @param {string} viaExposicao  — Via de exposição ("ingestao", "inalacao", "dermica")
 * @returns {number} — Atividade incorporada (Bq)
 */
function calcularAtividadeIncorporada(doseMBq, viaExposicao) {
    const fracaoAbsorcao = CONSTANTES.FRACAO_ABSORCAO_GI[viaExposicao] || 1.0;
    return doseMBq * 1e6 * fracaoAbsorcao; // Converte MBq → Bq e aplica absorção
}


// ============================================================================
// EXPORTAÇÃO PARA USO GLOBAL (sistema modular sem bundler)
// ============================================================================

window.Formulas = {
    CONSTANTES,
    calcularLambda,
    calcularMeiaVidaEfetiva,
    retencaoCorporal,
    excrecaoAcumulada,
    taxaExcrecao,
    calcularDoseEfetiva,
    calcularDoseAbsorvida,
    integralAtividade,
    classificarSAR,
    gerarCurvaTemporal,
    calcularAtividadeIncorporada,
};
