/**
 * teachers.js - Gerencia dados dos professores e interações da UI
 */

// Variáveis globais
let currentTeachers = [];
let searchTerm = '';
let statusFilter = 'all';

/**
 * Inicializa o módulo de professores
 */
function initTeachers() {
  // Carrega professores do módulo de dados
  currentTeachers = loadTeachers();
  
  // Renderiza a grade de professores
  renderTeachersGrid();
  
  // Configura event listeners
  setupTeacherEventListeners();
}

/**
 * Configura event listeners para elementos da UI relacionados a professores
 */
function setupTeacherEventListeners() {
  // Campo de busca
  const searchInput = document.getElementById('searchTeacher');
  searchInput.addEventListener('input', debounce(function() {
    searchTerm = this.value.trim();
    renderTeachersGrid();
  }, 300));
  
  // Filtro de status
  const statusFilterSelect = document.getElementById('statusFilter');
  statusFilterSelect.addEventListener('change', function() {
    statusFilter = this.value;
    renderTeachersGrid();
  });
  
  // Botão de atualizar
  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn.addEventListener('click', function() {
    animateElement(this, 'fa-spin', 1000);
    renderTeachersGrid();
    showNotification('Dados dos professores atualizados');
  });
  
  // Botão de adicionar professor
  const addTeacherBtn = document.getElementById('addTeacherBtn');
  addTeacherBtn.addEventListener('click', function() {
    openTeacherModal();
  });
  
  // Botão de salvar professor
  const saveTeacherBtn = document.getElementById('saveTeacherBtn');
  saveTeacherBtn.addEventListener('click', saveTeacher);
  
  // Botão de voltar para a grade
  const backToGridBtn = document.getElementById('backToGrid');
  backToGridBtn.addEventListener('click', function() {
    document.getElementById('scheduleSection').classList.add('d-none');
    document.getElementById('teachersGrid').parentElement.classList.remove('d-none');
  });
}

/**
 * Renderiza a grade de professores com base nos filtros atuais
 */
function renderTeachersGrid() {
  const teachersGrid = document.getElementById('teachersGrid');
  const filteredTeachers = filterTeachers(currentTeachers, searchTerm, statusFilter);
  
  // Limpa a grade
  teachersGrid.innerHTML = '';
  
  if (filteredTeachers.length === 0) {
    teachersGrid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          Nenhum professor encontrado com os filtros aplicados.
        </div>
      </div>
    `;
    return;
  }
  
  // Renderiza cada cartão de professor
  filteredTeachers.forEach(teacher => {
    const teacherCard = document.createElement('div');
    teacherCard.className = 'col-md-6 col-lg-4';
    teacherCard.innerHTML = `
      <div class="card teacher-card h-100" data-teacher-id="${teacher.id}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="card-title mb-0">${teacher.name}</h5>
            <span class="badge ${teacher.status === 'present' ? 'bg-success' : 'bg-danger'} status-badge">
              <span class="status-indicator ${teacher.status === 'present' ? 'status-present' : 'status-absent'}"></span>
              ${teacher.status === 'present' ? 'Presente' : 'Ausente'}
            </span>
          </div>
          <h6 class="card-subtitle mb-2 text-muted">${teacher.subject}</h6>
          <p class="card-text mb-1">
            <i class="fas fa-envelope text-secondary me-2"></i>${teacher.email}
          </p>
          ${teacher.phone ? `
          <p class="card-text mb-3">
            <i class="fas fa-phone text-secondary me-2"></i>${teacher.phone}
          </p>
          ` : ''}
          <p class="card-text text-muted small">
            <i class="fas fa-clock text-secondary me-1"></i>Última atualização: ${formatDate(teacher.lastUpdated)}
          </p>
        </div>
        <div class="card-footer bg-transparent">
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-primary view-schedule-btn">
              <i class="fas fa-calendar-alt me-1"></i>Ver Horário
            </button>
            <div>
              <button class="btn btn-sm btn-outline-secondary edit-teacher-btn me-1">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-${teacher.status === 'present' ? 'danger' : 'success'} toggle-status-btn">
                <i class="fas fa-${teacher.status === 'present' ? 'times' : 'check'}"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    teachersGrid.appendChild(teacherCard);
    
    // Adiciona event listeners aos botões
    const card = teacherCard.querySelector('.teacher-card');
    
    // Ver horário
    card.querySelector('.view-schedule-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      viewTeacherSchedule(teacher.id);
    });
    
    // Editar professor
    card.querySelector('.edit-teacher-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      openTeacherModal(teacher);
    });
    
    // Alternar status
    card.querySelector('.toggle-status-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      toggleTeacherStatus(teacher.id);
    });
    
    // Clique no cartão para ver horário
    card.addEventListener('click', function() {
      viewTeacherSchedule(teacher.id);
    });
  });
}

/**
 * Alterna o status de um professor (presente/ausente)
 * @param {string} teacherId - ID do professor
 */
