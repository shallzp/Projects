// const BASE_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies";
const BASE_URL = "https://v6.exchangerate-api.com/v6/02abc140eb7eaa1b64897882/latest/";

const dropdown = $("#selector select");
const btn = $("form button");
const to = $("#to select");
const from = $("#from select");
const msg = $("#msg");

for (let select of dropdown){
    for(currCode in countryList){
        let newOption = $("<option></option>").text(currCode).val(currCode);

        if (select.name === "from" && currCode === "USD") {
            newOption.prop("selected", true);
        }
        else if (select.name === "to" && currCode === "INR") {
            newOption.prop("selected", true);
        }

        $(select).append(newOption);
    }

    $(select).change((evt) => {
        updateFlag(evt.target);
    });
}

async function updateFlag(element) {
    let currCode = element.value;
    let countryCode = countryList[currCode];

    let srcLink = `https://flagsapi.com/${countryCode}/shiny/64.png`;

    let img = $(element).prev();
    await img.attr("src", srcLink);
}

async function convert() {
    let amount = $(".amount input");
    let amtValue = $(amount).val();

    if(amtValue === "" || amtValue < 1){
        amtValue = 1;
        $(amount).val("1");
    }

    const URL = `${BASE_URL}/${$(from).val()}`;

    let response = await fetch(URL);
    let data = await response.json();
    let rate = data["conversion_rates"][$(to).val()];
    
    let finalValue = rate * amtValue;

    $(msg).html(`${amtValue} ${$(from).val()} = ${finalValue} ${$(to).val()}`);
}

$(document).ready(() => {
    convert();
})

$(btn).click((evt) => {
    evt.preventDefault();
    convert();
});