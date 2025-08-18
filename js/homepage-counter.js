// যখন পুরো পেজ লোড হবে, তখন এই ফাংশনটি কাজ করবে
document.addEventListener('DOMContentLoaded', async () => {
    // id দিয়ে h3 এলিমেন্টটিকে সিলেক্ট করা হলো
    const countElement = document.getElementById('student-total-count');

    try {
        // students.json ফাইল থেকে ডেটা আনা হচ্ছে
        const response = await fetch('madrasa-scraper/students.json');

        // যদি ফাইল লোড হতে কোনো সমস্যা হয়, তাহলে এরর দেখাবে
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const studentData = await response.json();

        let totalStudents = 0;
        // studentData অবজেক্টের প্রতিটি ক্লাসের ছাত্র সংখ্যা যোগ করা হচ্ছে
        for (const className in studentData) {
            totalStudents += studentData[className].length;
        }

        // গণনা করা মোট সংখ্যাকে বাংলা সংখ্যায় রূপান্তর করে এলিমেন্টে দেখানো হচ্ছে
        countElement.textContent = totalStudents.toLocaleString('bn-BD');

    } catch (error) {
        console.error('শিক্ষার্থীর সংখ্যা লোড করতে ব্যর্থ:', error);
        // কোনো কারণে ফাইল লোড না হলে আগের ম্যানুয়াল সংখ্যাটি দেখানো হবে
        countElement.textContent = '১৫০০+';
    }
});