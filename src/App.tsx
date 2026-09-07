/* ===== БАЗОВЫЕ СТИЛИ ===== */
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: "Segoe UI", system-ui, sans-serif;
background: #0f0f1e;
color: #e0e0e0;
overflow: hidden;
}

.app {
height: 100vh;
display: flex;
flex-direction: column;
padding: 10px 12px;
background: #0f0f1e;
transition: opacity 0.4s ease;
}

/* ===== ШАПКА (ФИКСИРОВАННАЯ, НЕ СЪЕЗЖАЕТ) ===== */
.topbar {
display: flex;
justify-content: space-between;
align-items: center;
padding-bottom: 8px;
border-bottom: 1px solid #2a2a4a;
margin-bottom: 8px;
flex-shrink: 0;
}

.topbar h1 {
font-size: 0.95rem;
color: #c9b1ff;
font-weight: 600;
}

.topbar-right {
display: flex;
align-items: center;
gap: 12px;
flex-shrink: 0; /* Запрещает сжиматься и съезжать в центр */
}

.dev-badge {
background: #e04060;
color: white;
font-size: 0.6rem;
padding: 2px 6px;
border-radius: 4px;
font-weight: bold;
letter-spacing: 0.5px;
}

.clock {
text-align: right;
font-variant-numeric: tabular-nums;
}

.clock .time {
font-size: 1.1rem;
font-weight: 700;
color: #7c5cfc;
}

.clock .date {
font-size: 0.7rem;
color: #888;
text-transform: capitalize;
}

.icon-btn {
background: none;
border: none;
color: #888;
font-size: 1.1rem;
cursor: pointer;
padding: 4px 8px;
border-radius: 4px;
transition: all 0.2s;
}

.icon-btn:hover {
background: #2a2a4a;
color: #fff;
}

.icon-btn.active {
background: #7c5cfc;
color: #fff;
}

/* ===== РЕЖИМ РАЗРАБОТЧИКА ===== */
.dev-controls {
background: #1a1a2e;
padding: 8px;
border-radius: 6px;
margin-bottom: 12px;
display: flex;
align-items: center;
gap: 8px;
font-size: 0.8rem;
border: 1px dashed #e04060;
}

.dev-controls label {
color: #e04060;
font-weight: 600;
}

.dev-controls input {
background: #0f0f1e;
border: 1px solid #333;
color: #fff;
padding: 4px 6px;
border-radius: 4px;
font-size: 0.8rem;
}

/* ===== СЕКЦИИ ===== */
.section-title {
font-size: 0.7rem;
text-transform: uppercase;
color: #666;
letter-spacing: 1px;
margin: 8px 0 4px;
}

/* ===== ОБЫЧНЫЕ СОБЫТИЯ ===== */
.event-list {
flex: 1;
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 2px;
}

.event-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 6px 10px;
background: #16213e;
border-radius: 6px;
border-left: 3px solid;
font-size: 0.85rem;
transition: all 0.2s;
}

.event-item .name {
font-weight: 500;
}

.event-item .time {
color: #888;
font-size: 0.75rem;
margin-left: 6px;
}

.event-item .countdown {
font-size: 0.75rem;
color: #7c5cfc;
font-weight: 600;
white-space: nowrap;
}

/* Выделение ближайшего события */
.event-item.next-event {
background: linear-gradient(90deg, rgba(124, 92, 252, 0.2), transparent);
border-left-width: 4px;
box-shadow: 0 0 10px rgba(124, 92, 252, 0.3);
}

.event-item.next-event .name {
color: #fff;
font-weight: 700;
}

.event-item.next-event .countdown {
color: #c9b1ff;
font-size: 0.8rem;
}

/* ===== ОСОБЫЕ СОБЫТИЯ ===== */
.special-list {
display: flex;
flex-direction: column;
gap: 4px;
margin-bottom: 8px;
}

.special-item {
padding: 8px 10px;
background: #16213e;
border-radius: 6px;
border-left: 3px solid;
transition: all 0.3s;
}

.special-item.active {
background: #1f2f50;
box-shadow: 0 0 12px rgba(124, 92, 252, 0.3);
}

.special-item.highlighted {
background: linear-gradient(90deg, rgba(78, 205, 196, 0.15), transparent);
border-left-color: #4ecdc4 !important;
}

.special-item .sp-name {
font-size: 0.85rem;
font-weight: 600;
display: flex;
align-items: center;
gap: 6px;
flex-wrap: wrap;
}

.special-item .sp-desc {
font-size: 0.72rem;
color: #888;
margin-top: 2px;
}

.special-item .sp-badge {
font-size: 0.65rem;
padding: 1px 6px;
border-radius: 3px;
background: #4ecdc4;
color: #000;
font-weight: 700;
letter-spacing: 0.5px;
}

/* Подсветка активного подтипа (Остров/Форт) */
.special-item .sp-sub {
font-size: 0.75rem;
color: #4ecdc4;
font-weight: 600;
margin-top: 4px;
padding: 2px 6px;
background: rgba(78, 205, 196, 0.1);
border-radius: 4px;
display: inline-block;
}

.special-item .sp-days {
font-size: 0.68rem;
color: #666;
margin-top: 2px;
}

/* Таймер контрабанды */
.smuggle-timer {
font-size: 0.75rem;
color: #ff6b6b;
font-weight: 600;
margin-top: 4px;
font-variant-numeric: tabular-nums;
}

/* ===== МОДАЛКА ===== */
.modal-overlay {
position: fixed;
inset: 0;
background: rgba(0, 0, 0, 0.7);
display: flex;
align-items: center;
justify-content: center;
z-index: 100;
}

