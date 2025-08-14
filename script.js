document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const searchInput = document.getElementById('search-input');
    const autocompleteResults = document.getElementById('autocomplete-results');
    const dynamicContentContainer = document.getElementById('dynamic-content-container');
    const contentTabs = document.querySelector('.content-tabs');
    const modal = document.getElementById('preview-modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.getElementById('modal-close');
    const heroSection = document.querySelector('.hero-section');
    const mobileHeroSection = document.querySelector('.mobile-hero-section');

    let allCategories = [];
    let allWallpapers = [];
    let currentPage = 1;
    const wallpapersPerPage = 10;
    let currentCategory = 'all';

    // Theme and Background Logic
    const toggleRandomBackground = () => {
        const backgrounds = [
            'https://files.catbox.moe/fo6k1n.jpg',
            'https://files.catbox.moe/v64q6f.jpg',
            'https://files.catbox.moe/q9j2a6.jpg',
            'https://files.catbox.moe/s9p10c.jpg',
            'https://files.catbox.moe/p9t9c9.jpg'
        ];
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        body.style.backgroundImage = `url('${randomBg}')`;
    };

    toggleRandomBackground();

    // Sidebar functionality
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            body.style.overflow = 'hidden';
        });
    }

    const closeSidebar = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        body.style.overflow = '';
    };

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Fetch wallpapers data
    const fetchWallpapers = async () => {
        try {
            const response = await fetch('wallpapers.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            allCategories = data.categories;
            allWallpapers = allCategories.flatMap(cat => cat.wallpapers);
            renderCategories();
        } catch (error) {
            console.error('Failed to fetch wallpapers:', error);
            dynamicContentContainer.innerHTML = '<p>Failed to load wallpapers. Please try again later.</p>';
        }
    };

    // Render Categories
    const renderCategories = () => {
        if (!dynamicContentContainer) return;

        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'glass-card-grid';

        allCategories.forEach(category => {
            const categoryCard = document.createElement('a');
            categoryCard.href = '#';
            categoryCard.className = 'glass-card';
            categoryCard.dataset.category = category.id;

            const categoryImage = document.createElement('img');
            categoryImage.src = category.category_image_url;
            categoryImage.alt = `${category.name} wallpapers`;

            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category.name;

            categoryCard.appendChild(categoryImage);
            categoryCard.appendChild(categoryTitle);
            categoryGrid.appendChild(categoryCard);
        });

        dynamicContentContainer.innerHTML = '';
        dynamicContentContainer.appendChild(categoryGrid);
    };

    // Render Wallpapers
    const renderWallpapers = (categoryId, page = 1) => {
        if (!dynamicContentContainer) return;

        let selectedCategory = allCategories.find(cat => cat.id === categoryId);
        let wallpapersToRender = selectedCategory ? selectedCategory.wallpapers : allWallpapers;

        const startIndex = (page - 1) * wallpapersPerPage;
        const endIndex = startIndex + wallpapersPerPage;
        const wallpapersToDisplay = wallpapersToRender.slice(startIndex, endIndex);

        const wallpaperGrid = document.createElement('div');
        wallpaperGrid.className = 'wallpaper-grid';

        wallpapersToDisplay.forEach(wallpaper => {
            const wallpaperCard = document.createElement('div');
            wallpaperCard.className = 'wallpaper-card';
            wallpaperCard.dataset.id = wallpaper.id;

            const wallpaperImage = document.createElement('img');
            wallpaperImage.src = wallpaper.url;
            wallpaperImage.alt = wallpaper.title;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            const previewBtn = document.createElement('button');
            previewBtn.className = 'preview-btn';
            previewBtn.textContent = 'Preview';
            previewBtn.dataset.url = wallpaper.url;

            const downloadBtn = document.createElement('a');
            downloadBtn.href = wallpaper.url;
            downloadBtn.className = 'download-btn';
            downloadBtn.download = `${wallpaper.title}.jpg`;
            downloadBtn.textContent = 'Download';

            buttonContainer.appendChild(previewBtn);
            buttonContainer.appendChild(downloadBtn);
            wallpaperCard.appendChild(wallpaperImage);
            wallpaperCard.appendChild(buttonContainer);
            wallpaperGrid.appendChild(wallpaperCard);
        });

        dynamicContentContainer.innerHTML = '';
        dynamicContentContainer.appendChild(wallpaperGrid);
        renderPagination(wallpapersToRender.length, page);
    };

    // Pagination
    const renderPagination = (totalItems, currentPage) => {
        const totalPages = Math.ceil(totalItems / wallpapersPerPage);
        if (totalPages <= 1) return;

        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.className = 'page-btn';
        if (currentPage === 1) prevBtn.classList.add('disabled');
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                renderWallpapers(currentCategory, currentPage - 1);
            }
        });

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.className = 'page-btn';
        if (currentPage === totalPages) nextBtn.classList.add('disabled');
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                renderWallpapers(currentCategory, currentPage + 1);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(nextBtn);
        dynamicContentContainer.appendChild(paginationContainer);
    };

    // Event listeners for new layout
    if (contentTabs) {
        contentTabs.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = e.target;
            if (tab.classList.contains('content-tab')) {
                document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.textContent === 'Categories') {
                    renderCategories();
                } else if (tab.textContent === 'New') {
                    // Placeholder for 'New' tab logic
                    currentCategory = 'all';
                    renderWallpapers(currentCategory);
                } else if (tab.textContent === 'Popular') {
                    // Placeholder for 'Popular' tab logic
                    currentCategory = 'all';
                    renderWallpapers(currentCategory);
                }
            }
        });
    }

    if (dynamicContentContainer) {
        dynamicContentContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.glass-card');
            if (card) {
                e.preventDefault();
                currentCategory = card.dataset.category;
                renderWallpapers(currentCategory);
            }
        });
    }

    // Initial render based on URL hash
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        document.querySelectorAll('.nav-link-item').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.id === hash) {
                link.classList.add('active');
            }
        });

        if (heroSection) heroSection.style.display = 'none';
        if (mobileHeroSection) mobileHeroSection.style.display = 'none';

        if (hash === 'categories' || hash === 'home' || hash === '') {
            if (window.innerWidth <= 768) {
                if (mobileHeroSection) mobileHeroSection.style.display = 'flex';
            } else {
                if (heroSection) heroSection.style.display = 'flex';
            }
            renderCategories();
        } else if (hash === 'search') {
            dynamicContentContainer.innerHTML = `<h2 class="section-title">Search Page</h2>`;
        } else if (hash === 'contact') {
            dynamicContentContainer.innerHTML = `<h2 class="section-title">Contact Page</h2>`;
        }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('resize', handleHashChange);

    // Initial calls
    fetchWallpapers();
    handleHashChange();
});
