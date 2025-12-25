// ========== 資料儲存 ==========
let itineraries = [];
let checklistItems = [];
let expenses = [];
let flightData = { go: '', goTime: '', back: '', backTime: '' };
let hotelData = { name: '', address: '', phone: '', checkin: '', checkout: '' };
let currentEditId = null;

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
  updateTime();
  setInterval(updateTime, 1000);
  loadWeatherData();
  loadCurrentWeather();
  loadFromStorage();
  convertFromJPY();
});

// ========== 時間更新 ==========
function updateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '下午' : '上午';
  const displayHours = hours % 12 || 12;
  
  document.getElementById('currentTime').textContent = 
    `${year}.${month}.${day} ${ampm} ${displayHours}:${minutes}`;
}

// ========== 本地儲存 ==========
function saveToStorage() {
  localStorage.setItem('itineraries', JSON.stringify(itineraries));
  localStorage.setItem('checklistItems', JSON.stringify(checklistItems));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('flightData', JSON.stringify(flightData));
  localStorage.setItem('hotelData', JSON.stringify(hotelData));
}

function loadFromStorage() {
  try {
    itineraries = JSON.parse(localStorage.getItem('itineraries')) || [];
    checklistItems = JSON.parse(localStorage.getItem('checklistItems')) || [];
    expenses = JSON.parse(localStorage.getItem('expenses')) || [
      { id: 1, type: '機票', amount: 15000, date: '2024/12/20', details: '' },
      { id: 2, type: '住宿', amount: 8000, date: '2024/12/21', details: '' },
      { id: 3, type: '餐費', amount: 3500, date: '2024/12/22', details: '' }
    ];
    flightData = JSON.parse(localStorage.getItem('flightData')) || { go: '', goTime: '', back: '', backTime: '' };
    hotelData = JSON.parse(localStorage.getItem('hotelData')) || { name: '', address: '', phone: '', checkin: '', checkout: '' };
  } catch (e) {
    console.error('載入資料失敗:', e);
  }
  
  renderItineraries();
  renderChecklist();
  renderExpenses();
  renderFlightInfo();
  renderHotelInfo();
}

// ========== 頁面切換 ==========
function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.classList.add('inactive');
  });
  
  document.getElementById(sectionId).classList.add('active');
  event.currentTarget.classList.remove('inactive');
  event.currentTarget.classList.add('active');

  if (sectionId === 'itinerary') {
    renderItineraries();
    loadCurrentWeather();
  }
  if (sectionId === 'checklist') renderChecklist();
  if (sectionId === 'expense') renderExpenses();
  if (sectionId === 'info') {
    renderFlightInfo();
    renderHotelInfo();
  }
}

// ========== 天氣 API (OpenWeatherMap) ==========
// 使用免費的 OpenWeatherMap API
// const WEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // 需要註冊 https://openweathermap.org/api
// const TOKYO_LAT = 35.6762;
// const TOKYO_LON = 139.6503;

// async function loadWeatherData() {
//   try {
//     // 使用 OpenWeatherMap 的 5 天預報 API
//     const response = await fetch(
//       `https://api.openweathermap.org/data/2.5/forecast?lat=${TOKYO_LAT}&lon=${TOKYO_LON}&units=metric&appid=${WEATHER_API_KEY}&lang=zh_tw`
//     );
    
//     if (!response.ok) throw new Error('無法取得天氣資料');
    
//     const data = await response.json();
//     const grid = document.getElementById('weatherGrid');
//     grid.innerHTML = '';
    
//     // 取得每天中午的天氣資料
//     const dailyData = {};
//     data.list.forEach(item => {
//       const date = new Date(item.dt * 1000);
//       const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
//       if (date.getHours() === 12 && Object.keys(dailyData).length < 7) {
//         dailyData[dateStr] = {
//           icon: getWeatherIcon(item.weather[0].main),
//           temp: Math.round(item.main.temp) + '°C'
//         };
//       }
//     });
    
