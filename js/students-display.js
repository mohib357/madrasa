async function displayStudents() {
    const container = document.getElementById('student-container');

    try {
        const response = await fetch('../madrasa-scraper/students.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allClasses = await response.json();

        container.innerHTML = ''; // Loading message removed

        for (const className in allClasses) {
            const students = allClasses[className];

            const classTitle = document.createElement('h2');
            classTitle.textContent = className;
            container.appendChild(classTitle);

            const grid = document.createElement('div');
            grid.className = 'student-grid';

            if (students.length > 0) {
                students.forEach(student => {
                    const photo = student.photoUrl || 'https://i.imgur.com/838s6Ab.png';

                    // New card structure based on your ID card design
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
                                    <p><strong>পিতা:</strong> ${student.fatherName}</p>
                                    <p><strong>শ্রেণি:</strong> ${student.className}</p>
                                    <p><strong>ঠিকানা:</strong> ${student.address}</p>
                                    <p><strong>জন্ম তারিখ:</strong> ${student.dob}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.innerHTML += cardHTML;
                });
            } else {
                grid.innerHTML = '<p>এই ক্লাসে কোনো ছাত্র-ছাত্রী পাওয়া যায়নি।</p>';
            }
            container.appendChild(grid);
        }

    } catch (error) {
        container.innerHTML = '<p class="error">তথ্য লোড করা সম্ভব হয়নি। ফাইলটি সঠিক জায়গায় আছে কিনা নিশ্চিত করুন।</p>';
        console.error('Error fetching student data:', error);
    }
}

displayStudents();