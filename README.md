# MOSCÃO FIGHTER

![MOSCÃO FIGHTER](assets/images/bio_ship.png)

**MOSCÃO FIGHTER** é um jogo de tiro espacial estilo arcade (shmup) desenvolvido com tecnologias web modernas. O jogador controla uma nave biológica para defender a galáxia contra invasores, desviando de obstáculos e buracos negros enquanto tenta alcançar a maior pontuação possível.

## 🚀 Funcionalidades

- **Jogabilidade Arcade Clássica**: Ação rápida com mecânicas de pontuação baseadas em risco/recompensa.
- **Sistema de High Scores**: Leaderboard local persistente (SQLite) para salvar as 10 melhores pontuações.
- **Multilíngue**: Suporte completo para Português (PT-BR) e Inglês (EN-US) com detecção automática.
- **Suporte Multiplataforma**: Controles otimizados tanto para Desktop (Teclado) quanto para Dispositivos Móveis (Toque).
- **Trilha Sonora Dinâmica**: A música evolui conforme o jogador avança de nível.
- **Efeitos Visuais**: Fundo de campo estelar dinâmico, partículas e animações suaves.

## 🎮 Controles

### Desktop (Teclado)

| Ação | Tecla |
| :--- | :--- |
| **Mover Esquerda** | `Seta Esquerda` |
| **Mover Direita** | `Seta Direita` |
| **Atirar** | `Espaço` |
| **Acelerar (Fast Forward)** | `Seta Cima` (Bônus de Pontuação) |
| **Frear (Slow Motion)** | `Seta Baixo` (Penalidade de Pontuação) |
| **Iniciar Jogo** | `Qualquer Tecla` |
| **Instruções** | `i` |

### Mobile (Toque)

- **Mover**: Toque no lado **Esquerdo** (15% da tela) ou **Direito** (85% da tela).
- **Atirar**: Toque na área central da tela.
- **Interface**: Botões dedicados para iniciar e compartilhar pontuação.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5 Canvas, CSS3, JavaScript (ES6 Modules).
- **Backend**: PHP (para gerenciar pontuações e arquivos de música).
- **Banco de Dados**: SQLite (`scores.db`).
- **Assets**: Sprites e áudios otimizados para web.

## 📦 Instalação e Execução

Como o jogo utiliza PHP e SQLite para o sistema de pontuação, é necessário um servidor web local.

1. **Pré-requisitos**: Instale o [XAMPP](https://www.apachefriends.org/) ou outro ambiente servidor PHP.
2. **Clone/Download**: Coloque a pasta do projeto `MOSCAO_FIGHTER` dentro do diretório `htdocs` do seu servidor (ex: `C:\xampp\htdocs\MOSCAO_FIGHTER`).
3. **Permissões**: Certifique-se de que o servidor web tenha permissão de escrita no diretório para o arquivo `scores.db` (caso ele precise ser criado ou atualizado).
4. **Executar**:
   - Inicie o Apache no painel do XAMPP.
   - Acesse no navegador: `http://localhost/MOSCAO_FIGHTER`

## 🤝 Créditos

Desenvolvido como um projeto de jogo web interativo.

---
*Divirta-se e tente entrar no TOP 10!*
