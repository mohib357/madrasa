document.addEventListener('DOMContentLoaded', () => {
    // === DOM Element References ===
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

    /**
     * লোকাল স্টোরেজে ডেটা সংরক্ষণ করে
     */
    function saveDataToLocalStorage() {
        localStorage.setItem('teachersData', JSON.stringify(teachersData));
    }

    /**
     * সকল শিক্ষকের কার্ড UI-তে রেন্ডার করে
     */
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
            const displayName = teacher.name_bn || teacher.name; // Use Bangla name if available

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
                        <h3>${displayName}</h3>
                        <div class="info-item">
                            <strong>পদবী</strong><span class="info-separator">::</span><span>${teacher.designation_bn || teacher.designation || 'N/A'}</span>
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
                        <img src="${photo}" alt="${displayName}" class="teacher-photo">
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
            const actionButton = card.querySelector('.action-btn');
            const dropdownContent = card.querySelector('.dropdown-content');

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    showTeacherDetailsModal(index);
                }
            });

            actionButton.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.dropdown-content').forEach(d => {
                    if (d !== dropdownContent) d.style.display = 'none';
                });
                const isVisible = dropdownContent.style.display === 'block';
                dropdownContent.style.display = isVisible ? 'none' : 'block';
            });

            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openEditModal(index);
                dropdownContent.style.display = 'none';
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
            alert(`"${teacher.name_bn || teacher.name}" এর স্ট্যাটাস পরিবর্তন করে "${teacher.status}" করা হয়েছে।`);
        }
    }

    /**
     * শিক্ষক মুছে ফেলার জন্য কনফার্মেশন দেখায়
     */
    function handleDeleteTeacher(index) {
        const teacherName = teachersData[index]?.name_bn || teachersData[index]?.name || "এই শিক্ষক";
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

        modalTeacherName.textContent = teacher.name_bn || teacher.name;
        let detailsHTML = `
            <img src="${teacher.photoUrl || 'images/default_teacher.png'}" alt="${teacher.name_bn || teacher.name}" class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200">
            <p><strong>আইডি:</strong> ${teacher.id}</p>
            <p><strong>পদবী:</strong> ${teacher.designation_bn || teacher.designation || 'N/A'}</p>
            <p><strong>পিতার নাম:</strong> ${teacher.fatherName_bn || teacher.fatherName || 'N/A'}</p>
            <p><strong>মোবাইল:</strong> ${teacher.mobile || 'N/A'}</p>
            <p><strong>ইমেইল:</strong> ${teacher.email || 'N/A'}</p>
            <p><strong>স্ট্যাটাস:</strong> <span class="${teacher.status === 'approved' ? 'text-green-600' : 'text-yellow-600'} font-semibold">${teacher.status}</span></p>
        `;

        // Safely check for qualifications
        if (teacher.qualifications && teacher.qualifications.length > 0) {
            detailsHTML += `<h4 class="font-bold mt-3">শিক্ষাগত যোগ্যতা:</h4><ul>`;
            teacher.qualifications.forEach(q => {
                detailsHTML += `<li>${q.degree} - ${q.institution} (${q.year})</li>`;
            });
            detailsHTML += `</ul>`;
        }

        modalTeacherDetails.innerHTML = detailsHTML;
        teacherDetailsModal.classList.remove('hidden');
    }

    // === নতুন এবং পরিবর্তিত ফাংশন (সমস্যা সমাধানসহ) ===

    /**
     * শিক্ষকের তথ্য এডিট করার জন্য Modal ওপেন করে
     */
    function openEditModal(index) {
        const teacher = teachersData[index];
        if (!teacher) {
            console.error("Teacher not found for index:", index);
            return;
        }

        // 🟨 **গুরুত্বপূর্ণ পরিবর্তন:** এখানে || [] ব্যবহার করে নিশ্চিত করা হচ্ছে যে ডেটা না থাকলেও কোড ক্র্যাশ করবে না।
        const qualifications = teacher.qualifications || [];
        const socials = teacher.socials || [];

        editTeacherForm.innerHTML = `
            <input type="hidden" name="index" value="${index}">
            
            <div class="md:col-span-1 form-group"><label for="name_bn">নাম (বাংলা)</label><input type="text" id="name_bn" name="name_bn" value="${teacher.name_bn || ''}" placeholder="আপনার পুরো নাম লিখুন"></div>
            <div class="md:col-span-1 form-group"><label for="name_en">নাম (English)</label><input type="text" id="name_en" name="name_en" value="${teacher.name_en || ''}" placeholder="Enter your full name"></div>
            <div class="md:col-span-1 form-group"><label for="designation_bn">পদবী (বাংলা)</label><input type="text" id="designation_bn" name="designation_bn" value="${teacher.designation_bn || ''}" placeholder="পদবী"></div>
            <div class="md:col-span-1 form-group"><label for="designation_en">পদবী (English)</label><input type="text" id="designation_en" name="designation_en" value="${teacher.designation_en || ''}" placeholder="Designation"></div>
            <div class="md:col-span-1 form-group"><label for="fatherName_bn">পিতার নাম (বাংলা)</label><input type="text" id="fatherName_bn" name="fatherName_bn" value="${teacher.fatherName_bn || ''}" placeholder="পিতার নাম"></div>
            <div class="md:col-span-1 form-group"><label for="fatherName_en">পিতার নাম (English)</label><input type="text" id="fatherName_en" name="fatherName_en" value="${teacher.fatherName_en || ''}" placeholder="Father's Name"></div>

            <div class="md:col-span-2 form-group photo-upload-section">
                <img id="photo-preview" src="${teacher.photoUrl || 'images/default_teacher.png'}" alt="Photo Preview">
                <input type="text" name="photoUrl" value="${teacher.photoUrl || ''}" placeholder="ছবির URL দিন" class="w-full p-2 border rounded mt-2 text-center">
                <p class="text-gray-500 my-1">অথবা</p>
                <label for="photoFile" class="custom-file-upload">ফাইল থেকে ছবি দিন</label>
                <input type="file" id="photoFile" name="photoFile" accept="image/*">
            </div>

            <div class="form-group"><label for="dob">জন্ম তারিখ</label><input type="date" id="dob" name="dob" value="${teacher.dob || ''}"></div>
            <div class="form-group"><label for="joiningDate">যোগদানের তারিখ</label><input type="date" id="joiningDate" name="joiningDate" value="${teacher.joiningDate || ''}"></div>
            <div class="form-group"><label for="mobile">মোবাইল নং</label><input type="tel" id="mobile" name="mobile" value="${teacher.mobile || ''}" pattern="[0-9]{11}" title="১১ ডিজিটের মোবাইল নম্বর দিন"></div>
            <div class="form-group"><label for="email">ইমেইল</label><input type="email" id="email" name="email" value="${teacher.email || ''}"></div>
            <div class="form-group">
                <label for="gender">লিঙ্গ</label>
                <select id="gender" name="gender">
                    <option value="male" ${teacher.gender === 'male' ? 'selected' : ''}>পুরুষ</option>
                    <option value="female" ${teacher.gender === 'female' ? 'selected' : ''}>মহিলা</option>
                    <option value="other" ${teacher.gender === 'other' ? 'selected' : ''}>অন্যান্য</option>
                </select>
            </div>
            
            <div class="md:col-span-2">
                <fieldset class="dynamic-fieldset">
                    <legend>শিক্ষাগত যোগ্যতা</legend>
                    <div id="qualifications-container">
                        ${qualifications.map(q => `
                            <div class="dynamic-row qualification-row">
                                <input type="text" name="degree" value="${q.degree || ''}" placeholder="ডিগ্রী/পরীক্ষার নাম">
                                <input type="text" name="institution" value="${q.institution || ''}" placeholder="শিক্ষা প্রতিষ্ঠান">
                                <input type="text" name="year" value="${q.year || ''}" placeholder="পাসের সন">
                                <button type="button" class="remove-btn">মুছুন</button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" id="add-qualification-btn" class="add-btn">যোগ্যতা যোগ করুন</button>
                </fieldset>
            </div>

            <div class="md:col-span-2">
                <fieldset class="dynamic-fieldset">
                    <legend>সোশ্যাল মিডিয়া</legend>
                    <div id="socials-container">
                        ${socials.map(s => `
                            <div class="dynamic-row social-row">
                                <select name="platform">
                                    <option value="facebook" ${s.platform === 'facebook' ? 'selected' : ''}>Facebook</option>
                                    <option value="twitter" ${s.platform === 'twitter' ? 'selected' : ''}>Twitter</option>
                                    <option value="linkedin" ${s.platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                                    <option value="github" ${s.platform === 'github' ? 'selected' : ''}>GitHub</option>
                                    <option value="website" ${s.platform === 'website' ? 'selected' : ''}>Website</option>
                                </select>
                                <input type="text" name="username" value="${s.username || ''}" placeholder="ইউজারনেম বা লিংক">
                                <span class="text-gray-500"></span>
                                <button type="button" class="remove-btn">মুছুন</button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" id="add-social-btn" class="add-btn">লিংক যোগ করুন</button>
                </fieldset>
            </div>

            <div class="md:col-span-2 text-right"><button type="submit" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">সংরক্ষণ করুন</button></div>
        `;
        editTeacherModal.classList.remove('hidden');
        addDynamicFormEventListeners();
    }

    /**
     * এডিট ফরমের ডাইনামিক অংশগুলোর জন্য ইভেন্ট লিসেনার যোগ করে
     */
    function addDynamicFormEventListeners() {
        // Photo Preview
        const photoFileInput = document.getElementById('photoFile');
        const photoPreview = document.getElementById('photo-preview');
        photoFileInput.addEventListener('change', () => {
            const file = photoFileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { photoPreview.src = e.target.result; }
                reader.readAsDataURL(file);
            }
        });

        // Add Qualification
        document.getElementById('add-qualification-btn').addEventListener('click', () => {
            const container = document.getElementById('qualifications-container');
            const newRow = document.createElement('div');
            newRow.className = 'dynamic-row qualification-row';
            newRow.innerHTML = `
                <input type="text" name="degree" placeholder="ডিগ্রী/পরীক্ষার নাম">
                <input type="text" name="institution" placeholder="শিক্ষা প্রতিষ্ঠান">
                <input type="text" name="year" placeholder="পাসের সন">
                <button type="button" class="remove-btn">মুছুন</button>
            `;
            container.appendChild(newRow);
        });

        // Add Social Media
        document.getElementById('add-social-btn').addEventListener('click', () => {
            const container = document.getElementById('socials-container');
            const newRow = document.createElement('div');
            newRow.className = 'dynamic-row social-row';
            newRow.innerHTML = `
                 <select name="platform">
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="github">GitHub</option>
                    <option value="website">Website</option>
                </select>
                <input type="text" name="username" placeholder="ইউজারনেম বা লিংক">
                <span class="text-gray-500"></span>
                <button type="button" class="remove-btn">মুছুন</button>
            `;
            container.appendChild(newRow);
        });

        // Remove button delegation
        editTeacherForm.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                e.target.closest('.dynamic-row').remove();
            }
        });
    }

    /**
     * এডিট ফর্ম সাবমিট হলে শিক্ষকের তথ্য আপডেট করে
     */
    function handleUpdateTeacher(e) {
        e.preventDefault();
        const formData = new FormData(editTeacherForm);
        const index = parseInt(formData.get('index'), 10);
        const teacher = teachersData[index];

        if (teacher) {
            // Update simple fields
            teacher.name_bn = formData.get('name_bn');
            teacher.name_en = formData.get('name_en');
            teacher.designation_bn = formData.get('designation_bn');
            teacher.designation_en = formData.get('designation_en');
            teacher.fatherName_bn = formData.get('fatherName_bn');
            teacher.fatherName_en = formData.get('fatherName_en');
            teacher.dob = formData.get('dob');
            teacher.joiningDate = formData.get('joiningDate');
            teacher.mobile = formData.get('mobile');
            teacher.email = formData.get('email');
            teacher.gender = formData.get('gender');

            // Update photo
            const photoPreview = document.getElementById('photo-preview');
            if (photoPreview.src.startsWith('data:image')) {
                teacher.photoUrl = photoPreview.src;
            } else {
                teacher.photoUrl = formData.get('photoUrl');
            }

            // Update qualifications
            teacher.qualifications = [];
            document.querySelectorAll('#qualifications-container .qualification-row').forEach(row => {
                const degree = row.querySelector('[name="degree"]').value;
                const institution = row.querySelector('[name="institution"]').value;
                const year = row.querySelector('[name="year"]').value;
                if (degree && institution && year) {
                    teacher.qualifications.push({ degree, institution, year });
                }
            });

            // Update socials
            teacher.socials = [];
            document.querySelectorAll('#socials-container .social-row').forEach(row => {
                const platform = row.querySelector('[name="platform"]').value;
                const username = row.querySelector('[name="username"]').value;
                if (platform && username) {
                    teacher.socials.push({ platform, username });
                }
            });

            // Backward compatibility for old simple fields
            teacher.name = teacher.name_bn || teacher.name_en;
            teacher.designation = teacher.designation_bn || teacher.designation_en;
            teacher.fatherName = teacher.fatherName_bn || teacher.fatherName_en;


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
            try {
                teachersData = JSON.parse(savedData);
            } catch (e) {
                console.error("Error parsing localStorage data:", e);
                teachersData = []; // Reset if data is corrupted
            }
        } else {
            try {
                const response = await fetch('teachers.json');
                if (response.ok) {
                    teachersData = await response.json();
                    saveDataToLocalStorage();
                } else {
                    console.log("teachers.json not found. Starting with empty data.");
                    teachersData = [];
                }
            } catch (error) {
                console.error("Error loading teachers.json:", error);
                teachersData = [];
            }
        }
        renderTeachers();
    }

    // === Global Event Listeners ===
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