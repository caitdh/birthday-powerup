/* ============================================================
   Birthday Power-Up for Trello
   Custom Field: "Birth date" (mm/dd/yyyy text format)
   Shows blue 🎂 Birthday badge and adds birthday label
   ============================================================ */

const CUSTOM_FIELD_NAME = "Birth date";
const BIRTHDAY_LABEL_NAME = "🎂 Birthday";
const APP_NAME = "Birthday Highlighter";
const API_KEY = "d9ccf2db488309f6f540a1ebfeba86c0"; // Safe to include - not secret

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

function tryAddLabel(t, cardId, labelId) {
  setTimeout(function() {
    try {
      t.getRestApi().then(function(api) {
        api.post("/cards/" + cardId + "/idLabels", { value: labelId })
          .then(function() { console.log("🎂 Label added!"); })
          .catch(function(err) { console.log("🎂 Label add failed:", err); });
      }).catch(function(err) { console.log("🎂 REST API error:", err); });
    } catch(err) {
      console.log("🎂 Label error:", err);
    }
  }, 500);
}

console.log("🎂 Birthday Power-Up: connector.js loaded successfully");

TrelloPowerUp.initialize({

  "card-badges": function (t) {
    return t.card("customFieldItems", "id", "labels").then(function (card) {
      return t.board("customFields", "labels").then(function (board) {

        const birthdateField = board.customFields.find(
          (f) => f.name === CUSTOM_FIELD_NAME
        );
        if (!birthdateField) return [];

        const fieldItem = card.customFieldItems.find(
          (item) => item.idCustomField === birthdateField.id
        );
        if (!fieldItem || !fieldItem.value || !fieldItem.value.text) return [];

        if (isBirthdayToday(fieldItem.value.text)) {

          // Try to add the label
          const birthdayLabel = board.labels.find(
            (l) => l.name === BIRTHDAY_LABEL_NAME
          );
          if (birthdayLabel) {
            const hasLabel = card.labels.some((l) => l.id === birthdayLabel.id);
            if (!hasLabel) {
              tryAddLabel(t, card.id, birthdayLabel.id);
            }
          }

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

}, {
  appKey: API_KEY,
  appName: APP_NAME
});
