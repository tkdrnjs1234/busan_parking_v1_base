import { fetchBusanParkingData } from '../services/parkingService';

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const searchName = url.searchParams.get('name') || '';
    
    const apiKey = env.DATA_API_KEY; 

    if (!apiKey) {
        return Response.json({ success: false, message: "Cloudflare 환경변수에 DATA_API_KEY가 설정되지 않았습니다." });
    }

    try {
        const results = await fetchBusanParkingData(apiKey, searchName);

        return Response.json({
            success: true,
            items: results
        });

    } catch (error) {
        return Response.json({ success: false, message: error.message });
    }
}