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
        const rtUrl = `https://apis.data.go.kr/6260000/BusanTfcghtPrkngInfoService/getTfcghtPrkngInfo?ServiceKey=${apiKey}&pageNo=1&numOfRows=100&resultType=json`;
        const basicUrl = `https://apis.data.go.kr/6260000/BusanPblcPrkngBassInfoService/getPblcPrkngBassInfo?ServiceKey=${apiKey}&pageNo=1&numOfRows=1000&resultType=json`;

        const [listRes, rtRes, basicRes] = await Promise.all([
            fetch(listUrl), 
            fetch(rtUrl), 
            fetch(basicUrl)
        ]);

        const listText = await listRes.text();
        const rtText = await rtRes.text();
        const basicText = await basicRes.text();

        // 만약 공공데이터포털에서 에러 XML이나 인증 에러를 뱉었다면 그 내용을 그대로 반환
        let listData, rtData, basicData;
        try {
            listData = JSON.parse(listText);
            rtData = JSON.parse(rtText);
            basicData = JSON.parse(basicText);
        } catch (e) {
            return Response.json({ 
                success: false, 
                message: "공공데이터가 JSON 형식이 아닙니다 (인증키 오류 또는 서비스 점검 가능성).", 
                raw: listText.substring(0, 200) 
            });
        }

        const parkingList = listData.getPblcPrkngInfo?.body?.items?.item || [];
        const realtimeList = rtData.getTfcghtPrkngInfo?.body?.items?.item || [];
        const basicInfoList = basicData.getPblcPrkngBassInfo?.body?.items?.item || [];

        // 데이터가 왜 비어있는지 추적하기 위한 디버그 정보 포함
        if (parkingList.length === 0) {
            return Response.json({
                success: false,
                message: "목록 API(getPblcPrkngInfo)에서 데이터를 가져오지 못했습니다. 인증키나 API 상태를 확인하세요.",
                debugHeader: listData.getPblcPrkngInfo?.header || listData
            });
        }

        let results = parkingList.map(park => {
            const rt = realtimeList.find(r => r.parkgcd === park.parkgcd) || {};
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