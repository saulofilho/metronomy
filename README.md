# 🎵 Metrônomo Pro — Palco & Ensaio

<div align="center">
  <img src="/public/icon.jpg" alt="Metrônomo Pro Avatar" width="128" height="128" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(6, 182, 212, 0.35);" />
  <br />
  <p><strong>Metrônomo profissional de alta precisão projetado para músicos durante ensaios técnicos, estudos e apresentações ao vivo.</strong></p>
</div>

---

## 🌟 Principais Funcionalidades

### 1. ⏱️ Motor de Áudio de Alta Precisão (Web Audio API)
- **Zero Jitter**: Utiliza o algoritmo padrão *lookahead scheduler* da Web Audio API (`AudioContext.currentTime`).
- **Independente de Quedas de Frame**: O áudio continua perfeitamente cravado no tempo mesmo se a interface gráfica renderizar animações pesadas ou se o usuário rolar a página.
- **Faixa de Andamento**: 20 a 320 BPM com ajustes rápidos (±1, ±5, ÷2, ×2) e slider contínuo.
- **Tap Tempo Inteligente**: Média móvel ponderada dos últimos toques com estimativa em milissegundos e reset automático após inatividade.
- **Marcações Italianas**: Reconhecimento automático de termos clássicos (*Largo*, *Adagio*, *Andante*, *Moderato*, *Allegro*, *Vivace*, *Presto*, *Prestissimo*).

### 2. 🎼 Fórmulas de Compasso & Subdivisões
- **Compassos Padrão e Compostos**: 2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, 12/8 e modo personalizado (1 a 16 tempos por compasso).
- **Subdivisões Rítmicas**: Semínima (1), Colcheia (2), Tercina (3), Semicolcheia (4), Swing/Shuffle (suingue de jazz/blues) e Clave 3:2.
- **Acentos Interativos por Tempo**: Clique em qualquer tempo para alternar entre **Forte (Acento)**, **Médio**, **Fraco** ou **Mudo (Silêncio)**.

### 3. 🎸 Gerenciador de Repertório & Setlists para Shows
- Crie, edite e organize listas de músicas para shows ou sessões de gravação.
- Cada música armazena:
  - **Título & Artista**
  - **Andamento (BPM)** e **Fórmula de Compasso**
  - **Tom / Tonalidade (Key)** (ex: *Em*, *Bb maior*)
  - **Contagem de Entrada (Count-in)** (1 ou 2 compassos com sinal sonoro destacado)
  - **Timbre dedicado** e **Notas de arranjo/convenção** para a banda.
- Botões gigantes de **Próxima Música** e **Música Anterior** compatíveis com pedais footswitch USB/Bluetooth.
- Exportação e importação de repertórios em formato JSON para backup e compartilhamento entre músicos da banda.

### 4. 💡 Modo Palco Fullscreen (Visão Gigante)
- Interface de altíssimo contraste (AMOLED Black + Cyan/Emerald Glow) otimizada para estantes de partitura e palcos escuros.
- Números gigantes legíveis a até 4 metros de distância.
- Flash periférico de tela e de borda para palcos com alto volume onde o fone de retorno in-ear (IEM) não é suficiente.
- Atalho rápido de teclado: pressione **`F`** ou toque no botão superior.

### 5. 🏋️ Ferramentas de Estudo & Ensaio Técnico
- **Acelerador Gradual (Speed Trainer)**: Aumenta automaticamente o andamento em +X BPM a cada Y compassos tocados até atingir o BPM alvo (ideal para desenvolvimento de velocidade e técnica).
- **Treino de Ritmo Interior (Mute Trainer)**: Alterna entre compassos audíveis e compassos mudos (ex: 3 compassos tocando e 1 em silêncio) para testar a precisão do relógio interno do músico.
- **Cronômetro de Sessão & Contador de Compassos**: Acompanhe o tempo total de ensaio e número de compassos executados.

### 6. 📻 Diapasão Cromático & Afinação de Referência (440Hz)
- Gerador contínuo de ondas senoidais puras para checagem de afinação de instrumentos acústicos e elétricos antes de entrar no palco.
- Calibração de frequência: **440 Hz** (Padrão), **432 Hz** (Verdi) e **442 Hz** (Orquestral).
- Presets rápidos para: Violão/Guitarra (EADGBE), Baixo (EADG), Ukulele (GCEA) e escala cromática completa (C2 a B5).

### 7. 🔊 5 Timbres Sintetizados em Tempo Real
- **Bloco de Madeira (Woodblock)**: Madeira acústica ressonante padrão de estúdio.
- **Baquetas (Sticks)**: Estalo seco de baquetas de bateria para bandas de rock e pop.
- **Cowbell (808)**: Campana metálica de alta penetração para palcos barulhentos.
- **Bip Digital Pro**: Onda senoidal com envelope rápido e altíssima definição.
- **Sintetizador 808**: Punch eletrônico para pop, trap e música eletrônica.
- Transposição tonal do clique (±12 semitons) para evitar conflitos de frequência com guitarras ou pratos.

---

## ⌨️ Atalhos de Teclado & Footswitches de Palco

| Tecla | Ação |
| :--- | :--- |
| **`Espaço`** | Iniciar / Parar o Metrônomo |
| **`T`** | Tap Tempo (marca o andamento no ritmo do toque) |
| **`F`** | Alternar Modo Palco Fullscreen |
| **`↑` / `↓`** | Ajustar andamento em **±1 BPM** |
| **`Shift + ↑` / `Shift + ↓`** | Ajustar andamento em **±5 BPM** |
| **`N`** | Próxima música da Setlist |
| **`P`** | Música anterior da Setlist |
| **`A`** | Abrir Diapasão / Afinação de Palco |
| **`S`** | Abrir Configurações de Timbres e Flash |
| **`?`** | Exibir painel de ajuda de atalhos |
| **`Esc`** | Sair do Modo Palco ou fechar modais |

> 💡 **Dica de Palco**: Você pode conectar qualquer pedal footswitch USB ou Bluetooth configurado para emitir as teclas **`Espaço`** e **`N`** para controlar o metrônomo e avançar as músicas sem tirar as mãos do instrumento.

---

## 🛠️ Tecnologias Utilizadas

- **React 19 & TypeScript**: Interface reativa e fortemente tipada.
- **Web Audio API**: Síntese procedural de som em tempo real e agendador temporal de alta precisão.
- **Tailwind CSS 4**: Estilização moderna, acessível e otimizada para alto contraste em palcos.
- **Lucide Icons**: Ícones minimalistas para controles musicais.
- **Vite**: Build rápido e otimizado para produção.

---

## 🚀 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Gerar build de produção
npm run build
```

---

## 📄 Licença

Distribuído sob a licença **Apache-2.0**.
