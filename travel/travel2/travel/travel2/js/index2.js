// ========== 全域變數 ==========
let itineraries = [];
let checklistItems = [];
let expenses = [];
let flightData = { go: '', goTime: '', back: '', backTime: '' };
let hotelData = { name: '', address: '', phone: '', checkin: '', checkout: '' };
let currentEditId = null;
let currentDay = 1;
let totalDays = 7;
let dailyActivities = {};

// ========== 初始化（確保這段在最前面） ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== 頁面載入開始 ===');
  
  // 1. 先載入所有儲存的資料
  loadFromStorage();
  
  // 2. 初始化行程系統
  initItinerary();
  
  // 3. 更新時間
  updateTime();
  setInterval(updateTime, 1000);
  
  // 4. 載入天氣
  loadWeatherData();
  
  // 5. 初始化匯率換算
  convertFromJPY();
  
  console.log('=== 頁面載入完成 ===');
});

// ========== 本地儲存 ==========
function saveToStorage() {
  try {
    console.log('開始儲存資料...');
    localStorage.setItem('checklistItems', JSON.stringify(checklistItems));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('flightData', JSON.stringify(flightData));
    localStorage.setItem('hotelData', JSON.stringify(hotelData));
    localStorage.setItem('dailyActivities', JSON.stringify(dailyActivities));
    console.log('✅ 資料儲存成功');
    console.log('航班資料:', flightData);
    console.log('飯店資料:', hotelData);
    console.log('行程資料:', dailyActivities);
  } catch (e) {
    console.error('❌ 儲存失敗:', e);
    alert('資料儲存失敗：' + e.message);
  }
}

function loadFromStorage() {
  try {
    console.log('開始載入資料...');
    
    // 載入清單
    const savedChecklist = localStorage.getItem('checklistItems');
    if (savedChecklist) {
      checklistItems = JSON.parse(savedChecklist);
      console.log('載入清單:', checklistItems.length, '項');
    }
    
    // 載入記帳
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      expenses = JSON.parse(savedExpenses);
      console.log('載入記帳:', expenses.length, '筆');
    } else {
      expenses = [
        { id: 1, type: '機票', amount: 15000, date: '2024/12/20', details: '' },
        { id: 2, type: '住宿', amount: 8000, date: '2024/12/21', details: '' },
        { id: 3, type: '餐費', amount: 3500, date: '2024/12/22', details: '' }
      ];
    }
    
    // 載入航班資訊
    const savedFlight = localStorage.getItem('flightData');
    if (savedFlight) {
      flightData = JSON.parse(savedFlight);
      console.log('載入航班:', flightData);
    }
    
    // 載入飯店資訊
    const savedHotel = localStorage.getItem('hotelData');
    if (savedHotel) {
      hotelData = JSON.parse(savedHotel);
      console.log('載入飯店:', hotelData);
    }
    
    // 載入行程資料
    const savedActivities = localStorage.getItem('dailyActivities');
    if (savedActivities) {
      dailyActivities = JSON.parse(savedActivities);
      console.log('載入行程:', Object.keys(dailyActivities).length, '天');
    }
    
    console.log('✅ 資料載入完成');
    
    // 渲染所有資料
    renderChecklist();
    renderExpenses();
    renderFlightInfo();
    renderHotelInfo();
    
  } catch (e) {
    console.error('❌ 載入失敗:', e);
    alert('資料載入失敗：' + e.message);
  }
}

// 時間更新函數 (保持不變)
function updateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '下午' : '上午';
  const displayHours = hours % 12 || 12;
  
  const subtitle = document.getElementById('currentTime');
  if (subtitle) {
    subtitle.textContent = `${year}.${month}.${day} ${ampm} ${displayHours}:${minutes}`;
  }
}
// ========== 航班資訊 ==========
function saveFlight() {
  console.log('儲存航班資訊');
  flightData.go = document.getElementById('flightGo').value;
  flightData.goTime = document.getElementById('flightGoTime').value;
  flightData.back = document.getElementById('flightBack').value;
  flightData.backTime = document.getElementById('flightBackTime').value;
  
  console.log('航班資料:', flightData);
  saveToStorage(); // 重要！
  renderFlightInfo();
  closeModal('flightModal');
  alert('✅ 航班資訊已儲存');
}

// ========== 飯店資訊 ==========
function saveHotel() {
  console.log('儲存飯店資訊');
  hotelData.name = document.getElementById('hotelName').value;
  hotelData.address = document.getElementById('hotelAddress').value;
  hotelData.phone = document.getElementById('hotelPhone').value;
  hotelData.checkin = document.getElementById('hotelCheckin').value;
  hotelData.checkout = document.getElementById('hotelCheckout').value;
  
  console.log('飯店資料:', hotelData);
  saveToStorage(); // 重要！
  renderHotelInfo();
  closeModal('hotelModal');
  alert('✅ 飯店資訊已儲存');
}

