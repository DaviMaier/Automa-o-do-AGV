/**
 * utils.js - Funções utilitárias para a aplicação
 */

/**
 * Formata uma string de data para formato legível
 * @param {string} dateString - String de data ISO
 * @returns {string} - String de data formatada
 */
function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
}

/**
 * Cria uma função com debounce
 * @param {Function} func - Função para aplicar debounce
 * @param {number} delay - Atraso em milissegundos
 * @returns {Function} - Função com debounce
 */
function debounce(func, delay) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

/**
 * Gera um ID único
 * @returns {string} - ID único
 */
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Filtra professores por termo de busca e status
 * @param {Array} teachers - Array de objetos de professores
 * @param {string} searchTerm - Termo de busca
 * @param {string} statusFilter - Filtro de status ('all', 'present', 'absent')
 * @returns {Array} - Array filtrado de objetos de professores
 */
function filterTeachers(teachers, searchTerm, statusFilter) {
  return teachers.filter(teacher => {
    // Filtra por termo de busca
    const matchesSearch = !searchTerm || 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtra por status
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
}

/**
 * Cria um efeito de animação para um elemento
 * @param {HTMLElement} element - Elemento para animar
 * @param {string} className - Classe CSS para animação
 * @param {number} duration - Duração da animação em milissegundos
 */
function animateElement(element, className, duration = 500) {
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

/**
 * Trata erros e exibe uma notificação
 * @param {Error} error - Objeto de erro
 * @param {string} message - Mensagem de erro personalizada
 */
function handleError(error, message = 'Ocorreu um erro') {
  console.error(error);
  const notification = document.createElement('div');
  notification.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
  notification.setAttribute('role', 'alert');
  notification.innerHTML = `
    <strong>Erro!</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

/**
 * Exibe uma notificação de sucesso
 * @param {string} message - Mensagem de sucesso
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  notification.setAttribute('role', 'alert');
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Faz o download de um arquivo
 * @param {string} content - Conteúdo do arquivo
 * @param {string} fileName - Nome do arquivo
 * @param {string} contentType - Tipo de conteúdo
 */
function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}