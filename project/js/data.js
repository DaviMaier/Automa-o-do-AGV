/**
 * data.js - Gerencia o armazenamento de dados de professores e horários
 */

// Horários padrão para as aulas
const TIME_SLOTS = [
  '7:30 - 8:20',
  '8:20 - 9:10',
  '9:10 - 10:00',
  '10:20 - 11:10',
  '11:10 - 12:00',
  '13:30 - 14:20',
  '14:20 - 15:10',
  '15:10 - 16:00',
  '16:20 - 17:10',
  '17:10 - 18:00'
];

// Dias da semana
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

// Locais de aula
const LOCATIONS = ['Sala 101', 'Sala 102', 'Sala 103', 'Sala 104', 'Lab A', 'Lab B', 'Auditório'];

// Disciplinas
const SUBJECTS = [
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Literatura',
  'Informática',
  'Artes',
  'Música',
  'Educação Física'
];

// Chaves do LocalStorage
const STORAGE_KEYS = {
  TEACHERS: 'teachers_data',
  SCHEDULES: 'schedules_data'
};

/**
 * Gera dados de exemplo para um novo professor
 * @param {string} name - Nome do professor
 * @param {string} subject - Disciplina do professor
 * @returns {Object} - Objeto com dados do professor
 */
function generateTeacherData(name, subject, email, phone = '') {
  return {
    id: Date.now().toString(),
    name: name,
    subject: subject,
    email: email,
    phone: phone,
    status: Math.random() > 0.3 ? 'present' : 'absent',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Gera um horário aleatório para um professor
 * @param {string} teacherId - ID do professor
 * @returns {Object} - Objeto com dados do horário
 */
function generateScheduleData(teacherId) {
  const schedule = {};
  
  // Inicializa horário vazio para todos os períodos e dias
  TIME_SLOTS.forEach(timeSlot => {
    schedule[timeSlot] = {};
    DAYS.forEach(day => {
      schedule[timeSlot][day] = null;
    });
  });
  
  // Adiciona aulas aleatórias (30-50% preenchido)
  const totalSlots = TIME_SLOTS.length * DAYS.length;
  const slotsToFill = Math.floor(totalSlots * (0.3 + Math.random() * 0.2));
  
  for (let i = 0; i < slotsToFill; i++) {
    const randomTimeIndex = Math.floor(Math.random() * TIME_SLOTS.length);
    const randomDayIndex = Math.floor(Math.random() * DAYS.length);
    const timeSlot = TIME_SLOTS[randomTimeIndex];
    const day = DAYS[randomDayIndex];
    
    // Pula se já tem aula
    if (schedule[timeSlot][day] !== null) {
      continue;
    }
    
    // Adiciona uma aula
    schedule[timeSlot][day] = {
      subject: SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)],
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      notes: ''
    };
  }
  
  return {
    teacherId: teacherId,
    schedule: schedule,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Carrega professores do localStorage ou cria dados de exemplo
 * @returns {Array} - Array de objetos de professores
 */
function loadTeachers() {
  const storedTeachers = localStorage.getItem(STORAGE_KEYS.TEACHERS);
  
  if (storedTeachers) {
    return JSON.parse(storedTeachers);
  }
  
  // Gera professores de exemplo se não existirem dados
  const sampleTeachers = [
    generateTeacherData('João Silva', 'Matemática', 'joao.silva@exemplo.com', '(11) 99999-1234'),
    generateTeacherData('Maria Oliveira', 'Física', 'maria.oliveira@exemplo.com', '(11) 99999-2345'),
    generateTeacherData('Carlos Santos', 'História', 'carlos.santos@exemplo.com', '(11) 99999-3456'),
    generateTeacherData('Ana Pereira', 'Literatura', 'ana.pereira@exemplo.com', '(11) 99999-4567'),
    generateTeacherData('Pedro Almeida', 'Biologia', 'pedro.almeida@exemplo.com', '(11) 99999-5678'),
    generateTeacherData('Lucia Ferreira', 'Química', 'lucia.ferreira@exemplo.com', '(11) 99999-6789')
  ];
  
  saveTeachers(sampleTeachers);
  return sampleTeachers;
}

/**
 * Salva professores no localStorage
 * @param {Array} teachers - Array de objetos de professores
 */
function saveTeachers(teachers) {
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
}

/**
 * Carrega horários do localStorage ou cria dados de exemplo
 * @param {Array} teachers - Array de objetos de professores
 * @returns {Object} - Objeto com IDs dos professores e horários
 */
function loadSchedules(teachers) {
  const storedSchedules = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  
  if (storedSchedules) {
    return JSON.parse(storedSchedules);
  }
  
  // Gera horários de exemplo se não existirem dados
  const schedules = {};
  teachers.forEach(teacher => {
    schedules[teacher.id] = generateScheduleData(teacher.id);
  });
  
  saveSchedules(schedules);
  return schedules;
}

/**
 * Salva horários no localStorage
 * @param {Object} schedules - Objeto com IDs dos professores e horários
 */
function saveSchedules(schedules) {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
}

/**
 * Exporta horário para CSV
 * @param {string} teacherId - ID do professor
 * @returns {string} - Conteúdo CSV
 */
function exportScheduleToCSV(teacherId) {
  const teacher = currentTeachers.find(t => t.id === teacherId);
  const scheduleData = currentSchedules[teacherId];
  
  if (!teacher || !scheduleData) return null;
  
  let csv = 'Horário,' + DAYS.join(',') + '\n';
  
  TIME_SLOTS.forEach(timeSlot => {
    let row = [timeSlot];
    DAYS.forEach(day => {
      const classData = scheduleData.schedule[timeSlot][day];
      if (classData) {
        row.push(`${classData.subject} (${classData.location})`);
      } else {
        row.push('');
      }
    });
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Importa horário de CSV
 * @param {string} teacherId - ID do professor
 * @param {string} csvContent - Conteúdo CSV
 * @returns {boolean} - Sucesso da importação
 */
function importScheduleFromCSV(teacherId, csvContent) {
  try {
    const rows = csvContent.split('\n').map(row => row.split(','));
    const headers = rows[0];
    
    if (headers.length !== DAYS.length + 1) {
      throw new Error('Formato de CSV inválido');
    }
    
    const schedule = {};
    
    rows.slice(1).forEach(row => {
      if (row.length === headers.length) {
        const timeSlot = row[0];
        schedule[timeSlot] = {};
        
        row.slice(1).forEach((cell, index) => {
          const day = DAYS[index];
          if (cell.trim()) {
            const match = cell.match(/(.+) \((.+)\)/);
            if (match) {
              schedule[timeSlot][day] = {
                subject: match[1].trim(),
                location: match[2].trim(),
                notes: ''
              };
            }
          } else {
            schedule[timeSlot][day] = null;
          }
        });
      }
    });
    
    currentSchedules[teacherId] = {
      teacherId: teacherId,
      schedule: schedule,
      lastUpdated: new Date().toISOString()
    };
    
    saveSchedules(currentSchedules);
    return true;
  } catch (error) {
    console.error('Erro ao importar CSV:', error);
    return false;
  }
}