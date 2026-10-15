export async function fetchBusanParkingData(apiKey, searchName) {
    const listUrl = `https://apis.data.go.kr/6260000/BusanPblcPrkngInfoService/getPblcPrkngInfo?ServiceKey=${apiKey}&pageNo=1&numOfRows=100&resultType=json`;
    
    const response = await fetch(listUrl);
    const data = await response.json();

    const parkingList = data.response?.body?.items?.item || [];

    let results = parkingList.map(park => ({
        parkgcd: park.mgntNum,
        parknm: park.pkNam,
        maxcnt: park.pkCnt,
        parkingcnt: '-',
        curravacnt: park.currava || '-',
        lastupdatetime: park.fnlDt,
        doroAddr: park.doroAddr,
        jibunAddr: park.jibunAddr,
        pkBascTime: park.pkBascTime,
        tenMin: park.feeAdd || park.tenMin || '0',
        svcSrtTe: park.svcSrtTe,
        svcEndTe: park.svcEndTe,
        guNm: park.guNm
    }));

    if (searchName) {
        results = results.filter(p => p.parknm && p.parknm.includes(searchName));
    }

    return results;
}