export async function fetchParkingData(keyword) {
    const response = await fetch(`/api/parking?name=${encodeURIComponent(keyword)}`);
    const data = await response.json();
    return data;
}