/* ============================================================
   Birthday Power-Up for Trello
   Custom Field: "Birth date" (mm/dd/yyyy text format)
   Shows blue 🎂 Birthday badge and moves card to top on birthday
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

          // Move card to top using t.request which doesn't need appKey/appName
          setTimeout(function() {
            t.request({
              url: "/1/cards/" + card.id,
              method: "PUT",
              data: { pos: "top" }
            }).then(function() {
              console.log("🎂 Card moved to top!");
            }).catch(function(err) {
              console.log("🎂 Move failed:", err);
            });
          }, 500);

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
});
