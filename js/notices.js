// js/notices.js

// Script 1: Notice Load From google sheet
    document.addEventListener('DOMContentLoaded', function () {
      const noticeContainer = document.getElementById('notice-container');

      // Test Deta
      const testData = `তারিখ,শিরোনাম,বিবরণ,Status
              "০৩ আগষ্ট, ২০২৫","<span style='color:red;'>জরুরী ঘোষণা</span>","আগামী ৯ আগষ্ট থেকে ১ম সাময়িক পরীক্ষার বন্ধ শুরু হবে। সকল শিক্ষার্থীকে পরীক্ষার প্রস্তুতি নেওয়ার অনুরোধ করা হলো।",show
              "১০ নভেম্বর, ২০২৩","<strong>নতুন ভর্তির বিজ্ঞপ্তি</strong>","২০২৪ শিক্ষাবর্ষে ভর্তি শুরু হয়েছে। আগ্রহী ছাত্র-ছাত্রীদের অফিস থেকে ভর্তি ফরম সংগ্রহ করতে হবে।",show
              "০৫ নভেম্বর, ২০২৩","শীতকালীন ছুটির নোটিশ","আগামী ২০শে ডিসেম্বর থেকে ৫ই জানুয়ারি পর্যন্ত শীতকালীন ছুটি থাকবে।",hide`;

      // true for test data, false for Google Sheet Data
      const useTestData = false;

      if (useTestData) {
        console.log("Using test data");
        processNotices(testData);
      } else {
        // Google Sheets লিংক
        const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFpVqdRkkAhEvrJeTmioOx987QpCAeQlCjwRKZD_D_SjwdYZLBptKPxSpNsAPP5e-_DimfaYYUR0CK/pub?output=csv';
        console.log("Fetching notices from:", sheetURL);
        fetch(sheetURL)
          .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then(data => {
            console.log("Received raw data:", data);
            processNotices(data);
          })
          .catch(error => {
            console.error('Error fetching notices:', error);
            noticeContainer.innerHTML = '<p class="text-center text-red-500">নোটিশ লোড করা সম্ভব হয়নি।</p>';
          });
      }

      // টেক্সট ফরম্যাটিং ফাংশন
      function formatText(text) {
        // নিউলাইন ক্যারেক্টারকে <br> ট্যাগে রূপান্তর করা
        return text.replace(/\n/g, '<br>');
      }
      function processNotices(data) {
        noticeContainer.innerHTML = '';

        // CSV parsing functions
        function parseCSV(text) {
          const rows = [];
          let currentRow = [];
          let currentField = '';
          let inQuotes = false;
          let quoteChar = '"';
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === quoteChar) {
              if (inQuotes && text[i + 1] === quoteChar) {
                currentField += quoteChar;
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              currentRow.push(currentField);
              currentField = '';
            } else if (char === '\n' && !inQuotes) {
              currentRow.push(currentField);
              rows.push(currentRow);
              currentRow = [];
              currentField = '';
            } else {
              currentField += char;
            }
          }
          if (currentField !== '' || currentRow.length > 0) {
            currentRow.push(currentField);
            rows.push(currentRow);
          }
          return rows;
        }
        const rows = parseCSV(data);
        console.log("Total rows:", rows.length);
        if (rows.length <= 1) {
          noticeContainer.innerHTML = '<p class="text-center text-gray-600">কোনো নোটিশ পাওয়া যায়নি।</p>';
          return;
        }

        // Keeping all notices in an array
        const notices = [];
        const headers = rows[0].map(h => h.trim().toLowerCase());
        // The first row is a header, so it is being omitted
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          console.log("Processing row", i, ":", row);
          // Make sure there are at least 4 columns (including the Status column)
          if (row.length >= 4) {
            const noticeDate = row[0].trim();
            const noticeTitle = row[1].trim();
            const noticeDescription = row[2].trim();
            const noticeStatus = row[3].trim().toLowerCase();
            console.log("Processing notice:", { noticeDate, noticeTitle, noticeDescription, noticeStatus });
            // Only notices marked "show" are being retrieved
            if (noticeStatus === 'show') {
              notices.push({
                date: noticeDate,
                title: noticeTitle,
                description: noticeDescription
              });
              console.log("Added notice:", noticeTitle);
            }
          }
        }
        console.log("Filtered notices:", notices);
        // Notices are being sorted in reverse order (bottom to top)
        notices.reverse();
        // Showing a maximum of 3 notices.
        const maxNotices = Math.min(notices.length, 3);
        if (maxNotices === 0) {
          noticeContainer.innerHTML = '<p class="text-center text-gray-600">কোনো নোটিশ পাওয়া যায়নি।</p>';
          return;
        }
        for (let i = 0; i < maxNotices; i++) {
          const notice = notices[i];
          // Taking the first 100 characters of the description
          const shortDescription = notice.description.length > 100
            ? notice.description.substring(0, 100) + '...'
            : notice.description;
          const noticeCard = `
          <div class="bg-green-50 rounded-lg p-6 mb-4 hover:shadow-lg transition cursor-pointer notice-card" 
               data-full-description="${encodeURIComponent(notice.description)}"
               data-title="${encodeURIComponent(notice.title)}"
               data-date="${encodeURIComponent(notice.date)}">
            <div class="flex justify-between items-start flex-col sm:flex-row">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-green-800">${notice.title}</h3>
                <p class="text-gray-600 mt-1 notice-short-description">${shortDescription}</p>
              </div>
              <span class="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4">${notice.date}</span>
            </div>
          </div>
        `;
          noticeContainer.innerHTML += noticeCard;
        }
        // Adding click events to notice cards
        document.querySelectorAll('.notice-card').forEach(card => {
          card.addEventListener('click', function () {
            const title = decodeURIComponent(this.getAttribute('data-title'));
            const fullDescription = decodeURIComponent(this.getAttribute('data-full-description'));
            const date = decodeURIComponent(this.getAttribute('data-date'));
            // Creating popup
            const popup = document.createElement('div');
            popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            popup.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold text-green-800">${title}</h3>
                <button class="close-popup text-gray-500 hover:text-gray-700">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
              <p class="text-gray-600 mb-2">${date}</p>
              <div class="text-gray-700">${formatText(fullDescription)}</div>
            </div>
          `;
            document.body.appendChild(popup);
            // Popup close event
            popup.addEventListener('click', function (e) {
              if (e.target === popup || e.target.classList.contains('close-popup') || e.target.classList.contains('fa-times')) {
                document.body.removeChild(popup);
              }
            });
          });
          // Adding hover effect
          const shortDescription = card.querySelector('.notice-short-description');
          const fullDescription = decodeURIComponent(card.getAttribute('data-full-description'));
          // card.addEventListener('mouseenter', function () {
          //   shortDescription.textContent = fullDescription;
          // });
          card.addEventListener('mouseleave', function () {
            const originalText = fullDescription.length > 90
              ? fullDescription.substring(0, 90) + '.....'
              : fullDescription;
            shortDescription.textContent = originalText;
          });
        });
      }
    });



// Script 2: "View All Notices" button functionality
    document.getElementById('view-all-notices').addEventListener('click', function (e) {
      e.preventDefault();

      // একটি লোডিং পপ-আপ তৈরি করা এবং দেখানো
      const loadingPopup = document.createElement('div');
      loadingPopup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      loadingPopup.innerHTML = `
    <div class="bg-white rounded-lg p-6 shadow-lg flex items-center space-x-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700"></div>
      <p class="text-gray-700">নোটিশ লোড হচ্ছে...</p>
    </div>
  `;
      document.body.appendChild(loadingPopup);
      document.body.style.overflow = 'hidden';

      // CSV পার্সিং ফাংশন
      function parseCSV(text) {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;
        let quoteChar = '"';
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === quoteChar) {
            if (inQuotes && text[i + 1] === quoteChar) {
              currentField += quoteChar;
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
          } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentField.trim());
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
          } else {
            currentField += char;
          }
        }
        if (currentField !== '' || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          rows.push(currentRow);
        }
        return rows;
      }

      // শুধুমাত্র একটি বার্তা দেখানোর জন্য ছোট পপ-আপ
      function showMessagePopup(message) {
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4';
        popup.innerHTML = `
      <div class="bg-white rounded-lg p-8 shadow-xl text-center max-w-sm w-full">
        <p class="text-xl text-gray-800 mb-6">${message}</p>
        <button class="close-popup bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">বন্ধ করুন</button>
      </div>
    `;
        document.body.appendChild(popup);
        function close() {
          if (document.body.contains(popup)) {
            document.body.removeChild(popup);
          }
        }
        popup.querySelector('.close-popup').addEventListener('click', close);
        popup.addEventListener('click', function (e) {
          if (e.target === popup) {
            close();
          }
        });
      }

      // সকল নোটিশ দেখানোর জন্য বড় পপ-আপ
      function showAllNoticesPopup(notices) {
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto';
        popup.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <div class="flex justify-between items-center mb-6 sticky top-0 bg-white py-4 border-b">
          <h3 class="text-2xl font-bold text-green-800">সকল নোটিশ</h3>
          <button class="close-popup text-gray-500 hover:text-gray-700 text-2xl">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div id="all-notices-container"></div>
      </div>
    `;
        document.body.appendChild(popup);
        function close() {
          document.body.removeChild(popup);
        }
        popup.querySelector('.close-popup').addEventListener('click', close);
        popup.addEventListener('click', function (e) {
          if (e.target === popup) {
            close();
          }
        });
        const allNoticesContainer = popup.querySelector('#all-notices-container');
        notices.reverse(); // সর্বশেষ নোটিশ প্রথমে দেখানোর জন্য
        notices.forEach(notice => {
          // টেক্সট ফরম্যাটিং ফাংশন
          function formatText(text) {
            // নিউলাইন ক্যারেক্টারকে <br> ট্যাগে রূপান্তর করা
            return text.replace(/\n/g, '<br>');
          }
          const noticeCard = `
        <div class="bg-green-50 rounded-lg p-6 mb-4 hover:shadow-md transition">
          <div class="flex justify-between items-start flex-col sm:flex-row">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-green-800">${notice.title}</h3>
              <div class="text-gray-700 mt-2">${formatText(notice.description)}</div>
            </div>
            <span class="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4 whitespace-nowrap">${notice.date}</span>
          </div>
        </div>
      `;
          allNoticesContainer.innerHTML += noticeCard;
        });
      }
      // ডেটা প্রসেসিং ফাংশন
      function processData(data) {
        const rows = parseCSV(data);
        const notices = [];
        if (rows.length > 1) {
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length >= 4 && row[3].trim().toLowerCase() === 'show') {
              notices.push({
                date: row[0],
                title: row[1],
                description: row[2]
              });
            }
          }
        }
        // মূল লজিক: নোটিশ সংখ্যা পরীক্ষা করা
        if (notices.length <= 3) {
          showMessagePopup('বর্তমানে আর কোন নোটিশ নেই।');
        } else {
          showAllNoticesPopup(notices);
        }
      }

      // গুগল শিট থেকে ডেটা আনা
      const useTestData = false;
      if (useTestData) {
        // টেস্ট ডেটা এখানে যোগ করতে পারেন
        document.body.removeChild(loadingPopup);
        document.body.style.overflow = 'auto';
      } else {
        const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFpVqdRkkAhEvrJeTmioOx987QpCAeQlCjwRKZD_D_SjwdYZLBptKPxSpNsAPP5e-_DimfaYYUR0CK/pub?output=csv';
        fetch(sheetURL)
          .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
          })
          .then(data => {
            document.body.removeChild(loadingPopup);
            document.body.style.overflow = 'auto';
            processData(data);
          })
          .catch(error => {
            console.error('Error fetching notices:', error);
            document.body.removeChild(loadingPopup);
            document.body.style.overflow = 'auto';
            showMessagePopup('ত্রুটির কারণে নোটিশ লোড করা সম্ভব হয়নি।');
          });
      }
    });