// ========== 清單管理 ==========
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
  
  console.log('新增清單項目:', text);
  saveToStorage(); // 重要！
  renderChecklist();
  closeModal('checklistModal');
}

function toggleChecklistItem(id) {
  const item = checklistItems.find(i => i.id === id);
  if (item) {
    item.checked = !item.checked;
    console.log('切換清單狀態:', id);
    saveToStorage(); // 重要！
    renderChecklist();
  }
}

// ========== 記帳管理 ==========
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
  
  console.log('儲存記帳:', expenses.length, '筆');
  saveToStorage(); // 重要！
  renderExpenses();
  closeModal('expenseAddModal');
}

function deleteExpense() {
  if (currentEditId && confirm('確定要刪除這筆支出嗎？')) {
    expenses = expenses.filter(e => e.id !== currentEditId);
    console.log('刪除記帳');
    saveToStorage(); // 重要！
    renderExpenses();
    closeModal('expenseAddModal');
  }
}

// ========== 行程管理 ==========
function initItinerary() {
  console.log('初始化行程系統');
  currentDay = 1;
  renderDailyActivities();
}

function changeDay(delta) {
  const newDay = currentDay + delta;
  if (newDay >= 1 && newDay <= totalDays) {
    currentDay = newDay;
    document.getElementById('dayTitle').textContent = `Day ${currentDay}`;
    renderDailyActivities();
  }
}

function openActivityModal(activityId = null) {
  currentEditId = activityId;
  const modal = document.getElementById('activityModal');
  const title = document.getElementById('activityModalTitle');
  const deleteBtn = document.getElementById('activityDeleteBtn');
  
  if (activityId) {
    title.textContent = '✏️ 編輯活動';
    deleteBtn.style.display = 'block';
    
    const dayKey = `day${currentDay}`;
    const activity = (dailyActivities[dayKey] || []).find(a => a.id === activityId);
    
    if (activity) {
      document.getElementById('activityTime').value = activity.time || '';
      document.getElementById('activityPlace').value = activity.place || '';
      document.getElementById('activityAddress').value = activity.address || '';
      document.getElementById('activityMapLink').value = activity.mapLink || '';
      document.getElementById('activityTags').value = (activity.tags || []).join(', ');
      document.getElementById('activityTransport').value = (activity.transport || []).join('\n');
      document.getElementById('activityTicket').value = activity.ticket || '';
      document.getElementById('activityNotes').value = activity.notes || '';
    }
  } else {
    title.textContent = '➕ 新增活動';
    deleteBtn.style.display = 'none';
    
    document.getElementById('activityTime').value = '';
    document.getElementById('activityPlace').value = '';
    document.getElementById('activityAddress').value = '';
    document.getElementById('activityMapLink').value = '';
    document.getElementById('activityTags').value = '';
    document.getElementById('activityTransport').value = '';
    document.getElementById('activityTicket').value = '';
    document.getElementById('activityNotes').value = '';
  }
  
  modal.style.display = 'flex';
}

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
  
  console.log('儲存活動:', dayKey, dailyActivities[dayKey].length, '個活動');
  saveToStorage();
  renderDailyActivities();
  closeModal('activityModal');
}

function deleteActivity() {
  if (currentEditId && confirm('確定要刪除此活動嗎？')) {
    const dayKey = `day${currentDay}`;
    dailyActivities[dayKey] = (dailyActivities[dayKey] || []).filter(a => a.id !== currentEditId);
    console.log('刪除活動');
    saveToStorage();
    renderDailyActivities();
    closeModal('activityModal');
  }
}

