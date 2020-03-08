import { getOptions, setOption } from "./utils";

const $form = document.getElementById("OptionForm");
const $fieldset = $form.querySelector("fieldset");
const $status = document.getElementById("Status");

const $subscribedOnly = document.getElementById("subscribedOnly");
const $includeIds = document.getElementById("includeIds");
const $excludeIds = document.getElementById("excludeIds");
const $minDuration = document.getElementById("minDuration");

const parseStrToArray = str =>
  str
    .replace(/\n|,/g, " ")
    .split(" ")
    .map(s => s.trim())
    .filter(s => s.length > 0);

const showStatus = (text, ...classes) => {
  $status.innerText = text;
  $status.classList.add(...classes);
  $status.classList.remove("hide");
  setTimeout(() => {
    $status.classList.add("hide");
    $status.classList.remove(...classes);
  }, 2000);
};

async function setupForm() {
  const { subscribedOnly, includeIds, excludeIds, minDuration } = await getOptions();

  $subscribedOnly.checked = subscribedOnly;
  $includeIds.value = includeIds.join(",\n");
  $excludeIds.value = excludeIds.join(",\n");
  $minDuration.value = minDuration;

  $form.addEventListener("submit", async event => {
    event.preventDefault();
    $fieldset.setAttribute("disabled", "");

    // TODO: validate
    try {
      const newOptions = {
        subscribedOnly: $subscribedOnly.checked,
        includeIds: parseStrToArray($includeIds.value),
        excludeIds: parseStrToArray($excludeIds.value),
        minDuration: Number($minDuration.value)
      };
      await setOption(newOptions);

      $includeIds.value = newOptions.includeIds.join(",\n");
      $excludeIds.value = newOptions.excludeIds.join(",\n");

      $fieldset.removeAttribute("disabled");
      showStatus("Saved!", "success");
    } catch (e) {
      console.log(e);
      if (e.message) {
        showStatus(e.message, "warn");
      }
    }
  });
}

setupForm();