//     Object.entries(dailyData).forEach(([date, weather]) => {
//       grid.innerHTML += `
//         <div class="weather-day">
//           <div class="weather-icon-day">${weather.icon}</div>
//           <div class="weather-date">${date}</div>
//           <div class="weather-temp">${weather.temp}</div>
//         </div>
//       `;
//     });
//   } catch (error) {
//     console.error('天氣載入失敗:', error);
//     // 如果 API 失敗，使用模擬資料
//     loadMockWeatherData();
//   }
// }

// async function loadCurrentWeather() {
//   try {
//     const response = await fetch(
//       `https://api.openweathermap.org/data/2.5/weather?lat=${TOKYO_LAT}&lon=${TOKYO_LON}&units=metric&appid=${WEATHER_API_KEY}&lang=zh_tw`
//     );
    
//     if (!response.ok) throw new Error('無法取得即時天氣');
    
//     const data = await response.json();
//     const weatherSection = document.querySelector('#itinerary .card');
//     if (weatherSection) {
//       weatherSection.innerHTML = `
//         <h3 class="card-title">🌡️ 即時天氣</h3>
//         <div style="text-align: center; padding: 20px;">
//           <div style="font-size: 4rem; margin-bottom: 10px;">${getWeatherIcon(data.weather[0].main)}</div>
//           <div style="font-size: 2rem; font-weight: bold; color: #8b7355; margin-bottom: 5px;">${Math.round(data.main.temp)}°C</div>
//           <div style="font-size: 1.1rem; color: #a89480;">${data.weather[0].description} · 濕度 ${data.main.humidity}% · 風速 ${Math.round(data.wind.speed * 3.6)} km/h</div>
//         </div>
//       `;
//     }
//   } catch (error) {
//     console.error('即時天氣載入失敗:', error);
//   }
// }

// function getWeatherIcon(weather) {
//   const icons = {
//     'Clear': '☀️',
//     'Clouds': '☁️',
//     'Rain': '🌧️',
//     'Drizzle': '🌦️',
//     'Thunderstorm': '⛈️',
//     'Snow': '❄️',
//     'Mist': '🌫️',
//     'Fog': '🌫️'
//   };
//   return icons[weather] || '🌤️';
// }

// function loadMockWeatherData() {
//   const weatherData = [
//     { date: '12/15', icon: '☀️', temp: '18°C' },
//     { date: '12/16', icon: '⛅', temp: '16°C' },
//     { date: '12/17', icon: '🌤️', temp: '17°C' },
//     { date: '12/18', icon: '☁️', temp: '15°C' },
//     { date: '12/19', icon: '🌧️', temp: '13°C' },
//     { date: '12/20', icon: '⛅', temp: '14°C' },
//     { date: '12/21', icon: '☀️', temp: '16°C' }
//   ];
  
//   const grid = document.getElementById('weatherGrid');
//   grid.innerHTML = '';
  
//   weatherData.forEach(day => {
//     grid.innerHTML += `
//       <div class="weather-day">
//         <div class="weather-icon-day">${day.icon}</div>
//         <div class="weather-date">${day.date}</div>
//         <div class="weather-temp">${day.temp}</div>
//       </div>
//     `;
//   });
// }

// ========== 匯率換算 ==========
function convertFromJPY() {
  const jpy = parseFloat(document.getElementById('jpyInput').value) || 0;
  const rate = 4.7;
  const twd = Math.round(jpy / rate);
  document.getElementById('twdInput').value = twd;
  updateAlert(jpy);
}

function convertFromTWD() {
  const twd = parseFloat(document.getElementById('twdInput').value) || 0;
  const rate = 4.7;
  const jpy = Math.round(twd * rate);
  document.getElementById('jpyInput').value = jpy;
  updateAlert(jpy);
}

function updateAlert(jpy) {
  const alertBox = document.getElementById('alertBox');
  if (jpy >= 5000) {
    alertBox.innerHTML = `恭喜！¥${jpy.toLocaleString()} 已達到免稅門檻！`;
    alertBox.className = 'alert-box';
  } else {
    alertBox.innerHTML = `⚠️ 提醒：¥${jpy.toLocaleString()} 尚未達到免稅門檻 ¥5,000`;
    alertBox.className = 'alert-box alert-warning';
  }
}

// ========== Modal 控制 ==========
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  currentEditId = null;
}

function openEmergencyModal() {
  document.getElementById('emergencyModal').classList.add('active');
}

