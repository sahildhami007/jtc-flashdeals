const apiUrl = "http://198.12.253.79:2600/api";
const GetToken = localStorage.getItem("token");
const stockNumber = localStorage.getItem("stockNumber");
const GetEmail = parseJwt()?.email;
const stockButton = document.getElementById("upload-stock-button");
const sortedFeatures = [];
var documentList = [];
let datalist = {};
const loader = document.querySelector("#main-loader");

function removeUserSession() {
    localStorage.clear();
}

// loader
const hideSpinner = () => {
    loader.style.display = "none";
}
const showSpinner = () => {
    loader.style.display = "flex";
}

// perform function on enter click on input field email
$("#email").keyup(function (e) {
    if (e.keyCode === 13) {
        verifyEmail();
    }
});

// perform function on enter click on input field otp
$("#otp").keyup(function (e) {
    if (e.keyCode === 13) {
        verifyOtp();
    }
});

// Index page
const verifyEmail = () => {
    const api = apiUrl + "/Account/CustomerRegister";
    const email = document.getElementById("email")?.value;

    // validations
    if (email.trim() === "") {
        toastr.error("Enter email", "", { progressBar: true, timeOut: 2000 })
        return;
    } if (email.trim().length < 3) {
        toastr.error("Invalid email", "", { progressBar: true, timeOut: 2000 })
        return;
    }
    showSpinner();
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            data: email,
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    fetch(api, requestOptions)
        .then(response => response?.json())
        .catch((error) => { console.log(error, "err"); })
        .then((response) => {
            hideSpinner();
            if (response?.success) {
                toastr.success(response?.message, "", { progressBar: true, timeOut: 3000 });
                document.getElementById("email-box").style.display = "none";
                document.getElementById("email-otp").style.display = "block";
            } else {
                toastr.error(response?.message, "", { progressBar: true, timeOut: 2000 })
            }
        })
}

const verifyOtp = () => {
    const api = apiUrl + "/Account/VerifyOtp";
    const email = document.getElementById("email")?.value;
    const otp = document.getElementById("otp")?.value;
    const data = { email: email.trim(), otp: otp.trim() };
    showSpinner();
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            "data": JSON.stringify(data)
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    fetch(api, requestOptions)
        .then(response => response.json())
        .catch((error) => { console.log(error, "err"); })
        .then((response) => {
            hideSpinner();
            if (response?.success) {
                toastr.success(response?.message, "", { progressBar: true, timeOut: 3000 });
                window?.localStorage?.setItem("token", response?.data);
                var data = response?.data.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                var jsonPayload = decodeURIComponent(window.atob(data).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                var userdata = JSON.parse(jsonPayload);
                var userRole = userdata.role;

                if (userRole === "StockEntry") {
                    setTimeout(() => {
                        window?.location?.replace('upload-stock.html')
                    }, 2000);
                } else if (userRole === "Customer") {
                    setTimeout(() => {
                        window?.location?.replace('home.html')
                    }, 2000);
                } else {
                    window?.location?.reload();
                }
            }
            else {
                toastr.error(response?.message, "", { progressBar: true, timeOut: 3000 })
            }
        })
}

function parseJwt() {
    if (GetToken) {
        var base64Url = GetToken.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        if (jsonPayload) {
            var date = new Date() / 1000;
            var json = JSON.parse(jsonPayload);
            var exp = json.exp;
            if (date > exp) {
                removeUserSession();
                window?.location?.replace('index.html')
                return;
            }
            return JSON.parse(jsonPayload);
        }
        //  else {
        //     removeUserSession();
        //     window?.location?.replace('index.html')
        //     return;
        // }
    }
}

function getRole() {
    var role = parseJwt()?.role;
    return role;
}

// Stock upload page
const getMaker = () => {
    showSpinner();
    fetch(apiUrl + "/Product/MakerList")
        .then((response) => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();
            const makers = JSON.parse(response?.data);
            var select = document.getElementById("Maker");
            var options = makers;

            // add options of maker
            for (var i = 0; i < options?.length; i++) {
                var CategoryType = options[i]?.CategoryType;
                var id = options[i]?.Id;
                var el = document.createElement("option");
                el.textContent = CategoryType;
                el.value = id;
                select.appendChild(el);
            }
        })
}

const getModel = () => {
    showSpinner();
    const api = apiUrl + "/Product/ModelList";
    const makerValue = document.querySelector("#Maker").value;
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            "data": JSON.stringify(makerValue)
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    fetch(api, requestOptions)
        .then(response => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();
            const models = JSON.parse(response?.data)
            var options = models;
            var select = document.getElementById("Model");

            // delete old options of model if already exists
            let oldOptions = select.getElementsByTagName('option');
            for (var i = oldOptions.length; i--;) {
                select.removeChild(oldOptions[i]);
            } // if there's no option, create a default blank value option in model
            if (select?.value === "") {
                var el = document.createElement("option");
                el.textContent = "Select Model";
                el.value = "";
                el.disabled = true;
                el.selected = true;
                select.appendChild(el);
            }

            // delete old options of grade if already exists
            var select2 = document.getElementById("Grade");
            let oldOptions2 = select2.getElementsByTagName('option');
            for (var i = oldOptions2.length; i--;) {
                select2.removeChild(oldOptions2[i]);
            } // if there's no option, create a default blank value option in grade
            if (select2?.value === "") {
                var el = document.createElement("option");
                el.textContent = "Select Grade";
                el.value = "";
                el.disabled = true;
                el.selected = true;
                select2.appendChild(el);
            }

            // adding options wrt maker id
            for (var i = 0; i < options?.length; i++) {
                var CategoryType = options[i]?.CategoryType;
                var id = options[i]?.Id;
                var el = document.createElement("option");
                el.textContent = CategoryType;
                el.value = id;
                select.appendChild(el);
            }
        })
}

