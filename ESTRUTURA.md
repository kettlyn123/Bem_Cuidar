📁 ESTRUTURA DO PROJETO BEM CUIDAR
==================================

A estrutura está organizada de forma limpa e profissional:

```
bem_cuidar/
│
├── 📄 index.html           → Página inicial (Meus Remédios)
├── 📄 profile.html         → Página de Perfil
├── 📄 agenda.html          → Página de Agenda
│
├── 📂 css/
│   └── styles.css          → Todos os estilos do projeto
│
├── 📂 js/
│   ├── shared.js           → Banco de dados e funções comuns
│   ├── home.js             → Lógica da página inicial
│   ├── agenda.js           → Lógica da página de agenda
│   └── notifications.js    → Sistema de notificações
│
├── 📄 README.md            → Documentação completa
├── 📄 TESTE.txt            → Guia de teste
└── 📄 ESTRUTURA.md         → Este arquivo
```

## 📋 O que cada pasta contém:

### 🌐 Raiz (Arquivos HTML)
- **index.html** - Página inicial com todos os remédios
- **profile.html** - Informações do usuário
- **agenda.html** - Próximas tomadas e histórico

### 🎨 css/
- **styles.css** - Arquivo único com todos os estilos
  - Design moderno e responsivo
  - Sem scroll horizontal
  - Otimizado para mobile

### ⚙️ js/
- **shared.js**
  - Banco de dados com localStorage
  - Classe MedicineDatabase
  - Funções de formatação
  - Cálculos de duração

- **home.js**
  - Renderização de medicamentos
  - Modal de adicionar/editar
  - Busca e filtro
  - Consumir dose

- **agenda.js**
  - Próximas tomadas de hoje
  - Histórico de medicamentos
  - Atualização automática

- **notifications.js**
  - Lembretes de horário
  - Avisos de estoque baixo
  - Notificações do navegador

## 🔧 Como Modificar o Projeto

### Adicionar um novo arquivo JS
1. Crie o arquivo em `js/seu_arquivo.js`
2. Adicione a tag `<script>` no HTML:
   ```html
   <script src="js/seu_arquivo.js"></script>
   ```

### Modificar estilos
- Edite apenas `css/styles.css`
- Não há arquivos CSS em outras pastas

### Adicionar uma nova página
1. Crie `nome-página.html` na raiz
2. Copie a estrutura de `index.html` ou `agenda.html`
3. Atualize os links de CSS/JS:
   ```html
   <link rel="stylesheet" href="css/styles.css" />
   <script src="js/shared.js"></script>
   <script src="js/sua-logica.js"></script>
   ```

## 📊 Fluxo de Dados

```
user input → HTML events
    ↓
JS (home.js/agenda.js) processes
    ↓
shared.js → Database (localStorage)
    ↓
Screen updates / Notifications sent
    ↓
notifications.js → Browser notifications
```

## 💾 Dados

Todos os dados são salvos em **localStorage** com a chave:
```javascript
localStorage.getItem('bem_cuidar_medicines')
```

Estrutura de um medicamento:
```javascript
{
  id: 1,
  name: 'Losartana',
  stock: 30,
  dosage: 1,
  daysOfWeek: [1, 2, 3, 4, 5],
  time: '08:00',
  daysToTake: 30,
  lastUpdated: '2026-06-15T...'
}
```

## 🔐 Segurança & Performance

✅ Sem banco de dados remoto - tudo local
✅ Sem necessidade de internet após carregar
✅ Dados persistem entre sessões
✅ CSS otimizado - sem scroll horizontal
✅ Responsivo em todos os tamanhos

## 📱 Compatibilidade

- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅

## 🎯 Próximos Passos

Se quiser expandir:
1. Adicionar múltiplos usuários
2. Sincronizar com servidor
3. Exportar relatórios
4. Adicionar foto do medicamento
5. Integrar com calendário do sistema

---

**Dica**: A estrutura está pronta para crescer!
Qualquer novo arquivo deve seguir este padrão.
