<?php
/* ==========================================================================
   Contact form handler
   Receives the enquiry from contact.html and emails it to the inbox below.
   Plain PHP, no libraries - works on Hostinger and any normal PHP host.
   ========================================================================== */

// Where enquiries are delivered.
$TO = 'info@blueorbitdigi.com';

// The address the mail is sent FROM. It has to be a real address on your own
// domain, or the host refuses it and spam filters bin it. Using the same
// address for both works and needs no extra setup.
//
// If enquiries start landing in spam, the usual cause is that From and To are
// identical - a pattern filters associate with spoofing. The fix is to create
// website@blueorbitdigi.com in hPanel -> Emails (a plain alias is enough,
// nothing needs to read it) and put it here instead.
$FROM = 'info@blueorbitdigi.com';

// Only accept a real form post.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.html');
    exit;
}

/* Strip anything that could be used to inject extra mail headers. A newline
   in the name or email field would otherwise let a spammer add their own
   Bcc: line and send mail through this form. */
function clean($value) {
    return trim(str_replace(["\r", "\n", "%0a", "%0d", "\0"], '', (string) $value));
}

function field($key) {
    return isset($_POST[$key]) ? clean($_POST[$key]) : '';
}

// A hidden field no human ever sees. If it is filled in, it was a bot -
// answer normally so the bot does not learn anything, but send nothing.
if (field('company_url') !== '') {
    header('Location: contact.html?sent=1');
    exit;
}

$name     = field('name');
$business = field('business');
$email    = field('email');
$phone    = field('phone');
$budget   = field('budget');

// The message body is the one place newlines are allowed.
$details = isset($_POST['details']) ? trim(str_replace("\0", '', $_POST['details'])) : '';

// Checkbox group.
$needs = '-';
if (!empty($_POST['need']) && is_array($_POST['need'])) {
    $needs = implode(', ', array_map('clean', $_POST['need']));
}

// Same two rules the JavaScript enforces, re-checked here because anyone can
// post straight to this file without going through the page.
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: contact.html?error=1');
    exit;
}

$subject = 'Website enquiry - ' . $name;

$body =
    "New enquiry from the website\n" .
    "----------------------------\n\n" .
    "Name:     " . ($name     !== '' ? $name     : '-') . "\n" .
    "Business: " . ($business !== '' ? $business : '-') . "\n" .
    "Email:    " . $email . "\n" .
    "Phone:    " . ($phone    !== '' ? $phone    : '-') . "\n" .
    "Needs:    " . $needs . "\n" .
    "Budget:   " . ($budget   !== '' ? $budget   : '-') . "\n\n" .
    "Message:\n" . ($details !== '' ? $details : '-') . "\n\n" .
    "----------------------------\n" .
    "Sent " . date('D j M Y, g:ia') . "\n" .
    "IP " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers = implode("\r\n", [
    'From: Blue Orbit Digi website <' . $FROM . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',   // hitting Reply answers the enquirer
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
]);

$sent = mail($TO, $subject, $body, $headers, '-f' . $FROM);

header('Location: contact.html?' . ($sent ? 'sent=1' : 'error=1'));
exit;
