document.addEventListener('DOMContentLoaded', () => {
    // আপনার দেওয়া গুগল শীটের লিংক
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFpVqdRkkAhEvrJeTmioOx987QpCAeQlCjwRKZD_D_SjwdYZLBptKPxSpNsAPP5e-_DimfaYYUR0CK/pub?output=csv';

    // HTML এলিমেন্ট নির্বাচন
    const scrollingContainer = document.getElementById('scrolling-notice-container');
    const scrollingWrapper = document.getElementById('scrolling-wrapper');
    const scrollingContent = document.getElementById('scrolling-content');
    const fixedNotice = document.getElementById('fixed-notice');
    const fixedTitle = document.getElementById('fixed-title');
    const fixedDate = document.getElementById('fixed-date');

    let allNotices = [];
    let currentIndex = -1;
    let animationFrameId = null;
    let isPaused = false; // ১ নম্বর সমস্যার সমাধান: নতুন ফ্ল্যাগ

    // আপনার দেওয়া CSV পার্সার
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

    // ২ নম্বর সমস্যার সমাধান: নতুন ফাংশন যা ইনলাইন HTML ঠিক রাখে
    function renderInlineHtml(html) {
        if (!html) return '';
        // শুধুমাত্র ব্লক-লেভেল ট্যাগ এবং br ট্যাগকে স্পেস দিয়ে রিপ্লেস করুন
        const blockTagsRegex = /<\/?(div|p|h[1-6]|ul|ol|li|blockquote|section|article|header|footer|br)[^>]*>/gi;
        // একাধিক স্পেসকে একটিতে পরিণত করুন
        const sanitizedHtml = html.replace(blockTagsRegex, ' ').replace(/\s\s+/g, ' ').trim();
        return sanitizedHtml;
    }

    async function initializeScroller() {
        try {
            const response = await fetch(googleSheetURL, { cache: 'no-cache' });
            if (!response.ok) throw new Error('Network response was not ok');
            const csvData = await response.text();

            const noticesFromSheet = parseFinalCSV(csvData);
            allNotices = noticesFromSheet.filter(n => n && n.Status && n.Status.trim().toLowerCase() === 'show' && n.Type && n.Type.trim().toLowerCase() === 'scrolling');

            if (allNotices.length > 0) {
                scrollingContainer.classList.remove('hidden');

                // ১ নম্বর সমস্যার সমাধান: mouseenter এবং mouseleave ইভেন্ট আপডেট করা হয়েছে
                scrollingWrapper.addEventListener('mouseenter', () => { isPaused = true; });
                scrollingWrapper.addEventListener('mouseleave', () => { isPaused = false; });

                showNextNotice();
            } else {
                scrollingContainer.style.display = 'none';
            }
        } catch (error) {
            console.error("Scroller initialization failed:", error);
            scrollingContainer.style.display = 'none';
        }
    }

    function showNextNotice() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        scrollingContent.innerHTML = '';
        fixedNotice.classList.add('hidden');

        currentIndex = (currentIndex + 1) % allNotices.length;
        const notice = allNotices[currentIndex];

        const scrollingItem = document.createElement('div');
        scrollingItem.className = 'scrolling-item';

        // ২ নম্বর সমস্যার সমাধান: নতুন ফাংশন `renderInlineHtml` ব্যবহার করা হয়েছে
        scrollingItem.innerHTML = `
            <div class="scrolling-header">
                <span class="focus-title">${notice['শিরোনাম'] || ''}</span>
                <span class="text-gray-400 text-sm">${notice['তারিখ'] || ''}</span>
            </div>
            <div class="scrolling-details">${renderInlineHtml(notice['বিবরণ'])}</div>
        `;
        scrollingContent.appendChild(scrollingItem);

        const headerElement = scrollingItem.querySelector('.scrolling-header');
        let position = scrollingWrapper.offsetWidth;
        let isPinned = false;

        function animate() {
            // ১ নম্বর সমস্যার সমাধান: 'isPaused' ফ্ল্যাগ চেক করা হচ্ছে
            if (!isPaused) {
                position -= 1;
                scrollingItem.style.transform = `translateX(${position}px)`;

                const wrapperRect = scrollingWrapper.getBoundingClientRect();
                const headerRect = headerElement.getBoundingClientRect();

                if (!isPinned && headerRect.left <= wrapperRect.left) {
                    isPinned = true;
                    fixedTitle.innerHTML = notice['শিরোনাম'] || '';
                    fixedDate.textContent = notice['তারিখ'] || '';
                    fixedNotice.classList.remove('hidden');
                    headerElement.style.visibility = 'hidden';
                }

                const itemRect = scrollingItem.getBoundingClientRect();
                if (itemRect.right < wrapperRect.left) {
                    showNextNotice();
                    return;
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();
    }

    initializeScroller();
});