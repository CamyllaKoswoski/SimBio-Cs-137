/**
 * ============================================================================
 * APLICAÇÃO PRINCIPAL — Simulador Biocinético e Radiotoxicológico de Césio-137
 * ============================================================================
 * Este arquivo gerencia a interface, validação, cálculos (via formulas.js)
 * e renderização de gráficos/resultados.
 * ============================================================================
 */

"use strict";

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    inicializarFormulario();
    registrarEventos();
});


// ============================================================================
// REFERÊNCIAS DO DOM
// ============================================================================

function getEl(id) { return document.getElementById(id); }

const DOM = {};

function inicializarFormulario() {
    DOM.formAtividade     = getEl("input-atividade");
    DOM.formVia           = getEl("input-via");
    DOM.formIdade         = getEl("input-idade");
    DOM.formPeso          = getEl("input-peso");
    DOM.formLatencia      = getEl("input-latencia");
    DOM.formDuracao       = getEl("input-duracao");
    DOM.formAzulPrussia   = getEl("input-azul-prussia");
    DOM.btnSimular        = getEl("btn-simular");
    DOM.btnLimpar         = getEl("btn-limpar");
    DOM.resultados        = getEl("secao-resultados");

    // Preencher peso automático ao mudar a faixa etária
    DOM.formIdade.addEventListener("change", () => {
        const faixa = DOM.formIdade.value;
        const pesoRef = Formulas.CONSTANTES.PESO_REFERENCIA[faixa];
        if (pesoRef && (!DOM.formPeso.value || DOM.formPeso.dataset.auto === "true")) {
            DOM.formPeso.value = pesoRef;
            DOM.formPeso.dataset.auto = "true";
        }
    });

    DOM.formPeso.addEventListener("input", () => {
        DOM.formPeso.dataset.auto = "false";
    });

    // Definir peso initial
    const faixaInicial = DOM.formIdade.value;
    DOM.formPeso.value = Formulas.CONSTANTES.PESO_REFERENCIA[faixaInicial];
    DOM.formPeso.dataset.auto = "true";
}


// ============================================================================
// EVENTOS
// ============================================================================

function registrarEventos() {
    DOM.btnSimular.addEventListener("click", executarSimulacao);
    DOM.btnLimpar.addEventListener("click", limparTudo);

    // Permitir Enter para simular
    document.querySelectorAll(".form-group input").forEach(input => {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") executarSimulacao();
        });
    });
}


// ============================================================================
// VALIDAÇÃO
// ============================================================================

function validarEntradas() {
    const erros = [];

    const atividadeMBq = parseFloat(DOM.formAtividade.value);
    const peso = parseFloat(DOM.formPeso.value);
    const latencia = parseFloat(DOM.formLatencia.value);
    const duracao = parseFloat(DOM.formDuracao.value);

    if (isNaN(atividadeMBq) || atividadeMBq <= 0)         erros.push("Atividade deve ser um número positivo.");
    if (isNaN(peso) || peso <= 0 || peso > 300)             erros.push("Peso deve estar entre 0.1 e 300 kg.");
    if (isNaN(latencia) || latencia < 0)                    erros.push("Latência não pode ser negativa.");
    if (isNaN(duracao) || duracao <= 0 || duracao > 36500)   erros.push("Duração deve estar entre 1 e 36500 dias.");

    return erros;
}


// ============================================================================
// SIMULAÇÃO PRINCIPAL
// ============================================================================