const getGrade = () => {
    showSpinner();
    const api = apiUrl + "/Product/ModelGradeList";
    const modelValue = document.querySelector("#Model").value;
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            "data": JSON.stringify(modelValue)
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    fetch(api, requestOptions)
        .then(response => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();
            const grades = JSON.parse(response?.data)
            var select = document.getElementById("Grade");
            var options = grades;

            // delete old options of grade if already exists
            let oldOptions = select.getElementsByTagName('option');
            for (var i = oldOptions.length; i--;) {
                select.removeChild(oldOptions[i]);
            } // if there's no option, create a default blank value option in grade
            if (select?.value === "") {
                var el = document.createElement("option");
                el.textContent = "Select Grade";
                el.value = "";
                el.disabled = true;
                el.selected = true;
                select.appendChild(el);
            }

            // adding options wrt model id
            for (var i = 0; i < options?.length; i++) {
                var CategoryType = options[i]?.CategoryType;
                var id = options[i]?.Id;
                var el = document.createElement("option");
                el.textContent = CategoryType;
                el.value = id;
                select.appendChild(el);
            }
        })
}

const getType = () => {
    showSpinner();
    const api = apiUrl + "/Product/TypeList";
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            "data": JSON.stringify()
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    fetch(api, requestOptions)
        .then((response) => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();
            const type = JSON.parse(response?.data);
            var select = document.getElementById("Type");
            var options = type;

            // add options of type
            for (var i = 0; i < options?.length; i++) {
                var CategoryType = options[i]?.CategoryType;
                var id = options[i]?.Id;
                var el = document.createElement("option");
                el.textContent = CategoryType;
                el.value = id;
                select.appendChild(el);
            }
        })
}

const getColorList = () => {
    showSpinner();
    fetch(apiUrl + "/Product/ColorList")
        .then((response) => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();
            const color = JSON.parse(response?.data);
            var select = document.getElementById("Color");
            var options = color;

            // add options of colors
            for (var i = 0; i < options?.length; i++) {
                var Name = options[i]?.Name;
                var id = options[i]?.Id;
                var el = document.createElement("option");
                el.textContent = Name;
                el.value = id;
                select.appendChild(el);
            }
        })
}

const getCountryList = () => {
    showSpinner();
    fetch(apiUrl + "/Common/CountryList")
        .then((response) => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();
            const country = JSON.parse(response?.data);

            // for country
            var selectForCountry = document.getElementById("ForCountryId");
            var options = country;
            // add options of type
            for (var i = 0; i < options?.length; i++) {
                var CountryName = options[i]?.CountryName;
                var id = options[i]?.Id;
                var el = document.createElement("option");
                el.textContent = CountryName;
                el.value = id;
                selectForCountry.appendChild(el);
                // selectBuyingCountry.appendChild(el);
            }

            // for buying country
            // var selectBuyingCountry = document.getElementById("BuyingCountryId");
            // var options = country;
            // // add options of type
            // for (var i = 0; i < options?.length; i++) {
            //     var CountryName = options[i]?.CountryName;
            //     var id = options[i]?.Id;
            //     var el = document.createElement("option");
            //     el.textContent = CountryName;
            //     el.value = id;
            //     selectBuyingCountry.appendChild(el);
            // }
        })
}

const getCurrencyList = () => {
    const api = apiUrl + "/Common/CurrencyList";
    const data = 0;
    showSpinner();
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            data: JSON.stringify(data),
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    fetch(api, requestOptions)
        .then((response) => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();
            const currency = JSON.parse(response?.data);
            var select = document.getElementById("Currency");
            var options = currency;

            // add options of currency
            for (var i = 0; i < options?.length; i++) {
                var Name = options[i]?.Name;
                var id = options[i]?.Id;
                var el = document.createElement("option");
                el.textContent = Name;
                el.value = id;
                select.appendChild(el);
            }
        })
}

const checkChangeHandeler = (e) => {
    ExtraFeature();
}

const ExtraFeature = () => {
    var checkboxes = document.getElementsByName('Feature');
    var result = "";
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            result += "," + checkboxes[i].value;
        }
    }
    var featuresVal = result.substring(1);
    return featuresVal;
}