function openJapaneseModal() {
  document.getElementById('japaneseModal').classList.add('active');
}

function openReminderModal() {
  document.getElementById('reminderModal').classList.add('active');
}

// ========== 行程管理（新版） - 取代原本的行程函數 ==========
let currentDay = 1;
let totalDays = 7;
let dailyActivities = {};

// 初始化行程
function initItinerary() {
  const saved = localStorage.getItem('dailyActivities');
  if (saved) {
    try {
      dailyActivities = JSON.parse(saved);
    } catch (e) {
      dailyActivities = {};
    }
  }
  updateDayDisplay();
  renderDailyActivities();
}

// 儲存行程資料
function saveItineraryData() {
  localStorage.setItem('dailyActivities', JSON.stringify(dailyActivities));
}

// 切換天數
function changeDay(direction) {
  const newDay = currentDay + direction;
  if (newDay >= 1 && newDay <= totalDays) {
    currentDay = newDay;
    updateDayDisplay();
    renderDailyActivities();
  }
}

// 更新天數顯示
function updateDayDisplay() {
  document.getElementById('dayTitle').textContent = `Day ${currentDay}`;
  
  const startDate = new Date(2024, 11, 25);
  const currentDate = new Date(startDate);
  currentDate.setDate(startDate.getDate() + (currentDay - 1));
  
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const weekday = weekdays[currentDate.getDay()];
  
  const dayTitles = {
    1: '抵達與安頓',
    2: '市區探索',
    3: '文化體驗',
    4: '購物美食',
    5: '近郊一日遊',
    6: '自由活動',
    7: '回程'
  };
  
  document.getElementById('dateDisplay').textContent = 
    `${month}/${day} (${weekday}) - ${dayTitles[currentDay] || ''}`;
}

