require('dotenv').config();

const puppeteer = require('puppeteer');
const fs = require('fs');

// আপনার sikkhaloy.com এর লগইন তথ্য
const USERNAME = process.env.SIKKHALOY_USERNAME;
const PASSWORD = process.env.SIKKHALOY_PASSWORD;

// URL সমূহ
const LOGIN_URL = "https://sikkhaloy.com/Default.aspx";
const ID_CARD_URL = "https://sikkhaloy.com/ID_Cards/Card.aspx";
const FIND_STUDENTS_URL = "https://sikkhaloy.com/ID_Cards/Find_Students.aspx";

async function scrapeData() {
    console.log("🚀 ব্রাউজার চালু হচ্ছে...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setDefaultNavigationTimeout(60000);

    // --- ধাপ ১: লগইন প্রক্রিয়া ---
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
    const loginModalButtonSelector = 'a[data-target="#myModal"]';
    await page.waitForSelector(loginModalButtonSelector, { visible: true });
    await page.click(loginModalButtonSelector);

    await page.waitForSelector('#UserLogin_UserName', { visible: true });
    await page.type('#UserLogin_UserName', USERNAME);
    await page.type('#UserLogin_Password', PASSWORD);
    await Promise.all([
        page.click('#UserLogin_LoginButton'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);
    console.log("✅ লগইন সফল হয়েছে!");

    // --- ধাপ ২: ID Card পেজে গিয়ে ক্লাস তালিকা সংগ্রহ ---
    console.log("💳 আইডি কার্ড পেজে যাওয়া হচ্ছে...");
    await page.goto(ID_CARD_URL, { waitUntil: 'networkidle2' });

    const classDropdownSelector = '#body_ClassDropDownList';
    const classes = await page.evaluate((selector) => {
        const classOptions = [];
        const options = document.querySelectorAll(`${selector} > option`);
        options.forEach(option => {
            if (option.value && option.value !== "0") {
                classOptions.push({ value: option.value, name: option.innerText.trim() });
            }
        });
        return classOptions;
    }, classDropdownSelector);

    console.log('যেসব ক্লাস পাওয়া গেছে:', classes.map(c => c.name));

    // --- ধাপ ৩: Find Students পেজ থেকে সকল ছাত্রের জেন্ডার তথ্য সংগ্রহ ---
    console.log("👥 Find Students পেজে যাওয়া হচ্ছে...");
    await page.goto(FIND_STUDENTS_URL, { waitUntil: 'networkidle2' });

    const allGenderData = [];

    // ✅ পৃষ্ঠা থেকে তথ্য সংগ্রহের হেল্পার ফাংশন
    async function collectPageData(page, pageNum, allGenderData) {
        console.log(`📄 পৃষ্ঠা ${pageNum} থেকে তথ্য সংগ্রহ করা হচ্ছে...`);

        if (pageNum > 1) {
            await page.evaluate((targetPage) => {
                const links = document.querySelectorAll('a[href*="Page$"]');
                for (const link of links) {
                    if (link.textContent.trim() === targetPage.toString()) {
                        link.click();
                        break;
                    }
                }
            }, pageNum);

            await page.waitForNetworkIdle({ idleTime: 2000, timeout: 15000 });
            await new Promise(r => setTimeout(r, 1000));
        }

        const pageData = await page.evaluate(() => {
            const students = [];
            const table = document.querySelector('#body_StudentGridView');
            if (table) {
                const rows = table.querySelectorAll('tr:not(.pgr)');
                for (let i = 1; i < rows.length; i++) {
                    const cells = rows[i].querySelectorAll('td');
                    if (cells.length >= 7) {
                        students.push({
                            studentId: cells[0].textContent.trim(),
                            name: cells[1].textContent.trim(),
                            fatherName: cells[2].textContent.trim(),
                            gender: cells[6].textContent.trim(),
                            className: cells[9].textContent.trim()
                        });
                    }
                }
            }
            return students;
        });

        allGenderData.push(...pageData);
        console.log(`✅ ${pageData.length} জন ছাত্র পাওয়া গেছে পৃষ্ঠা ${pageNum}-এ`);
    }

    // --- ধাপ ৩.১: ১–১০ পৃষ্ঠা সংগ্রহ ---
    for (let pageNum = 1; pageNum <= 10; pageNum++) {
        await collectPageData(page, pageNum, allGenderData);
    }

    // --- ধাপ ৩.২: "..." এ ক্লিক করা (যাতে ১১–১৯ পৃষ্ঠা আসে) ---
    await page.evaluate(() => {
        const ellipsis = Array.from(document.querySelectorAll('a'))
            .find(a => a.textContent.trim() === "...");
        if (ellipsis) ellipsis.click();
    });
    await page.waitForNetworkIdle({ idleTime: 2000, timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));

    // --- ধাপ ৩.৩: ১১–১৯ পৃষ্ঠা সংগ্রহ ---
    for (let pageNum = 11; pageNum <= 19; pageNum++) {
        await collectPageData(page, pageNum, allGenderData);
    }

    // ডুপ্লিকেট ডেটা সরানো
    const uniqueGenderData = allGenderData.filter((student, index, self) =>
        index === self.findIndex(s => s.studentId === student.studentId)
    );
    console.log(`✅ মোট ${uniqueGenderData.length} জন ছাত্রের জেন্ডার তথ্য সংগ্রহ করা হয়েছে।`);

    // --- ধাপ ৪: ID Card পেজে ফিরে গিয়ে প্রতিটি ক্লাসের তথ্য সংগ্রহ ---
    console.log("\n💳 আইডি কার্ড পেজে ফিরে যাওয়া হচ্ছে...");
    await page.goto(ID_CARD_URL, { waitUntil: 'networkidle2' });

    const allStudentsData = {};
    for (const classInfo of classes) {
        console.log(`\n🔄 "${classInfo.name}" ক্লাসের তথ্য সংগ্রহ শুরু...`);
        await page.select(classDropdownSelector, classInfo.value);
        await page.waitForNetworkIdle({ idleTime: 2000, timeout: 60000 });

        const studentsInClass = await page.evaluate(() => {
            const students = [];
            const cardContainerSelector = 'div#wrapper > div';
            const cardElements = document.querySelectorAll(cardContainerSelector);

            cardElements.forEach(card => {
                const nameElement = card.querySelector('p[style*="font-weight:800"]');
                const idElement = card.querySelector('strong.d-block');
                const photoElement = card.querySelector('#user-info img');

                let fatherName = '', address = '', dob = '', className = '', mobile = '';
                const listItems = card.querySelectorAll('#user-info ul li');

                listItems.forEach(li => {
                    const text = li.innerText.trim();
                    if (text.startsWith('পিতা :')) {
                        fatherName = text.replace('পিতা :', '').trim();
                    } else if (text.startsWith('ঠিকানা :')) {
                        address = text.replace('ঠিকানা :', '').trim();
                    } else if (text.startsWith('জন্ম তারিখ :')) {
                        dob = text.replace('জন্ম তারিখ :', '').trim();
                    } else if (text.startsWith('শ্রেণি :')) {
                        className = text.replace('শ্রেণি :', '').trim();
                    } else if (text.startsWith('মোবাইল :')) {
                        mobile = text.replace('মোবাইল :', '').trim();
                    }
                });

                let photoUrl = photoElement ? photoElement.src : '';
                if (photoUrl && !photoUrl.startsWith('http')) {
                    photoUrl = `https://sikkhaloy.com${photoElement.getAttribute('src')}`;
                }

                if (nameElement) {
                    students.push({
                        name: nameElement.innerText.trim(),
                        studentId: idElement ? idElement.innerText.replace('ID :', '').trim() : '',
                        photoUrl: photoUrl,
                        fatherName: fatherName,
                        address: address,
                        dob: dob,
                        className: className,
                        mobile: mobile,
                        gender: '' // পরে যোগ করা হবে
                    });
                }
            });
            return students;
        });

        // জেন্ডার তথ্য মার্জ
        const studentsWithGender = studentsInClass.map(student => {
            let genderInfo = uniqueGenderData.find(g => g.studentId === student.studentId);
            if (!genderInfo) {
                genderInfo = uniqueGenderData.find(g =>
                    g.name.includes(student.name) && g.fatherName.includes(student.fatherName)
                );
            }
            return { ...student, gender: genderInfo?.gender || 'Unknown' };
        });

        allStudentsData[classInfo.name] = studentsWithGender;
        console.log(`✅ "${classInfo.name}" ক্লাসে ${studentsWithGender.length} জন ছাত্র-ছাত্রীর সম্পূর্ণ তথ্য সংগ্রহ করা হয়েছে।`);
    }

    // --- আউটপুট ---
    fs.writeFileSync('students.json', JSON.stringify(allStudentsData, null, 2));
    console.log("💾 তথ্য সফলভাবে students.json ফাইলে সেভ করা হয়েছে!");

    await browser.close();
    console.log("\n🎉 কাজ সম্পন্ন হয়েছে!");
}

scrapeData().catch(err => console.error("❌ একটি ত্রুটি ঘটেছে:", err));