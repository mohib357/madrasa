// This script fetches and displays all notices from a Google Sheet on a dedicated page.

document.addEventListener('DOMContentLoaded', function () {
    // --- Configuration & DOM Elements ---
    const noticeContainer = document.getElementById('notice-container');
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFpVqdRkkAhEvrJeTmioOx987QpCAeQlCjwRKZD_D_SjwdYZLBptKPxSpNsAPP5e-_DimfaYYUR0CK/pub?output=csv';

    /**
     * Parses raw CSV text into an array of rows.
     * This version is slightly simplified for better readability.
     * @param {string} text - The raw CSV string.
     * @returns {Array<Array<string>>} - An array of rows.
     */
    function parseCSV(text) {
        // Split the text into lines, then process each line.
        const lines = text.trim().split('\n');
        return lines.map(line => line.split(',').map(field => {
            // Remove quotes from start and end of the field if they exist.
            return field.trim().replace(/^"|"$/g, '');
        }));
    }

    /**
     * Processes the fetched data and renders all notices.
     * @param {string} data - Raw CSV data from the fetch request.
     */
    function processNotices(data) {
        noticeContainer.innerHTML = ''; // Clear the "Loading..." message.
        const rows = parseCSV(data);

        // Skip the header row (i=0) and filter for notices with 'show' status.
        const notices = rows.slice(1).map(row => {
            const [date, title, description, status] = row;
            // Use optional chaining (?.) for safety if a status is missing.
            if (status?.trim().toLowerCase() === 'show') {
                return { date, title, description };
            }
            return null; // Return null for rows that shouldn't be shown.
        }).filter(Boolean); // 'filter(Boolean)' removes all null/undefined entries.

        // If no valid notices are found, display a message.
        if (notices.length === 0) {
            noticeContainer.innerHTML = '<p class="text-center text-gray-600">কোনো নোটিশ পাওয়া যায়নি।</p>';
            return;
        }

        // Reverse the array to show the most recent notices first.
        notices.reverse();

        // --- Render Notice Cards ---
        notices.forEach(notice => {
            // Create a summary for the card view.
            const shortDescription = notice.description.length > 100
                ? notice.description.substring(0, 100) + '...'
                : notice.description;

            // Create the HTML for each notice card.
            const noticeCard = `
              <div class="bg-green-50 rounded-lg p-6 mb-4 hover:shadow-lg transition cursor-pointer notice-card" 
                   data-full-description="${encodeURIComponent(notice.description)}"
                   data-title="${encodeURIComponent(notice.title)}"
                   data-date="${encodeURIComponent(notice.date)}">
                <div class="flex justify-between items-start flex-col sm:flex-row">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-green-800">${notice.title}</h3>
                    <p class="text-gray-600 mt-1">${shortDescription}</p>
                  </div>
                  <span class="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4">${notice.date}</span>
                </div>
              </div>
            `;
            noticeContainer.innerHTML += noticeCard;
        });

        // --- Add Click Listeners for Popups ---
        addPopupEventListeners();
    }

    /**
     * Adds click event listeners to all notice cards to open a detailed popup.
     */
    function addPopupEventListeners() {
        document.querySelectorAll('.notice-card').forEach(card => {
            card.addEventListener('click', function () {
                // Retrieve data stored in data-* attributes.
                const title = decodeURIComponent(this.dataset.title);
                const fullDescription = decodeURIComponent(this.dataset.fullDescription);
                const date = decodeURIComponent(this.dataset.date);

                // Create and display the popup.
                createAndShowPopup(title, date, fullDescription);
            });
        });
    }

    /**
     * Creates and displays a popup (modal) with the full notice details.
     * @param {string} title
     * @param {string} date
     * @param {string} description
     */
    function createAndShowPopup(title, date, description) {
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        // The 'whitespace-pre-line' class respects newline characters from the source text.
        popup.innerHTML = `
          <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-green-800">${title}</h3>
              <button class="close-popup text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <p class="text-gray-600 mb-2">${date}</p>
            <p class="text-gray-700 whitespace-pre-line">${description}</p>
          </div>
        `;
        document.body.appendChild(popup);

        // Add event listener to close the popup.
        popup.addEventListener('click', function (e) {
            // Close if the background overlay or the close button is clicked.
            if (e.target === popup || e.target.classList.contains('close-popup')) {
                document.body.removeChild(popup);
            }
        });
    }

    // --- Initial Fetch ---
    fetch(sheetURL)
        .then(response => {
            if (!response.ok) throw new Error('Network issue while fetching notices.');
            return response.text();
        })
        .then(data => processNotices(data))
        .catch(error => {
            console.error(error);
            noticeContainer.innerHTML = '<p class="text-center text-red-500">ত্রুটির কারণে নোটিশ লোড করা সম্ভব হয়নি।</p>';
        });
});