<?php

header('Content-Type: application/json');
function sendCurlRequest($url, $postData, $headers) {
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => $postData,
        CURLOPT_HTTPHEADER => $headers,
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        die(json_encode(["error" => "cURL Error", "message" => $err])); 
    }

    return $response;
}

$msisdn = $_REQUEST['num'] ?? null;
$nid = $_REQUEST['nid'] ?? null;
$dob = $_REQUEST['dob'] ?? null;

if (!$msisdn || !$nid || !$dob) {
    die(json_encode(["error" => "Missing Parameters", "message" => "msisdn, nid, or dob is required."]));
}


$headers = [
    'User-Agent: okhttp/5.0.0-alpha.10',
    'Connection: Keep-Alive',
    'Accept-Encoding: gzip',
    'device-token: c2r3mvSlSTifyw3iQB5JwW:APA91bFYAe1icbyjTFPZaDp0bmTjk40uuDIf-vjLx0m6avQlg9_uKBdiJ50PoDV_tAaejQcVes9Aw4aKUKDEIXcsnoE3z6nYGfgAF1g5H7TIm187gb95Rr4',
    'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjlkNTQ1ZjNiZWYyOTQwM2Q0MjAyMjUxOWYyZjFlMTM0NGU3YWFmYjkyYmMyZmNkYTkwMDg1NDgzYzhmZTdlMTE3OWQwY2ViN2U5MGQ3ZmE1In0.eyJhdWQiOiJmOGViZTc2MC0wZWIzLTExZWEtOGIwOC00M2E4MmNjOWQxOGMiLCJqdGkiOiI5ZDU0NWYzYmVmMjk0MDNkNDIwMjI1MTlmMmYxZTEzNDRlN2FhZmI5MmJjMmZjZGE5MDA4NTQ4M2M4ZmU3ZTExNzlkMGNlYjdlOTBkN2ZhNSIsImlhdCI6MTczMzY4NTA0MSwibmJmIjoxNzMzNjg1MDQxLCJleHAiOjE3NjUyMjEwNDEsInN1YiI6IjM1MzE3NjM1Iiwic2NvcGVzIjpbXX0.0Bpf2cpg6ldVuTA4H3ezZUl0EuoPJxQGjDmmE_H4CLvlrbPDutKBLf1lR4y1crtnUarJOqAbfSt9f18r0D4HIP94nGJRNSJzMCAeLApOrw2wsqjSRfNRIz3hHCwKl-pr0-1sNAc-pXXw4ROKG8Bf8pP5imXoA9NMBRQRpzqZgmvr3DRWYHO0pxktPsabTH17wQBQ7xSBWVoGdS6Pi9ugZvgR6tQKCxTt4Rh--rbdKLp-4t69q583uqOvPrPVpuJJ5hXplro11qhIT-MuK0b3ryVWXEEEB-iJ7wvTiBpDjjguGaN9UMTvp9ZyO3WtghUjSMakILCb1wEw7NGFxFcdzvYoZl4-0PfPvInH7xDGFOIRL6fHjoUoUlQJW_tq0mPTSklNiQUI2H9o_yat7uHrSDUJof_WUpBjqEpbKOSV_cOiRJNtCBMo4sa_zPQZasyEk3G5StNRUtJevilEdKFvjcu6SygAiDOFq5uf0IHtxPAYS_rgW1oVTUyKCdtra197mCVlYtreDaCp1RXsRE0a9M-g48oWx2SssQyxYYZl_ql30T5wONbuI6TJPSRmXB2aZ6koTpRJ--_8bBy6-KkDT8deJG63mGsJJ8suIvtGLOKBGLZ0djzuXmfhzha-_44moyFAAwdvtScKcpgF66pPL22ruzSmzNc-kTe2RNXjV2s',
    'Accept-Language: en',
    'platform: android',
    'app-version: 11.17.0',
    'version-code: 1117000',
    'api-client-pass: 1E6F751EBCD16B4B719E76A34FBA9',
    'msisdn: 01936503139',
    'connection-type: prepaid',
    'X-Entitlements: PREPAID',
    'Content-Type: application/json; charset=UTF-8',
];


$initiateUrl = 'https://myblapi.banglalink.net/api/v1/sim-bar/initiate';
$initiateData = json_encode(['dob' => $dob, 'msisdn' => $msisdn, 'nid' => $nid]);

$response = sendCurlRequest($initiateUrl, $initiateData, $headers);
$responseData = json_decode($response, true);

if ($responseData['status'] === 'SUCCESS' && isset($responseData['data']['tran_id'])) {
    $tranId = $responseData['data']['tran_id'];


    $updateUrl = 'https://myblapi.banglalink.net/api/v1/sim-bar/update';
    $updateData = json_encode(['tran_id' => $tranId]);

    $updateResponse = sendCurlRequest($updateUrl, $updateData, $headers);
    echo $updateResponse;
} else {
    die(json_encode(["error" => "Failed to initiate SIM bar", "response" => $response]));
}