// 渲染當日行程
function renderDailyActivities() {
  const container = document.getElementById('dailyItineraryList');
  if (!container) return;
  
  const dayKey = `day${currentDay}`;
  const activities = dailyActivities[dayKey] || [];
  
  if (activities.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <p>今天還沒有安排行程</p>
        <p style="font-size: 0.9rem; margin-top: 10px;">點擊下方按鈕開始規劃</p>
      </div>
    `;
    return;
  }
  
  activities.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  
  container.innerHTML = activities.map(activity => {
    const tags = Array.isArray(activity.tags) ? activity.tags : 
                 (activity.tags ? activity.tags.split(',').map(t => t.trim()).filter(t => t) : []);
    const transport = Array.isArray(activity.transport) ? activity.transport : 
                      (activity.transport ? activity.transport.split('\n').filter(t => t.trim()) : []);
    
    return `
      <div class="activity-card" onclick="editActivity(${activity.id})">
        <div class="timeline-dot"></div>
        <div class="timeline-line"></div>
        
        ${activity.time ? `<div class="activity-time">🕐 ${activity.time}</div>` : ''}
        
        <div class="activity-title">${activity.place}</div>
        
        ${activity.address ? `<div class="activity-location">📍 ${activity.address}</div>` : ''}
        
        ${activity.mapLink ? `
          <a href="${activity.mapLink}" target="_blank" class="nav-button" onclick="event.stopPropagation()">
            ✓ 導航前往
          </a>
        ` : ''}
        
        ${tags.length > 0 ? `
          <div class="activity-tags">
            ${tags.map(tag => `<span class="activity-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        
        ${transport.length > 0 ? `
          <div class="activity-section">
            <div class="section-title">🚇 交通資訊</div>
            <ul class="activity-list">
              ${transport.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${activity.ticket ? `
          <div class="activity-section">
            <div class="section-title">🎫 售票資訊</div>
            <div style="padding-left: 20px; color: #6d5a45;">${activity.ticket}</div>
          </div>
        ` : ''}
        
        ${activity.notes ? `
          <div class="tip-box">💡 ${activity.notes}</div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// 開啟新增活動 Modal
function openActivityModal() {
  currentEditId = null;
  document.getElementById('activityModalTitle').textContent = '➕ 新增活動';
  document.getElementById('activityTime').value = '';
  document.getElementById('activityPlace').value = '';
  document.getElementById('activityAddress').value = '';
  document.getElementById('activityMapLink').value = '';
  document.getElementById('activityTags').value = '';
  document.getElementById('activityTransport').value = '';
  document.getElementById('activityTicket').value = '';
  document.getElementById('activityNotes').value = '';
  document.getElementById('activityDeleteBtn').style.display = 'none';
  document.getElementById('activityModal').classList.add('active');
}

// 編輯活動
function editActivity(id) {
  const dayKey = `day${currentDay}`;
  const activities = dailyActivities[dayKey] || [];
  const activity = activities.find(a => a.id === id);
  
  if (activity) {
    currentEditId = id;
    document.getElementById('activityModalTitle').textContent = '✏️ 編輯活動';
    document.getElementById('activityTime').value = activity.time || '';
    document.getElementById('activityPlace').value = activity.place || '';
    document.getElementById('activityAddress').value = activity.address || '';
    document.getElementById('activityMapLink').value = activity.mapLink || '';
    
    const tags = Array.isArray(activity.tags) ? activity.tags.join(', ') : (activity.tags || '');
    document.getElementById('activityTags').value = tags;
    
    const transport = Array.isArray(activity.transport) ? activity.transport.join('\n') : (activity.transport || '');
    document.getElementById('activityTransport').value = transport;
    
    document.getElementById('activityTicket').value = activity.ticket || '';
    document.getElementById('activityNotes').value = activity.notes || '';
    document.getElementById('activityDeleteBtn').style.display = 'block';
    document.getElementById('activityModal').classList.add('active');
  }
}

// 儲存活動
function saveActivity() {
  const place = document.getElementById('activityPlace').value.trim();
  
  if (!place) {
    alert('請填寫地點名稱');
    return;
  }
  
  const dayKey = `day${currentDay}`;
  if (!dailyActivities[dayKey]) {
    dailyActivities[dayKey] = [];
  }
  
  const tags = document.getElementById('activityTags').value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);
  
  const transport = document.getElementById('activityTransport').value
    .split('\n')
    .map(t => t.trim())
    .filter(t => t);
  
  const activityData = {
    id: currentEditId || Date.now(),
    time: document.getElementById('activityTime').value,
    place: place,
    address: document.getElementById('activityAddress').value.trim(),
    mapLink: document.getElementById('activityMapLink').value.trim(),
    tags: tags,
    transport: transport,
    ticket: document.getElementById('activityTicket').value.trim(),
    notes: document.getElementById('activityNotes').value.trim()
  };
  
  if (currentEditId) {
    const index = dailyActivities[dayKey].findIndex(a => a.id === currentEditId);
    if (index !== -1) {
      dailyActivities[dayKey][index] = activityData;
    }
  } else {
    dailyActivities[dayKey].push(activityData);
  }
  
  saveItineraryData();
  renderDailyActivities();
  closeModal('activityModal');
}

// 刪除活動
function deleteActivity() {
  if (currentEditId && confirm('確定要刪除此活動嗎？')) {
    const dayKey = `day${currentDay}`;
    dailyActivities[dayKey] = (dailyActivities[dayKey] || []).filter(a => a.id !== currentEditId);
    saveItineraryData();
    renderDailyActivities();
    closeModal('activityModal');
  }
}

// 在 DOMContentLoaded 中加入初始化
document.addEventListener('DOMContentLoaded', function() {
  // ... 保留原有的初始化代碼 ...
  initItinerary(); // 加入這一行
});

// 刪除或註解掉原本的這些函數（如果有的話）：
// renderItineraries, openItineraryModal, editItinerary, saveItinerary, deleteItinerary

// ========== 清單管理 ==========
function renderChecklist() {
  const list = document.getElementById('checklistItems');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (checklistItems.length === 0) {
    list.innerHTML = '<p style="color: #8b7355; text-align: center; padding: 40px;">尚無清單項目，點擊下方按鈕新增</p>';
    return;
  }
  
  checklistItems.forEach(item => {
    const div = document.createElement('div');
    div.className = `list-item ${item.checked ? 'checked' : ''}`;
    div.onclick = () => toggleChecklistItem(item.id);
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 1.5rem;">${item.checked ? '✅' : '⬜'}</div>
        <div style="font-size: 1.1rem; font-weight: 600; color: #6d5a45;">${item.text}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

function openChecklistModal() {
  document.getElementById('checklistItem').value = '';
  document.getElementById('checklistModal').classList.add('active');
}

function saveChecklistItem() {
  const text = document.getElementById('checklistItem').value.trim();
  
  if (!text) {
    alert('請輸入項目名稱');
    return;
  }
  
  checklistItems.push({
    id: Date.now(),
    text: text,
    checked: false
  });
  
  saveToStorage();
  renderChecklist();
  closeModal('checklistModal');
}

function toggleChecklistItem(id) {
  const item = checklistItems.find(i => i.id === id);
  if (item) {
    item.checked = !item.checked;
    saveToStorage();
    renderChecklist();
  }
}

// ========== 記帳管理 ==========
const expenseTypes = {
  '機票': { icon: '✈️' },
  '住宿': { icon: '🏨' },
  '餐費': { icon: '🍜' },
  '交通': { icon: '🚗' },
  '購物': { icon: '🛍️' },
  '娛樂': { icon: '🎭' },
  '其他': { icon: '💰' }
};

function renderExpenses() {
  const list = document.getElementById('expenseList');
  if (!list) return;
  
  list.innerHTML = '';
  
  expenses.forEach(expense => {
    const typeInfo = expenseTypes[expense.type];
    const div = document.createElement('div');
    div.className = 'expense-item';
    div.onclick = () => editExpense(expense.id);
    div.innerHTML = `
      <div class="expense-content">
        <div class="expense-left">
          <div class="expense-icon">${typeInfo.icon}</div>
          <div>
            <div class="expense-title">${expense.type} - NT$ ${expense.amount.toLocaleString()}</div>
            ${expense.details ? `<div style="font-size: 0.9rem; color: #a89480; margin-top: 3px;">${expense.details}</div>` : ''}
          </div>
        </div>
        <div class="expense-date">${expense.date}</div>
      </div>
    `;
    list.appendChild(div);
  });
  
  updateTotal();
}

function updateTotal() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalElement = document.getElementById('totalAmount');
  if (totalElement) {
    totalElement.textContent = `NT$ ${total.toLocaleString()}`;
  }
}

function openExpenseAddModal() {
  currentEditId = null;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('expenseModalTitle').textContent = '➕ 新增支出';
  document.getElementById('expenseType').value = '機票';
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseDate').value = today;
  document.getElementById('expenseDetails').value = '';
  document.getElementById('expenseDeleteBtn').style.display = 'none';
  document.getElementById('expenseAddModal').classList.add('active');
}

function editExpense(id) {
  const expense = expenses.find(e => e.id === id);
  if (expense) {
    currentEditId = id;
    document.getElementById('expenseModalTitle').textContent = '✏️ 編輯支出';
    document.getElementById('expenseType').value = expense.type;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseDate').value = expense.date.replace(/\//g, '-');
    document.getElementById('expenseDetails').value = expense.details || '';
    document.getElementById('expenseDeleteBtn').style.display = 'block';
    document.getElementById('expenseAddModal').classList.add('active');
  }
}

function saveExpense() {
  const type = document.getElementById('expenseType').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const date = document.getElementById('expenseDate').value.replace(/-/g, '/');
  const details = document.getElementById('expenseDetails').value;
  
  if (!amount || amount <= 0) {
    alert('請輸入有效的金額');
    return;
  }
  
  if (currentEditId) {
    const expense = expenses.find(e => e.id === currentEditId);
    if (expense) {
      expense.type = type;
      expense.amount = amount;
      expense.date = date;
      expense.details = details;
    }
  } else {
    expenses.push({
      id: Date.now(),
      type: type,
      amount: amount,
      date: date,
      details: details
    });
  }
  
  saveToStorage();
  renderExpenses();
  closeModal('expenseAddModal');
}

function deleteExpense() {
  if (currentEditId && confirm('確定要刪除這筆支出嗎？')) {
    expenses = expenses.filter(e => e.id !== currentEditId);
    saveToStorage();
    renderExpenses();
    closeModal('expenseAddModal');
  }
}

// ========== 掃描發票 ==========
function openScanModal() {
  document.getElementById('scanModal').classList.add('active');
}

function handleScanReceipt(event) {
  const file = event.target.files[0];
  if (file) {
    const mockAmount = Math.floor(Math.random() * 5000) + 100;
    closeModal('scanModal');
    
    setTimeout(() => {
      document.getElementById('expenseAmount').value = mockAmount;
      document.getElementById('expenseDetails').value = '已掃描發票';
      openExpenseAddModal();
      alert(`✅ 發票掃描成功！\n識別金額：NT$ ${mockAmount}`);
    }, 100);
  }
}

// ========== 航班資訊 ==========
function renderFlightInfo() {
  const info = document.getElementById('flightInfo');
  if (!info) return;
  
  if (!flightData.go && !flightData.back) {
    info.innerHTML = '<p style="color: #8b7355; text-align: center; padding: 20px;">尚未設定航班資訊</p>';
  } else {
    info.innerHTML = `
      <div style="line-height: 2;">
        <p><strong>✈️ 去程：</strong>${flightData.go || '未設定'}</p>
        <p><strong>🕐 時間：</strong>${flightData.goTime ? formatDateTime(flightData.goTime) : '未設定'}</p>
        <p style="margin-top: 15px;"><strong>✈️ 回程：</strong>${flightData.back || '未設定'}</p>
        <p><strong>🕐 時間：</strong>${flightData.backTime ? formatDateTime(flightData.backTime) : '未設定'}</p>
      </div>
    `;
  }
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '未設定';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function openFlightModal() {
  document.getElementById('flightGo').value = flightData.go || '';
  document.getElementById('flightGoTime').value = flightData.goTime || '';
  document.getElementById('flightBack').value = flightData.back || '';
  document.getElementById('flightBackTime').value = flightData.backTime || '';
  document.getElementById('flightModal').classList.add('active');
}

function saveFlight() {
  flightData.go = document.getElementById('flightGo').value;
  flightData.goTime = document.getElementById('flightGoTime').value;
  flightData.back = document.getElementById('flightBack').value;
  flightData.backTime = document.getElementById('flightBackTime').value;
  
  saveToStorage();
  renderFlightInfo();
  closeModal('flightModal');
  alert('✅ 航班資訊已儲存');
}

// ========== 飯店資訊 ==========
function renderHotelInfo() {
  const info = document.getElementById('hotelInfo');
  if (!info) return;
  
  if (!hotelData.name) {
    info.innerHTML = '<p style="color: #8b7355; text-align: center; padding: 20px;">尚未設定飯店資訊</p>';
  } else {
    info.innerHTML = `
      <div style="line-height: 2;">
        <p><strong>🏨 飯店：</strong>${hotelData.name}</p>
        <p><strong>📍 地址：</strong>${hotelData.address || '未設定'}</p>
        <p><strong>📞 電話：</strong>${hotelData.phone ? `<a href="tel:${hotelData.phone}" style="color: #8b7355; text-decoration: none;">${hotelData.phone}</a>` : '未設定'}</p>
        <p><strong>📅 入住：</strong>${hotelData.checkin || '未設定'}</p>
        <p><strong>📅 退房：</strong>${hotelData.checkout || '未設定'}</p>
      </div>
    `;
  }
}

function openHotelModal() {
  document.getElementById('hotelName').value = hotelData.name || '';
  document.getElementById('hotelAddress').value = hotelData.address || '';
  document.getElementById('hotelPhone').value = hotelData.phone || '';
  document.getElementById('hotelCheckin').value = hotelData.checkin || '';
  document.getElementById('hotelCheckout').value = hotelData.checkout || '';
  document.getElementById('hotelModal').classList.add('active');
}

function saveHotel() {
  hotelData.name = document.getElementById('hotelName').value;
  hotelData.address = document.getElementById('hotelAddress').value;
  hotelData.phone = document.getElementById('hotelPhone').value;
  hotelData.checkin = document.getElementById('hotelCheckin').value;
  hotelData.checkout = document.getElementById('hotelCheckout').value;
  
  saveToStorage();
  renderHotelInfo();
  closeModal('hotelModal');
  alert('✅ 飯店資訊已儲存');
}