// ==UserScript==
// @name         AWS Console Redactor
// @description  Redact sensitive information on your AWS Console
// @version      0.1
// @author       https://github.com/mauricioklein
// @license      MIT
// @include      https://*console.aws.amazon.com/*
// @grant        none
// @run-at       document-start

// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// ==/UserScript==

// ==OpenUserJS==
// @author mklein
// ==/OpenUserJS==
var btargetsFound;
var UPDATE_FREQUENCY_MS = 300;

this.$ = this.jQuery = jQuery.noConflict(true);

watchForElements(queryAccountId, "accountId", function (element) {
  const accountId = element[0].textContent;

  redactPattern(accountId); // Redact by account ID
  redactPattern("arn:aws"); // Redact all ARNs
  redactPattern("Account:"); // Redact trusted accounts on IAM roles list view


  const accInheader = accountId.substring(0,4) + "-" + accountId.substring(4,8) + "-" + accountId.substring(8);
  redactPattern(accInheader); // the banner, where account number is hyphenated 1234-5678-9876 format

});

/**
 * Redact all text elements matching the given pattern
 */
function redactPattern(pattern) {
  const queryFn = function () {
    return getTextElementsMatchingPattern(pattern);
  };

  watchForElements(
    queryFn,
    pattern,
    function (element) {
      const node = element[0];
      replaceByRedactedLink(node);
    },
    false
  );
}

/**
 * Replace a node containing sensitive data
 * by a link with "[REDACTED]" text.
 *
 * When clicked, the link will copy the original
 * sensitive data to clipboard
 */
function replaceByRedactedLink(node) {
  const redactedLink = $("<a>", {
    href: "#",
    style: "color: inherit;",
    text: "[🔒🔒🔒🔒🔒]",
    title: ""+node.data,
    click: function (event) {
      event.preventDefault();
      copyToClipboard(node.textContent);
    },
  });

  redactedLink.insertAfter(node);
  node.remove();
}

/**
 * Copy "data" to clipboard
 */
function copyToClipboard(data) {

  (async()=>
  {
      await navigator.clipboard.writeText(data.trim());
      alert("Copied to clipboard!");
  })();

  // Fixed error regarding document not in focus.
}

/**
 * Return the span element containing the AWS account ID
 */
function queryAccountId() {
  return $('span[data-testid="aws-my-account-details"]');
}

/**
 * Get all text elements in the DOM that contains the given pattern
 */
function getTextElementsMatchingPattern(pattern) {
  return $("body")
    .find("*")
    .contents()
    .filter(function () {
      return this.nodeType === 3 && (this.textContent.includes(pattern) || this.textContent.match(new RegExp(pattern)));
    });
}

/**
 * Adapted from original "waitForKeyElements" function, by schurpf@
 * (https://gist.github.com/schurpf/26d9bf85384e70596561)
 */
function watchForElements(queryFn, pattern, actionFunction, bWaitOnce) {
  const targetNodes = queryFn();

  if (targetNodes && targetNodes.length > 0) {
    btargetsFound = true;

    /*---
    	Found target node(s).  Go through each and act if they
      are new.
    */
    targetNodes.each(function () {
      var jThis = $(this);
      var alreadyFound = jThis.data("alreadyFound") || false;

      if (!alreadyFound) {
        //--- Call the payload function.
        var cancelFound = actionFunction(jThis);

        if (cancelFound) {
          btargetsFound = false;
        } else {
          jThis.data("alreadyFound", true);
        }
      }
    });
  } else {
    btargetsFound = false;
  }

  //--- Get the timer-control variable for this selector.
  var controlObj = watchForElements.controlObj || {};
  var controlKey = pattern;
  var timeControl = controlObj[controlKey];

  //--- Now set or clear the timer as appropriate.
  if (btargetsFound && bWaitOnce && timeControl) {
    //--- The only condition where we need to clear the timer.
    clearInterval(timeControl);
    delete controlObj[controlKey];
  } else {
    //--- Set a timer, if needed.
    if (!timeControl) {
      timeControl = setInterval(function () {
        watchForElements(queryFn, pattern, actionFunction, bWaitOnce);
      }, UPDATE_FREQUENCY_MS);

      controlObj[controlKey] = timeControl;
    }
  }

  watchForElements.controlObj = controlObj;
}

redactPattern("arn:aws");
redactPattern("Account");
redactPattern("[0-9]{4}\-[0-9]{4}\-[0-9]{4}");
