// const puppeteer = require('puppeteer');
// const fs = require('fs');

// // আপনার sikkhaloy.com এর লগইন তথ্য
// const USERNAME = "ahia_mohib";
// const PASSWORD = "Mohib66442";

// // URL সমূহ
// const LOGIN_URL = "https://sikkhaloy.com/Default.aspx";
// const STUDENTS_URL = "https://sikkhaloy.com/Admission/Student_Report/Students_List.aspx";

// async function scrapeData() {
//     console.log("🚀 ব্রাউজার চালু হচ্ছে...");
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     // নতুন: ব্রাউজারের স্ক্রিন সাইজ ডেস্কটপের মতো বড় করে দেওয়া হচ্ছে
//     await page.setViewport({ width: 1280, height: 800 });

//     await page.setDefaultNavigationTimeout(60000);

//     // --- ধাপ ১: লগইন প্রক্রিয়া ---
//     await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });

//     const loginModalButtonSelector = 'a[data-target="#myModal"]';

//     console.log("লগইন বাটন দৃশ্যমান হওয়ার জন্য অপেক্ষা করা হচ্ছে...");
//     await page.waitForSelector(loginModalButtonSelector, { visible: true });

//     await page.click(loginModalButtonSelector);

//     await page.waitForSelector('#UserLogin_UserName', { visible: true });
//     await page.type('#UserLogin_UserName', USERNAME);
//     await page.type('#UserLogin_Password', PASSWORD);

//     await Promise.all([
//         page.click('#UserLogin_LoginButton'),
//         page.waitForNavigation({ waitUntil: 'networkidle2' }),
//     ]);
//     console.log("✅ লগইন সফল হয়েছে!");

//     // --- ধাপ ২: ক্লাস তালিকা সংগ্রহ ---
//     console.log("🧑‍🏫 ছাত্র-ছাত্রীদের পেজে যাওয়া হচ্ছে...");
//     await page.goto(STUDENTS_URL, { waitUntil: 'networkidle2' });

//     console.log("📚 সকল ক্লাসের তালিকা সংগ্রহ করা হচ্ছে...");
//     const classDropdownSelector = '#body_ClassDropDownList';

//     const classes = await page.evaluate((selector) => {
//         const classOptions = [];
//         const options = document.querySelectorAll(`${selector} > option`);
//         options.forEach(option => {
//             if (option.value && option.value !== "0") {
//                 classOptions.push({
//                     value: option.value,
//                     name: option.innerText.trim()
//                 });
//             }
//         });
//         return classOptions;
//     }, classDropdownSelector);

//     console.log('যেসব ক্লাস পাওয়া গেছে:', classes.map(c => c.name));

//     // --- ধাপ ৩: প্রতিটি ক্লাসের ছাত্র-ছাত্রীদের তথ্য সংগ্রহ ---
//     const allStudentsData = {};

//     for (const classInfo of classes) {
//         console.log(`\n🔄 "${classInfo.name}" ক্লাসের তথ্য সংগ্রহ শুরু...`);

//         //...
//         // ড্রপডাউন থেকে ক্লাস সিলেক্ট করা হচ্ছে
//         await page.select(classDropdownSelector, classInfo.value);

//         // পেজের ডেটা লোড হওয়া পর্যন্ত অপেক্ষা করা হচ্ছে (নতুন পদ্ধতি)
//         await page.waitForNetworkIdle({ idleTime: 2000, timeout: 60000 });
//         //...

//         const studentsInClass = await page.evaluate(() => {
//             const students = [];
//             const studentRows = document.querySelectorAll('#body_StudentsGridView tr');

//             studentRows.forEach((row, index) => {
//                 if (index === 0) return;
//                 const cells = row.querySelectorAll('td');
//                 if (cells.length > 2) {
//                     const name = cells[1]?.innerText.trim();
//                     const roll = cells[2]?.innerText.trim();
//                     students.push({ name, roll });
//                 }
//             });
//             return students;
//         });

//         allStudentsData[classInfo.name] = studentsInClass;
//         console.log(`✅ "${classInfo.name}" ক্লাসে ${studentsInClass.length} জন ছাত্র-ছাত্রী পাওয়া গেছে।`);
//     }

//     console.log("\n\n--- সকল ক্লাসের সম্পূর্ণ তথ্য ---");
//     fs.writeFileSync('students.json', JSON.stringify(allStudentsData, null, 2));
//     console.log("💾 তথ্য সফলভাবে students.json ফাইলে সেভ করা হয়েছে!");

//     await browser.close();
//     console.log("\n🎉 কাজ সম্পন্ন হয়েছে!");
// }

// scrapeData().catch(err => console.error("❌ একটি ত্রুটি ঘটেছে:", err));



const puppeteer = require('puppeteer');
const fs =require('fs');

// আপনার sikkhaloy.com এর লগইন তথ্য
const USERNAME = "ahia_mohib";
const PASSWORD = "Mohib66442";

// URL সমূহ
const LOGIN_URL = "https://sikkhaloy.com/Default.aspx";
const ID_CARD_URL = "https://sikkhaloy.com/ID_Cards/Card.aspx";

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

    // --- ধাপ ২: ID Card পেজে গিয়ে ক্লাস তালিকা সংগ্রহ ---
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
    console.log('যেসব ক্লাস পাওয়া গেছে:', classes.map(c => c.name));

    // --- ধাপ ৩: প্রতিটি ক্লাসের সকল ছাত্রের আইডি কার্ড থেকে তথ্য সংগ্রহ ---
    const allStudentsData = {};

    for (const classInfo of classes) {
        console.log(`\n🔄 "${classInfo.name}" ক্লাসের তথ্য সংগ্রহ শুরু...`);

        await page.select(classDropdownSelector, classInfo.value);
        await page.waitForNetworkIdle({ idleTime: 2000, timeout: 60000 });

        const studentsInClass = await page.evaluate(() => {
            const students = [];
            
            // আপনার দেওয়া HTML অনুযায়ী সঠিক কন্টেইনার Selector
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

                if (nameElement) { // শুধু নাম থাকলেই তথ্য যোগ করা হবে
                    students.push({
                        name: nameElement.innerText.trim(),
                        studentId: idElement ? idElement.innerText.replace('ID :', '').trim() : '',
                        photoUrl: photoUrl,
                        fatherName: fatherName,
                        address: address,
                        dob: dob,
                        className: className,
                        mobile: mobile
                    });
                }
            });
            return students;
        });

        allStudentsData[classInfo.name] = studentsInClass;
        console.log(`✅ "${classInfo.name}" ক্লাসে ${studentsInClass.length} জন ছাত্র-ছাত্রী পাওয়া গেছে।`);
    }

    console.log("\n\n--- সকল ক্লাসের সম্পূর্ণ তথ্য ---");
    fs.writeFileSync('students.json', JSON.stringify(allStudentsData, null, 2));
    console.log("💾 তথ্য সফলভাবে students.json ফাইলে সেভ করা হয়েছে!");

    await browser.close();
    console.log("\n🎉 কাজ সম্পন্ন হয়েছে!");
}

scrapeData().catch(err => console.error("❌ একটি ত্রুটি ঘটেছে:", err));