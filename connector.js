/* ============================================================
   Birthday Power-Up for Trello - DEBUG VERSION
   Custom Field: "Birth date" (mm/dd/yyyy text format)
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
    console.log("🎂 card-badges called");
    return t.card("customFieldItems").then(function (card) {
      console.log("🎂 card customFieldItems:", JSON.stringify(card.customFieldItems));
      return t.board("customFields").then(function (board) {
        console.log("🎂 board customFields:", JSON.stringify(board.customFields));

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
        console.log("🎂 Field item on this card:", fieldItem);

        if (!fieldItem || !fieldItem.value || !fieldItem.value.text) {
          console.log("🎂 No birth date value set on this card");
          return [];
        }

        const birthdateText = fieldItem.value.text;
        const { month, day } = getTodayMonthDay();
        console.log("🎂 Birth date on card:", birthdateText);
        console.log("🎂 Today is:", month + "/" + day);
        console.log("🎂 Is birthday today?", isBirthdayToday(birthdateText));

        if (isBirthdayToday(birthdateText)) {
          console.log("🎂 MATCH! Showing Birthday badge");
          return [
            {
              text:  "Birthday",
              color: "blue",
            },
          ];
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
              color: "blue",
            },
          ];
        }
        return [];
      });
    });
  },
});
