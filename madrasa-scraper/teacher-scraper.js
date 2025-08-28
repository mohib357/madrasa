require('dotenv').config();

const puppeteer = require('puppeteer');
const fs = require('fs');

// --- sikkhaloy.com এর লগইন তথ্য ---
const USERNAME = process.env.SIKKHALOY_USERNAME;
const PASSWORD = process.env.SIKKHALOY_PASSWORD;

// URL সমূহ
const LOGIN_URL = "https://sikkhaloy.com/Default.aspx";
const TEACHER_LIST_URL = "https://sikkhaloy.com/Employee/Employee_List.aspx";

// ✅ পরিবর্তন: আউটপুট ফাইলের পাথ এবং নাম এখানে পরিবর্তন করা হয়েছে
const OUTPUT_FILE = 'Control_Panel/teachers.json';

async function scrapeTeachers() {
    console.log("🚀 ব্রাউজার চালু হচ্ছে...");
    const browser = await puppeteer.launch({
        headless: false, // true রাখলে ব্রাউজার দেখা যাবে না
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setDefaultNavigationTimeout(90000); // টাইমআউট ৯০ সেকেন্ড করা হলো

    try {
        // --- ধাপ ১: লগইন প্রক্রিয়া ---
        console.log("🔐 লগইন করা হচ্ছে...");
        await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

        const loginModalButtonSelector = 'a[data-target="#myModal"]';
        await page.waitForSelector(loginModalButtonSelector, { visible: true });
        await page.click(loginModalButtonSelector);

        await page.waitForSelector('#UserLogin_UserName', { visible: true });
        await page.type('#UserLogin_UserName', USERNAME);
        await page.type('#UserLogin_Password', PASSWORD);

        await Promise.all([
            page.click('#UserLogin_LoginButton'),
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        ]);
        console.log("✅ লগইন সফল হয়েছে!");

        // --- ধাপ ২: শিক্ষক তালিকা পেজে যাওয়া ---
        console.log("👨‍🏫 শিক্ষক তালিকা পেজে যাওয়া হচ্ছে...");
        await page.goto(TEACHER_LIST_URL, { waitUntil: 'domcontentloaded' });

        // --- ধাপ ৩: পেজ থেকে তথ্য সংগ্রহ করা ---
        console.log("📊 টেবিল থেকে তথ্য সংগ্রহ করা হচ্ছে...");
        const teachersData = await page.evaluate((baseUrl) => {
            const teachers = [];
            const tableSelector = '#body_EmployeeGridView';
            const rows = document.querySelectorAll(`${tableSelector} tbody tr`);

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 10) return;

                const id = cells[1]?.querySelector('input')?.value.trim() || '';
                const name = cells[2]?.textContent.trim() || '';
                const fatherName = cells[3]?.textContent.trim() || '';
                const cleanFatherName = fatherName === '\xa0' ? '' : fatherName;
                const mobile = cells[4]?.textContent.trim() || '';
                const designation = cells[5]?.textContent.trim() || '';
                const imageElement = cells[9]?.querySelector('img');
                const relativeImgSrc = imageElement ? imageElement.getAttribute('src') : '';

                const photoUrl = relativeImgSrc ? `${baseUrl}${relativeImgSrc}` : '';

                // কন্ট্রোল প্যানেলের ফরম্যাটের সাথে মিল রেখে অবজেক্ট তৈরি
                teachers.push({
                    id: Date.now() + Math.random(), // একটি বেসিক ইউনিক আইডি
                    name: name,
                    designation: designation,
                    photoUrl: photoUrl,
                    status: 'pending', // ✅ নতুন: ডিফল্ট স্ট্যাটাস 'pending'
                    joiningDate: "", // এই তথ্যটি এখানে নেই, তাই খালি রাখা হলো
                    subjects: [],
                    sections: [],
                    fatherName: cleanFatherName,
                    mobile: mobile,
                    presentAddress: "",
                    permanentAddress: "",
                    socials: {
                        facebook: "",
                        gmail: "",
                        instagram: null
                    }
                });
            });

            return teachers;
        }, "https://sikkhaloy.com");

        console.log(`✅ মোট ${teachersData.length} জন শিক্ষকের তথ্য সংগ্রহ করা হয়েছে।`);

        // --- ধাপ ৪: ফাইল সেভ করা ---
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(teachersData, null, 2));
        console.log(`💾 তথ্য সফলভাবে ${OUTPUT_FILE} ফাইলে সেভ করা হয়েছে!`);

    } catch (error) {
        console.error("❌ একটি ত্রুটি ঘটেছে:", error);
    } finally {
        await browser.close();
        console.log("🎉 কাজ সম্পন্ন হয়েছে এবং ব্রাউজার বন্ধ করা হয়েছে।");
    }
}

// স্ক্রেপার চালানো
scrapeTeachers();