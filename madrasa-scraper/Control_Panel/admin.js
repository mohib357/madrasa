document.addEventListener('DOMContentLoaded', () => {
    const teacherGridContainer = document.getElementById('teacher-grid-container');
    const teacherDetailsModal = document.getElementById('teacher-details-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTeacherName = document.getElementById('modal-teacher-name');
    const modalTeacherDetails = document.getElementById('modal-teacher-details');
    let teachersData = [];

    // === Functions ===
    function renderTeachers() {
        teacherGridContainer.innerHTML = '';
        if (teachersData.length === 0) {
            teacherGridContainer.innerHTML = '<p class="text-gray-500 p-4 text-center col-span-full">কোনো শিক্ষক এখনো যোগ করা হয়নি।</p>';
            return;
        }

        const teacherCardsHTML = teachersData.map((teacher, index) => {
            const isApproved = teacher.status === 'approved';
            const cardStatusClass = isApproved ? '' : 'pending';
            const photo = teacher.photoUrl || 'images/default_teacher.png';
            const madrasaNameLine1 = "আলহাজ্ব আবুল কাশেম ও মরহুমা ফাতেমা খাতুন";
            const madrasaNameLine2 = "মারকাযুল কুরআন মাদরাসা";

            return `
        <div class="id-card ${cardStatusClass}" data-index="${index}">
            <div class="card-content">
                <div class="card-header">
                    <img src="images/logo.png" alt="লোগো" class="logo">
                    <div class="header-text">
                        <p class="header-line-1">${madrasaNameLine1}</p>
                        <h2 class="header-line-2">${madrasaNameLine2}</h2>
                    </div>
                </div>
                
                <div class="info-area">
                    <h3>${teacher.name}</h3>
                    <div class="info-item">
                        <strong>পদবী</strong><span class="info-separator">::</span><span>${teacher.designation || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>যোগদানের তারিখ</strong><span class="info-separator">::</span><span>${teacher.joiningDate || 'N/A'}</span>
                    </div>
                    
                    <div class="info-item">
                        <strong>মোবাইল নং</strong><span class="info-separator">::</span><span>${teacher.mobile || 'N/A'}</span>
                    </div>

                    <div class="info-item">
                        <strong>জন্ম তারিখ</strong><span class="info-separator">::</span><span>${teacher.dob || 'N/A'}</span>
                    </div>   
                </div>
                
                <div class="photo-area">
                    <img src="${photo}" alt="${teacher.name}" class="teacher-photo">
                </div>
            </div>

            <div class="card-actions">
                <i class="fas fa-ellipsis-v action-btn"></i>
                <div class="dropdown-content">
                    <a href="#" class="edit-btn">এডিট করুন</a>
                    <a href="#" class="approve-btn">${isApproved ? 'পেন্ডিং করুন' : 'অনুমোদন দিন'}</a>
                    <a href="#" class="delete-btn">মুছে ফেলুন</a>
                </div>
            </div>
        </div>`;
        }).join('');

        teacherGridContainer.innerHTML = teacherCardsHTML;
        addCardEventListeners();
    }
    /**
     * কার্ডগুলোর মধ্যে থাকা বিভিন্ন বাটনের জন্য ইভেন্ট লিসেনার যোগ করে
     */
    function addCardEventListeners() {
        document.querySelectorAll('.id-card').forEach(card => {
            const index = parseInt(card.dataset.index, 10);

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    showTeacherDetailsModal(index);
                }
            });

            const actionButton = card.querySelector('.action-btn');
            const dropdownContent = card.querySelector('.dropdown-content');

            actionButton.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.dropdown-content').forEach(d => {
                    if (d !== dropdownContent) d.style.display = 'none';
                });
                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
            });

            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Edit teacher at index: ${index}`);
                dropdownContent.style.display = 'none';
                // এখানে এডিট পপ-আপ খোলার কোড আসবে
            });

            card.querySelector('.approve-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTeacherStatus(index);
                dropdownContent.style.display = 'none';
            });

            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteTeacher(index);
                dropdownContent.style.display = 'none';
            });
        });
    }

    /**
     * শিক্ষকের স্ট্যাটাস পরিবর্তন করে (approved/pending)
     */
    function toggleTeacherStatus(index) {
        const teacher = teachersData[index];
        if (teacher) {
            teacher.status = teacher.status === 'approved' ? 'pending' : 'approved';
            renderTeachers();
            alert(`"${teacher.name}" এর স্ট্যাটাস পরিবর্তন করে "${teacher.status}" করা হয়েছে।`);
        }
    }

    /**
     * শিক্ষক মুছে ফেলার জন্য কনফার্মেশন দেখায়
     */
    function handleDeleteTeacher(index) {
        const teacherName = teachersData[index]?.name || "এই শিক্ষক";
        if (confirm(`আপনি কি "${teacherName}" কে মুছে ফেলতে চান?`)) {
            teachersData.splice(index, 1);
            renderTeachers();
            alert(`"${teacherName}" কে সফলভাবে মুছে ফেলা হয়েছে।`);
        }
    }

    /**
     * শিক্ষকের বিস্তারিত তথ্য একটি পপ-আপে দেখায়
     */
    function showTeacherDetailsModal(index) {
        const teacher = teachersData[index];
        if (!teacher) return;

        modalTeacherName.textContent = teacher.name;
        modalTeacherDetails.innerHTML = `
            <img src="${teacher.photoUrl || 'images/default_teacher.png'}" alt="${teacher.name}" class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200">
            <p class="text-base mb-1"><strong>আইডি:</strong> ${teacher.id}</p>
            <p class="text-base mb-1"><strong>পদবী:</strong> ${teacher.designation || 'N/A'}</p>
            <p class="text-base mb-1"><strong>পিতার নাম:</strong> ${teacher.fatherName || 'N/A'}</p>
            <p class="text-base mb-1"><strong>মোবাইল:</strong> ${teacher.mobile || 'N/A'}</p>
            <p class="text-base mb-1"><strong>ইমেইল:</strong> ${teacher.socials?.gmail || 'N/A'}</p>
            <p class="text-base mb-1"><strong>স্ট্যাটাস:</strong> <span class="${teacher.status === 'approved' ? 'text-green-600' : 'text-yellow-600'} font-semibold">${teacher.status}</span></p>
        `;
        teacherDetailsModal.classList.remove('hidden');
    }

    /**
     * অ্যাপ্লিকেশন শুরু করার জন্য মূল ফাংশন
     */
    async function initializeApp() {
        try {
            const response = await fetch('teachers.json');
            if (response.ok) {
                teachersData = await response.json();
            } else {
                console.log("teachers.json not found. Starting with an empty list.");
            }
        } catch (error) {
            console.error("Error loading teachers.json:", error);
        }
        renderTeachers();
    }

    // === Event Listeners (Global) ===
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card-actions')) {
            document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
        }
    });

    closeModalBtn.addEventListener('click', () => {
        teacherDetailsModal.classList.add('hidden');
    });

    // --- অ্যাপ্লিকেশন শুরু করা হলো ---
    initializeApp();
});