function executarSimulacao() {
    const erros = validarEntradas();
    if (erros.length > 0) {
        mostrarErros(erros);
        return;
    }

    // Coletar parâmetros
    const params = {
        atividadeMBq: parseFloat(DOM.formAtividade.value),
        viaExposicao: DOM.formVia.value,
        faixaEtaria:  DOM.formIdade.value,
        pesoKg:       parseFloat(DOM.formPeso.value),
        latenciaH:    parseFloat(DOM.formLatencia.value),
        duracaoDias:  parseFloat(DOM.formDuracao.value),
        azulPrussia:  DOM.formAzulPrussia.checked,
    };

    // Calcular atividade incorporada
    const A0 = Formulas.calcularAtividadeIncorporada(params.atividadeMBq, params.viaExposicao);

    // Obter parâmetros biocinéticos
    const biocinetica = Formulas.CONSTANTES.BIOCINETICA_POR_IDADE[params.faixaEtaria];

    // Gerar curvas
    const curvaSemAP = Formulas.gerarCurvaTemporal(
        A0, params.duracaoDias, biocinetica, false, params.pesoKg, 500
    );

    let curvaComAP = null;
    if (params.azulPrussia) {
        curvaComAP = Formulas.gerarCurvaTemporal(
            A0, params.duracaoDias, biocinetica, true, params.pesoKg, 500
        );
    }

    // Dose efetiva comprometida (50 anos)
    const doseEfetiva = Formulas.calcularDoseEfetiva(A0, params.faixaEtaria);

    // Dose absorvida ao final da simulação
    const integralSemAP = Formulas.integralAtividade(A0, params.duracaoDias, biocinetica, false);
    const doseAbsorvidaSemAP = Formulas.calcularDoseAbsorvida(integralSemAP, params.pesoKg);

    let doseAbsorvidaComAP = null;
    if (params.azulPrussia) {
        const integralComAP = Formulas.integralAtividade(A0, params.duracaoDias, biocinetica, true);
        doseAbsorvidaComAP = Formulas.calcularDoseAbsorvida(integralComAP, params.pesoKg);
    }

    // Meias-vidas efetivas
    const T_bio1 = params.azulPrussia
        ? biocinetica.meiaVida2 * Formulas.CONSTANTES.FATOR_REDUCAO_AZUL_PRUSSIA
        : biocinetica.meiaVida2;
    const meiaVidaEfetiva = Formulas.calcularMeiaVidaEfetiva(
        Formulas.CONSTANTES.MEIA_VIDA_FISICA_DIAS, T_bio1
    );

    // Classificação SAR
    const dosePrincipal = params.azulPrussia ? doseAbsorvidaComAP : doseAbsorvidaSemAP;
    const classificacaoSAR = Formulas.classificarSAR(dosePrincipal);

    // Retenção no tempo da latência (convertir horas → dias)
    const latenciaDias = params.latenciaH / 24;
    const retencaoLatencia = Formulas.retencaoCorporal(A0, latenciaDias, biocinetica, params.azulPrussia);

    // Montar resultado
    const resultado = {
        params,
        A0,
        biocinetica,
        curvaSemAP,
        curvaComAP,
        doseEfetiva,
        doseAbsorvidaSemAP,
        doseAbsorvidaComAP,
        meiaVidaEfetiva,
        classificacaoSAR,
        retencaoLatencia,
        latenciaDias,
    };

    renderizarResultados(resultado);
}


// ============================================================================
// RENDERIZAÇÃO DOS RESULTADOS
// ============================================================================

function renderizarResultados(r) {
    DOM.resultados.innerHTML = "";
    DOM.resultados.classList.add("visible");

    // 1. Métricas principais
    renderizarMetricas(r);

    // 2. Alerta SAR
    renderizarAlertaSAR(r);

    // 3. Gráficos
    renderizarGraficos(r);

    // 4. Tabela de dados
    renderizarTabela(r);

    // 5. Informações detalhadas
    renderizarDetalhes(r);

    // Scroll suave para resultados
    DOM.resultados.scrollIntoView({ behavior: "smooth", block: "start" });
}


