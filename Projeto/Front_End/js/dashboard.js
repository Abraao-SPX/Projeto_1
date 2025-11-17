document.addEventListener('DOMContentLoaded', () => {
  const totalClientsEl = document.getElementById('totalClients');
  const appointmentsTodayEl = document.getElementById('appointmentsToday');
  const revenueMonthEl = document.getElementById('revenueMonth');
  const servicesListEl = document.getElementById('servicesList');
  const appointmentsTableBody = document.querySelector('#appointmentsTable tbody');
  const refreshBtn = document.getElementById('refreshBtn');
  const searchInput = document.getElementById('searchInput');

  let dashboardData = null;

  function formatCurrency(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function renderCards(data) {
    totalClientsEl.textContent = data.totalClients;
    appointmentsTodayEl.textContent = data.appointmentsToday;
    revenueMonthEl.textContent = formatCurrency(data.revenueMonth);
  }

  function renderServices(data) {
    servicesListEl.innerHTML = '';
    data.servicesBreakdown.forEach(s => {
      const li = document.createElement('li');
      li.textContent = `${s.service}: ${s.count}`;
      servicesListEl.appendChild(li);
    });
  }

  function renderAppointments(data, filter = '') {
    const term = filter.trim().toLowerCase();
    appointmentsTableBody.innerHTML = '';
    data.recentAppointments
      .filter(a => !term || a.cliente.toLowerCase().includes(term) || a.service.toLowerCase().includes(term))
      .forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${a.time}</td><td>${a.cliente}</td><td>${a.service}</td><td>${formatCurrency(a.price)}</td>`;
        appointmentsTableBody.appendChild(tr);
      });
  }

  async function fetchDashboard() {
    try {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Carregando...';

      const token = localStorage.getItem('auth_token');
      const headers = token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };

      const res = await fetch('http://localhost:3000/api/dashboard', { headers });
      if (!res.ok) throw new Error('Falha ao obter dados');
      const data = await res.json();
      dashboardData = data;

      renderCards(data);
      renderServices(data);
      renderAppointments(data);
    } catch (err) {
      console.error('Erro ao buscar dashboard', err);
      alert('Erro ao carregar dados do dashboard. Veja o console.');
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = 'Atualizar';
    }
  }

  refreshBtn.addEventListener('click', () => fetchDashboard());
  searchInput.addEventListener('input', (e) => {
    if (!dashboardData) return;
    renderAppointments(dashboardData, e.target.value);
  });

  // inicializa
  fetchDashboard();
});
