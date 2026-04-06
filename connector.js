/* ============================================================
   Birthday Power-Up for Trello - DEBUG VERSION
   Custom Field: "Birth date" (mm/dd/yyyy text format)
   Adds/removes a red "🎂 Birthday" label on matching cards
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

console.log("🎂 Birthday Power-Up: connector.js loaded successfully");

TrelloPowerUp.initialize({

  "card-badges": function (t) {
    console.log("🎂 card-badges called");
    return t.card("customFieldItems", "id", "labels").then(function (card) {
      console.log("🎂 card customFieldItems:", JSON.stringify(card.customFieldItems));
      return t.board("customFields", "labels").then(function (board) {
        console.log("🎂 board customFields:", JSON.stringify(board.customFields));

        // Find the birthday label on the board
        const birthdayLabel = board.labels.find(
          (l) => l.name === BIRTHDAY_LABEL_NAME
        );
        console.log("🎂 Birthday label on board:", birthdayLabel);

        // Find the custom field
        const birthdateField = board.customFields.find(
          (f) => f.name === CUSTOM_FIELD_NAME
        );
        console.log("🎂 Found field named '" + CUSTOM_FIELD_NAME + "':", birthdateField);

        if (!birthdateField) {
          console.log("🎂 ERROR: Custom field not found on board!");
          return [];
        }

        const fieldItem = card.customFieldItems.find(
          (item) => item.idCustomField === birthdateField.id
        );

        if (!fieldItem || !fieldItem.value || !fieldItem.value.text) {
          console.log("🎂 No birth date value set on this card");
          // Remove birthday label if it exists on this card
          if (birthdayLabel) {
            const hasLabel = card.labels.some((l) => l.id === birthdayLabel.id);
            if (hasLabel) {
              t.getRestApi().then(function(api) {
                api.del("/cards/" + card.id + "/idLabels/" + birthdayLabel.id)
                  .catch(function(err) { console.log("🎂 Could not remove label:", err); });
              }).catch(function(err) { console.log("🎂 REST API error:", err); });
            }
          }
          return [];
        }

        const birthdateText = fieldItem.value.text;
        const { month, day } = getTodayMonthDay();
        console.log("🎂 Birth date on card:", birthdateText);
        console.log("🎂 Today is:", month + "/" + day);
        console.log("🎂 Is birthday today?", isBirthdayToday(birthdateText));

        if (isBirthdayToday(birthdateText)) {
          console.log("🎂 MATCH! Adding birthday label");

          // Add the birthday label if not already on the card
          if (birthdayLabel) {
            const hasLabel = card.labels.some((l) => l.id === birthdayLabel.id);
            if (!hasLabel) {
              t.getRestApi().then(function(api) {
                api.post("/cards/" + card.id + "/idLabels", { value: birthdayLabel.id })
                  .then(function() { console.log("🎂 Label added successfully!"); })
                  .catch(function(err) { console.log("🎂 Could not add label:", err); });
              }).catch(function(err) { console.log("🎂 REST API error:", err); });
            }
          }

          return [
            {
              text:  "Birthday",
              color: "red",
            },
          ];
        }

        // Not their birthday — remove label if present
        if (birthdayLabel) {
          const hasLabel = card.labels.some((l) => l.id === birthdayLabel.id);
          if (hasLabel) {
            t.getRestApi().then(function(api) {
              api.del("/cards/" + card.id + "/idLabels/" + birthdayLabel.id)
                .then(function() { console.log("🎂 Label removed successfully"); })
                .catch(function(err) { console.log("🎂 Could not remove label:", err); });
            }).catch(function(err) { console.log("🎂 REST API error:", err); });
          }
        }

        console.log("🎂 No birthday match for this card");
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
        const birthdateText = fieldItem.value.text;
        if (isBirthdayToday(birthdateText)) {
          return [
            {
              title: "Birthday",
              text:  "Birthday",
              color: "red",
            },
          ];
        }
        return [];
      });
    });
  },
});
