document.addEventListener('DOMContentLoaded', () => {
    const notices = [
        {
            title: "প্রতিষ্ঠাতা পরিচালকের গুরুত্বপূর্ণ বার্তা",
            date: "২০ জুলাই, ২০২৪",
            details: `
                এতদ্বারা মাদরাসার সকল ছাত্র, শিক্ষক ও কর্মচারীদের অবগতির জন্য জানানো যাচ্ছে যে,
                আসন্ন ঈদুল আযহা উপলক্ষে মাদরাসার সকল কার্যক্রম আগামী <b>২২ জুলাই, ২০২৪</b> থেকে <b>২৮ জুলাই, ২০২৪</b> পর্যন্ত বন্ধ থাকবে।
                <div>২৯ জুলাই, ২০২৪ থেকে যথারীতি সকল কার্যক্রম শুরু হবে।</div>
                <p>সকলকে ঈদের শুভেচ্ছা।</p>
            `
        },
        {
            title: "ভর্তি পরীক্ষার ফলাফল",
            date: "১৮ জুলাই, ২০২৪",
            details: "২০২৪-২৫ শিক্ষাবর্ষের ভর্তি পরীক্ষার ফলাফল প্রকাশ করা হয়েছে। বিস্তারিত জানতে নোটিশ বোর্ডে দেখুন অথবা <a href='#' class='text-cyan-400 hover:underline'>এখানে ক্লিক করুন</a>।"
        },
        {
            title: "অভিভাবক সমাবেশ",
            date: "১৫ জুলাই, ২০২৪",
            details: "<i>আগামী ২৫ জুলাই, ২০২৪</i> তারিখে একটি অভিভাবক সমাবেশ অনুষ্ঠিত হবে। সকল অভিভাবককে উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।"
        },
        {
            title: "লাইব্রেরী কার্ড বিতরণ",
            date: "১২ জুলাই, ২০২৪",
            details: "নতুন ছাত্রদের জন্য লাইব্রেরী কার্ড বিতরণ চলছে। নিজ নিজ বিভাগ থেকে কার্ড সংগ্রহ করার জন্য বলা হলো।"
        }
    ];

    const noticeContainer = document.getElementById('scrolling-notice-container');
    const scrollingWrapper = document.getElementById('scrolling-wrapper');
    const scrollingContent = document.getElementById('scrolling-content');
    const fixedNotice = document.getElementById('fixed-notice');
    const fixedTitle = document.getElementById('fixed-title');
    const fixedDate = document.getElementById('fixed-date');

    // নোটিশ না থাকলে স্ক্রলারটি দেখাবে না
    if (!notices || notices.length === 0) {
        return;
    }

    // কন্টেইনারগুলো দৃশ্যমান করুন
    noticeContainer.classList.remove('hidden');
    fixedNotice.classList.remove('hidden');

    let currentIndex = -1;
    let animationFrameId;

    /**
     * এই ফাংশনটি নোটিশের বিবরণ থেকে লাইন ব্রেক (<br>) এবং 
     * p, div এর মতো ব্লক-লেভেল ট্যাগ সরিয়ে দেয়, কিন্তু b, i, a এর মতো 
     * ইনলাইন ট্যাগ ঠিক রাখে।
     * @param {string} html - নোটিশের বিবরণ
     * @returns {string} - এক লাইনে প্রদর্শনের জন্য পরিচ্ছন্ন টেক্সট
     */
    function sanitizeDetails(html) {
        if (!html) return '';
        // <br> এবং অন্যান্য ব্লক-লেভেল ট্যাগকে একটি স্পেস দিয়ে প্রতিস্থাপন করুন
        const blockTagsRegex = /<\/?(div|p|h[1-6]|ul|ol|li|blockquote|section|article|header|footer|br)[^>]*>/gi;
        // একাধিক স্পেসকে একটি মাত্র স্পেসে পরিণত করুন
        return html.replace(blockTagsRegex, ' ').replace(/\s\s+/g, ' ').trim();
    }

    /**
     * পরবর্তী নোটিশ দেখানোর জন্য মূল ফাংশন
     */
    function showNextNotice() {
        // আগের অ্যানিমেশন ফ্রেম বাতিল করুন যাতে কোনো ওভারল্যাপ না হয়
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        // ইনডেক্স বাড়ান এবং শেষে পৌঁছালে আবার প্রথম থেকে শুরু করুন
        currentIndex = (currentIndex + 1) % notices.length;
        const currentNotice = notices[currentIndex];

        // ধাপ ১: নতুন নোটিশ শুরু হওয়ার মুহূর্তে স্থির শিরোনাম এবং তারিখ আপডেট করুন
        fixedTitle.textContent = currentNotice.title;
        fixedDate.textContent = currentNotice.date;

        // ধাপ ২: নোটিশের বিবরণকে এক লাইনের জন্য প্রস্তুত করুন
        const sanitizedDetails = sanitizeDetails(currentNotice.details);
        scrollingContent.innerHTML = sanitizedDetails;

        // ধাপ ৩: স্ক্রলিং শুরু করার জন্য অবস্থান রিসেট করুন
        const wrapperWidth = scrollingWrapper.offsetWidth;
        let position = wrapperWidth; // ডান দিক থেকে শুরু হবে

        // অ্যানিমেশন লুপ
        function animate() {
            position -= 1; // স্ক্রলের গতি

            scrollingContent.style.transform = `translateX(${position}px)`;

            const contentRect = scrollingContent.getBoundingClientRect();
            const wrapperRect = scrollingWrapper.getBoundingClientRect();

            // নোটিশের ডান প্রান্ত কন্টেইনারের বাম প্রান্ত অতিক্রম করেছে কিনা তা পরীক্ষা করুন
            if (contentRect.right < wrapperRect.left) {
                // যদি নোটিশটি পুরোপুরি স্ক্রিনের বাইরে চলে যায়, তবে পরেরটি দেখান
                showNextNotice();
                return; // বর্তমান অ্যানিমেশন লুপ বন্ধ করুন
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // অ্যানিমেশন শুরু করুন
        animationFrameId = requestAnimationFrame(animate);
    }

    // নোটিশ দেখানো শুরু করুন
    showNextNotice();
});