function toggleTeacherStatus(teacherId) {
  const teacherIndex = currentTeachers.findIndex(t => t.id === teacherId);
  if (teacherIndex === -1) return;
  
  // Alterna status
  currentTeachers[teacherIndex].status = 
    currentTeachers[teacherIndex].status === 'present' ? 'absent' : 'present';
  currentTeachers[teacherIndex].lastUpdated = new Date().toISOString();
  
  // Salva no localStorage
  saveTeachers(currentTeachers);
  
  // Atualiza UI
  const statusBadge = document.querySelector(`.teacher-card[data-teacher-id="${teacherId}"] .status-badge`);
  if (statusBadge) {
    const newStatus = currentTeachers[teacherIndex].status;
    statusBadge.className = `badge ${newStatus === 'present' ? 'bg-success' : 'bg-danger'} status-badge`;
    statusBadge.innerHTML = `
      <span class="status-indicator ${newStatus === 'present' ? 'status-present' : 'status-absent'}"></span>
      ${newStatus === 'present' ? 'Presente' : 'Ausente'}
    `;
    
    // Anima a mudança de status
    animateElement(statusBadge, 'status-change');
  }
  
  // Atualiza botão de alternar
  const toggleBtn = document.querySelector(`.teacher-card[data-teacher-id="${teacherId}"] .toggle-status-btn`);
  if (toggleBtn) {
    const newStatus = currentTeachers[teacherIndex].status;
    toggleBtn.className = `btn btn-sm btn-outline-${newStatus === 'present' ? 'danger' : 'success'} toggle-status-btn`;
    toggleBtn.innerHTML = `<i class="fas fa-${newStatus === 'present' ? 'times' : 'check'}"></i>`;
  }
  
  // Mostra notificação
  const teacher = currentTeachers[teacherIndex];
  showNotification(`Status de ${teacher.name} atualizado para ${teacher.status === 'present' ? 'presente' : 'ausente'}`);
}

/**
 * Abre o modal de professor para adicionar ou editar
 * @param {Object} teacher - Objeto do professor (null para novo professor)
 */
function openTeacherModal(teacher = null) {
  const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
  const modalTitle = document.getElementById('teacherModalTitle');
  const teacherForm = document.getElementById('teacherForm');
  
  // Reseta formulário
  teacherForm.reset();
  
  if (teacher) {
    // Edita professor existente
    modalTitle.textContent = 'Editar Professor';
    document.getElementById('teacherId').value = teacher.id;
    document.getElementById('teacherName').value = teacher.name;
    document.getElementById('teacherSubject').value = teacher.subject;
    document.getElementById('teacherEmail').value = teacher.email;
    document.getElementById('teacherPhone').value = teacher.phone || '';
    
    // Define status no radio button
    const statusRadio = document.querySelector(`input[name="teacherStatus"][value="${teacher.status}"]`);
    if (statusRadio) statusRadio.checked = true;
  } else {
    // Adiciona novo professor
    modalTitle.textContent = 'Adicionar Novo Professor';
    document.getElementById('teacherId').value = '';
  }
  
  modal.show();
}

/**
 * Salva um professor (adiciona novo ou atualiza existente)
 */
function saveTeacher() {
  const teacherId = document.getElementById('teacherId').value;
  const teacherName = document.getElementById('teacherName').value.trim();
  const teacherSubject = document.getElementById('teacherSubject').value.trim();
  const teacherEmail = document.getElementById('teacherEmail').value.trim();
  const teacherPhone = document.getElementById('teacherPhone').value.trim();
  const teacherStatus = document.querySelector('input[name="teacherStatus"]:checked').value;
  
  if (!teacherName || !teacherSubject || !teacherEmail) {
    alert('Por favor, preencha todos os campos obrigatórios');
    return;
  }
  
  if (teacherId) {
    // Atualiza professor existente
    const teacherIndex = currentTeachers.findIndex(t => t.id === teacherId);
    if (teacherIndex !== -1) {
      currentTeachers[teacherIndex] = {
        ...currentTeachers[teacherIndex],
        name: teacherName,
        subject: teacherSubject,
        email: teacherEmail,
        phone: teacherPhone,
        status: teacherStatus,
        lastUpdated: new Date().toISOString()
      };
      
      showNotification(`Professor "${teacherName}" atualizado com sucesso`);
    }
  } else {
    // Adiciona novo professor
    const newTeacher = generateTeacherData(
      teacherName, 
      teacherSubject, 
      teacherEmail,
      teacherPhone
    );
    
    // Sobrescreve status aleatório com status selecionado
    newTeacher.status = teacherStatus;
    
    currentTeachers.push(newTeacher);
    
    // Cria um novo horário para este professor
    const schedules = loadSchedules(currentTeachers);
    schedules[newTeacher.id] = generateScheduleData(newTeacher.id);
    saveSchedules(schedules);
    
    showNotification(`Professor "${teacherName}" adicionado com sucesso`);
  }
  
  // Salva no localStorage
  saveTeachers(currentTeachers);
  
  // Fecha modal e atualiza UI
  const modal = bootstrap.Modal.getInstance(document.getElementById('teacherModal'));
  modal.hide();
  
  // Atualiza a grade
  renderTeachersGrid();
}

/**
 * Visualiza o horário de um professor
 * @param {string} teacherId - ID do professor
 */
function viewTeacherSchedule(teacherId) {
  const teacher = currentTeachers.find(t => t.id === teacherId);
  if (!teacher) return;
  
  // Oculta grade de professores e mostra seção de horário
  document.getElementById('teachersGrid').parentElement.classList.add('d-none');
  const scheduleSection = document.getElementById('scheduleSection');
  scheduleSection.classList.remove('d-none');
  
  // Define nome do professor na seção de horário
  document.getElementById('scheduleTeacherName').textContent = `Horário de ${teacher.name}`;
  
  // Carrega e renderiza horário
  loadTeacherSchedule(teacherId);
  
  // Atualiza evento do botão de edição
  document.getElementById('editScheduleBtn').onclick = function() {
    openScheduleEditModal(teacherId);
  };
}