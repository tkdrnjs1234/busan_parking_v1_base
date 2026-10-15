export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const searchName = url.searchParams.get('name') || '';
    
    const apiKey = env.DATA_API_KEY; 

    if (!apiKey) {
        return Response.json({ success: false, message: "Cloudflare 환경변수에 DATA_API_KEY가 설정되지 않았습니다." });
    }

    try {
        const listUrl = `https://apis.data.go.kr/6260000/BusanPblcPrkngInfoService/getPblcPrkngInfo?ServiceKey=${apiKey}&pageNo=1&numOfRows=100&resultType=json`;
        
        const response = await fetch(listUrl);
        const data = await response.json();

        // 올바른 JSON 경로(response.body.items.item)로 수정
        const parkingList = data.response?.body?.items?.item || [];

        let results = parkingList.map(park => {
            return {
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
            };
        });

        // 검색어 필터링
        if (searchName) {
            results = results.filter(p => p.parknm && p.parknm.includes(searchName));
        }

        return Response.json({
            success: true,
            items: results
        });

    } catch (error) {
        return Response.json({ success: false, message: error.message });
    }
}