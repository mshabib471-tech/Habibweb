<?php
// ১. রেসপন্স হেডার সেট করা
header("Access-Control-Allow-Origin: *");

// ২. Clipdrop এর ফ্রি API Key এখানে বসান
$apiKey = '7c248e0b55e6f238c8034604c309ff7cdc4a5f7c5cfccfe71e59ec9d7ee70b8c223c527bc738e38ee0c0f9ab0569cee4';

// ৩. URL থেকে ছবির লিঙ্ক চেক করা
if (!isset($_GET['image']) || empty($_GET['image'])) {
    http_response_code(400);
    header("Content-Type: application/json");
    echo json_encode(["status" => "error", "message" => "Please provide an image URL. Example: api.php?image=IMAGE_URL"]);
    exit;
}

$imageUrl = $_GET['image'];

// ৪. ডাইনামিক URL থেকে ছবি ডাউনলোড করে টেম্পোরারি ফাইলে রাখা
$tempInputPath = sys_get_temp_dir() . '/' . uniqid('input_') . '.jpg';
$imageContent = @file_get_contents($imageUrl);

if ($imageContent === FALSE) {
    http_response_code(400);
    header("Content-Type: application/json");
    echo json_encode(["status" => "error", "message" => "Failed to download image from the provided URL."]);
    exit;
}

file_put_contents($tempInputPath, $imageContent);

// ৫. cURL এর মাধ্যমে Clipdrop API-তে ছবি পাঠানো
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://clipdrop-api.co/remove-background/v1');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'x-api-key: ' . $apiKey
]);

// Multipart Form-Data দিয়ে ফাইল পাঠানো
$postData = [
    'image_file' => new CURLFile($tempInputPath, 'image/jpeg', 'image.jpg')
];

curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// টেম্পোরারি ডাউনলোড করা ফাইল মুছে ফেলা
@unlink($tempInputPath);

// ৬. রেসপন্স হ্যান্ডেল করা
if ($httpCode === 200 && !empty($response)) {
    // সরাসরি ব্যাকগ্রাউন্ড রিমুভ করা PNG ছবি ব্রাউজারে আউটপুট দেওয়া
    header("Content-Type: image/png");
    echo $response;
    exit;
} else {
    // সমস্যা হলে এরর মেসেজ দেখাবে
    http_response_code($httpCode > 0 ? $httpCode : 500);
    header("Content-Type: application/json");
    echo json_encode([
        "status" => "error",
        "message" => "Failed to process image with AI API.",
        "details" => json_decode($response, true)
    ]);
    exit;
}
?>
