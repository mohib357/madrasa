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

// গ্লোবাল ভেরিয়েবল: সব ছাত্রছাত্রীর ডেটা এবং DOM এলিমেন্টস
let allStudentsData = {};
const container = document.getElementById('student-container');
const classSelector = document.getElementById('class-selector');
const searchBox = document.getElementById('search-box');
const studentCountElement = document.getElementById('student-count');

// ছাত্রছাত্রীদের ডেটা রেন্ডার করার ফাংশন
function renderStudents(filteredClasses, searchTerm = '') {
    container.innerHTML = '';

    // --- কাউন্টার এর লজিক ---
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
        studentCountElement.textContent = `মোট ${absoluteTotal.toLocaleString('bn-BD')} জনের মধ্যে ${filteredCount.toLocaleString('bn-BD')} জন শিক্ষার্থী`;
    } else {
        studentCountElement.textContent = `মোট ছাত্র-ছাত্রী: ${absoluteTotal.toLocaleString('bn-BD')} জন`;
    }

    // --- ফলাফল না পাওয়া গেলে বার্তা দেখানোর লজিক ---
    if (Object.keys(filteredClasses).length === 0) {
        container.innerHTML = '<p class="no-results">কোনো ছাত্র-ছাত্রী পাওয়া যায়নি।</p>';
        return;
    }

    // যদি সার্চ করা হয়ে থাকে, তাহলে সব ফলাফল এক গ্রিডে দেখানো
    if (searchTerm) {
        const grid = document.createElement('div');
        grid.className = 'student-grid';

        // সব ক্লাসের ফলাফলকে একটিমাত্র অ্যারে-তে একত্রিত করা
        const allFilteredStudents = Object.values(filteredClasses).reduce((acc, val) => acc.concat(val), []);
        allFilteredStudents.forEach(student => {
            const photo = student.photoUrl || 'https://i.imgur.com/838s6Ab.png';
            const cardHTML = `
                <div class="id-card">
                    <div class="card-header">
                        <img src="../images/markajul quran logo.png" alt="Madrasa Logo" class="logo">
                        <div class="header-text">
                            <p>আলহাজ্ব আবুল কাশেম ও মরহুমা ফাতেমা খাতুন</p>
                            <h2>মারকাযুল কুরআন মাদরাসা</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="photo-section">
                            <img src="${photo}" alt="ছাত্রের ছবি" class="student-photo">
                            <p class="id-number">দাখেলা : ${student.studentId}</p>
                        </div>
                        <div class="info-section">
                            <h3>${student.name}</h3>
                            <p><strong>পিতা:</strong> <span>${student.fatherName}</span></p>
                            <p><strong>শ্রেণি:</strong> <span>${student.className}</span></p>
                            <p><strong>ঠিকানা:</strong> <span>${student.address}</span></p>
                            <p><strong>জন্ম তারিখ:</strong> <span>${student.dob}</span></p>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += cardHTML;
        });
        container.appendChild(grid);
    }

    // যদি সার্চ বক্স খালি থাকে, তাহলে আগের মতোই ক্লাস অনুযায়ী দেখানো
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
            if (students.length > 0) {
                students.forEach(student => {
                    const photo = student.photoUrl || 'https://i.imgur.com/838s6Ab.png';
                    const cardHTML = `
                        <div class="id-card">
                           <div class="card-header">
                                <img src="../images/markajul quran logo.png" alt="Madrasa Logo" class="logo">
                                <div class="header-text">
                                    <p>আলহাজ্ব আবুল কাশেম ও মরহুমা ফাতেমা খাতুন</p>
                                    <h2>মারকাযুল কুরআন মাদরাসা</h2>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="photo-section">
                                    <img src="${photo}" alt="ছাত্রের ছবি" class="student-photo">
                                    <p class="id-number">দাখেলা : ${student.studentId}</p>
                                </div>
                                <div class="info-section">
                                    <h3>${student.name}</h3>
                                    <p><strong>পিতা:</strong> <span>${student.fatherName}</span></p>
                                    <p><strong>শ্রেণি:</strong> <span>${student.className}</span></p>
                                    <p><strong>ঠিকানা:</strong> <span>${student.address}</span></p>
                                    <p><strong>জন্ম তারিখ:</strong> <span>${student.dob}</span></p>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.innerHTML += cardHTML;
                });
            }
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
        if (selectedClass !== 'all' && className !== selectedClass) {
            continue;
        }
        const students = allStudentsData[className];
        const filteredStudents = students.filter(student => {
            const name = student.name.toLowerCase();
            const fatherName = student.fatherName.toLowerCase();
            const address = student.address.toLowerCase();
            const studentId = student.studentId.toString();
            return name.includes(searchTerm) ||
                fatherName.includes(searchTerm) ||
                address.includes(searchTerm) ||
                studentId.includes(searchTerm);
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allStudentsData = await response.json();

        // লুকানো ক্লাস সিলেক্টর পপুলেট করা
        Object.keys(allStudentsData).forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelector.appendChild(option);
        });

        // --- সার্চ সাজেশন যুক্তি ---
        const suggestionsBox = document.getElementById('suggestions-box');
        let searchHistory = JSON.parse(localStorage.getItem('studentSearchHistory')) || [];
        let suggestionIndex = -1; // কীবোর্ড নেভিগেশনের জন্য ইনডেক্স

        // সাজেশন বক্স দেখানোর ফাংশন
        const showSuggestions = (filter = '') => {
            let suggestionsToShow = [];
            if (!filter) {
                suggestionsToShow = searchHistory.slice(0, 5);  // কতগুলো সাজেষ্ট দেখাবে
            } else {
                const matchingHistory = searchHistory.filter(term =>
                    term.toLowerCase().startsWith(filter.toLowerCase())
                );
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
            suggestionIndex = -1; // প্রতিবার নতুন তালিকা দেখানোর সময় ইনডেক্স রিসেট করা
        };

        // সার্চ বক্সে ফোকাস করলে সাজেশন দেখানো
        searchBox.addEventListener('focus', () => {
            const currentInput = searchBox.value.trim();
            showSuggestions(currentInput);
        });

        // বাইরে ক্লিক করলে সাজেশন বক্স লুকানো
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

        // --- কী-বোর্ড নেভিগেশন যুক্তি এখানে যোগ করা হয়েছে ---
        searchBox.addEventListener('keydown', (e) => {
            const suggestions = suggestionsBox.querySelectorAll('.suggestion-item');
            if (suggestions.length === 0) return;

            // ডাউন অ্যারো কী চাপলে
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                suggestionIndex = (suggestionIndex + 1) % suggestions.length;
                suggestions.forEach((item, index) => {
                    item.style.backgroundColor = index === suggestionIndex ? '#f0f0f0' : '';
                });
            }
            // আপ অ্যারো কী চাপলে
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                suggestionIndex = (suggestionIndex - 1 + suggestions.length) % suggestions.length;
                suggestions.forEach((item, index) => {
                    item.style.backgroundColor = index === suggestionIndex ? '#f0f0f0' : '';
                });
            }
            // Enter কী চাপলে
            else if (e.key === 'Enter') {
                e.preventDefault();
                if (suggestionIndex > -1) {
                    suggestions[suggestionIndex].querySelector('span').click();
                }
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

// --- নতুন কাস্টম ড্রপডাউন ফাংশনালিটি ---
function initializeCustomDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const select = dropdown.querySelector('.select');
    const selectedDisplay = dropdown.querySelector('#selected-display');
    const optionsContainer = dropdown.querySelector('.options');
    const hiddenSelect = document.getElementById('class-selector');

    // লুকানো select থেকে option নিয়ে কাস্টম ড্রপডাউনের li তৈরি করা
    Array.from(hiddenSelect.options).forEach((option) => {
        const li = document.createElement('li');
        li.textContent = option.textContent;
        li.dataset.value = option.value;
        li.tabIndex = 0;
        if (option.selected) {
            li.classList.add('selected');
        }
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

            // মূল select এলিমেন্টে change ইভেন্ট ট্রিগার করা
            hiddenSelect.dispatchEvent(new Event('change'));
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            toggleDropdown();
        });
    });

    // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হবে
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            optionsContainer.classList.remove('show');
            select.classList.remove('active');
        }
    });

    // কী-বোর্ড নেভিগেশন
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
            if (document.activeElement.tagName === 'LI') {
                document.activeElement.click();
            } else {
                toggleDropdown();
            }
        } else if (e.key === 'Escape') {
            optionsContainer.classList.remove('show');
            select.classList.remove('active');
        }
    });
}