// Global variables
let wallpaperData = { categories: [] };
let currentPage = 1;
const itemsPerPage = 20;

// DOM elements
const mainContent = document.querySelector('.content');
const navLinksContainer = document.getElementById('nav-links-container');
const searchInput = document.getElementById('search-input');
const searchToggle = document.getElementById('search-toggle');
const searchContainer = document.getElementById('search-container');
const searchClose = document.getElementById('search-close');
const menuToggle = document.getElementById('menu-toggle');
const modal = document.createElement('div');
const autocompleteResults = document.getElementById('autocomplete-results');

// Setup modal element
modal.className = 'modal';
modal.innerHTML = `
    <img src="" class="modal-image" alt="Full-size wallpaper preview">
    <button class="modal-close"><i class="fas fa-times"></i></button>
`;
document.body.appendChild(modal);

// Function to safely extract keywords
const extractKeywords = (url) => {
    try {
        const fullFileName = url.split('/').pop();
        if (!fullFileName || fullFileName.includes('favicon')) {
            return [];
        }
        const fileNameWithoutExt = fullFileName.substring(0, fullFileName.lastIndexOf('.'));
        if (fileNameWithoutExt) {
            return fileNameWithoutExt.split('-').map(kw => kw.toLowerCase());
        }
    } catch (e) {
        console.error('Failed to extract keywords from URL:', url, e);
    }
    return [];
};

// Main function to fetch and render data
const fetchDataAndRender = async () => {
    try {
        const response = await fetch('wallpapers.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        wallpaperData = await response.json();

        // Process data to include keywords from filenames
        wallpaperData.categories.forEach(category => {
            category.wallpapers.forEach(wallpaper => {
                const fileKeywords = extractKeywords(wallpaper.url);
                if (!wallpaper.keywords) {
                    wallpaper.keywords = [];
                }
                wallpaper.keywords.push(...fileKeywords);
            });
        });

        renderCategories(wallpaperData.categories);
        renderNavLinks(wallpaperData.categories);
        renderHomePage();
    } catch (error) {
        console.error('Could