function renderDailyActivities() {
  const container = document.getElementById('dailyItineraryList');
  if (!container) return;
  
  const dayKey = `day${currentDay}`;
  const activities = dailyActivities[dayKey] || [];
  
  if (activities.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #a89480; padding: 30px;">尚無活動，點擊下方按鈕新增</div>';
    return;
  }
  
  container.innerHTML = activities.map(activity => `
    <div class="timeline-item" onclick="openActivityModal(${activity.id})">
      <div class="timeline-time">${activity.time || '未設定'}</div>
      <div class="timeline-content">
        <div class="timeline-place">${activity.place}</div>
        ${activity.address ? `<div class="timeline-address">${activity.address}</div>` : ''}
        ${activity.mapLink ? `<div class="timeline-link"><a href="${activity.mapLink}" target="_blank" onclick="event.stopPropagation();">📍 Google Maps</a></div>` : ''}
        ${activity.tags.length > 0 ? `<div class="timeline-tags">${activity.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
        ${activity.transport.length > 0 ? `<div class="timeline-transport">${activity.transport.map(t => `<div>🚇 ${t}</div>`).join('')}</div>` : ''}
        ${activity.ticket ? `<div class="timeline-ticket">🎫 ${activity.ticket}</div>` : ''}
        ${activity.notes ? `<div class="timeline-notes">📝 ${activity.notes}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// ========== 渲染函數 ==========
function renderChecklist() {
  const container = document.getElementById('checklistItems');
  if (!container) return;
  
  if (checklistItems.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #a89480; padding: 20px;">尚無項目</div>';
    return;
  }
  
  container.innerHTML = checklistItems.map(item => `
    <div class="checklist-item">
      <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleChecklistItem(${item.id})">
      <span style="${item.checked ? 'text-decoration: line-through; color: #a89480;' : ''}">${item.text}</span>
    </div>
  `).join('');
}

function renderExpenses() {
  const container = document.getElementById('expenseList');
  if (!container) return;
  
  if (expenses.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #a89480; padding: 20px;">尚無支出記錄</div>';
    return;
  }
  
  container.innerHTML = expenses.map(expense => `
    <div class="expense-item" onclick="openExpenseEditModal(${expense.id})">
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 5px;">${expense.type}</div>
        <div style="font-size: 0.85rem; color: #a89480;">${expense.date}</div>
        ${expense.details ? `<div style="font-size: 0.85rem; color: #8b7355; margin-top: 3px;">${expense.details}</div>` : ''}
      </div>
      <div style="font-weight: 700; color: #8b7355;">NT$ ${expense.amount.toLocaleString()}</div>
    </div>
  `).join('');
  
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalEl = document.getElementById('totalAmount');
  if (totalEl) {
    totalEl.textContent = `NT$ ${total.toLocaleString()}`;
  }
}

function renderFlightInfo() {
  const container = document.getElementById('flightInfo');
  if (!container) return;
  
  if (!flightData.go && !flightData.back) {
    container.innerHTML = '<div style="text-align: center; color: #a89480; padding: 20px;">尚未設定航班資訊</div>';
    return;
  }
  
  container.innerHTML = `
    ${flightData.go ? `
      <div style="margin-bottom: 15px;">
        <div style="font-weight: 600; margin-bottom: 5px;">✈️ 去程：${flightData.go}</div>
        <div style="color: #8b7355;">${flightData.goTime ? new Date(flightData.goTime).toLocaleString('zh-TW') : '未設定時間'}</div>
      </div>
    ` : ''}
    ${flightData.back ? `
      <div>
        <div style="font-weight: 600; margin-bottom: 5px;">✈️ 回程：${flightData.back}</div>
        <div style="color: #8b7355;">${flightData.backTime ? new Date(flightData.backTime).toLocaleString('zh-TW') : '未設定時間'}</div>
      </div>
    ` : ''}
  `;
}

function renderHotelInfo() {
  const container = document.getElementById('hotelInfo');
  if (!container) return;
  
  if (!hotelData.name) {
    container.innerHTML = '<div style="text-align: center; color: #a89480; padding: 20px;">尚未設定飯店資訊</div>';
    return;
  }
  
  container.innerHTML = `
    <div style="margin-bottom: 10px;">
      <div style="font-weight: 600; margin-bottom: 5px;">🏨 ${hotelData.name}</div>
      ${hotelData.address ? `<div style="color: #8b7355; margin-bottom: 5px;">📍 ${hotelData.address}</div>` : ''}
      ${hotelData.phone ? `<div style="color: #8b7355; margin-bottom: 5px;">📞 ${hotelData.phone}</div>` : ''}
    </div>
    ${hotelData.checkin || hotelData.checkout ? `
      <div style="background: rgba(232, 232, 208, 0.3); padding: 10px; border-radius: 10px;">
        ${hotelData.checkin ? `<div>入住：${hotelData.checkin}</div>` : ''}
        ${hotelData.checkout ? `<div>退房：${hotelData.checkout}</div>` : ''}
      </div>
    ` : ''}
  `;
}

// ========== Modal 控制 ==========
function openChecklistModal() {
  document.getElementById('checklistItem').value = '';
  document.getElementById('checklistModal').style.display = 'flex';
}

function openExpenseAddModal() {
  currentEditId = null;
  document.getElementById('expenseModalTitle').textContent = '➕ 新增支出';
  document.getElementById('expenseDeleteBtn').style.display = 'none';
  
  document.getElementById('expenseType').value = '機票';
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('expenseDetails').value = '';
  
  document.getElementById('expenseAddModal').style.display = 'flex';
}

function openExpenseEditModal(id) {
  currentEditId = id;
  const expense = expenses.find(e => e.id === id);
  
  if (expense) {
    document.getElementById('expenseModalTitle').textContent = '✏️ 編輯支出';
    document.getElementById('expenseDeleteBtn').style.display = 'block';
    
    document.getElementById('expenseType').value = expense.type;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseDate').value = expense.date.replace(/\//g, '-');
    document.getElementById('expenseDetails').value = expense.details;
    
    document.getElementById('expenseAddModal').style.display = 'flex';
  }
}

function openFlightModal() {
  document.getElementById('flightGo').value = flightData.go || '';
  document.getElementById('flightGoTime').value = flightData.goTime || '';
  document.getElementById('flightBack').value = flightData.back || '';
  document.getElementById('flightBackTime').value = flightData.backTime || '';
  document.getElementById('flightModal').style.display = 'flex';
}

function openHotelModal() {
  document.getElementById('hotelName').value = hotelData.name || '';
  document.getElementById('hotelAddress').value = hotelData.address || '';
  document.getElementById('hotelPhone').value = hotelData.phone || '';
  document.getElementById('hotelCheckin').value = hotelData.checkin || '';
  document.getElementById('hotelCheckout').value = hotelData.checkout || '';
  document.getElementById('hotelModal').style.display = 'flex';
}

function openEmergencyModal() {
  document.getElementById('emergencyModal').style.display = 'flex';
}

function openJapaneseModal() {
  document.getElementById('japaneseModal').style.display = 'flex';
}

function openReminderModal() {
  document.getElementById('reminderModal').style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  currentEditId = null;
}

// ========== 頁面切換 ==========
function showSection(sectionId) {
  const sections = document.querySelectorAll('.content-section');
  const tabs = document.querySelectorAll('.nav-tab');
  
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  tabs.forEach(tab => {
    tab.classList.remove('active');
    tab.classList.add('inactive');
  });
  
  document.getElementById(sectionId).classList.add('active');
  event.target.classList.remove('inactive');
  event.target.classList.add('active');
}

// ========== 匯率換算 ==========
const EXCHANGE_RATE = 4.7;

function convertFromJPY() {
  const jpy = parseFloat(document.getElementById('jpyInput').value) || 0;
  const twd = Math.round(jpy / EXCHANGE_RATE);
  document.getElementById('twdInput').value = twd;
  checkTaxFree(jpy);
}

function convertFromTWD() {
  const twd = parseFloat(document.getElementById('twdInput').value) || 0;
  const jpy = Math.round(twd * EXCHANGE_RATE);
  document.getElementById('jpyInput').value = jpy;
  checkTaxFree(jpy);
}

function checkTaxFree(jpy) {
  const alertBox = document.getElementById('alertBox');
  if (jpy >= 5000) {
    alertBox.innerHTML = '✅ 此金額可享免稅優惠';
    alertBox.style.color = '#4a7c59';
  } else if (jpy > 0) {
    alertBox.innerHTML = '⚠️ 此金額未達免稅門檻';
    alertBox.style.color = '#c67e5c';
  } else {
    alertBox.innerHTML = '';
  }
}


    // 顯示提示訊息
    function showToast(message, isError = false) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      if (isError) {
        toast.style.background = '#dc3545';
      }
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    // 匯出所有資料
    function exportAllData() {
      try {
        // 收集所有 localStorage 的資料
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          allData[key] = localStorage.getItem(key);
        }

        // 加入匯出時間
        const backupData = {
          exportDate: new Date().toISOString(),
          exportDateReadable: new Date().toLocaleString('zh-TW'),
          data: allData
        };

        // 轉成 JSON 並下載
        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const fileName = `旅遊助手備份_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.json`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('✅ 資料匯出成功！');
      } catch (error) {
        console.error('匯出錯誤:', error);
        showToast('❌ 匯出失敗，請重試', true);
      }
    }

    // 匯入所有資料
    function importAllData(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const backupData = JSON.parse(e.target.result);
          
          // 顯示確認對話框
          const exportDate = backupData.exportDateReadable || '未知時間';
          const confirmMsg = `即將匯入 ${exportDate} 的備份資料\n\n⚠️ 這會覆蓋目前的所有資料\n\n確定要繼續嗎？`;
          
          if (confirm(confirmMsg)) {
            // 清空現有資料
            localStorage.clear();
            
            // 匯入新資料
            const data = backupData.data || backupData;
            for (const key in data) {
              localStorage.setItem(key, data[key]);
            }

            showToast('✅ 資料匯入成功！頁面即將重新載入...');
            
            // 1秒後重新載入頁面
            setTimeout(() => {
              location.reload();
            }, 1000);
          }
        } catch (error) {
          console.error('匯入錯誤:', error);
          showToast('❌ 檔案格式錯誤，請選擇正確的備份檔案', true);
        }
      };
      reader.readAsText(file);
      
      // 清空 input，允許重複選擇同一檔案
      event.target.value = '';
    }

