export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const searchName = url.searchParams.get('name') || '';
    
    // Cloudflare 환경변수에 등록한 인증키 사용
    const apiKey = env.DATA_API_KEY; 

    if (!apiKey) {
        return Response.json({ success: false, message: "Cloudflare 환경변수에 DATA_API_KEY가 설정되지 않았습니다." });
    }

    try {
        // 1. API ① 시설공단 주차장 목록
        const listUrl = `http://apis.data.go.kr/6260000/BusanPblcPrkngInfoService/getPblcPrkngInfo?serviceKey=${apiKey}&pageNo=1&numOfRows=100&resultType=json`;
        
        // 2. API ② 시설공단 실시간 현황
        const rtUrl = `http://apis.data.go.kr/6260000/BusanTfcghtPrkngInfoService/getTfcghtPrkngInfo?serviceKey=${apiKey}&pageNo=1&numOfRows=100&resultType=json`;
        
        // 3. API ③ 부산시 기본정보
        const basicUrl = `http://apis.data.go.kr/6260000/BusanPblcPrkngBassInfoService/getPblcPrkngBassInfo?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&resultType=json`;

        // V1.0 특징: 세 개의 API를 동시에 호출하여 시간을 단축
        const [listRes, rtRes, basicRes] = await Promise.all([
            fetch(listUrl), 
            fetch(rtUrl), 
            fetch(basicUrl)
        ]);

        const listData = await listRes.json();
        const rtData = await rtRes.json();
        const basicData = await basicRes.json();

        // 응답 데이터에서 배열만 안전하게 추출
        const parkingList = listData.getPblcPrkngInfo?.body?.items?.item || [];
        const realtimeList = rtData.getTfcghtPrkngInfo?.body?.items?.item || [];
        const basicInfoList = basicData.getPblcPrkngBassInfo?.body?.items?.item || [];

        // 4. 데이터 통합 및 매칭
        let results = parkingList.map(park => {
            // 실시간 현황은 코드가 일치하는 것(parkgcd)을 매칭
            const rt = realtimeList.find(r => r.parkgcd === park.parkgcd) || {};
            
            // 기본정보는 이름으로 대략적인 매칭 진행 (V1.0 방식)
            const basic = basicInfoList.find(b => b.pkNam && b.pkNam.includes(park.parknm)) || {};

            return {
                parkgcd: park.parkgcd,
                parknm: park.parknm,
                maxcnt: rt.maxcnt,
                parkingcnt: rt.parkingcnt,
                curravacnt: rt.curravacnt,
                lastupdatetime: rt.lastupdatetime,
                doroAddr: basic.doroAddr,
                jibunAddr: basic.jibunAddr,
                pkBascTime: basic.pkBascTime,
                tenMin: basic.tenMin,
                svcSrtTe: basic.svcSrtTe,
                svcEndTe: basic.svcEndTe,
                guNm: basic.guNm
            };
        });

        // 5. 사용자가 입력한 검색어가 있으면 필터링
        if (searchName) {
            results = results.filter(p => p.parknm.includes(searchName));
        }

        // 6. 결과 반환
        return Response.json({
            success: true,
            items: results
        });

    } catch (error) {
        return Response.json({ success: false, message: error.message });
    }
}