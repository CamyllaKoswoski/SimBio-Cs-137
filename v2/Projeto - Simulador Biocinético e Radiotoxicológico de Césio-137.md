### 1. Visão Geral

O projeto consiste no desenvolvimento de um **software de modelagem computacional preditiva** focado na dinâmica do radioisótopo Césio-137 ($^{137}Cs$) no organismo humano e no ambiente. O objetivo central é oferecer uma ferramenta capaz de simular cenários de contaminação, calculando em tempo real a absorção, distribuição e excreção do elemento, além de prever riscos clínicos imediatos e tardios.

### 2. Fundamentação Científica

O diferencial do simulador reside na precisão do seu "motor" matemático. O Césio-137 é um análogo químico do potássio ($K^+$), o que faz com que ele seja rapidamente absorvido pela bomba de sódio-potássio e distribuído pelos tecidos moles.

O programa utiliza **Equações Diferenciais Ordinárias (EDOs)** para modelar a taxa de variação da atividade radioativa no corpo, considerando:

- **Meia-vida Física:** O decaimento natural do isótopo (~30 anos).
    
- **Meia-vida Biológica:** O tempo de eliminação metabólica (variável conforme idade e peso).
    
- **Ação Farmacológica:** O impacto do **Azul da Prússia** como agente quelante, que atua no lúmen intestinal para acelerar a excreção e reduzir a dose absorvida.
    

### 3. Arquitetura do Sistema (A Abordagem de TI)

O software será estruturado em três camadas principais:

- **Camada de Entrada (Inputs):** Interface para inserção de variáveis críticas, como via de exposição (dérmica, ingestão ou inalação), dose estimada, tempo de latência até o socorro e parâmetros fisiológicos do indivíduo.
    
- **Camada de Processamento (Kernel):** Algoritmos que resolvem as equações de biocinética. Aqui, a TI aplica métodos numéricos para transformar a teoria física em curvas de dados temporais.
    
- **Camada de Saída (Visualização):** Geração de gráficos dinâmicos de concentração de dose e um sistema de **alerta semafórico** (verde, amarelo e vermelho) para a Síndrome Aguda da Radiação (SAR), facilitando a interpretação rápida para tomadas de decisão em emergências.
    

### 4. Relevância e Impacto (Fit SBPC)

O projeto se alinha ao tema da SBPC 2026 (**"Ciência para todos: soberania, desenvolvimento e inclusão"**) ao propor uma solução tecnológica nacional para um problema de segurança nuclear e saúde pública. Ele democratiza o acesso a cálculos complexos de física médica, transformando-os em uma interface inclusiva e visual, essencial para a defesa civil e o desenvolvimento científico soberano do Brasil.