.modal {
background: #1a1a2e;
border: 1px solid #333;
border-radius: 10px;
padding: 20px;
width: 320px;
}

.modal.wide {
width: 480px;
max-width: 95vw;
max-height: 90vh;
display: flex;
flex-direction: column;
}

.modal h2 {
font-size: 1rem;
margin-bottom: 8px;
color: #c9b1ff;
}

.modal-hint {
font-size: 0.75rem;
color: #888;
margin-bottom: 14px;
}

.modal label {
display: block;
font-size: 0.8rem;
color: #aaa;
margin-bottom: 6px;
}

.modal input[type="number"],
.modal input[type="text"] {
width: 100%;
padding: 8px;
background: #16213e;
border: 1px solid #333;
border-radius: 6px;
color: #fff;
font-size: 0.9rem;
margin-bottom: 14px;
}

.modal-actions {
display: flex;
justify-content: flex-end;
gap: 6px;
margin-top: 14px;
}

/* ===== КНОПКИ ===== */
.btn {
padding: 6px 14px;
border: none;
border-radius: 6px;
cursor: pointer;
font-size: 0.85rem;
background: #2a2a4a;
color: #e0e0e0;
transition: background 0.2s;
}

.btn:hover {
background: #3a3a5a;
}

.btn.primary {
background: #7c5cfc;
color: #fff;
}

.btn.primary:hover {
background: #6a4ae0;
}

.btn.small {
padding: 4px 10px;
font-size: 0.75rem;
}

.btn.small:disabled {
opacity: 0.4;
cursor: not-allowed;
}

/* ===== СТРОКА НАСТРОЙКИ ===== */
.settings-list {
display: flex;
flex-direction: column;
gap: 10px;
max-height: 55vh;
overflow-y: auto;
padding-right: 4px;
}

.notify-row {
background: #16213e;
border-radius: 8px;
padding: 10px 12px;
border: 1px solid #2a2a4a;
}

.nr-head {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 6px;
}

.nr-toggle {
display: flex;
align-items: center;
gap: 8px;
cursor: pointer;
font-size: 0.85rem;
color: #e0e0e0;
}

.nr-toggle input[type="checkbox"] {
width: 16px;
height: 16px;
accent-color: #7c5cfc;
cursor: pointer;
}

.nr-title {
font-weight: 500;
}

.nr-body {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 8px;
margin-top: 8px;
padding-top: 8px;
border-top: 1px solid #2a2a4a;
}

.nr-field {
display: flex;
flex-direction: column;
gap: 4px;
}

.nr-field label {
font-size: 0.7rem;
color: #888;
margin: 0;
}

.nr-field input,
.nr-field select {
padding: 6px 8px;
background: #0f0f1e;
border: 1px solid #333;
border-radius: 4px;
color: #fff;
font-size: 0.8rem;
}

.nr-field input[type="number"] {
width: 100%;
margin: 0;
}

.nr-field input[type="file"] {
font-size: 0.75rem;
color: #aaa;
}

.nr-field input[type="file"]::file-selector-button {
background: #7c5cfc;
color: white;
border: none;
padding: 4px 10px;
border-radius: 4px;
cursor: pointer;
margin-right: 8px;
font-size: 0.75rem;
}

.nr-field input[type="file"]::file-selector-button:hover {
background: #6a4ae0;
}

/* ===== РЕЖИМ ОВЕРЛЕЯ ===== */
.app.overlay-mode {
background: transparent !important;
}

.exit-overlay-btn {
position: fixed;
top: 8px;
right: 8px;
background: rgba(224, 64, 96, 0.8);
color: white;
border: none;
width: 24px;
height: 24px;
border-radius: 50%;
cursor: pointer;
opacity: 0;
transition: opacity 0.3s;
z-index: 9999;
font-size: 0.9rem;
display: flex;
align-items: center;
justify-content: center;
}

.app.overlay-mode:hover .exit-overlay-btn {
opacity: 1;
}

/* ===== TOAST (ПРИЯТНОЕ ВНУТРЕННЕЕ УВЕДОМЛЕНИЕ) ===== */
.toast {
position: fixed;
bottom: 20px;
right: 20px;
background: rgba(26, 26, 46, 0.95);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid #7c5cfc;
border-radius: 12px;
padding: 12px 16px;
display: flex;
align-items: center;
gap: 12px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
transform: translateX(120%);
transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
z-index: 10000;
max-width: 300px;
}

.toast.show {
transform: translateX(0);
}

.toast-icon {
font-size: 1.5rem;
}

.toast-content {
flex: 1;
}

.toast-title {
font-weight: 700;
color: #c9b1ff;
font-size: 0.9rem;
}

.toast-message {
font-size: 0.8rem;
color: #e0e0e0;
margin-top: 2px;
}

.toast-close {
background: none;
border: none;
color: #888;
font-size: 1.2rem;
cursor: pointer;
padding: 0 4px;
line-height: 1;
}

.toast-close:hover {
color: #fff;
}

/* ===== СКРОЛЛБАР ===== */
.event-list::-webkit-scrollbar,
.settings-list::-webkit-scrollbar {
width: 4px;
}

.event-list::-webkit-scrollbar-thumb,
.settings-list::-webkit-scrollbar-thumb {
background: #333;
border-radius: 2px;
}

.event-list::-webkit-scrollbar-thumb:hover,
.settings-list::-webkit-scrollbar-thumb:hover {
background: #555;
}