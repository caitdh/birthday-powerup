/* ============================================================
   Birthday Power-Up for Trello - DEBUG VERSION
   Custom Field: "Birth date" (mm/dd/yyyy text format)
   Adds a red "🎂 Birthday" label and shows badge on matching cards
   ============================================================ */

const CUSTOM_FIELD_NAME = "Birth date";
const BIRTHDAY_LABEL_NAME = "🎂 Birthday";

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

// Safely try to add/remove label — errors here will NOT affect the badge
function tryAddLabel(t, cardId, labelId) {
  try {
    t.getRestApi().then(function(api) {
      api.post("/cards/" + cardId + "/idLabels", { value: labelId })
        .then(function() { console.log("🎂 Label added successfully!"); })
        .catch(function(err) { console.log("🎂 Could not add label (may need auth):", err); });
    }).catch(function(err) { console.log("🎂 REST API not available:", err); });
  } catch(err) {
    console.log("🎂 Label add failed silently:", err);
  }
}

function tryRemoveLabel(t, cardId, labelId) {
  try {
    t.getRestApi().then(function(api) {
      api.del("/cards/" + cardId + "/idLabels/" + labelId)
        .then(function() { console.log("🎂 Label removed successfully"); })
        .catch(function(err) { console.log("🎂 Could not remove label:", err); });
    }).catch(function(err) { console.log("🎂 REST API not available:", err); });
  } catch(err) {
    console.log("🎂 Label remove failed silently:", err);
  }
}

console.log("🎂 Birthday Power-Up: connector.js loaded successfully");

TrelloPowerUp.initialize({

  "card-badges": function (t) {
    console.log("🎂 card-badges called");

    return t.card("customFieldItems", "id", "labels").then(function (card) {
      return t.board("customFields", "labels").then(function (board) {

        const birthdayLabel = board.labels.find(
          (l) => l.name === BIRTHDAY_LABEL_NAME
        );
        console.log("🎂 Birthday label found:", !!birthdayLabel);

        const birthdateField = board.customFields.find(
          (f) => f.name === CUSTOM_FIELD_NAME
        );

        if (!birthdateField) {
          console.log("🎂 ERROR: Custom field not found!");
          return [];
        }

        const fieldItem = card.customFieldItems.find(
          (item) => item.idCustomField === birthdateField.id
        );

        if (!fieldItem || !fieldItem.value || !fieldItem.value.text) {
          console.log("🎂 No birth date on this card");
          return [];
        }

        const birthdateText = fieldItem.value.text;
        console.log("🎂 Birth date:", birthdateText, "| Today:", getTodayMonthDay().month + "/" + getTodayMonthDay().day);

        if (isBirthdayToday(birthdateText)) {
          console.log("🎂 MATCH! It's their birthday!");

          // Try to add the label — failure won't crash the badge
          if (birthdayLabel) {
            const hasLabel = card.labels.some((l) => l.id === birthdayLabel.id);
            if (!hasLabel) {
              tryAddLabel(t, card.id, birthdayLabel.id);
            }
          }

          // Always return the badge regardless of label success
          return [{ text: "🎂 Birthday", color: "red" }];
        }

        // Not birthday — try to remove label if present
        if (birthdayLabel) {
          const hasLabel = card.labels.some((l) => l.id === birthdayLabel.id);
          if (hasLabel) {
            tryRemoveLabel(t, card.id, birthdayLabel.id);
          }
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
          return [{ title: "Birthday", text: "🎂 Birthday", color: "red" }];
        }
        return [];
      });
    });
  },
});
