# 💊 Bem Cuidar - Gerenciador de Medicamentos

Um aplicativo web moderno para gerenciar seus medicamentos, receber lembretes e acompanhar seu estoque.

## ✨ Funcionalidades

### 📋 Gerenciamento de Medicamentos
- **Adicionar medicamentos** com todas as informações necessárias
- **Editar** dados do medicamento a qualquer momento
- **Deletar** medicamentos que não usa mais
- **Buscar** medicamentos rapidamente

### 📅 Agendamento Completo
- Define **quantidade em casa** (em unidades)
- Define **dose por tomada**
- Define **horário específico** de tomada
- Seleciona **quais dias da semana** toma o remédio
- Cálculo automático de **quantos dias o remédio vai durar**

### 🔔 Notificações Inteligentes
- **Alerta quando está próximo da hora** de tomar o medicamento
- **Aviso quando estoque está acabando** (menos de 3 doses)
- **Notificações do navegador** em tempo real
- Histórico diário de notificações

### 📊 Acompanhamento
- **Previsão de término** do medicamento
- **Status de estoque** (OK, Acabando, Sem Estoque)
- **Próximas tomadas de hoje** listadas por horário
- **Histórico** de todos os medicamentos cadastrados

## 🚀 Como Usar

### Primeira Vez
1. Abra `index.html` no navegador
2. Clique em "+ Adicionar" para adicionar seu primeiro medicamento

### Adicionar um Medicamento
1. Preencha o **Nome do Remédio**
2. Digite **Quantidade em Casa** (quantas unidades você tem)
3. Defina a **Dose por Tomada** (quantas unidades por vez)
4. Escolha o **Horário** da tomada
5. Selecione os **Dias da Semana** que toma
6. Clique em "Salvar Remédio"

### Usar o App
- **Página Inicial**: Veja todos seus medicamentos em cards com status
- **Consumir Dose**: Clique no medicamento → "Consumir 1 Dose" (reduz o estoque)
- **Editar**: Clique no medicamento → "Editar" (para alterar informações)
- **Agenda**: Veja próximas tomadas de hoje e histórico
- **Perfil**: Informações da conta

## 📱 Compatibilidade

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Responsivo para mobile

## 🔐 Privacidade

Todos os seus dados são salvos **localmente no seu navegador** (localStorage). Nenhuma informação é enviada para servidor. 
Os dados persistem mesmo após fechar o navegador.

## 🆘 Suporte

### Dados não aparecem após atualizar?
- Verifique se está na mesma aba/navegador (dados são por navegador)
- Limpe cache se tiver problemas

### Notificações não funcionam?
- Permita notificações quando o navegador pedir
- Em alguns navegadores, só funcionam em HTTPS

### Quero apagar todos os dados
- Abra Console (F12) e execute:
  ```javascript
  localStorage.removeItem('bem_cuidar_medicines')
  location.reload()
  ```

## 📧 Versão
v1.0.0 - Inicial

---

**Bem Cuidar** - Cuide da sua saúde, nós cuidamos do seu cronograma! 💚
