/**
 * app.js - Ponto de entrada principal da aplicação
 */

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

/**
 * Inicializa a aplicação
 */
function initApp() {
  // Inicializa módulos
  initTeachers();
  initSchedule();
  
  console.log('Sistema de Gestão de Horários de Professores - Alberto Gomes Veiga inicializado');
}