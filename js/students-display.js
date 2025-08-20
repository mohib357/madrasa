// Debounce function to limit how often a function gets called
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// নতুন: Chart.js এর সাথে Datalabels প্লাগইনটি রেজিস্টার করা হলো
Chart.register(ChartDataLabels);


// গ্লোবাল ভেরিয়েবল
let allStudentsData = {};
const container = document.getElementById('student-container');
const classSelector = document.getElementById('class-selector');
const searchBox = document.getElementById('search-box');
const studentCountElement = document.getElementById('student-count');

// ছাত্রছাত্রীদের ডেটা রেন্ডার করার ফাংশন (অপটিমাইজ করা)
function renderStudents(filteredClasses, searchTerm = '') {
    container.innerHTML = '';
    let filteredCount = 0;
    for (const className in filteredClasses) {
        filteredCount += filteredClasses[className].length;
    }
    let absoluteTotal = 0;
    for (const className in allStudentsData) {
        absoluteTotal += allStudentsData[className].length;
    }
    const selectedClass = classSelector.value;
    if (selectedClass !== 'all' || searchTerm !== '') {
        studentCountElement.textContent = `মোট ${absoluteTotal.toLocaleString('bn-BD')} জনের মধ্যে ${filteredCount.toLocaleString('bn-BD')} জন পাওয়া গেছে`;
    } else {
        studentCountElement.textContent = `মোট ছাত্র-ছাত্রী: ${absoluteTotal.toLocaleString('bn-BD')} জন`;
    }
    if (Object.keys(filteredClasses).length === 0) {
        container.innerHTML = '<p class="no-results">কোনো ছাত্র-ছাত্রী পাওয়া যায়নি।</p>';
        return;
    }

    // সার্চ করা হলে সব ফলাফল এক গ্রিডে দেখানো
    if (searchTerm) {
        const grid = document.createElement('div');
        grid.className = 'student-grid';
        const allFilteredStudents = Object.values(filteredClasses).reduce((acc, val) => acc.concat(val), []);
        
        // অপটিমাইজেশন: সব কার্ডের HTML একসাথে তৈরি করা
        const cardsHTML = allFilteredStudents.map(student => {
            const photo = student.photoUrl || 'https://i.imgur.com/838s6Ab.png';
            return `<div class="id-card"><div class="card-header"><img src="../images/markajul quran logo.png" alt="Madrasa Logo" class="logo"><div class="header-text"><p>আলহাজ্ব আবুল কাশেম ও মরহুমা ফাতেমা খাতুন</p><h2>মারকাযুল কুরআন মাদরাসা</h2></div></div><div class="card-body"><div class="photo-section"><img src="${photo}" alt="ছাত্রের ছবি" class="student-photo"><p class="id-number">দাখেলা : ${student.studentId}</p></div><div class="info-section"><h3>${student.name}</h3><p><strong>পিতা:</strong> <span>${student.fatherName}</span></p><p><strong>শ্রেণি:</strong> <span>${student.className}</span></p><p><strong>ঠিকানা:</strong> <span>${student.address}</span></p><p><strong>জন্ম তারিখ:</strong> <span>${student.dob}</span></p></div></div></div>`;
        }).join('');

        grid.innerHTML = cardsHTML; // মাত্র একবার DOM এ যুক্ত করা
        container.appendChild(grid);
    } 
    // সার্চ করা না হলে ক্লাস অনুযায়ী দেখানো
    else {
        for (const className in filteredClasses) {
            const students = filteredClasses[className];
            if (classSelector.value === 'all') {
                const classTitle = document.createElement('h2');
                classTitle.textContent = className;
                container.appendChild(classTitle);
            }
            const grid = document.createElement('div');
            grid.className = 'student-grid';

            // অপটিমাইজেশন: সব কার্ডের HTML একসাথে তৈরি করা
            const cardsHTML = students.map(student => {
                const photo = student.photoUrl || 'https://i.imgur.com/838s6Ab.png';
                return `<div class="id-card"><div class="card-header"><img src="../images/markajul quran logo.png" alt="Madrasa Logo" class="logo"><div class="header-text"><p>আলহাজ্ব আবুল কাশেম ও মরহুমা ফাতেমা খাতুন</p><h2>মারকাযুল কুরআন মাদরাসা</h2></div></div><div class="card-body"><div class="photo-section"><img src="${photo}" alt="ছাত্রের ছবি" class="student-photo"><p class="id-number">দাখেলা : ${student.studentId}</p></div><div class="info-section"><h3>${student.name}</h3><p><strong>পিতা:</strong> <span>${student.fatherName}</span></p><p><strong>শ্রেণি:</strong> <span>${student.className}</span></p><p><strong>ঠিকানা:</strong> <span>${student.address}</span></p><p><strong>জন্ম তারিখ:</strong> <span>${student.dob}</span></p></div></div></div>`;
            }).join('');
            grid.innerHTML = cardsHTML; // মাত্র একবার DOM এ যুক্ত করা
            container.appendChild(grid);
        }
    }
}


