document.getElementById('searchBtn').addEventListener('click', async () => {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        alert('검색어를 입력해주세요.');
        return;
    }

    const resultsDiv = document.getElementById('results');
    const countDiv = document.getElementById('resultCount');
    
    resultsDiv.innerHTML = '<p>검색 중입니다...</p>';
    countDiv.innerHTML = '';

    try {
        // Cloudflare Function 통합 API 호출
        const response = await fetch(`/api/parking?name=${encodeURIComponent(keyword)}`);
        const data = await response.json();

        if (!data.success) {
            resultsDiv.innerHTML = `<p>오류가 발생했습니다: ${data.message}</p>`;
            return;
        }

        if (data.items.length === 0) {
            resultsDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
            return;
        }

        // 결과 카드 출력
        countDiv.innerHTML = `<p style="color: #666; margin-bottom: 15px;">검색 결과 ${data.items.length}건</p>`;
        resultsDiv.innerHTML = data.items.map(parking => `
            <div class="card">
                <h2>${parking.parknm}</h2>
                <div class="available">현재 주차가능 ${parking.curravacnt ?? '-'}대</div>
                <div class="info-grid">
                    <div class="info-item"><label>총 주차면수</label><span>${parking.maxcnt ?? '-'}대</span></div>
                    <div class="info-item"><label>현재 주차대수</label><span>${parking.parkingcnt ?? '-'}대</span></div>
                    <div class="info-item"><label>주소</label><span>${parking.doroAddr || parking.jibunAddr || '정보 없음'}</span></div>
                    <div class="info-item"><label>기본요금</label><span>${parking.pkBascTime ? parking.pkBascTime + '분 ' + parking.tenMin + '원' : '정보 없음'}</span></div>
                    <div class="info-item"><label>운영시간</label><span>${parking.svcSrtTe || '-'} ~ ${parking.svcEndTe || '-'}</span></div>
                    <div class="info-item"><label>관리기관</label><span>${parking.guNm || '-'}</span></div>
                </div>
                <div class="update-time">최종 갱신: ${parking.lastupdatetime || '-'}</div>
            </div>
        `).join('');
    } catch (error) {
        resultsDiv.innerHTML = '<p>데이터를 불러오는 중 문제가 발생했습니다.</p>';
        console.error('Fetch Error:', error);
    }
});

// 엔터키로 검색 가능하게 지원
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});