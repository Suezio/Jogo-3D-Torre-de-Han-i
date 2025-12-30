# 🗼 Torre de Hanói 3D

<div align="center">

![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)

**Um jogo puzzle clássico reinventado com gráficos 3D modernos e efeitos visuais impressionantes**

[🎮 Jogar Demo](#como-executar) • [📖 Sobre](#sobre-o-projeto) • [🛠️ Tecnologias](#tecnologias) • [📦 Instalação](#instalação)

</div>

---

## 📖 Sobre o Projeto

A **Torre de Hanói 3D** é uma implementação moderna e visualmente impressionante do clássico puzzle matemático. O jogo apresenta:

- 🎨 **Gráficos 3D de alta qualidade** com iluminação realista e sombras suaves
- ✨ **Efeitos visuais avançados** incluindo bloom, partículas flutuantes e animações suaves
- 🎯 **Jogabilidade intuitiva** com controles por clique/toque
- 🏆 **Sistema de recordes** persistente com ranking local
- 📱 **Design responsivo** otimizado para desktop e dispositivos móveis
- ⚡ **Performance otimizada** com renderização eficiente

## 🎮 Como Jogar

1. **Selecione** um disco clicando nele (apenas o disco do topo pode ser selecionado)
2. **Mova** o disco clicando na torre de destino
3. **Regra de ouro**: Um disco maior nunca pode ser colocado sobre um disco menor
4. **Objetivo**: Mova todos os discos da torre da esquerda para a torre da direita

> 💡 **Dica**: O número mínimo de movimentos para resolver o puzzle é `2ⁿ - 1`, onde `n` é o número de discos.

## 🛠️ Tecnologias

Este projeto foi construído utilizando tecnologias modernas de desenvolvimento web:

| Tecnologia | Descrição |
|------------|-----------|
| **[Three.js](https://threejs.org/)** | Biblioteca JavaScript para gráficos 3D no navegador |
| **[TypeScript](https://www.typescriptlang.org/)** | Superset tipado de JavaScript para maior robustez |
| **[Vite](https://vitejs.dev/)** | Build tool moderno e ultrarrápido |
| **[GSAP](https://greensock.com/gsap/)** | Biblioteca de animações de alta performance |

### Recursos Gráficos Implementados

- 🌟 **Post-processing** com UnrealBloomPass para efeito de brilho
- 💡 **Sistema de iluminação** multi-camadas (ambiente, direcional, pontual)
- 🔮 **Materiais PBR** com metalness e roughness
- 🎭 **Sombras suaves** com PCFSoftShadowMap
- 🌌 **Partículas animadas** para ambiente atmosférico
- 📷 **Controles de câmera** com OrbitControls e limites configurados

## 📁 Estrutura do Projeto

```
torre-de-hanoi-3d/
├── 📄 index.html           # Página principal com UI do jogo
├── 📄 package.json         # Dependências e scripts
├── 📄 tsconfig.json        # Configurações TypeScript
├── 📂 src/
│   ├── 📄 main.ts          # Ponto de entrada da aplicação
│   ├── 📄 style.css        # Estilos globais e UI
│   ├── 📂 game/
│   │   ├── 📄 Game.ts      # Lógica principal do jogo
│   │   ├── 📄 Tower.ts     # Classe das torres
│   │   └── 📄 Disk.ts      # Classe dos discos
│   ├── 📂 graphics/
│   │   ├── 📄 SceneManager.ts  # Gerenciamento de cena 3D
│   │   └── 📄 Materials.ts     # Factory de materiais
│   └── 📂 utils/
│       └── 📄 RecordsManager.ts # Gerenciamento de recordes
└── 📂 public/              # Assets estáticos
```

## 📦 Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm ou yarn

### Passos para Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/torre-de-hanoi-3d.git

# Entre no diretório do projeto
cd torre-de-hanoi-3d

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

O jogo estará disponível em `http://localhost:5173`

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila o projeto para produção |
| `npm run preview` | Visualiza a build de produção |

## 🎨 Características Visuais

### Design Futurista
O jogo apresenta uma estética sci-fi moderna com:
- Paleta de cores escuras com acentos em dourado e ciano
- Efeitos de brilho (glow) nos elementos interativos
- Grid de fundo estilo cyberpunk
- Tipografia moderna com fontes Orbitron e Inter

### Animações Suaves
- Discos levantam suavemente ao serem selecionados
- Movimento fluido em arco ao transferir entre torres
- Efeito de bounce ao pousar nos destinos
- Shake da câmera para movimentos inválidos

### Interface Responsiva
- Menu principal elegante com glassmorphism
- Indicadores de progresso (movimentos, tempo, mínimo)
- Painel de vitória com celebração
- Sistema de recordes com abas por dificuldade

## 🏆 Sistema de Recordes

O jogo salva automaticamente os **10 melhores** resultados para cada nível de dificuldade (3 a 8 discos).

Os recordes são ordenados por:
1. **Número de movimentos** (menor é melhor)
2. **Tempo** (em caso de empate, menor tempo vence)

Os dados são persistidos no `localStorage` do navegador.

## 🧮 Teoria por Trás do Puzzle

A Torre de Hanói é um problema matemático clássico que demonstra:

- **Recursão**: A solução ótima é naturalmente recursiva
- **Complexidade exponencial**: Requer `2ⁿ - 1` movimentos mínimos
- **Crescimento exponencial**:

| Discos | Movimentos Mínimos |
|--------|-------------------|
| 3      | 7                 |
| 4      | 15                |
| 5      | 31                |
| 6      | 63                |
| 7      | 127               |
| 8      | 255               |

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um **Fork** do projeto
2. Criar uma **branch** para sua feature (`git checkout -b feature/NovaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. **Push** para a branch (`git push origin feature/NovaFeature`)
5. Abrir um **Pull Request**

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Desenvolvido com ❤️ e ☕**

⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>
