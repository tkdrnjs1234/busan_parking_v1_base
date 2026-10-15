import { fetchParkingData } from './api.js';
import { renderLoading, renderError, renderEmpty, renderResults } from './ui.js';

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const countDiv = document.getElementById('resultCount');

async function handleSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
        alert('검색어를 입력해주세요.');
        return;
    }

    renderLoading(resultsDiv, countDiv);

    try {
        const data = await fetchParkingData(keyword);

        if (!data.success) {
            renderError(resultsDiv, data.message);
            return;
        }

        if (data.items.length === 0) {
            renderEmpty(resultsDiv);
            return;
        }

        renderResults(resultsDiv, countDiv, data.items);

    } catch (error) {
        resultsDiv.innerHTML = '<p>데이터를 불러오는 중 문제가 발생했습니다.</p>';
        console.error('Fetch Error:', error);
    }
}

searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});