// ফিল্টার এবং রেন্ডার করার মূল ফাংশন
function filterAndRender() {
    const selectedClass = classSelector.value;
    const searchTerm = searchBox.value.toLowerCase().trim();
    const filteredClasses = {};
    for (const className in allStudentsData) {
        if (selectedClass !== 'all' && className !== selectedClass) continue;
        const students = allStudentsData[className];
        const filteredStudents = students.filter(student => {
            const name = student.name.toLowerCase();
            const fatherName = student.fatherName.toLowerCase();
            const address = student.address.toLowerCase();
            const studentId = student.studentId.toString();
            return name.includes(searchTerm) || fatherName.includes(searchTerm) || address.includes(searchTerm) || studentId.includes(searchTerm);
        });
        if (filteredStudents.length > 0) {
            filteredClasses[className] = filteredStudents;
        }
    }
    renderStudents(filteredClasses, searchTerm);
}

// অ্যাপ্লিকেশন শুরু করার ফাংশন
async function initializeApp() {
    try {
        const response = await fetch('../madrasa-scraper/students.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allStudentsData = await response.json();

        // --- পরিসংখ্যান ও গ্রাফ তৈরির যুক্তি ---
        const boyCountEl = document.getElementById('boy-count-stats');
        const girlCountEl = document.getElementById('girl-count-stats');
        const totalCountEl = document.getElementById('total-count-stats');

        // --- আপাতত ম্যানুয়াল সংখ্যা দিয়ে গ্রাফ দেখানো হচ্ছে ---
        let manualBoys = 498;
        let manualGirls = 812;
        let manualTotal = manualBoys + manualGirls;

        boyCountEl.textContent = manualBoys.toLocaleString('bn-BD');
        girlCountEl.textContent = manualGirls.toLocaleString('bn-BD');
        totalCountEl.textContent = manualTotal.toLocaleString('bn-BD');
        
        // --- চার্ট তৈরি করা ---
        const ctx = document.getElementById('genderChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['ছাত্র', 'ছাত্রী'],
                datasets: [{
                    data: [manualBoys, manualGirls],
                    backgroundColor: ['#42a5f5', '#ec407a'],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        formatter: (value) => value.toLocaleString('bn-BD'),
                        color: '#fff',
                        font: { weight: 'bold', size: 16 },
                        textShadow: { stroke: 'rgba(0,0,0,0.8)', blur: 5 }
                    },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed.toLocaleString('bn-BD')} জন`
                        }
                    }
                }
            }
        });

        /*
        // --- ভবিষ্যতের জন্য: students.json থেকে স্বয়ংক্রিয়ভাবে জেন্ডার গণনার কোড ---
        let totalBoys = 0, totalGirls = 0;
        for (const className in allStudentsData) {
            for (const student of allStudentsData[className]) {
                if (student.gender === 'বালক') totalBoys++;
                else if (student.gender === 'বালিকা') totalGirls++;
            }
        }
        const absoluteTotal = totalBoys + totalGirls;
        boyCountEl.textContent = totalBoys.toLocaleString('bn-BD');
        girlCountEl.textContent = totalGirls.toLocaleString('bn-BD');
        totalCountEl.textContent = absoluteTotal.toLocaleString('bn-BD');
        // উপরের চার্টের data: [manualBoys, manualGirls] পরিবর্তন করে data: [totalBoys, totalGirls] করে দেবেন।
        */

        // --- বাকি কোড ---
        
        Object.keys(allStudentsData).forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelector.appendChild(option);
        });

        const suggestionsBox = document.getElementById('suggestions-box');
        let searchHistory = JSON.parse(localStorage.getItem('studentSearchHistory')) || [];
        let suggestionIndex = -1;

        const showSuggestions = (filter = '') => {
            let suggestionsToShow = [];
            if (!filter) {
                suggestionsToShow = searchHistory.slice(0, 5);
            } else {
                const matchingHistory = searchHistory.filter(term => term.toLowerCase().startsWith(filter.toLowerCase()));
                suggestionsToShow = [...new Set(matchingHistory)];
            }
            if (suggestionsToShow.length === 0) {
                suggestionsBox.style.display = 'none';
                return;
            }
            suggestionsBox.innerHTML = '';
            suggestionsToShow.slice(0, 5).forEach(term => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                const termText = document.createElement('span');
                termText.textContent = term;
                termText.onclick = () => {
                    searchBox.value = term;
                    filterAndRender();
                    suggestionsBox.style.display = 'none';
                };
                const deleteBtn = document.createElement('span');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '&times;';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    searchHistory = searchHistory.filter(t => t !== term);
                    localStorage.setItem('studentSearchHistory', JSON.stringify(searchHistory));
                    showSuggestions(filter);
                };
                item.appendChild(termText);
                item.appendChild(deleteBtn);
                suggestionsBox.appendChild(item);
            });
            suggestionsBox.style.display = 'block';
            suggestionIndex = -1;
        };
        
        searchBox.addEventListener('focus', () => {
            const currentInput = searchBox.value.trim();
            showSuggestions(currentInput);
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                suggestionsBox.style.display = 'none';
            }
        });
        const addSearchTerm = (term) => {
            if (term) {
                searchHistory = searchHistory.filter(t => t.toLowerCase() !== term.toLowerCase());
                searchHistory.unshift(term);
                localStorage.setItem('studentSearchHistory', JSON.stringify(searchHistory));
            }
        };
        searchBox.addEventListener('keydown', (e) => {
            const suggestions = suggestionsBox.querySelectorAll('.suggestion-item');
            if (suggestionsBox.style.display !== 'none' && suggestions.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    suggestionIndex = (suggestionIndex + 1) % suggestions.length;
                    suggestions.forEach((item, index) => {
                        item.style.backgroundColor = index === suggestionIndex ? '#f0f0f0' : '';
                    });
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    suggestionIndex = (suggestionIndex - 1 + suggestions.length) % suggestions.length;
                    suggestions.forEach((item, index) => {
                        item.style.backgroundColor = index === suggestionIndex ? '#f0f0f0' : '';
                    });
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (suggestionIndex > -1) {
                        suggestions[suggestionIndex].querySelector('span').click();
                        return;
                    }
                }
            }
            if (e.key === 'Enter') {
                const searchTerm = searchBox.value.trim();
                addSearchTerm(searchTerm);
                suggestionsBox.style.display = 'none';
                searchBox.blur();
            }
        });
        
        const handleSearchInput = () => {
            filterAndRender();
            const currentInput = searchBox.value.trim();
            showSuggestions(currentInput);
        };
        
        classSelector.addEventListener('change', filterAndRender);
        searchBox.addEventListener('input', debounce(handleSearchInput, 300));
        
        filterAndRender();
        initializeCustomDropdown();

    } catch (error) {
        container.innerHTML = `<p class="error">তথ্য লোড করা সম্ভব হয়নি। ফাইলটি সঠিক জায়গায় আছে কিনা নিশ্চিত করুন।</p>`;
        console.error('Error fetching student data:', error);
    }
}

// অ্যাপলিকেশন শুরু করুন
initializeApp();

// --- কাস্টম ড্রপডাউন ফাংশনালিটি ---
function initializeCustomDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const select = dropdown.querySelector('.select');
    const selectedDisplay = document.querySelector('#selected-display');
    const optionsContainer = document.querySelector('.options');
    const hiddenSelect = document.getElementById('class-selector');
    Array.from(hiddenSelect.options).forEach((option) => {
        const li = document.createElement('li');
        li.textContent = option.textContent;
        li.dataset.value = option.value;
        li.tabIndex = 0;
        if (option.selected) li.classList.add('selected');
        optionsContainer.appendChild(li);
    });
    const options = optionsContainer.querySelectorAll('li');
    const toggleDropdown = () => {
        optionsContainer.classList.toggle('show');
        select.classList.toggle('active');
    };
    select.addEventListener('click', toggleDropdown);
    options.forEach(option => {
        option.addEventListener('click', () => {
            selectedDisplay.textContent = option.textContent;
            hiddenSelect.value = option.dataset.value;
            hiddenSelect.dispatchEvent(new Event('change'));
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            toggleDropdown();
        });
    });
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            optionsContainer.classList.remove('show');
            select.classList.remove('active');
        }
    });
    let currentIndex = -1;
    dropdown.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % options.length;
            options[currentIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + options.length) % options.length;
            options[currentIndex].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (document.activeElement.tagName === 'LI') document.activeElement.click();
            else toggleDropdown();
        } else if (e.key === 'Escape') {
            optionsContainer.classList.remove('show');
            select.classList.remove('active');
        }
    });
}