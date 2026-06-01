<?php
/**
 * Alsonex contact form handler (STUB).
 *
 * WHY THIS LIVES IN public/:
 *   Astro outputs a static site, but cPanel runs PHP. Anything in Astro's
 *   public/ directory is copied verbatim into the build output (dist/), which
 *   the deploy workflow uploads into the host's public_html. So this file ends
 *   up at https://<site>/contact-handler.php and the contact form posts to it.
 *
 * WHAT IT DOES:
 *   Validates input, checks the honeypot + (placeholder) captcha, then emails
 *   the enquiry to info@alsonex.com.au. The mailbox is local to the cPanel host,
 *   so local mail delivery via PHP mail() is expected to work out of the box.
 *   For better deliverability/DKIM, swap mail() for PHPMailer SMTP (see below).
 *
 * CONFIG REQUIRED BEFORE LAUNCH (see System/CLAUDE.md):
 *   - TO_EMAIL                : recipient mailbox (default info@alsonex.com.au)
 *   - CAPTCHA_SECRET          : reCAPTCHA/hCaptcha server-side secret
 *   - CAPTCHA_VERIFY_ENDPOINT : provider verify URL
 *   - (optional) PHPMailer SMTP credentials if not using local mail()
 *
 * This is a STUB: the happy path works with mail(); captcha verification is
 * scaffolded but disabled until a real provider + keys are wired in.
 */

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const TO_EMAIL = 'info@alsonex.com.au';
const SITE_NAME = 'Alsonex Pharmaceuticals';

// CAPTCHA — leave empty to skip verification (stub mode). Fill before launch.
const CAPTCHA_SECRET = '';                                          // server secret
const CAPTCHA_VERIFY_ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fail(int $code, string $msg): never {
    http_response_code($code);
    header('Content-Type: text/plain; charset=utf-8');
    echo $msg;
    exit;
}

function clean(string $v): string {
    return trim(filter_var($v, FILTER_UNSAFE_RAW, FILTER_FLAG_STRIP_LOW));
}

// ---------------------------------------------------------------------------
// 1. Method guard
// ---------------------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Method Not Allowed');
}

// ---------------------------------------------------------------------------
// 2. Honeypot — real users never fill alx_company; bots do.
// ---------------------------------------------------------------------------
if (!empty($_POST['alx_company'] ?? '')) {
    // Pretend success so bots don't learn they were caught.
    http_response_code(200);
    echo 'Thank you. Your enquiry has been sent.';
    exit;
}

// ---------------------------------------------------------------------------
// 3. CAPTCHA (placeholder) — only enforced once CAPTCHA_SECRET is set.
// ---------------------------------------------------------------------------
if (CAPTCHA_SECRET !== '') {
    $token = $_POST['g-recaptcha-response'] ?? ($_POST['h-captcha-response'] ?? '');
    if ($token === '') {
        fail(400, 'Captcha verification failed.');
    }
    $resp = @file_get_contents(
        CAPTCHA_VERIFY_ENDPOINT,
        false,
        stream_context_create([
            'http' => [
                'method'  => 'POST',
                'header'  => 'Content-Type: application/x-www-form-urlencoded',
                'content' => http_build_query([
                    'secret'   => CAPTCHA_SECRET,
                    'response' => $token,
                    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
                ]),
            ],
        ])
    );
    $ok = $resp ? (json_decode($resp, true)['success'] ?? false) : false;
    if (!$ok) {
        fail(400, 'Captcha verification failed.');
    }
}

// ---------------------------------------------------------------------------
// 4. Validate input
// ---------------------------------------------------------------------------
$name    = clean($_POST['name'] ?? '');
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$message = clean($_POST['message'] ?? '');

if ($name === '' || $email === false || $message === '') {
    fail(400, 'Please complete all fields with a valid email address.');
}

// ---------------------------------------------------------------------------
// 5. Send — local mail() (cPanel local delivery to info@alsonex.com.au).
//    To use PHPMailer/SMTP instead, install via Composer and replace this
//    block (see System/CLAUDE.md "Contact form" section).
// ---------------------------------------------------------------------------
$subject = "Website enquiry — {$name}";
$body    = "Name: {$name}\nEmail: {$email}\n\nMessage:\n{$message}\n";
$headers = implode("\r\n", [
    'From: ' . SITE_NAME . ' <info@alsonex.com.au>',
    "Reply-To: {$name} <{$email}>",
    'Content-Type: text/plain; charset=utf-8',
    'X-Mailer: PHP/' . phpversion(),
]);

$sent = mail(TO_EMAIL, $subject, $body, $headers);

if (!$sent) {
    fail(500, 'Sorry, the message could not be sent. Please email info@alsonex.com.au directly.');
}

// Plain success for the stub. A production build can redirect to a thank-you page.
http_response_code(200);
header('Content-Type: text/plain; charset=utf-8');
echo 'Thank you. Your enquiry has been sent.';
