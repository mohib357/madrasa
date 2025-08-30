document.addEventListener('DOMContentLoaded', () => {
    const teacherGridContainer = document.getElementById('teacher-grid-container');
    const teacherDetailsModal = document.getElementById('teacher-details-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal');
    const modalTeacherName = document.getElementById('modal-teacher-name');
    const modalTeacherDetails = document.getElementById('modal-teacher-details');
    const editTeacherModal = document.getElementById('edit-teacher-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal');
    const editTeacherForm = document.getElementById('edit-teacher-form');
    let teachersData = [];

    // === Functions ===

    function saveDataToLocalStorage() {
        localStorage.setItem('teachersData', JSON.stringify(teachersData));
    }

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

            // আপনার addCardEventListeners ফাংশনের ভেতরের এই অংশটুকু পরিবর্তন করুন

            actionButton.addEventListener('click', (e) => {
                e.stopPropagation();

                // অন্য সব ড্রপডাউন এবং active ক্লাস বন্ধ করুন
                document.querySelectorAll('.id-card').forEach(c => {
                    if (c !== card) {
                        c.classList.remove('active');
                        c.querySelector('.dropdown-content').style.display = 'none';
                        c.querySelector('.dropdown-content').classList.remove('show-left');
                    }
                });

                const isVisible = dropdownContent.style.display === 'block';

                if (isVisible) {
                    dropdownContent.style.display = 'none';
                    card.classList.remove('active');
                } else {
                    dropdownContent.style.display = 'block';
                    card.classList.add('active');

                    // স্ক্রিনের বাইরে চলে যাচ্ছে কিনা তা পরীক্ষা করুন
                    const rect = dropdownContent.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;

                    if (rect.right > viewportWidth) {
                        dropdownContent.classList.add('show-left');
                    } else {
                        dropdownContent.classList.remove('show-left');
                    }
                }
            });

            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openEditModal(index);
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
            saveDataToLocalStorage();
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
            saveDataToLocalStorage();
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

    // ✅ অনুপস্থিত ফাংশনটি এখানে যোগ করা হলো
    function openEditModal(index) {
        const teacher = teachersData[index];
        if (!teacher) return;
        editTeacherForm.innerHTML = `
            <input type="hidden" name="index" value="${index}">
            <div><label class="block mb-1 font-medium">নাম</label><input type="text" name="name" value="${teacher.name || ''}" class="w-full p-2 border rounded"></div>
            <div><label class="block mb-1 font-medium">পদবী</label><input type="text" name="designation" value="${teacher.designation || ''}" class="w-full p-2 border rounded"></div>
            <div class="md:col-span-2"><label class="block mb-1 font-medium">ছবির URL</label><input type="text" name="photoUrl" value="${teacher.photoUrl || ''}" class="w-full p-2 border rounded"></div>
            <div><label class="block mb-1 font-medium">পিতার নাম</label><input type="text" name="fatherName" value="${teacher.fatherName || ''}" class="w-full p-2 border rounded"></div>
            <div><label class="block mb-1 font-medium">জন্ম তারিখ</label><input type="text" name="dob" value="${teacher.dob || ''}" class="w-full p-2 border rounded"></div>
            <div><label class="block mb-1 font-medium">মোবাইল নং</label><input type="text" name="mobile" value="${teacher.mobile || ''}" class="w-full p-2 border rounded"></div>
            <div><label class="block mb-1 font-medium">যোগদানের তারিখ</label><input type="text" name="joiningDate" value="${teacher.joiningDate || ''}" class="w-full p-2 border rounded"></div>
            <div class="md:col-span-2"><label class="block mb-1 font-medium">ফেসবুক URL</label><input type="text" name="facebook" value="${teacher.socials?.facebook || ''}" class="w-full p-2 border rounded"></div>
            <div class="md:col-span-2"><label class="block mb-1 font-medium">ইমেইল</label><input type="email" name="gmail" value="${teacher.socials?.gmail || ''}" class="w-full p-2 border rounded"></div>
            <div class="md:col-span-2 text-right"><button type="submit" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">সংরক্ষণ করুন</button></div>
        `;
        editTeacherModal.classList.remove('hidden');
    }


    // ✅ নতুন: এডিট ফর্ম সাবমিট হ্যান্ডেল করার ফাংশন
    function handleUpdateTeacher(e) {
        e.preventDefault();
        const formData = new FormData(editTeacherForm);
        const index = parseInt(formData.get('index'), 10);
        const teacher = teachersData[index];

        if (teacher) {
            teacher.name = formData.get('name');
            teacher.designation = formData.get('designation');
            teacher.photoUrl = formData.get('photoUrl');
            teacher.fatherName = formData.get('fatherName');
            teacher.dob = formData.get('dob');
            teacher.mobile = formData.get('mobile');
            teacher.joiningDate = formData.get('joiningDate');
            teacher.socials.facebook = formData.get('facebook');
            teacher.socials.gmail = formData.get('gmail');

            saveDataToLocalStorage();
            renderTeachers();
            editTeacherModal.classList.add('hidden');
            alert('তথ্য সফলভাবে আপডেট করা হয়েছে!');
        }
    }

    /**
     * অ্যাপ্লিকেশন শুরু করার জন্য মূল ফাংশন
     */
    async function initializeApp() {
        const savedData = localStorage.getItem('teachersData');
        if (savedData) {
            teachersData = JSON.parse(savedData);
        } else {
            try {
                const response = await fetch('teachers.json');
                if (response.ok) {
                    teachersData = await response.json();
                    saveDataToLocalStorage();
                } else { console.log("teachers.json not found."); }
            } catch (error) { console.error("Error loading teachers.json:", error); }
        }
        renderTeachers();
    }

    // === Event Listeners (Global) ===
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card-actions')) {
            document.querySelectorAll('.dropdown-content').forEach(d => {
                d.style.display = 'none';
            });
        }
    });

    closeDetailsModalBtn.addEventListener('click', () => teacherDetailsModal.classList.add('hidden'));
    closeEditModalBtn.addEventListener('click', () => editTeacherModal.classList.add('hidden'));
    editTeacherForm.addEventListener('submit', handleUpdateTeacher);

    initializeApp();
});