const getFeatures = () => {
    showSpinner();
    const api = apiUrl + "/Product/FeatureList";
    const data = 0;
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            data: JSON.stringify(data),
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    fetch(api, requestOptions)
        .then((response) => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();
            const feature = JSON.parse(response?.data);
            var options = feature;
            var check = document.getElementById("selectCheck");

            for (var i = 0; i < options?.length; i++) {
                var name = options[i]?.Name;
                var value = options[i]?.Id;
                var id = options[i]?.Id;
                var type = options[i]?.Type;

                var div = document.createElement('div');
                div.id = "specifications";
                var label = document.createElement('label');
                label.innerHTML = name;
                var input = document.createElement('input');

                input.addEventListener('change', (event) => { })
                input.onchange = checkChangeHandeler;

                input.type = "checkbox";
                input.name = type;
                input.id = id;
                input.value = value;
                check.appendChild(div);
                div.appendChild(input);
                div.appendChild(label);
            }
        })
}
// for selecting images
let inputFile = document.getElementById("upload-btn");
let rowOfPhotos = document.getElementById("preview");
if (inputFile != null) {
    inputFile.addEventListener("change", function (e) {
        const files = e.target.files;
        // image validations
        if (files.length > 6 || documentList?.length > 6) {
            toastr.error("you can upload 6 images only", "", { progressBar: true, timeOut: 3000 });
            return;
        }
        for (let i = 0; i < files.length; i++) {
            var size = (files[i]?.size / (1024 * 1024));
            if (size > 45) {
                toastr.error("Image Size can't be more then 45 Mb", "", { progressBar: true, timeOut: 3000 });
                return;
            }
        }

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    var obj = {}
                    obj.FileName = file?.name;
                    obj.DocType = file?.type.slice(6, file?.type?.length);
                    obj.DefaultImage = false;
                    obj.recordId = documentList.length + 1;

                    const div = document.createElement("div");
                    div.className = "imageDiv";
                    div.id = "old";

                    const icon = document.createElement("i");
                    icon.className = "fa fa-times cross-icon";
                    icon.id = obj.recordId;

                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = function (e) {
                        const canvas = document.createElement("canvas");
                        canvas.width = 580;
                        canvas.height = 420;

                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, 580, 420);
                        const compressImg = ctx.canvas.toDataURL(e.target, "image/jpeg");
                        img.src = compressImg;
                        img.alt = file.name;
                        obj.Base64 = compressImg;
                        var Base64Content = compressImg.split(",")[1];
                        obj.Base64Content = Base64Content;
                    }
                    documentList.push(obj);

                    icon.addEventListener('click', () => {
                        onRemoveImg(obj);
                    })
                    const label = document.createElement("label");
                    label.innerText = "Set as default";
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = "defaultImage";
                    input.id = obj.recordId;
                    input.className = "set-default"
                    input.value = i;

                    label.appendChild(input);
                    div.appendChild(img);
                    div.appendChild(icon);
                    div.appendChild(label);
                    rowOfPhotos.append(div);

                    $("input[name='defaultImage']").on("click", function () {
                        var id = this.id;
                        $.each(documentList, function (i, n) {
                            n.DefaultImage = (n.recordId === parseInt(id));
                        })
                    })
                };
            }
        }
    });
}

const onRemoveImg = (val) => {
    // delete all pics if already exist
    const old = document.querySelectorAll('#old')
    for (let i = 0; i < old?.length; i++) {
        old[i].remove();
    }

    let arr = [...documentList];
    const Index = documentList.indexOf(val)
    if (Index > -1) {
        arr.splice(Index, 1);
    }
    documentList = arr;
    showPrev();
}

const showPrev = () => {
    let rowOfPhotos = document.getElementById("preview");
    documentList.map((item) => {
        const div = document.createElement("div");
        div.className = "imageDiv";
        div.id = "old";
        const icon = document.createElement("i");
        icon.className = "fa fa-times cross-icon";
        icon.addEventListener('click', () => {
            onRemoveImg(item);
        })
        const img = document.createElement("img")
        img.src = item?.Base64;

        const label = document.createElement("label");
        label.innerText = "Set as default";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "defaultImage";
        input.id = item.recordId;
        input.className = "set-default"
        input.value = item.recordId;

        label.appendChild(input);
        div.appendChild(img);
        div.appendChild(icon);
        div.appendChild(label);
        rowOfPhotos.append(div);
    })
    $("input[name='defaultImage']").on("click", function () {
        var id = this.id;
        $.each(documentList, function (i, n) {
            n.DefaultImage = (n.recordId === parseInt(id));
        })
    })
}

function setDefaultImage() {
    var valid = false;
    var checkRadio = document.querySelector('input[name="defaultImage"]:checked');
    if (checkRadio != null) { valid = true; }
    else { valid = false }
    return valid;
}

