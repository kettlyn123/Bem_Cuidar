🛠️ GUIA PARA MEXER NO PROJETO
==============================

## 🎯 Como Editar Cada Parte

### 1️⃣ MODIFICAR ESTILOS (CSS)

**Arquivo**: `css/styles.css`

Procure pela seção que quer mexer:

```css
/* Exemplo: Mudar cor do botão primário */
.btn-primary {
  background: var(--primary);  ← Mude aqui
  color: white;
}
```

**Variáveis de Cores** (no início do arquivo):
```css
:root {
  --primary: #1f5de8;        /* Azul principal */
  --primary-soft: #e8eeff;   /* Azul claro */
  --text: #1b2737;           /* Texto escuro */
  --muted: #6b7a99;          /* Texto cinza */
  --white: #ffffff;          /* Branco */
}
```

✅ **Depois de editar**: Salve (Ctrl+S) e recarregue o navegador (F5)

---

### 2️⃣ ADICIONAR/EDITAR LÓGICA

**Arquivos**: `js/`
- `home.js` - Página inicial
- `agenda.js` - Página de agenda
- `shared.js` - Dados e funções comuns
- `notifications.js` - Notificações

**Exemplo: Adicionar uma função nova**

1. Abra `js/shared.js`
2. Adicione sua função:

```javascript
function meuCalculo(valor) {
  return valor * 2;
}
```

3. Use em qualquer outro arquivo:

```javascript
// Em home.js ou agenda.js
resultado = meuCalculo(10);
```

---

### 3️⃣ MODIFICAR HTML

**Arquivos**: `index.html`, `profile.html`, `agenda.html`

**Não mexa em**:
- Tags de script (dentro de `<script>`)
- Links de CSS/JS (caminho dos arquivos)

**Pode mexer em**:
- Textos
- Estrutura de elementos
- Adicionar novo HTML

**Exemplo: Mudar texto de um botão**

```html
<!-- Antes -->
<button id="addMedicineBtn" class="btn-add">+ Adicionar</button>

<!-- Depois -->
<button id="addMedicineBtn" class="btn-add">+ Novo Remédio</button>
```

⚠️ Cuidado com os IDs! Se mudar um ID, precisa atualizar também em `home.js`

---

### 4️⃣ ADICIONAR UM NOVO CAMPO NO FORMULÁRIO

**Passo 1**: Edite `index.html`

```html
<!-- Procure por: class="form-group" -->
<!-- Adicione um novo -->

<div class="form-group">
  <label for="medicineNotes">Notas</label>
  <input type="text" id="medicineNotes" placeholder="Deixe uma nota" />
</div>
```

**Passo 2**: Edite `js/home.js`

```javascript
// Procure por: medicineName, medicineStock, etc
const medicineNotes = document.getElementById('medicineNotes');

// No salvamento, adicione:
const medicine = {
  // ... outros campos
  notes: medicineNotes.value,
};
```

**Passo 3**: Edite `js/shared.js`

```javascript
// Na função saveMedicine, adicione o novo campo
medicine.notes = medicine.notes || '';
```

---

### 5️⃣ MUDAR CORES DO APP

**Arquivo**: `css/styles.css` (linhas 1-11)

```css
:root {
  --primary: #1f5de8;       /* Azul - MUDE PARA SUA COR */
  --primary-soft: #e8eeff;  /* Azul claro - mude também */
}
```

**Uso**: https://www.color-hex.com/

Exemplo:
```css
:root {
  --primary: #10b981;       /* Verde */
  --primary-soft: #d1fae5;  /* Verde claro */
}
```

---

### 6️⃣ ADICIONAR UMA PÁGINA NOVA

**Passo 1**: Crie um novo arquivo HTML

Copie a estrutura de `agenda.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Minha Página - Bem Cuidar</title>
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
  <main class="app-shell">
    <!-- Seu conteúdo aqui -->
  </main>

  <nav class="bottom-nav">
    <a href="index.html" class="nav-item">Início</a>
    <!-- ... -->
    <a href="minha-pagina.html" class="nav-item active">Minha Página</a>
  </nav>

  <script src="js/shared.js"></script>
  <script src="js/minha-pagina.js"></script>
</body>
</html>
```

**Passo 2**: Crie o arquivo JS correspondente

Crie `js/minha-pagina.js`:

```javascript
// Seu código aqui
updateDateTime(); // Mostrar data/hora
```

**Passo 3**: Atualize a navegação

Adicione o link em TODAS as páginas:

```html
<nav class="bottom-nav">
  <a href="index.html" class="nav-item">Início</a>
  <a href="minha-pagina.html" class="nav-item">Minha Página</a>
</nav>
```

---

### 7️⃣ PROBLEMAS COMUNS

**❌ Botão não funciona**
- Verificar se o ID está correto em HTML e JS
- Verificar se o evento está anexado: `button.addEventListener('click', ...)`

**❌ Dados desaparecem**
- Limpar cache/cookies do navegador
- Executar no console: `localStorage.removeItem('bem_cuidar_medicines')`

**❌ Estilos não mudam**
- Salvar o arquivo (Ctrl+S)
- Recarregar navegador (Ctrl+Shift+R) - hard refresh

**❌ Scroll horizontal aparece**
- Verificar largura dos elementos em CSS
- Adicionar `box-sizing: border-box;` ao elemento
- Usar `width: 100%` em vez de `max-width`

---

### 8️⃣ ATALHOS ÚTEIS

```javascript
// Limpar TODOS os dados
localStorage.removeItem('bem_cuidar_medicines');
location.reload();

// Ver dados no console
console.log(JSON.parse(localStorage.getItem('bem_cuidar_medicines')));

// Adicionar um medicamento manualmente
db.saveMedicine({
  id: Date.now(),
  name: 'Asprina',
  stock: 50,
  dosage: 1,
  daysOfWeek: [1, 2, 3, 4, 5],
  time: '12:00'
});

// Carregar medicamentos
const meds = db.getAllMedicines();
console.log(meds);
```

---

### 9️⃣ ESTRUTURA DE PASTAS - O QUE MEXER E O QUE NÃO MEXER

✅ PODE EDITAR:
- `index.html`, `profile.html`, `agenda.html`
- `css/styles.css`
- `js/home.js`, `js/agenda.js`
- Criar novo arquivo em `js/`

❌ NÃO MEXA:
- Caminhos de imports (`src=`, `href=`)
- ID dos elementos HTML sem atualizar JS
- Estrutura de dados em `shared.js` sem entender

---

### 🔟 TESTANDO SUAS MUDANÇAS

1. **Salve o arquivo** (Ctrl+S)
2. **Recarregue o navegador** (F5)
3. **Abra o Console** (F12)
4. **Procure por erros** (aba Console)

Se tiver erro vermelho, copie e procure por "JavaScript Error" + seu erro

---

## 📞 DÚVIDAS?

Leia os comentários nos arquivos JS - eles explicam tudo! 💡
