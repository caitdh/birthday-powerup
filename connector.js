/* ============================================================
   Birthday Power-Up for Trello
   Custom Field: "Birth date" (mm/dd/yyyy text format)
   On birthday: shows blue badge, moves card to top
   Uses Trello's secure authorization flow - no credentials in code
   ============================================================ */

const CUSTOM_FIELD_NAME = "Birth date";

function getTodayMonthDay() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day   = String(now.getDate()).padStart(2, "0");
  return { month, day };
}

function isBirthdayToday(birthdateText) {
  if (!birthdateText || typeof birthdateText !== "string") return false;
  const parts = birthdateText.trim().split("/");
  if (parts.length !== 3) return false;
  const fieldMonth = parts[0].padStart(2, "0");
  const fieldDay   = parts[1].padStart(2, "0");
  const { month, day } = getTodayMonthDay();
  return fieldMonth === month && fieldDay === day;
}

function tryMoveToTop(t, cardId) {
  t.getRestApi().then(function(api) {
    return api.put("/cards/" + cardId, { pos: "top" });
  }).then(function() {
    console.log("🎂 Card moved to top!");
  }).catch(function(err) {
    if (err && err.name === "restApi::ApiNotConfiguredError") {
      // API key not configured in Power-Up admin — skip silently
      console.log("🎂 REST API not configured, skipping move");
    } else if (err && err.name === "restApi::AuthDeniedError") {
      // User hasn't authorized yet — request authorization
      console.log("🎂 Auth needed, requesting...");
      t.authorize().catch(function() {
        console.log("🎂 User declined authorization");
      });
    } else {
      console.log("🎂 Could not move card:", err);
    }
  });
}

console.log("🎂 Birthday Power-Up: connector.js loaded successfully");

TrelloPowerUp.initialize({

  "card-badges": function (t) {
    return t.card("customFieldItems", "id").then(function (card) {
      return t.board("customFields").then(function (board) {

        const birthdateField = board.customFields.find(
          (f) => f.name === CUSTOM_FIELD_NAME
        );

        if (!birthdateField) return [];

        const fieldItem = card.customFieldItems.find(
          (item) => item.idCustomField === birthdateField.id
        );

        if (!fieldItem || !fieldItem.value || !fieldItem.value.text) return [];

        if (isBirthdayToday(fieldItem.value.text)) {
          tryMoveToTop(t, card.id);
          return [{ text: "🎂 Birthday", color: "blue" }];
        }

        return [];
      });
    });
  },

  "card-detail-badges": function (t) {
    return t.card("customFieldItems").then(function (card) {
      return t.board("customFields").then(function (board) {
        const birthdateField = board.customFields.find(
          (f) => f.name === CUSTOM_FIELD_NAME
        );
        if (!birthdateField) return [];
        const fieldItem = card.customFieldItems.find(
          (item) => item.idCustomField === birthdateField.id
        );
        if (!fieldItem || !fieldItem.value || !fieldItem.value.text) return [];
        if (isBirthdayToday(fieldItem.value.text)) {
          return [{ title: "Birthday", text: "🎂 Birthday", color: "blue" }];
        }
        return [];
      });
    });
  },

  // Handles the authorization flow when Trello asks the user to authorize
  "authorization-status": function(t) {
    return t.getRestApi().then(function(api) {
      return api.isAuthorized().then(function(isAuthorized) {
        return { authorized: isAuthorized };
      });
    });
  },

  "show-authorization": function(t) {
    return t.getRestApi().then(function(api) {
      return api.authorize({ scope: "read,write" });
    });
  },

});