const uploadStock = () => {
    const api = apiUrl + "/Stock/UploadStock";
    const Maker = document.querySelector("#Maker")?.value;
    const Model = document.querySelector("#Model")?.value;
    const Grade = document.querySelector("#Grade")?.value;
    const Type = document.querySelector("#Type")?.value;
    const ChassisType = document.querySelector("#ChassisType")?.value;
    const ChassisNumber = document.querySelector("#ChassisNumber")?.value;
    const Manufacture = document.querySelector("#Manufacture")?.value;
    const Registration = document.querySelector("#Registration")?.value;
    const Drive = document.querySelector("#Drive")?.value;
    const Fuel = document.querySelector("#Fuel")?.value;
    const Milage = document.querySelector("#Milage")?.value;
    const EngineType = document.querySelector("#EngineType")?.value;
    const EngineNumber = document.querySelector("#EngineNumber")?.value;
    const EngineCc = document.querySelector("#EngineCc")?.value;
    const NoOfSeats = document.querySelector("#NoOfSeats")?.value;
    const NoOfDoors = document.querySelector("#NoOfDoors")?.value;
    const Auction = document.querySelector("#Auction")?.value;
    const Color = document.querySelector("#Color")?.value;
    const ForCountryId = document.querySelector("#ForCountryId")?.value;
    const Currency = document.querySelector("#Currency")?.value;
    const BuyingPrice = document.querySelector("#BuyingPrice")?.value;
    const OfferPrice = document.querySelector("#OfferPrice")?.value;
    const Description = document.querySelector("#Description")?.value;

    const BuyingCountryId = document.querySelector("#BuyingCountryId")?.value;

    // validation for required inputs
    const validDateRegex = "^((19|2[0-9])[0-9]{2})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$";
    if (getRole() != "StockEntry") { toastr.error("You Have Not Access To Upload Stock", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Maker.trim() === "") { toastr.error("Select Maker", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Model.trim() === "") { toastr.error("Select Model", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Grade.trim() === "") { toastr.error("Select Grade", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Type.trim() === "") { toastr.error("Select Type", "", { progressBar: true, timeOut: 3000 }); return; }
    if (ChassisType.trim() === "") { toastr.error("Please Enter  Chassis Type", "", { progressBar: true, timeOut: 3000 }); return; }
    if (ChassisNumber.trim() === "") { toastr.error("Please Enter  Chassis Number", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Manufacture.trim() === "") { toastr.error("Please Enter valid Manufacture Date", "", { progressBar: true, timeOut: 3000 }); return; }
    if (!Manufacture.trim().match(validDateRegex)) { toastr.error("Please Enter valid Manufacture Date", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Registration.trim() === "") { toastr.error("Please Enter valid Registration Date", "", { progressBar: true, timeOut: 3000 }); return; }
    if (!Registration.trim().match(validDateRegex)) { toastr.error("Please Enter valid Registration Date", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Drive.trim() === "") { toastr.error("Select Drive", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Fuel.trim() === "") { toastr.error("Select Fuel", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Milage.trim() === "") { toastr.error("Please Enter Milage", "", { progressBar: true, timeOut: 3000 }); return; }
    if (EngineType.trim() === "") { toastr.error("Please Enter EngineType", "", { progressBar: true, timeOut: 3000 }); return; }
    if (EngineNumber.trim() === "") { toastr.error("Enter Engine Number", "", { progressBar: true, timeOut: 3000 }); return; }
    if (EngineCc.trim() === "") { toastr.error("Enter Engine in cc", "", { progressBar: true, timeOut: 3000 }); return; }
    if (NoOfSeats.trim() === "") { toastr.error("Select Number Of Seats", "", { progressBar: true, timeOut: 3000 }); return; }
    if (NoOfDoors.trim() === "") { toastr.error("Select Number Of Doors", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Auction.trim() === "") { toastr.error("Please Enter  Auction Grade", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Color.trim() === "") { toastr.error("Select Color", "", { progressBar: true, timeOut: 3000 }); return; }
    if (ForCountryId.trim() === "") { toastr.error("Select For Country", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Currency.trim() === "") { toastr.error("Select Currency", "", { progressBar: true, timeOut: 3000 }); return; }
    if (BuyingPrice.trim() === "") { toastr.error("Please Enter Buying Price", "", { progressBar: true, timeOut: 3000 }); return; }
    if (OfferPrice.trim() === "") { toastr.error("Please Enter Offer Price", "", { progressBar: true, timeOut: 3000 }); return; }
    if (Description.trim() === "") { toastr.error("Please Enter Product description", "", { progressBar: true, timeOut: 3000 }); return; }
    if (ExtraFeature()?.length === 0) { toastr.error("Select Specifications", "", { progressBar: true, timeOut: 3000 }); return; }
    if (documentList?.length === 0) { toastr.error("Please Upload Images", "", { progressBar: true, timeOut: 3000 }); return; }
    if (documentList?.length > 6) { toastr.error("you can upload 6 images only", "", { progressBar: true, timeOut: 3000 }); return; }
    if (setDefaultImage() === false) { toastr.error("Select Default Image", "", { progressBar: true, timeOut: 3000 }); return; }

    const data = {
        MakerId: Maker, ModelId: Model, VariantId: Grade, Typeid: Type, ChassisType: ChassisType, ChassisNumber: ChassisNumber,
        ManufactureDate: Manufacture, FirstRegistrationDate: Registration, Drive: Drive, Fuel: Fuel, Milage: Milage,
        EngineType: EngineType, EngineNumber: EngineNumber, EngineCc: EngineCc, NoOfSeats: NoOfSeats, NoOfDoors: NoOfDoors,
        AuctionGrade: Auction, ColorId: Color, ForCountryId: ForCountryId, CurrencyId: Currency, BuyingPrice: BuyingPrice,
        OfferPrice: OfferPrice, Description: Description, Documents: documentList, ExtraFeature: ExtraFeature(),

        // ProductId: null, BuyingCountryId: BuyingCountryId, 
        // DefaultImage: null, OtherFeature: null, ExchangeRateYenDoller: 2.000,
    };

    showSpinner();
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            "data": JSON.stringify(data)
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Authorization": `Bearer ${GetToken}`
        }
    }
    fetch(api, requestOptions)
        .then(response => response.json())
        .catch((error) => { console.log(error, "err"); })
        .then((response) => {
            hideSpinner();
            if (response?.success) {
                toastr.success(response?.message, "", { progressBar: true, timeOut: 2000 });
                document?.getElementById("myform")?.reset();
                setTimeout(() => {
                    window?.location?.reload();
                }, 1000);
            } else {
                toastr.error(response?.message, "", { progressBar: true, timeOut: 3000 })
            }
        })
}

// Home page
const flashStockDeal = () => {
    const api = apiUrl + "/Stock/FlashStockDeal";
    const data = new Date().toJSON().split('T')[0];
    showSpinner();

    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            "data": JSON.stringify(data)
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Authorization": `Bearer ${GetToken}`
        }
    }
    fetch(api, requestOptions)
        .then((response) => response.json())
        .catch((error) => { console.log(error);; })
        .then((response) => {
            hideSpinner();
            if (response?.success) {
                const stocks = response?.data;
                const newStock = stocks.filter((item) => item?.defaultImage != null);
                const newStocks = newStock.filter((item) => item?.defaultImage != "");
                newStocks.sort(function (a, b) {
                    return b.id - a.id;
                });
                const firstVehicle = newStocks[0];
                localStorage.setItem("stockNumber", firstVehicle?.stockNumber);
                // default first vehicle
                document.getElementById("bigImageDisplay").src = firstVehicle?.defaultImage;
                document.getElementById("description").innerHTML = firstVehicle?.productDiscription;
                document.getElementById("other-data").innerHTML = `${firstVehicle?.fuel} ${firstVehicle?.drive} ${firstVehicle?.engineCc} CC Engine`;

                document.getElementById("stockDetails")
                // newStocks.length = 3;
                newStocks?.map(item => {
                    const imagedetails = document.getElementById("detailsImage");
                    const div = document.createElement('div');
                    div.id = "mydiv";
                    const anchor = document.createElement('a');
                    const img = document.createElement('img');
                    img.src = item?.defaultImage;
                    img.alt = item?.id;
                    const p1 = document.createElement('p');
                    p1.className = "vehName";
                    p1.innerHTML = item?.productDiscription;
                    const p2 = document.createElement('p');
                    p2.className = "vehName";
                    p2.innerHTML = `${item?.fuel} ${item?.drive} ${item?.engineCc} CC`;

                    anchor.href = "#bigImageDisplay";
                    anchor.addEventListener('click', () => {
                        document.getElementById("bigImageDisplay").src = item?.defaultImage;
                        document.getElementById("bigImageDisplay").alt = item?.id;
                        document.getElementById("description").innerHTML = item?.productDiscription;
                        document.getElementById("other-data").innerHTML = `${item?.fuel} ${item?.drive} ${item?.engineCc} CC Engine`;

                        const stockDetails = document.getElementById("stockDetails");
                        const newAnchor = document.createElement('a');
                        newAnchor.href = "details.html";
                        newAnchor.className = "btn-detail";
                        newAnchor.innerHTML = "Details";
                        newAnchor.addEventListener('click', () => {
                            const stockNumber = item?.stockNumber;
                            localStorage.setItem("stockNumber", stockNumber)
                        })
                        stockDetails.append(newAnchor);
                    })

                    anchor.append(img);
                    anchor.append(p1);
                    anchor.append(p2);
                    div.append(anchor);
                    imagedetails.append(div);
                })
            } else {
                toastr.error(response?.message, "", { progressBar: true, timeOut: 3000 })
            }
        })
}

// Details page
const StockDetail = () => {
    const api = apiUrl + "/Stock/StockDetail";
    const data = stockNumber;
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            "data": data
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Authorization": `Bearer ${GetToken}`
        }
    }
    showSpinner();
    fetch(api, requestOptions)
        .then((response) => response.json())
        .catch((error) => { console.log(error, "err"); })
        .then((response) => {
            hideSpinner();
            if (response?.success) {
                var sendInquiry = response?.data?.sendInquiry;
                // hide send req button if already req has been sended
                if (sendInquiry) {
                    document.querySelector("#box-negotiate").style.display = "none";
                    document.querySelector("#box-negotiate-message").style.display = "block";
                }
                const details = response?.data?.stock;
                specifications(details);
                datalist = details?.extraFeature?.split(',');
                document.getElementById("description").innerHTML = details?.productDiscription;
                document.getElementById("chassisnumber").innerHTML = `Chassis Number : ${details?.chassisNumber}`;
                document.getElementById("chassistype").innerHTML = `Chassis Type : ${details?.chassisType}`;
                document.getElementById("buyingprice").innerHTML = `Offer Price : ${details?.currency?.sign}  ${details?.offerPrice} <p> &nbsp; (<span>${details?.buyingPrice}</span>) </p> `;
                document.getElementById("newImage").src = details?.defaultImage;
                details?.documents?.filter((i) => i.urlLink).map(item => {
                    const imagepreview = document.getElementById("details-preview-image");
                    const div = document.createElement('div');
                    div.id = "mydiv";
                    const anchor = document.createElement('a');
                    anchor.id = "myanchor";
                    const img = document.createElement('img');
                    img.id = "myimg";

                    img.src = item?.urlLink;
                    img.alt = item?.id;
                    anchor.href = "#newImage";
                    anchor.addEventListener('click', () => {
                        document.getElementById("newImage").src = item?.urlLink;
                        document.getElementById("newImage").alt = item?.id;
                    })
                    anchor.append(img);
                    div.append(anchor);
                    imagepreview.append(div);
                })
            } else {
                toastr.error(response?.message, "", { progressBar: true, timeOut: 3000 });
                window?.location?.replace("home.html");
            }
        })
}

const specifications = (e) => {
    const api = apiUrl + "/Product/FeatureList";
    const data = 0;
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            data: JSON.stringify(data),
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    showSpinner();
    fetch(api, requestOptions)
        .then((response) => response.json())
        .catch((error) => { console.log(error); })
        .then((response) => {
            hideSpinner();

            const feature = JSON.parse(response?.data);
            var spec = [];
            var data = [];
            for (var i = 0; i < datalist?.length; i++) {
                data.push(parseInt(datalist[i]))
            }
            for (let i = 0; i < data.length; i++) {
                const res = feature?.filter(item => item.Id === data[i])
                spec.push(res);
            }
            var existedFeatures = feature?.filter((item => spec?.find((detail) => detail[0]?.Id === item.Id)))
            var existId = existedFeatures.map((item) => item.Id);
            var check = document.getElementById("existedFeatures");
            var exist = feature.filter((item) => existId.find((exist) => exist === item.Id))
            var notExist = feature.filter((item) => !existId.find((detail) => detail === item.Id));

            for (var i = 0; i < exist?.length; i++) {
                sortedFeatures.push(exist[i])
            }
            for (var i = 0; i < notExist?.length; i++) {
                sortedFeatures.push(notExist[i])
            }

            // delete all features if already exist
            const features = document.querySelectorAll('#features')
            for (let i = 0; i < features?.length; i++) {
                features[i].remove();
            }

            // remove all deplicate features
            const repeatedFeatures = sortedFeatures.filter((v, i, a) => a.findIndex(v2 => ['Id', 'Name'].every(k => v2[k] === v[k])) === i)
            repeatedFeatures.map(item => {
                var div = document.createElement('div');
                div.id = "features"
                div.className = "specification_div";
                var label = document.createElement('label');
                label.innerHTML = item?.Name;
                var input = document.createElement('img');
                input.height = 15;
                input.width = 15;
                if (existId.includes(item?.Id)) {
                    input.src = "images/exist.png";
                } else { input.src = "images/cross.png"; }
                // input.type = "checkbox";
                // input.name = "existedFeatures";            
                // input.disabled = true;
                // input.defaultChecked = existId.includes(item?.Id);
                check.appendChild(div);
                div.appendChild(input);
                div.appendChild(label);
            })
        })
}

const stockReq = () => {
    const api = apiUrl + "/Customer/SendStockRequest";
    const name = document.querySelector("#name")?.value;
    const country = document.querySelector("#ForCountryId")?.value;
    const currency = document.querySelector("#Currency")?.value;
    const customerOffer = document.querySelector("#customerOffer")?.value;
    const PhoneNumber = document.querySelector("#PhoneNumber")?.value;

    // validation for required inputs
    if (stockNumber === "") { window.location.replace("home.html"); return; }
    if (name?.trim() === "") { toastr.error("Enter Your Name", "", { progressBar: true, timeOut: 3000 }); return; }
    if (name?.trim()?.length < 3) { toastr.error("Name must be 3 characters", "", { progressBar: true, timeOut: 3000 }); return; }
    if (country === "") { toastr.error("Select Country", "", { progressBar: true, timeOut: 3000 }); return; }
    if (currency === "") { toastr.error("Select Currency", "", { progressBar: true, timeOut: 3000 }); return; }
    if (customerOffer === "") { toastr.error("Enter Offer Price", "", { progressBar: true, timeOut: 3000 }); return; }
    if (PhoneNumber === "") { toastr.error("Enter Phone Number", "", { progressBar: true, timeOut: 3000 }); return; }
    if (PhoneNumber === "") { toastr.error("Enter Phone Number", "", { progressBar: true, timeOut: 3000 }); return; }
    if (PhoneNumber?.length > 20 || PhoneNumber?.length < 7) { toastr.error("That doesn't looks like Mobile number", "", { progressBar: true, timeOut: 3000 }); return; }
    const data = {
        'Name': name, 'StockNumber': stockNumber, 'PhoneNumber': PhoneNumber, 'Email': GetEmail,
        'SelectedCurrencyId': currency, 'CustomerOffer': customerOffer, 'CountryId': country
    }
    const requestOptions = {
        method: "POST",
        body: JSON.stringify({
            "data": JSON.stringify(data)
        }),
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Authorization": `Bearer ${GetToken}`
        }
    }
    showSpinner();
    fetch(api, requestOptions)
        .then(response => response.json())
        .catch((error) => { console.log(error, "err"); })
        .then((response) => {
            hideSpinner();
            if (response?.success) {
                toastr.success(response?.message, "", { progressBar: true, timeOut: 2000 });
                setTimeout(() => {
                    window?.location?.replace('home.html');
                }, 1000);
            } else {
                toastr.error(response?.message, "", { progressBar: true, timeOut: 3000 })
            }
        })
}

// my request page
const MyRequests = () => {
    const api = apiUrl + "/Customer/MyRequest";
    const requestOptions = {
        method: "POST",
        body: "",
        headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Authorization": `Bearer ${GetToken}`
        }
    }
    showSpinner();
    fetch(api, requestOptions)
        .then(response => response.json())
        .catch((error) => { console.log(error, "err"); })
        .then((response) => {
            hideSpinner();
            if (response?.success) {
                const reqStock = response?.data.filter(item => item?.stock?.defaultImage != null)
                if (reqStock?.length > 0) {
                    reqStock.map((item, i) => {
                        const reqdiv = document.getElementById("reqdiv");
                        const div = document.createElement("div");
                        div.className = "requested-stock";
                        div.id = "oldDiv";
                        var reqDate = item?.requestDate.split("T")[0];
                        div.innerHTML = `<div class="col-5 col-lg-5 reqDiv"><img src=${item?.stock?.defaultImage} alt="img"></div>
                        <div class="col-7 col-lg-7">
                        <p class="vehDetail"><span>Request #:</span> ${i+1}</p>
                            <p class="vehDetail"><span>${item?.stock?.productDiscription}</p>
                            <p class="vehDetail"><span>Request On:</span> ${reqDate}</p>
                            <p class="vehDetail"><span>Customer Name:</span> ${item?.name}</p>
                            <p class="vehDetail"><span>Email:</span> ${item?.email}</p>
                            <p class="vehDetail"><span>Phone:</span> ${item?.phoneNumber}</p>
                            <p class="vehDetail"><span>Assign To Salesman:</span> ${item?.salesmanEmail}</p>
                        </div><hr>`;
                        if (getRole() === "Customer") {
                            div.addEventListener('click', function () {
                                localStorage.setItem("stockNumber", item?.stockNumber)
                                window.location.replace("details.html");
                            });
                        }
                        reqdiv.append(div);
                        const hr = document.createElement("hr");
                        reqdiv.append(hr);
                    })
                } else {
                    document.getElementById("noReq").innerHTML = "No record found";
                }
            }
            else {
                toastr.error(response?.message, "", { progressBar: true, timeOut: 3000 })
            }
        })
}


// Initials page functions onload
const initHome = () => {
    if (GetToken) {
        document.getElementById("user-email").innerHTML = GetEmail;
        flashStockDeal();
        parseJwt();
        if (getRole() === "StockEntry") {
            stockButton.style.display = "block";
        } else {
            stockButton.style.display = "none";
        }
    }
    else {
        window?.location?.replace('index.html');
    }
}

const initUploadStock = () => {
    if (GetToken) {
        document.getElementById("user-email").innerHTML = GetEmail;
        document.getElementById("footerHome").href = "#";
        parseJwt();
        if (getRole() === "StockEntry") {
            stockButton.style.display = "block";
            getMaker();
            getType();
            getColorList();
            getCountryList();
            getCurrencyList();
            getFeatures();
            parseJwt();
        } else {
            stockButton.style.display = "none";
            window?.location?.replace('home.html')
        }
    } else {
        window?.location?.replace('index.html')
    }
}

const initDetails = () => {
    if (GetToken) {
        if (stockNumber === "" || stockNumber === null) {
            window.location.replace("home.html");
            return;
        }
        parseJwt();
        if (getRole() === "Customer") {
            stockButton.style.display = "none";
            document.getElementById("user-email").innerHTML = GetEmail;
            document.getElementById("user-input-email").value = GetEmail;
            StockDetail();
            getCountryList();
            getCurrencyList();
        } else {
            window?.location?.replace('index.html')
        }
    } else {
        window?.location?.replace('index.html')
    }
}

const initMyRequest = () => {
    // if (GetToken) {
        document.getElementById("user-email").innerHTML = GetEmail;
        MyRequests();
        parseJwt();
        if (getRole() === "StockEntry") {
            stockButton.style.display = "block";
            document.getElementById("footerHome").href = "#";
        } else {
            stockButton.style.display = "none";
        }
    // }
    // else {
    //     window?.location?.replace('index.html');
    // }
}

// Reload page functions
const reloadHome = () => {
    document.getElementById("user-email").innerHTML = GetEmail;
    parseJwt();
    if (getRole() === "StockEntry") {
        stockButton.style.display = "block";
    } else {
        stockButton.style.display = "none";
    }

    // remove all images
    const stock = document.querySelectorAll('#mydiv');
    for (let i = 0; i < stock?.length; i++) {
        stock[i].remove();
    }

    // call api for reloading the page
    flashStockDeal();
}

const reloadDetails = () => {
    if (stockNumber === "" || stockNumber === null || stockNumber === "undefined") {
        window.location.replace("home.html");
        return;
    }
    parseJwt();
    if (getRole() === "Customer") {
        stockButton.style.display = "none";
        document?.getElementById("myform")?.reset();
        document.getElementById("user-email").innerHTML = GetEmail;
        document.getElementById("user-input-email").value = GetEmail;
    } else {
        window?.location?.replace('index.html')
    }

    // remove all images
    const vehicleImages = document.querySelectorAll('#mydiv');
    for (let i = 0; i < vehicleImages?.length; i++) {
        vehicleImages[i].remove();
    }

    // remove country options
    var select = document.getElementById("ForCountryId");
    let oldOption = select.getElementsByTagName('option');
    for (var i = oldOption.length; i--;) {
        select.removeChild(oldOption[i]);
    } // if there's no option, create a default blank value option in model
    if (select?.value === "") {
        var el = document.createElement("option");
        el.textContent = "Select Country";
        el.value = "";
        el.disabled = true;
        el.selected = true;
        select.appendChild(el);
    }

    // remove currency options
    var select = document.getElementById("Currency");
    let oldOption2 = select.getElementsByTagName('option');
    for (var i = oldOption2.length; i--;) {
        select.removeChild(oldOption2[i]);
    } // if there's no option, create a default blank value option in model
    if (select?.value === "") {
        var el = document.createElement("option");
        el.textContent = "Select Country";
        el.value = "";
        el.disabled = true;
        el.selected = true;
        select.appendChild(el);
    }

    // call api for reloading the page
    StockDetail();
    getCountryList();
    getCurrencyList();
}

const reloadUploadStock = () => {
    parseJwt();
    if (getRole() === "StockEntry") {
        stockButton.style.display = "block";
        document.getElementById("user-email").innerHTML = GetEmail;
        document?.getElementById("myform")?.reset();

        // delete old options of model if already exists
        var select = document.getElementById("Model");
        let oldOptions = select.getElementsByTagName('option');
        for (var i = oldOptions.length; i--;) {
            select.removeChild(oldOptions[i]);
        } // if there's no option, create a default blank value option
        if (select?.value === "") {
            var el = document.createElement("option");
            el.textContent = "Select Model";
            el.value = "";
            el.disabled = true;
            el.selected = true;
            select.appendChild(el);
        }
        // delete old options of grade if already exists
        var select = document.getElementById("Grade");
        let oldOptions2 = select.getElementsByTagName('option');
        for (var i = oldOptions2.length; i--;) {
            select.removeChild(oldOptions2[i]);
        }
        if (select?.value === "") {
            var el = document.createElement("option");
            el.textContent = "Select Grade";
            el.value = "";
            el.disabled = true;
            el.selected = true;
            select.appendChild(el);
        }

        // delete apis data
        var select = document.getElementById("Maker");
        let oldMaker = select.getElementsByTagName('option');
        for (var i = oldMaker.length; i--;) {
            select.removeChild(oldMaker[i]);
        } // if there's no option, create a default blank value option
        if (select?.value === "") {
            var el = document.createElement("option");
            el.textContent = "Select Maker";
            el.value = "";
            el.disabled = true;
            el.selected = true;
            select.appendChild(el);
        }

        // delete old options of color if already exists
        var select = document.getElementById("Color");
        let oldColor = select.getElementsByTagName('option');
        for (var i = oldColor.length; i--;) {
            select.removeChild(oldColor[i]);
        } // if there's no option, create a default blank value option
        if (select?.value === "") {
            var el = document.createElement("option");
            el.textContent = "Select Color";
            el.value = "";
            el.disabled = true;
            el.selected = true;
            select.appendChild(el);
        }

        // delete old options of country if already exists
        var select = document.getElementById("ForCountryId");
        let oldCountry = select.getElementsByTagName('option');
        for (var i = oldCountry.length; i--;) {
            select.removeChild(oldCountry[i]);
        } // if there's no option, create a default blank value option
        if (select?.value === "") {
            var el = document.createElement("option");
            el.textContent = "Select Country";
            el.value = "";
            el.disabled = true;
            el.selected = true;
            select.appendChild(el);
        }

        // delete old options of type if already exists
        var select = document.getElementById("Type");
        let oldTypes = select.getElementsByTagName('option');
        for (var i = oldTypes.length; i--;) {
            select.removeChild(oldTypes[i]);
        } // if there's no option, create a default blank value option
        if (select?.value === "") {
            var el = document.createElement("option");
            el.textContent = "Select Type";
            el.value = "";
            el.disabled = true;
            el.selected = true;
            select.appendChild(el);
        }

        // delete old options of type if already exists
        var select = document.getElementById("Currency");
        let oldCurrency = select.getElementsByTagName('option');
        for (var i = oldCurrency.length; i--;) {
            select.removeChild(oldCurrency[i]);
        } // if there's no option, create a default blank value option in model
        if (select?.value === "") {
            var el = document.createElement("option");
            el.textContent = "Select Country";
            el.value = "";
            el.disabled = true;
            el.selected = true;
            select.appendChild(el);
        }

        // delete old options of features if already exists
        var select = document.querySelectorAll("#specifications");
        for (var i = select?.length; i--;) {
            select[i].remove();
        }

        // // delete image preview
        let old = document.querySelectorAll('#old')
        for (let i = 0; i < old?.length; i++) {
            old[i].remove();
        }

        // blank input type file
        $("#upload-btn").val('');
        documentList.length = 0;

        // call api for reloading the page
        getMaker();
        getType();
        getColorList();
        getCountryList();
        getCurrencyList();
        getFeatures();
        parseJwt();
    } else {
        stockButton.style.display = "none";
        window?.location?.replace('home.html')
    }
}

const reloadMyRequest = () => {
    document.getElementById("user-email").innerHTML = GetEmail;
    document.getElementById("noReq").innerHTML = "";
    if (getRole() === "StockEntry") {
        stockButton.style.display = "block";
    }

    // remove all images
    const oldData = document.querySelectorAll("#oldDiv");
    for (let i = 0; i < oldData?.length; i++) {
        oldData[i].remove();
    }
    const oldhr = document.getElementsByTagName("hr");
    for (let i = 0; i < oldhr?.length; i++) {
        oldhr[i].remove();
    }

    // call api for reloading the page
    MyRequests();
}
