const USERS_KEY = 'cf_users';
const APPOINTMENTS_KEY = 'cf_appointments';
const currentUserKey = 'cf_current_user';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getAppointments() {
  return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
}

function saveAppointments(apps) {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(apps));
}

function setCurrentUser(user) {
  localStorage.setItem(currentUserKey, JSON.stringify(user));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(currentUserKey) || 'null');
}

function logout() {
  localStorage.removeItem(currentUserKey);
  location.reload();
}

const doctors = [
  {id: 1, name: 'Dr. Ana Cardoso', specialty: 'Cardiologia', email: 'ana@clinica.com', type: 'doctor'},
  {id: 2, name: 'Dr. Bruno Ortopedista', specialty: 'Ortopedia', email: 'bruno@clinica.com', type: 'doctor'},
  {id: 3, name: 'Dr. Carla Pediatra', specialty: 'Pediatria', email: 'carla@clinica.com', type: 'doctor'}
];

// Initialize localStorage with doctors
(function init() {
  const users = getUsers();
  doctors.forEach(doc => {
    if (!users.find(u => u.email === doc.email)) {
      users.push({...doc, password: '1234'});
    }
  });
  saveUsers(users);
})();

function showRegister() {
  document.getElementById('login-section').classList.add('d-none');
  document.getElementById('register-section').classList.remove('d-none');
}

function showLogin() {
  document.getElementById('register-section').classList.add('d-none');
  document.getElementById('login-section').classList.remove('d-none');
}

function renderDoctors() {
  const list = document.getElementById('doctor-list');
  const select = document.getElementById('doctor-select');
  list.innerHTML = '';
  select.innerHTML = '<option value="">Selecione...</option>';
  doctors.forEach(doc => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${doc.name} - ${doc.specialty}`;
    list.appendChild(li);

    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = `${doc.name} - ${doc.specialty}`;
    select.appendChild(option);
  });
}

function updateAppointments() {
  const user = getCurrentUser();
  const apps = getAppointments();
  const list = document.getElementById('appointment-list');
  const historyList = document.getElementById('history-list');
  list.innerHTML = '';
  historyList.innerHTML = '';
  const now = new Date();

  apps.filter(a => a.userEmail === user.email).forEach((app, idx) => {
    const date = new Date(app.date);
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = `${date.toLocaleDateString()} - ${app.doctorName}`;
    if (date > now) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-sm btn-danger';
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.onclick = () => {
        apps.splice(idx, 1);
        saveAppointments(apps);
        updateAppointments();
      };
      li.appendChild(cancelBtn);
      list.appendChild(li);
    } else {
      historyList.appendChild(li);
    }
  });
}

function updateDoctorAppointments() {
  const user = getCurrentUser();
  const apps = getAppointments();
  const list = document.getElementById('doctor-appointments');
  list.innerHTML = '';
  apps.filter(a => a.doctorId === user.id).forEach(app => {
    const date = new Date(app.date);
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${date.toLocaleDateString()} - ${app.userName}`;
    list.appendChild(li);
  });
}

function checkNotifications() {
  const user = getCurrentUser();
  const apps = getAppointments();
  const upcoming = apps.filter(a => a.userEmail === user.email && new Date(a.date) > new Date());
  if (upcoming.length) {
    alert(`Você possui ${upcoming.length} consulta(s) futura(s).`);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    document.getElementById('auth').classList.add('d-none');
    document.getElementById('dashboard').classList.remove('d-none');
    document.getElementById('user-name').textContent = currentUser.name;
    if (currentUser.type === 'doctor') {
      document.getElementById('doctor-area').classList.remove('d-none');
      updateDoctorAppointments();
    } else {
      document.getElementById('patient-area').classList.remove('d-none');
      renderDoctors();
      updateAppointments();
      checkNotifications();
    }
  }

  document.getElementById('show-register').onclick = showRegister;
  document.getElementById('show-login').onclick = showLogin;

  document.getElementById('register-form').onsubmit = (e) => {
    e.preventDefault();
    const users = getUsers();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    if (users.find(u => u.email === email)) {
      alert('Email já cadastrado');
      return;
    }
    const newUser = { name, email, password, type: 'patient' };
    users.push(newUser);
    saveUsers(users);
    alert('Cadastro realizado!');
    showLogin();
  };

  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const user = getUsers().find(u => u.email === email && u.password === password);
    if (!user) {
      alert('Credenciais inválidas');
      return;
    }
    setCurrentUser(user);
    location.reload();
  };

  document.getElementById('schedule-form').onsubmit = (e) => {
    e.preventDefault();
    const doctorId = parseInt(document.getElementById('doctor-select').value);
    const date = document.getElementById('date-input').value;
    if (!doctorId || !date) {
      alert('Preencha todos os campos');
      return;
    }
    const doctor = doctors.find(d => d.id === doctorId);
    const apps = getAppointments();
    const user = getCurrentUser();
    apps.push({
      doctorId,
      doctorName: doctor.name,
      userEmail: user.email,
      userName: user.name,
      date
    });
    saveAppointments(apps);
    updateAppointments();
    alert('Consulta agendada!');
  };

  document.getElementById('logout').onclick = logout;
});
