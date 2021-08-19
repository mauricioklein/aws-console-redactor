# AWS Console Refactor

Greasemonkey script that redacts sensitive information on your AWS Console.

## How it works

This script works by watching text nodes in your AWS Console DOM and replacing
those with sensitive data by a link with `[REDACTED]` text.

When clicked, this link will copy the sensitive data to your clipboard.

## ATTENTION

Use this script at your own risk.

Due to Greasemonkey characteristics, there's a very short delay where the original sensitive data
is still visible at your console. If you're recording your screen, someone checking the video frame by
frame can still spot sensitive data.

The author isn't responsible by the consequences of using this script
