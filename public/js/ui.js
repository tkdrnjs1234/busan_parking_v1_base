export function renderLoading(resultsDiv, countDiv) {
    resultsDiv.innerHTML = '<p>검색 중입니다...</p>';
    countDiv.innerHTML = '';
}

export function renderError(resultsDiv, message) {
    resultsDiv.innerHTML = `<p>오류가 발생했습니다: ${message}</p>`;
}

export function renderEmpty(resultsDiv) {
    resultsDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
}

export function renderResults(resultsDiv, countDiv, items) {
    countDiv.innerHTML = `<p style="color: #666; margin-bottom: 15px;">검색 결과 ${items.length}건</p>`;
    resultsDiv.innerHTML = items.map(parking => `
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
}