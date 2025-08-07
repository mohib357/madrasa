document.addEventListener('DOMContentLoaded', () => {
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFpVqdRkkAhEvrJeTmioOx987QpCAeQlCjwRKZD_D_SjwdYZLBptKPxSpNsAPP5e-_DimfaYYUR0CK/pub?output=csv';
    const scrollingContainer = document.getElementById('scrolling-notice-container');
    const scrollingWrapper = document.getElementById('scrolling-wrapper');
    const scrollingContent = document.getElementById('scrolling-content');
    const fixedNotice = document.getElementById('fixed-notice');
    const fixedTitle = document.getElementById('fixed-title');
    const fixedDate = document.getElementById('fixed-date');

    // CSV ডেটা পার্স করার জন্য নির্ভরযোগ্য ফাংশন
    function parseFinalCSV(csv) {
        const result = [];
        let headers = []; let field = ''; let inQuotes = false; let row = [];
        csv = csv.trim() + '\n';
        for (let i = 0; i < csv.length; i++) {
            const char = csv[i];
            if (inQuotes) {
                if (char === '"') {
                    if (i + 1 < csv.length && csv[i + 1] === '"') { field += '"'; i++; }
                    else { inQuotes = false; }
                } else { field += char; }
            } else {
                if (char === '"') { inQuotes = true; }
                else if (char === ',') { row.push(field); field = ''; }
                else if (char === '\n' || char === '\r') {
                    row.push(field); field = '';
                    if (headers.length === 0) { headers = row.map(h => h.trim()); }
                    else if (row.length === headers.length) {
                        const obj = {};
                        headers.forEach((header, index) => { obj[header] = row[index]; });
                        result.push(obj);
                    }
                    row = [];
                    if (char === '\r' && i + 1 < csv.length && csv[i + 1] === '\n') { i++; }
                } else { field += char; }
            }
        }
        return result;
    }

    // HTML ট্যাগ রিমুভ করার ফাংশন
    function stripHtmlTags(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    async function loadScrollingNotices() {
        try {
            const response = await fetch(googleSheetURL, { cache: 'no-cache' });
            if (!response.ok) throw new Error('নেটওয়ার্ক সমস্যা');
            const csvData = await response.text();
            if (!csvData.trim()) throw new Error('কোনো ডেটা পাওয়া যায়নি');
            const allNotices = parseFinalCSV(csvData);
            const activeNotices = allNotices.filter(n => n && n.Status && n.Status.trim().toLowerCase() === 'show');
            const scrollingNotices = activeNotices.filter(n => n.Type && n.Type.trim().toLowerCase() === 'scrolling');
            
            // যদি কোনো স্ক্রলিং নোটিশ না থাকে, তাহলে কিছুই দেখাবে না
            if (scrollingNotices.length === 0) {
                scrollingContainer.style.display = 'none'; // পুরো সেকশনটি লুকিয়ে ফেলুন
                return;
            }

            // স্ক্রলিং কন্টেন্ট তৈরি করুন
            let scrollingText = '';
            
            // প্রথম নোটিশের জন্য শুধু বিবরণ
            if (scrollingNotices.length > 0) {
                const firstNotice = scrollingNotices[0];
                const description = firstNotice['বিবরণ'] ? `<span class="notice-description">${firstNotice['বিবরণ']}</span>` : '';
                scrollingText += description;
            }
            
            // অন্যান্য নোটিশের জন্য শিরোনাম, তারিখ এবং বিবরণ
            for (let i = 1; i < scrollingNotices.length; i++) {
                const notice = scrollingNotices[i];
                const title = notice['শিরোনাম'] ? `<span class="focus-title mx-2 title-element" data-title="${stripHtmlTags(notice['শিরোনাম'])}" data-date="${notice['তারিখ'] || ''}">${notice['শিরোনাম']}</span>` : '';
                const date = notice['তারিখ'] ? `<span class="text-gray-400 text-sm mx-1">[${notice['তারিখ']}]</span>` : '';
                const description = notice['বিবরণ'] ? `<span class="notice-description">- ${notice['বিবরণ']}</span>` : '';
                
                if (i > 1) {
                    scrollingText += `<span class="notice-divider">||</span>`;
                }
                
                scrollingText += `${date} ${title} ${description}`;
            }

            // নির্বিঘ্ন অ্যানিমেশনের জন্য টেক্সটটি ডুপ্লিকেট করুন
            scrollingContent.innerHTML = scrollingText + scrollingText;
            
            // প্রথম নোটিশের শিরোনাম এবং তারিখ স্থির অবস্থানে সেট করুন
            if (scrollingNotices.length > 0) {
                const firstNotice = scrollingNotices[0];
                // HTML ট্যাগ ছাড়া শিরোনাম সেট করুন
                fixedTitle.innerHTML = firstNotice['শিরোনাম'] || '';
                fixedDate.textContent = firstNotice['তারিখ'] || '';
                fixedNotice.classList.remove('hidden');
            }
            
            // অ্যানিমেশন চালু করুন এবং সেকশনটি দৃশ্যমান করুন
            scrollingContent.classList.add('animate-marquee');
            scrollingContainer.classList.remove('hidden');
            
            // মাউস হোভারে অ্যানিমেশন থামানোর ব্যবস্থা
            scrollingWrapper.addEventListener('mouseenter', () => scrollingContent.classList.add('paused'));
            scrollingWrapper.addEventListener('mouseleave', () => scrollingContent.classList.remove('paused'));
            
            // প্রতিটি নোটিশের জন্য শিরোনাম পরিবর্তন করার মেকানিজম
            const titleElements = document.querySelectorAll('.title-element');
            
            // প্রতিটি শিরোনাম এলিমেন্টের জন্য একটি অবজারভার তৈরি করুন
            const observerOptions = {
                root: scrollingWrapper,
                rootMargin: '0px',
                threshold: [0.5]
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // যখন একটি শিরোনাম মাঝখানে আসে, তখন তা স্থির করুন
                        const title = entry.target.getAttribute('data-title');
                        const date = entry.target.getAttribute('data-date');
                        
                        if (title) {
                            fixedTitle.innerHTML = title;
                            fixedDate.textContent = date;
                            
                            // অ্যানিমেশন রিসেট করুন
                            fixedNotice.style.animation = 'none';
                            setTimeout(() => {
                                fixedNotice.style.animation = 'slideInFromRight 0.5s ease-out forwards';
                            }, 10);
                        }
                    }
                });
            }, observerOptions);
            
            // প্রতিটি শিরোনাম এলিমেন্টের জন্য অবজারভার সেট করুন
            titleElements.forEach(element => {
                observer.observe(element);
            });
        } catch (error) {
            console.error("স্ক্রলিং নোটিশ লোড করতে সমস্যা:", error.message);
            scrollingContainer.style.display = 'none'; // কোনো সমস্যা হলেও সেকশনটি লুকিয়ে ফেলুন
        }
    }

    loadScrollingNotices();
});