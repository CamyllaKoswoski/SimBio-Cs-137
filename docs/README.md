# ☢️ SimBio Cs-137 — Simulador Biocinético e Radiotoxicológico de Césio-137

**Versão 1.0** · Março 2026

Um software de modelagem computacional preditiva focado na dinâmica do radioisótopo Césio-137 (¹³⁷Cs) no organismo humano. O simulador calcula em tempo real a absorção, distribuição e excreção do elemento, além de prever riscos clínicos imediatos e tardios com base nos modelos da ICRP (International Commission on Radiological Protection).

---

## 📋 Índice

1. [Requisitos do Sistema](#-requisitos-do-sistema)
2. [Instalação (Computador Recém-Formatado)](#-instalação-passo-a-passo)
3. [Como Iniciar a Aplicação](#-como-iniciar-a-aplicação)
4. [Guia de Uso Completo](#-guia-de-uso-completo)
5. [Entendendo os Resultados](#-entendendo-os-resultados)
6. [Estrutura dos Arquivos](#-estrutura-dos-arquivos)
7. [Arquivo de Fórmulas (Para Especialistas)](#-arquivo-de-fórmulas-para-especialistas)
8. [Fundamentação Científica](#-fundamentação-científica)
9. [Perguntas Frequentes](#-perguntas-frequentes)
10. [Créditos e Referências](#-créditos-e-referências)

---

## 💻 Requisitos do Sistema

O programa é **extremamente leve** e roda em qualquer computador moderno.

| Requisito | Mínimo | Recomendado |
|---|---|---|
| **Sistema Operacional** | Windows 7 ou superior | Windows 10/11 |
| **Navegador** | Qualquer navegador instalado | Google Chrome, Firefox ou Edge |
| **Memória RAM** | 512 MB | 2 GB ou mais |
| **Espaço em disco** | < 1 MB | < 1 MB |
| **Internet** | ❌ **NÃO necessária** | ❌ **NÃO necessária** |
| **Instalação de software adicional** | ❌ **Nenhuma** | ❌ **Nenhuma** |

> **Nota:** O programa funciona **100% offline**. Não é necessário instalar nada além de um navegador de internet, que já vem pré-instalado em qualquer versão do Windows.

---

## 🔧 Instalação (Passo a Passo)

### Partindo de um computador recém-formatado:

#### Passo 1 — Verificar o navegador

O Windows já vem com o **Microsoft Edge** pré-instalado. Isso é **suficiente** para rodar o simulador. Você não precisa instalar nenhum outro programa.

Se preferir usar outro navegador (opcional):
- **Google Chrome:** https://www.google.com/chrome
- **Mozilla Firefox:** https://www.mozilla.org/pt-BR/firefox

#### Passo 2 — Copiar a pasta do simulador

Copie toda a pasta **`v2`** (ou o nome que você deu à pasta do projeto) para qualquer lugar do seu computador. Exemplos de locais sugeridos:

- `C:\Users\SeuNome\Documentos\SimBio Cs-137\`
- `C:\Users\SeuNome\Desktop\SimBio Cs-137\`
- Qualquer pendrive ou HD externo (o programa funciona direto do pendrive!)

> ⚠️ **Importante:** Mantenha todos os arquivos juntos. Não mova arquivos individuais para fora da pasta, caso contrário o programa não funcionará.

#### Passo 3 — Pronto!

Não há mais nada para instalar. O simulador já está pronto para uso.

---

## 🚀 Como Iniciar a Aplicação

1. Abra a pasta onde o simulador foi salvo
2. Dê **duplo clique** no arquivo:

   ```
   Iniciar SimBio Cs-137.bat
   ```

3. Uma janela preta (prompt de comando) aparecerá brevemente com a mensagem:
   ```
   =====================================================
    SimBio Cs-137 - Simulador Biocinético de Césio-137
   =====================================================

    Abrindo o simulador no navegador padrão...
   ```

4. O simulador será aberto automaticamente no seu navegador padrão
5. A janela preta se fechará sozinha após alguns segundos

> **Dica:** Se o Windows exibir um aviso de segurança ao abrir o `.bat`, clique em **"Mais informações"** e depois em **"Executar assim mesmo"**. Isso acontece porque o arquivo `.bat` não possui assinatura digital, mas ele é completamente seguro — apenas abre uma página HTML no navegador.

---

## 📖 Guia de Uso Completo

### O que cada campo significa

Ao abrir o simulador, você verá o formulário **"Parâmetros de Exposição"** com os seguintes campos:

| Campo | O que significa | Exemplo |
|---|---|---|
| **Atividade da Fonte (MBq)** | A quantidade de radioatividade do material contaminante, medida em Megabecquerels. Quanto maior, mais intensa a fonte. | `50.9` (caso de Goiânia) |
| **Via de Exposição** | Como a pessoa entrou em contato com o material radioativo. | Ingestão, Inalação ou Dérmica |
| **Faixa Etária** | Idade do indivíduo exposto. Afeta a velocidade de eliminação do corpo. | Neonato até Adulto |
| **Peso Corporal (kg)** | Peso do indivíduo. Preenchido automaticamente conforme a faixa etária, mas pode ser ajustado. | `70` kg para adulto |
| **Latência até Socorro (horas)** | Tempo entre a contaminação e o início do atendimento médico. | `0` a `168` horas (1 semana) |
| **Duração da Simulação (dias)** | Por quantos dias o simulador deve projetar os dados. | `365` (1 ano) |
| **Azul da Prússia** | Marque esta opção para simular o efeito do tratamento com Azul da Prússia (medicamento quelante usado em contaminação por Césio). | ☑ Ativado ou ☐ Desativado |

### Passo a passo de uma simulação

1. **Preencha a atividade da fonte** — Digite o valor em MBq. Exemplo: `50.9`
2. **Selecione a via de exposição** — Como a contaminação ocorreu
3. **Escolha a faixa etária** — O peso será preenchido automaticamente
4. **Ajuste o peso** (se necessário) — Caso o indivíduo tenha peso diferente da referência
5. **Informe a latência** — Horas até o socorro (se não souber, deixe `0`)
6. **Defina a duração** — Quantos dias quer simular (padrão: 365 dias = 1 ano)
7. **Marque o Azul da Prússia** — Se quiser comparar cenários com e sem tratamento
8. **Clique em "▶ Executar Simulação"**

Os resultados aparecerão imediatamente abaixo do formulário.

### Para fazer uma nova simulação

- Altere os valores desejados e clique em **"▶ Executar Simulação"** novamente, ou
- Clique em **"↺ Limpar"** para resetar todos os campos

---

## 📊 Entendendo os Resultados

Após executar a simulação, quatro seções de resultados serão exibidas:

### 1. Cards de Métricas

Quatro indicadores principais no topo:

| Métrica | O que significa |
|---|---|
| **Atividade Incorporada** | Quantidade de Cs-137 que efetivamente entrou no corpo (em MBq e Bq) |
| **Dose Efetiva Comprometida** | Dose total que o corpo receberá ao longo de 50 anos, conforme ICRP |
| **Dose Absorvida** | Dose recebida pelo corpo inteiro no período simulado |
| **Meia-vida Efetiva** | Tempo para o corpo eliminar metade do Cs-137 (combina decaimento físico + biológico) |

### 2. Alerta SAR (Sistema Semafórico)

Um indicador visual colorido que classifica o risco de Síndrome Aguda da Radiação:

| Cor | Nível | Dose | Significado |
|---|---|---|---|
| 🟢 **Verde** | Sem SAR | < 1 Sv | Sem síndrome aguda. Possíveis efeitos a longo prazo apenas. |
| 🟡 **Amarelo** | SAR Leve | 1–2 Sv | Náusea, fadiga, linfopenia. Recuperação esperada. |
| 🟠 **Laranja** | SAR Moderada | 2–4 Sv | Queda de leucócitos/plaquetas. Tratamento intensivo. |
| 🔴 **Vermelho** | SAR Severa | 4–6 Sv | Falência de medula óssea. Risco elevado de morte. |
| ⚫ **Crítico** | Dose Letal | > 6 Sv | Prognóstico extremamente reservado. Mortalidade > 90%. |

### 3. Gráficos Interativos

Três gráficos acessíveis por abas:

- **Retenção Corporal (%):** Mostra como a atividade no corpo diminui ao longo do tempo
- **Excreção (%):** Mostra a porcentagem acumulada eliminada pelo corpo
- **Dose Acumulada (mSv):** Mostra a dose absorvida acumulando-se ao longo do tempo

Se o Azul da Prússia estiver ativado, cada gráfico mostrará **duas curvas** para comparação:
- 🟠 **Laranja** → Sem tratamento
- 🟢 **Verde** → Com Azul da Prússia

### 4. Tabela de Dados Temporais

Uma tabela numérica com os valores detalhados em aproximadamente 20 pontos ao longo da simulação, contendo: dia, retenção (Bq e %), excreção (%) e dose (mSv).

### 5. Parâmetros da Simulação

Seção técnica que detalha todos os coeficientes usados internamente, incluindo frações compartimentais, meias-vidas biológicas, fatores de dose e o efeito do Azul da Prússia.

---

## 📁 Estrutura dos Arquivos

```
📂 SimBio Cs-137/
│
├── 📄 README.md                          ← Este arquivo (documentação)
├── 📄 Iniciar SimBio Cs-137.bat          ← Duplo clique para abrir o simulador
├── 📄 Projeto - Simulador...md           ← Documento descritivo do projeto
│
└── 📂 arquivos/                          ← Todos os arquivos da aplicação
    ├── 📄 index.html                     ← Página principal (interface)
    ├── 📄 estilos.css                    ← Aparência visual (tema escuro)
    ├── 📄 formulas.js                    ← 🔬 FÓRMULAS CIENTÍFICAS (auditável)
    └── 📄 app.js                         ← Lógica de interface e gráficos
```

> **Não mova, renomeie ou delete nenhum arquivo de dentro da pasta `arquivos/`.** O simulador precisa de todos eles para funcionar corretamente.

---

## 🔬 Arquivo de Fórmulas (Para Especialistas)

O arquivo `arquivos/formulas.js` foi **propositalmente separado** para facilitar a auditoria por especialistas em física médica, radioproteção ou dosimetria.

Ele contém **exclusivamente:**

- **Constantes físicas e biológicas** (ICRP 56, 67, 89, 119, 134)
- **Parâmetros biocinéticos** por faixa etária (modelo bicompartimental)
- **Frações de absorção** por via de exposição
- **Fatores de dose efetiva** (Sv/Bq)
- **Limiares da Síndrome Aguda da Radiação** (SAR)
- **Fator de redução do Azul da Prússia** (WHO/IAEA)

### Equações implementadas

| Equação | Fórmula |
|---|---|
| **Constante de decaimento** | `λ = ln(2) / T½` |
| **Meia-vida efetiva** | `T_ef = (T_f × T_b) / (T_f + T_b)` |
| **Retenção corporal** | `R(t) = A₀ × [a₁·e^(-λ_ef1·t) + a₂·e^(-λ_ef2·t)]` |
| **Taxa de excreção** | `dE/dt = A₀ × [a₁·λ_ef1·e^(-λ_ef1·t) + a₂·λ_ef2·e^(-λ_ef2·t)]` |
| **Dose efetiva comprometida** | `E₅₀ = A₀ × e(g)` |
| **Dose absorvida** | `D = (Ã × E_média × 1.6e⁻¹³ × 86400) / massa` |
| **Integração numérica** | Regra do Trapézio com 1000 passos |

Cada função possui documentação completa em formato JSDoc com a fórmula escrita por extenso, unidades e referências.

---

## 🔭 Fundamentação Científica

O Césio-137 é um análogo químico do potássio (K⁺). Quando incorporado ao organismo, é rapidamente absorvido pela bomba de sódio-potássio e distribuído pelos tecidos moles.

O simulador modela esse comportamento utilizando:

1. **Equações Diferenciais Ordinárias (EDOs)** para a taxa de variação da atividade radioativa
2. **Modelo bicompartimental da ICRP** com duas velocidades de eliminação:
   - Compartimento rápido (turnover celular acelerado)
   - Compartimento lento (tecido muscular e órgãos)
3. **Meia-vida física** do Cs-137: ~30,17 anos (decaimento para Ba-137m)
4. **Meia-vida biológica**: variável conforme idade (2 a 110 dias)
5. **Azul da Prússia** (ferrocianeto férrico): agente quelante aprovado pela FDA e OMS que liga-se ao Cs no trato intestinal, acelerando a excreção fecal e reduzindo a meia-vida biológica em aproximadamente 60%

### Publicações de referência

- ICRP Publication 56 (1989) — Age-dependent Doses to Members of the Public
- ICRP Publication 67 (1993) — Age-dependent Doses: Ingestion
- ICRP Publication 89 (2002) — Basic Anatomical and Physiological Data
- ICRP Publication 119 (2012) — Compendium of Dose Coefficients
- ICRP Publication 134 (2016) — Occupational Intakes of Radionuclides Part 2

---

## ❓ Perguntas Frequentes

### O programa precisa de internet?
**Não.** O simulador funciona 100% offline. Todos os cálculos são feitos localmente no seu navegador.

### Preciso instalar alguma coisa?
**Não.** Basta ter um navegador de internet (Edge, Chrome, Firefox, etc.), que já vem instalado no Windows.

### Funciona no Mac ou Linux?
O arquivo `.bat` é exclusivo do Windows. Porém, você pode abrir o arquivo `arquivos/index.html` diretamente em qualquer navegador, em qualquer sistema operacional.

### O Windows bloqueou a execução do .bat. O que faço?
Isso é normal para arquivos `.bat` baixados da internet. Clique em **"Mais informações"** → **"Executar assim mesmo"**. O arquivo apenas abre uma página HTML no navegador, não executa nenhuma ação no sistema.

### Posso rodar direto do pendrive?
**Sim!** Copie a pasta inteira para o pendrive e execute o `.bat` de lá. Funciona perfeitamente.

### Os dados são enviados para algum servidor?
**Não.** Nenhum dado sai do seu computador. Tudo é processado localmente no navegador.

### As fórmulas estão corretas?
As fórmulas foram implementadas com base nas publicações oficiais da ICRP. O arquivo `arquivos/formulas.js` foi separado especificamente para que especialistas possam abrir, ler e validar cada equação. Todas as funções possuem documentação detalhada.

### Posso usar isto em uma situação real de emergência?
**Este é um software educacional.** Embora baseado em dados da ICRP, ele não substitui a análise de um profissional de radioproteção. Em caso de acidente real, contate imediatamente o CNEN (Comissão Nacional de Energia Nuclear) ou o corpo de bombeiros.

---

## 📜 Créditos e Referências

- **Desenvolvido para:** SBPC 2026 — *"Ciência para todos: soberania, desenvolvimento e inclusão"*
- **Base científica:** ICRP Publications 56, 67, 89, 119, 134
- **Metodologia:** Modelagem bicompartimental com EDOs resolvidas numericamente
- **Tecnologia:** HTML5, CSS3, JavaScript puro (zero dependências)

---

*SimBio Cs-137 · Simulador Biocinético e Radiotoxicológico · Ferramenta educacional*
