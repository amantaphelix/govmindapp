// Global variables
let currentPage = 1;
let totalPages = 1;
let newsItems = [];
let selectedNewsId = null;

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    fetchNews(1); // Fetch initial news data

    // Search form submission
    document.getElementById('filter-form').addEventListener('submit', function (e) {
        e.preventDefault();
        fetchNews(1);
    });

    // Attach event listeners for cancel buttons
    setupModalCancelListeners();
});

function renderPagination(totalPages, currentPage) {
    console.log("DEBUG: renderPagination called");  // Debugging log
    const pageInfo = document.getElementById("page-info");
    const prevPageItem = document.getElementById("prev-page-item");
    const nextPageItem = document.getElementById("next-page-item");

    if (!pageInfo || !prevPageItem || !nextPageItem) {
        console.error("Pagination elements not found in DOM");
        return;
    }

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevPageItem.classList.toggle("disabled", currentPage <= 1);
    nextPageItem.classList.toggle("disabled", currentPage >= totalPages);

    prevPageItem.onclick = function () {
        if (currentPage > 1) {
            fetchNews(currentPage - 1);
        }
    };

    nextPageItem.onclick = function () {
        if (currentPage < totalPages) {
            fetchNews(currentPage + 1);
        }
    };
}

function fetchNews(page = 1) {
    if (page < 1) return;

    currentPage = page;
    const search = document.getElementById("search-input")?.value || '';
    const date = document.getElementById("date-filter")?.value || '';
    const sentiment = document.getElementById("sentiment-select")?.value || '';
    const category = document.getElementById("department-select")?.value || '';  // Fixed naming

    let url = `${fetchNewsUrl}?search=${encodeURIComponent(search)}&date=${encodeURIComponent(date)}&sentiment=${encodeURIComponent(sentiment)}&category=${encodeURIComponent(category)}&page=${page}`;

    console.log("DEBUG: Fetching news with URL:", url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("DEBUG: News data received", data);
            const newsGrid = document.getElementById("news-grid");
            newsGrid.innerHTML = "";

            if (data.news.length > 0) {
                newsItems = data.news;
                data.news.forEach(article => {
                    const card = document.createElement("div");
                    card.className = "col";
                    card.innerHTML = `
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <img src="${article.image_url || '/static/default.jpeg'}"
                                    class="img-fluid mb-3" style="object-fit: cover; height: 200px; border-radius: 8px;">
                                <h3 class="card-title fs-5">${article.title}</h3>
                                <p class="text-muted"><strong>Source:</strong> ${article.source}</p>
                                <p class="text-muted"><strong>Sentiment:</strong> ${article.sentiment}</p>
                                <p class="text-muted"><strong>Department:</strong> ${article.category}</p>
                                
                                <div class="mt-3">
                                <a href="/news/news_get/${article.article_id}/" class="btn btn-success btn-sm rounded-pill">
                                    Read More
                                </a>
                                    <button class="btn btn-danger delete-news-btn" data-news-id="${article.article_id}">Delete</button>
                                </div>
                            </div>
                        </div>`;
                    newsGrid.appendChild(card);
                });
            } else {
                newsGrid.innerHTML = `<div class="col-12 text-center"><p class="text-danger">No news articles found.</p></div>`;
            }

            renderPagination(data.total_pages, currentPage);
        })
        .catch(error => console.error("Error fetching news:", error));
}


// Handle Delete button click
document.addEventListener('click', function (e) {
    if (e.target.matches('.delete-news-btn') || e.target.closest('.delete-news-btn')) {
        const newsId = e.target.closest('.delete-news-btn').dataset.newsId;
        showDeleteModal(newsId);
    }
});

// Show delete confirmation modal
function showDeleteModal(newsId) {
    document.getElementById('deleteNewsId').value = newsId;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();
}

// Delete news item
function deleteNews() {
    const newsId = document.getElementById('deleteNewsId').value;
    if (!newsId) return console.error('No news ID provided for deletion.');

    fetch(`/news/delete/${newsId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to delete news: ${response.statusText}`);
        return response.json();
    })
    .then(() => {
        alert('News deleted successfully.');
        closeModal('deleteConfirmModal');
        fetchNews(currentPage); // Reload news list
    })
    .catch(error => alert('Error deleting news: ' + error.message));
}



// Ensure Cancel buttons remove the dim effect
function setupModalCancelListeners() {
    document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
        button.addEventListener('click', function () {
            const modal = bootstrap.Modal.getInstance(button.closest('.modal'));
            if (modal) modal.hide();
            removeModalBackdrop();
        });
    });
}

// Close modal properly and restore screen
function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) modal.hide();
    removeModalBackdrop();
}

// Remove modal backdrop and enable scrolling
function removeModalBackdrop() {
    setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = "auto";
    }, 300);
}

// Attach event listeners for cancel buttons
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteNews);
    document.getElementById('saveNewsBtn').addEventListener('click', saveUpdatedNews);
    document.getElementById('cancelEditBtn').addEventListener('click', () => closeModal('editNewsModal'));
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteConfirmModal'));
});