function renderizarMetricas(r) {
    const doseRef = r.params.azulPrussia ? r.doseAbsorvidaComAP : r.doseAbsorvidaSemAP;

    const metricas = [
        {
            valor: formatarNumero(r.A0 / 1e6, 2) + " MBq",
            label: "Atividade Incorporada",
            sub: formatarNumero(r.A0, 0) + " Bq"
        },
        {
            valor: formatarDose(r.doseEfetiva),
            label: "Dose Efetiva Comprometida",
            sub: "E₅₀ (ICRP)"
        },
        {
            valor: formatarDose(doseRef),
            label: "Dose Absorvida" + (r.params.azulPrussia ? " (c/ AP)" : ""),
            sub: "Corpo inteiro em " + r.params.duracaoDias + " dias"
        },
        {
            valor: formatarNumero(r.meiaVidaEfetiva, 1) + " dias",
            label: "Meia-vida Efetiva",
            sub: "T_ef (comp. lento)"
        },
    ];

    const grid = criarElemento("div", "metrics-grid animate-in");

    metricas.forEach(m => {
        const card = criarElemento("div", "metric-card");
        card.innerHTML = `
            <div class="metric-value">${m.valor}</div>
            <div class="metric-label">${m.label}</div>
            ${m.sub ? `<div class="metric-sub">${m.sub}</div>` : ""}
        `;
        grid.appendChild(card);
    });

    DOM.resultados.appendChild(grid);
}


function renderizarAlertaSAR(r) {
    const sar = r.classificacaoSAR;

    const icones = {
        verde: "✅", amarelo: "⚠️", laranja: "🔶",
        vermelho: "🔴", critico: "☢️"
    };

    const alerta = criarElemento("div", `sar-alert ${sar.cor} animate-in`);
    alerta.innerHTML = `
        <div class="sar-indicator">${icones[sar.cor]}</div>
        <div class="sar-content">
            <h3>${sar.titulo}</h3>
            <p>${sar.descricao}</p>
            <span class="sar-mortalidade">Mortalidade estimada: ${sar.mortalidade}</span>
        </div>
    `;

    DOM.resultados.appendChild(alerta);
}


function renderizarGraficos(r) {
    const card = criarElemento("div", "card animate-in");

    // Tabs
    const tabs = criarElemento("div", "tabs");
    const tabBtns = [
        { id: "tab-retencao", label: "Retenção Corporal" },
        { id: "tab-excrecao", label: "Excreção" },
        { id: "tab-dose",     label: "Dose Acumulada" },
    ];

    tabBtns.forEach((tb, i) => {
        const btn = criarElemento("button", `tab-btn${i === 0 ? " active" : ""}`);
        btn.textContent = tb.label;
        btn.dataset.tab = tb.id;
        btn.addEventListener("click", () => trocarAba(btn, card));
        tabs.appendChild(btn);
    });

    card.appendChild(tabs);

    // Canvas para gráfico
    const chartContainer = criarElemento("div", "chart-container");
    const canvas = document.createElement("canvas");
    canvas.id = "grafico-principal";
    canvas.className = "chart-canvas";
    chartContainer.appendChild(canvas);
    card.appendChild(chartContainer);

    DOM.resultados.appendChild(card);

    // Armazenar dados para troca de abas
    card._dadosGrafico = r;
    card._abaAtual = "tab-retencao";

    // Desenhar gráfico inicial
    desenharGrafico(canvas, r, "tab-retencao");
}


function trocarAba(btnAtivo, card) {
    card.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btnAtivo.classList.add("active");

    const aba = btnAtivo.dataset.tab;
    card._abaAtual = aba;

    const canvas = card.querySelector("canvas");
    desenharGrafico(canvas, card._dadosGrafico, aba);
}


// ============================================================================
// MOTOR DE GRÁFICOS (Canvas puro — sem dependências)
// ============================================================================

