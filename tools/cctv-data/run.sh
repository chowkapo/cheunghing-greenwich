node cctv-to-json.js cctv-data-utf8.txt > cctv-data.json
cp cctv-data.json ../../mobile/GreenwichApp/src/resources/data

node map-to-json.js cctv-map-data-utf8.txt > cctv-map-data.ts
cp cctv-map-data.ts ../../mobile/GreenwichApp/src/resources/data
