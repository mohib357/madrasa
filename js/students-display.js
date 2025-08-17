// গ্লোবাল ভেরিয়েবল: সব ছাত্রছাত্রীর ডেটা এবং DOM এলিমেন্টস
let allStudentsData = {};
const container = document.getElementById('student-container');
const classSelector = document.getElementById('class-selector');
const searchBox = document.getElementById('search-box');
// নতুন সংযোজন: ছাত্র-ছাত্রীর সংখ্যা দেখানোর এলিমেন্ট
const studentCountElement = document.getElementById('student-count');

// ছাত্রছাত্রীদের ডেটা রেন্ডার করার ফাংশন
function renderStudents(filteredClasses) {
    container.innerHTML = ''; // আগের কনটেন্ট মুছে ফেলা হলো

    // নতুন সংযোজন: মোট ছাত্র-ছাত্রী গণনা
    let totalStudents = 0;
    for (const className in filteredClasses) {
        totalStudents += filteredClasses[className].length;
    }
    // কাউন্ট প্রদর্শন
    studentCountElement.textContent = `মোট ছাত্র-ছাত্রী: ${totalStudents} জন`;


    if (Object.keys(filteredClasses).length === 0) {
        container.innerHTML = '<p class="no-results">কোনো ছাত্র-ছাত্রী পাওয়া যায়নি।</p>';
        return;
    }

    for (const className in filteredClasses) {
        const students = filteredClasses[className];

        // ক্লাস টাইটেল দেখানোর আগে চেক করা হচ্ছে যে ক্লাস সিলেক্ট করা আছে কি না
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

// ফিল্টার এবং রেন্ডার করার মূল ফাংশন
function filterAndRender() {
    const selectedClass = classSelector.value;
    const searchTerm = searchBox.value.toLowerCase().trim();
    const filteredClasses = {};

    for (const className in allStudentsData) {
        // ক্লাস অনুযায়ী ফিল্টার
        if (selectedClass !== 'all' && className !== selectedClass) {
            continue;
        }

        const students = allStudentsData[className];
        
        // সার্চ টার্ম অনুযায়ী ফিল্টার
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
        
        // যদি ফিল্টার করার পর ছাত্রছাত্রী থাকে, তাহলে অবজেক্টে যোগ করা হবে
        if (filteredStudents.length > 0) {
            filteredClasses[className] = filteredStudents;
        }
    }
    
    renderStudents(filteredClasses);
}


// অ্যাপ্লিকেশন শুরু করার ফাংশন
async function initializeApp() {
    try {
        const response = await fetch('../madrasa-scraper/students.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allStudentsData = await response.json();

        // ক্লাস সিলেক্টর পপুলেট করা
        Object.keys(allStudentsData).forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelector.appendChild(option);
        });

        // ইভেন্ট লিসেনার যোগ করা
        classSelector.addEventListener('change', filterAndRender);
        searchBox.addEventListener('input', filterAndRender);
        
        // প্রথমবার সব ছাত্রছাত্রীদের দেখানো
        filterAndRender(); // এটাকে filterAndRender কল করা হলো যাতে কাউন্ট শুরুতেই দেখায়

    } catch (error) {
        container.innerHTML = '<p class="error">তথ্য লোড করা সম্ভব হয়নি। ফাইলটি সঠিক জায়গায় আছে কিনা নিশ্চিত করুন।</p>';
        console.error('Error fetching student data:', error);
    }
}

// অ্যাপলিকেশন শুরু করুন
initializeApp();