function desenharGrafico(canvas, r, aba) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // Ajustar para tela retina
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 340 * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = "340px";
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = 340;

    // Margens
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const plotW = W - margin.left - margin.right;
    const plotH = H - margin.top - margin.bottom;

    // Limpar
    ctx.clearRect(0, 0, W, H);

    // Fundo do plot
    ctx.fillStyle = "rgba(15, 23, 40, 0.5)";
    roundRect(ctx, margin.left, margin.top, plotW, plotH, 4);
    ctx.fill();

    // Selecionar dados
    let datasets = [];
    let yLabel = "";

    const curvaPrimaria = r.params.azulPrussia ? r.curvaComAP : r.curvaSemAP;

    if (aba === "tab-retencao") {
        datasets.push({
            data: r.curvaSemAP.map(p => ({ x: p.t, y: p.retencaoPct })),
            color: "#f97316",
            label: "Sem Azul da Prússia"
        });
        if (r.curvaComAP) {
            datasets.push({
                data: r.curvaComAP.map(p => ({ x: p.t, y: p.retencaoPct })),
                color: "#22c55e",
                label: "Com Azul da Prússia"
            });
        }
        yLabel = "Retenção (%)";
    } else if (aba === "tab-excrecao") {
        datasets.push({
            data: r.curvaSemAP.map(p => ({ x: p.t, y: p.excrecaoPct })),
            color: "#3b82f6",
            label: "Sem Azul da Prússia"
        });
        if (r.curvaComAP) {
            datasets.push({
                data: r.curvaComAP.map(p => ({ x: p.t, y: p.excrecaoPct })),
                color: "#22c55e",
                label: "Com Azul da Prússia"
            });
        }
        yLabel = "Excreção Acumulada (%)";
    } else if (aba === "tab-dose") {
        datasets.push({
            data: r.curvaSemAP.map(p => ({ x: p.t, y: p.doseSv * 1000 })), // mSv
            color: "#ef4444",
            label: "Sem Azul da Prússia"
        });
        if (r.curvaComAP) {
            datasets.push({
                data: r.curvaComAP.map(p => ({ x: p.t, y: p.doseSv * 1000 })),
                color: "#22c55e",
                label: "Com Azul da Prússia"
            });
        }
        yLabel = "Dose (mSv)";
    }

    // Calcular escalas
    let allY = [];
    datasets.forEach(ds => ds.data.forEach(p => allY.push(p.y)));
    const xMax = r.params.duracaoDias;
    const yMax = Math.max(...allY) * 1.1 || 1;

    function scaleX(v) { return margin.left + (v / xMax) * plotW; }
    function scaleY(v) { return margin.top + plotH - (v / yMax) * plotH; }

    // Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
        const yVal = (yMax / yTicks) * i;
        const yPos = scaleY(yVal);
        ctx.beginPath();
        ctx.moveTo(margin.left, yPos);
        ctx.lineTo(margin.left + plotW, yPos);
        ctx.stroke();

        // Label Y
        ctx.fillStyle = "#4f5b6f";
        ctx.font = "11px 'Inter', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(formatarNumeroGrafico(yVal), margin.left - 8, yPos + 4);
    }

    const xTicks = Math.min(8, Math.ceil(xMax));
    for (let i = 0; i <= xTicks; i++) {
        const xVal = (xMax / xTicks) * i;
        const xPos = scaleX(xVal);
        ctx.beginPath();
        ctx.moveTo(xPos, margin.top);
        ctx.lineTo(xPos, margin.top + plotH);
        ctx.stroke();

        // Label X
        ctx.fillStyle = "#4f5b6f";
        ctx.font = "11px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(formatarNumeroGrafico(xVal), xPos, margin.top + plotH + 20);
    }

    // Eixo labels
    ctx.fillStyle = "#8893a7";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Tempo (dias)", margin.left + plotW / 2, H - 8);

    ctx.save();
    ctx.translate(16, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Desenhar linhas dos datasets
    datasets.forEach(ds => {
        // Gradiente de preenchimento
        const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + plotH);
        gradient.addColorStop(0, hexToRGBA(ds.color, 0.15));
        gradient.addColorStop(1, hexToRGBA(ds.color, 0));

        // Área preenchida
        ctx.beginPath();
        ctx.moveTo(scaleX(ds.data[0].x), scaleY(0));
        ds.data.forEach(p => ctx.lineTo(scaleX(p.x), scaleY(p.y)));
        ctx.lineTo(scaleX(ds.data[ds.data.length - 1].x), scaleY(0));
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Linha
        ctx.beginPath();
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ds.data.forEach((p, i) => {
            const x = scaleX(p.x);
            const y = scaleY(p.y);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    });

    // Legenda
    const legendaY = margin.top + 12;
    let legendaX = margin.left + 12;
    datasets.forEach(ds => {
        ctx.fillStyle = ds.color;
        ctx.beginPath();
        ctx.arc(legendaX + 5, legendaY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#a0aec0";
        ctx.font = "11px 'Inter', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(ds.label, legendaX + 14, legendaY + 4);
        legendaX += ctx.measureText(ds.label).width + 30;
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


// ============================================================================
// TABELA DE DADOS
// ============================================================================

function renderizarTabela(r) {
    const card = criarElemento("div", "card animate-in");
    card.innerHTML = `<div class="card-title"><span class="card-title-icon">📋</span>Dados Temporais</div>`;

    const container = criarElemento("div", "data-table-container");
    container.style.maxHeight = "320px";
    container.style.overflow = "auto";

    const curva = r.params.azulPrussia ? r.curvaComAP : r.curvaSemAP;
    const comAP = r.params.azulPrussia;

    // Selecionar ~20 pontos representativos
    const step = Math.max(1, Math.floor(curva.length / 20));
    const pontos = [];
    for (let i = 0; i < curva.length; i += step) pontos.push(curva[i]);
    if (pontos[pontos.length - 1] !== curva[curva.length - 1]) {
        pontos.push(curva[curva.length - 1]);
    }

    let html = `<table class="data-table">
        <thead><tr>
            <th>Dia</th>
            <th>Retenção (Bq)</th>
            <th>Retenção (%)</th>
            <th>Excreção (%)</th>
            <th>Dose (mSv)</th>
        </tr></thead><tbody>`;

    pontos.forEach(p => {
        html += `<tr>
            <td>${formatarNumero(p.t, 1)}</td>
            <td>${formatarNumero(p.retencaoBq, 0)}</td>
            <td>${formatarNumero(p.retencaoPct, 2)}%</td>
            <td>${formatarNumero(p.excrecaoPct, 2)}%</td>
            <td>${formatarNumero(p.doseSv * 1000, 4)}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
    card.appendChild(container);

    DOM.resultados.appendChild(card);
}


// ============================================================================
// DETALHES / INFORMAÇÕES
// ============================================================================

function renderizarDetalhes(r) {
    const card = criarElemento("div", "card animate-in");

    const bio = r.biocinetica;
    const fatorAP = r.params.azulPrussia ? Formulas.CONSTANTES.FATOR_REDUCAO_AZUL_PRUSSIA : 1;

    const T1_bio = bio.meiaVida1 * fatorAP;
    const T2_bio = bio.meiaVida2 * fatorAP;
    const T1_ef = Formulas.calcularMeiaVidaEfetiva(Formulas.CONSTANTES.MEIA_VIDA_FISICA_DIAS, T1_bio);
    const T2_ef = Formulas.calcularMeiaVidaEfetiva(Formulas.CONSTANTES.MEIA_VIDA_FISICA_DIAS, T2_bio);

    const fracAbsorc = Formulas.CONSTANTES.FRACAO_ABSORCAO_GI[r.params.viaExposicao];
    const labelVia = { "ingestao": "Ingestão", "inalacao": "Inalação", "dermica": "Dérmica" };

    card.innerHTML = `
        <div class="card-title"><span class="card-title-icon">🔬</span>Parâmetros da Simulação</div>
        <div class="info-box">
            <strong>Modelo bicompartimental</strong> (ICRP 56/67)<br><br>
            <strong>Compartimento 1 (rápido):</strong> fração = ${bio.fracao1} · T_bio = ${formatarNumero(T1_bio, 1)} dias · T_ef = ${formatarNumero(T1_ef, 2)} dias<br>
            <strong>Compartimento 2 (lento):</strong> fração = ${bio.fracao2} · T_bio = ${formatarNumero(T2_bio, 1)} dias · T_ef = ${formatarNumero(T2_ef, 2)} dias<br><br>
            <strong>Via de exposição:</strong> ${labelVia[r.params.viaExposicao]} (f₁ = ${fracAbsorc})<br>
            <strong>Faixa etária:</strong> ${r.params.faixaEtaria.replace("_", " ")} · Peso: ${r.params.pesoKg} kg<br>
            <strong>Meia-vida física (Cs-137):</strong> ${formatarNumero(Formulas.CONSTANTES.MEIA_VIDA_FISICA_DIAS, 0)} dias (~30.17 anos)<br>
            <strong>Fator de dose efetiva:</strong> ${Formulas.CONSTANTES.FATOR_DOSE_EFETIVA[r.params.faixaEtaria]} Sv/Bq<br>
            ${r.params.azulPrussia ? `<br><strong style="color: var(--sar-verde);">☑ Azul da Prússia ativo</strong> — Fator de redução: ${Formulas.CONSTANTES.FATOR_REDUCAO_AZUL_PRUSSIA} (reduz T_bio em ~60%)` : ""}
        </div>
    `;

    // Comparação de doses com/sem AP
    if (r.params.azulPrussia && r.doseAbsorvidaComAP !== null) {
        const reducao = ((r.doseAbsorvidaSemAP - r.doseAbsorvidaComAP) / r.doseAbsorvidaSemAP * 100);
        const compHTML = `
            <div style="margin-top: 16px;" class="comparison-grid">
                <div>
                    <div class="comparison-label without-ap">Sem Azul da Prússia</div>
                    <div class="metric-value" style="font-size: 1.2rem; color: var(--sar-laranja);">${formatarDose(r.doseAbsorvidaSemAP)}</div>
                </div>
                <div>
                    <div class="comparison-label with-ap">Com Azul da Prússia</div>
                    <div class="metric-value" style="font-size: 1.2rem; color: var(--sar-verde);">${formatarDose(r.doseAbsorvidaComAP)}</div>
                </div>
            </div>
            <div class="info-box" style="margin-top: 12px;">
                <strong>Redução da dose absorvida:</strong> ${formatarNumero(reducao, 1)}%
            </div>
        `;
        card.innerHTML += compHTML;
    }

    DOM.resultados.appendChild(card);
}


// ============================================================================
// UTILIDADES
// ============================================================================

function criarElemento(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
}

function formatarNumero(num, decimais) {
    if (num === undefined || num === null || isNaN(num)) return "—";
    if (Math.abs(num) >= 1e6) return num.toExponential(decimais);
    return num.toLocaleString("pt-BR", {
        minimumFractionDigits: decimais,
        maximumFractionDigits: decimais
    });
}

function formatarNumeroGrafico(num) {
    if (num === 0) return "0";
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + "k";
    if (Math.abs(num) < 0.01) return num.toExponential(1);
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2);
}

function formatarDose(doseSv) {
    if (doseSv === null || doseSv === undefined) return "—";
    if (doseSv >= 1) return formatarNumero(doseSv, 3) + " Sv";
    if (doseSv >= 0.001) return formatarNumero(doseSv * 1000, 2) + " mSv";
    return formatarNumero(doseSv * 1e6, 1) + " μSv";
}

function mostrarErros(erros) {
    const msg = erros.join("\n");
    alert("⚠️ Verifique os dados de entrada:\n\n" + msg);
}

function limparTudo() {
    DOM.formAtividade.value = "";
    DOM.formVia.value = "ingestao";
    DOM.formIdade.value = "adulto";
    DOM.formPeso.value = Formulas.CONSTANTES.PESO_REFERENCIA["adulto"];
    DOM.formPeso.dataset.auto = "true";
    DOM.formLatencia.value = "0";
    DOM.formDuracao.value = "365";
    DOM.formAzulPrussia.checked = false;

    DOM.resultados.classList.remove("visible");
    DOM.resultados.innerHTML = "";
}


// ============================================================================
// RESPONSIVIDADE — Redesenhar gráfico ao redimensionar janela
// ============================================================================

let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const canvas = document.querySelector("#grafico-principal");
        if (canvas) {
            const card = canvas.closest(".card");
            if (card && card._dadosGrafico) {
                desenharGrafico(canvas, card._dadosGrafico, card._abaAtual);
            }
        }
    }, 200);
});
