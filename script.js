class LifeDashboard {
    constructor() {
        this.quotes = [
            { text: "成功不是終點，失敗不是末日，唯有勇氣才是永恆", author: "邱吉爾" },
            { text: "不要等待機會，而要創造機會", author: "佚名" },
            { text: "今天的努力是明天的希望", author: "佚名" },
            { text: "行動是治癒恐懼的良藥", author: "威廉·詹姆斯" },
            { text: "相信自己，你已經擁有所需的一切", author: "佚名" },
            { text: "小步前進，也是進步", author: "佚名" },
            { text: "困難只是偽裝的機會", author: "愛迪生" },
            { text: "保持好奇心，保持學習的心", author: "佚名" },
            { text: "今日事今日畢，明日又是新開始", author: "佚名" },
            { text: "堅持不懈，直到成功", author: "拿破崙·希爾" }
        ];
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.bindEvents();
        this.updateUI();
        this.updateDate();
        this.loadDailyQuote();
    }
    
    loadData() {
        this.data = {
            waterCups: parseInt(localStorage.getItem('waterCups') || '0'),
            didExercise: localStorage.getItem('didExercise') === 'true',
            sleepStart: localStorage.getItem('sleepStart') || '23:00',
            sleepEnd: localStorage.getItem('sleepEnd') || '07:00',
            todos: JSON.parse(localStorage.getItem('todos') || '[]')
        };
    }
    
    saveData() {
        localStorage.setItem('waterCups', this.data.waterCups.toString());
        localStorage.setItem('didExercise', this.data.didExercise.toString());
        localStorage.setItem('sleepStart', this.data.sleepStart);
        localStorage.setItem('sleepEnd', this.data.sleepEnd);
        localStorage.setItem('todos', JSON.stringify(this.data.todos));
    }
    
    bindEvents() {
        // 喝水控制
        document.getElementById('waterPlus').addEventListener('click', () => {
            if (this.data.waterCups < 12) {
                this.data.waterCups++;
                this.updateWaterUI();
                this.saveData();
            }
        });
        
        document.getElementById('waterMinus').addEventListener('click', () => {
            if (this.data.waterCups > 0) {
                this.data.waterCups--;
                this.updateWaterUI();
                this.saveData();
            }
        });
        
        // 運動切換
        document.getElementById('exerciseToggle').addEventListener('change', (e) => {
            this.data.didExercise = e.target.checked;
            this.saveData();
        });
        
        // 睡眠時間
        document.getElementById('sleepStart').addEventListener('change', (e) => {
            this.data.sleepStart = e.target.value;
            this.updateSleepUI();
            this.saveData();
        });
        
        document.getElementById('sleepEnd').addEventListener('change', (e) => {
            this.data.sleepEnd = e.target.value;
            this.updateSleepUI();
            this.saveData();
        });
        
        // 每日一句
        document.getElementById('refreshQuote').addEventListener('click', () => {
            this.loadRandomQuote();
        });
        
        // 待辦事項
        document.getElementById('addTodo').addEventListener('click', () => {
            this.addTodo();
        });
        
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        
        // 檢查是否需要重置每日數據
        this.checkDayReset();
    }
    
    updateUI() {
        this.updateWaterUI();
        this.updateSleepUI();
        this.updateTodoUI();
        
        // 設定運動切換狀態
        document.getElementById('exerciseToggle').checked = this.data.didExercise;
        
        // 設定睡眠時間
        document.getElementById('sleepStart').value = this.data.sleepStart;
        document.getElementById('sleepEnd').value = this.data.sleepEnd;
    }
    
    updateWaterUI() {
        const waterCount = document.getElementById('waterCount');
        const waterProgress = document.getElementById('waterProgress');
        const waterMinus = document.getElementById('waterMinus');
        
        waterCount.textContent = `${this.data.waterCups}/8 杯`;
        waterProgress.style.width = `${(this.data.waterCups / 8) * 100}%`;
        waterMinus.disabled = this.data.waterCups === 0;
    }
    
    updateSleepUI() {
        const sleepHours = document.getElementById('sleepHours');
        const [startHour, startMin] = this.data.sleepStart.split(':').map(Number);
        const [endHour, endMin] = this.data.sleepEnd.split(':').map(Number);
        
        let startTime = startHour + startMin / 60;
        let endTime = endHour + endMin / 60;
        
        // 處理跨日情況
        if (endTime < startTime) {
            endTime += 24;
        }
        
        const duration = endTime - startTime;
        sleepHours.textContent = `${duration.toFixed(1)} 小時`;
    }
    
    updateTodoUI() {
        const todoList = document.getElementById('todoList');
        const todoCount = document.getElementById('todoCount');
        const incompleteTodos = this.data.todos.filter(todo => !todo.completed);
        
        todoCount.textContent = `${incompleteTodos.length} 項待完成`;
        
        if (this.data.todos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">✓</span>
                    <p>暫無待辦事項</p>
                </div>
            `;
            return;
        }
        
        // 排序：未完成的在前面
        const sortedTodos = [...this.data.todos].sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });
        
        todoList.innerHTML = sortedTodos.map(todo => `
            <div class="todo-item">
                <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" 
                     onclick="dashboard.toggleTodo('${todo.id}')">
                    ${todo.completed ? '✓' : ''}
                </div>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <button class="todo-delete" onclick="dashboard.deleteTodo('${todo.id}')">🗑</button>
            </div>
        `).join('');
    }
    
    addTodo() {
        const input = document.getElementById('todoInput');
        const addBtn = document.getElementById('addTodo');
        const text = input.value.trim();
        
        if (!text) return;
        
        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.data.todos.push(newTodo);
        input.value = '';
        this.updateTodoUI();
        this.saveData();
    }
    
    toggleTodo(id) {
        const todo = this.data.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.updateTodoUI();
            this.saveData();
        }
    }
    
    deleteTodo(id) {
        this.data.todos = this.data.todos.filter(t => t.id !== id);
        this.updateTodoUI();
        this.saveData();
    }
    
    loadDailyQuote() {
        const today = new Date().toDateString();
        const savedQuote = localStorage.getItem('dailyQuote');
        const savedDate = localStorage.getItem('dailyQuoteDate');
        
        if (savedDate === today && savedQuote) {
            const quote = JSON.parse(savedQuote);
            this.displayQuote(quote);
        } else {
            // 根據日期生成一個固定的每日名言
            const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
            const quote = this.quotes[dayOfYear % this.quotes.length];
            this.displayQuote(quote);
            
            localStorage.setItem('dailyQuote', JSON.stringify(quote));
            localStorage.setItem('dailyQuoteDate', today);
        }
    }
    
    loadRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        const quote = this.quotes[randomIndex];
        this.displayQuote(quote);
    }
    
    displayQuote(quote) {
        document.getElementById('quoteText').textContent = quote.text;
        document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
    }
    
    updateDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            weekday: 'short'
        };
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('zh-TW', options);
    }
    
    checkDayReset() {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('lastActiveDate');
        
        if (lastDate !== today) {
            // 新的一天，重置數據
            this.data.waterCups = 0;
            this.data.didExercise = false;
            this.saveData();
            this.updateUI();
            localStorage.setItem('lastActiveDate', today);
        }
    }
}

// 初始化應用
const dashboard = new LifeDashboard();

// PWA 支援
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
