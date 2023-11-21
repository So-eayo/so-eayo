let request_key;
let user_address;
let tokenA_symbol = "";
let tokenB_symbol = "";
let fee_get = "";
let pool_info;
const kspAddress = "0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654";
const caAddress = "0xBBc6EC1385B35156fd893D54C022fF88d3888148";
async function display_pool(data) {
  const caver = new Caver("https://public-en-cypress.klaytn.net");
  const contract = new caver.klay.Contract(contractABI, caAddress);
  try {
    for (let i = 0; i < data.length; i++) {
      let tokenA_address = caver.utils.toChecksumAddress(
        data[i][0].tokenA_address
      );
      let tokenB_address = caver.utils.toChecksumAddress(
        data[i][0].tokenB_address
      );
      let fee_display = data[i][0].fee_display;
      let tokenA = data[i][0].tokenA;
      let tokenB = data[i][0].tokenB;
      let fee = data[i][0].fee;
      let result = await contract.methods
        .balance(tokenA_address, tokenB_address, fee)
        .call();
      console.log(result);
      if (result / 10 ** 18 <= 100) {
        makePool_html =
          '<div class="form-check form-switch"><input class = "form-check-input" type="radio" id="flexSwitchCheckChecked' +
          i +
          '"' +
          'name="checkboxGroup" onclick="donationPool(this)"/><label class="form-check-label" for="flexSwitchCheckChecked' +
          i +
          '"' +
          ">tokenA :" +
          "  " +
          tokenA +
          "  " +
          "tokenB : " +
          tokenB +
          "  " +
          "Fee : " +
          "  " +
          fee_display +
          `</label><br><span style ="color:red; font-size:12px"> Funding : ${
            result / 10 ** 18
          }/100 KSP</span></div> `;
        $("#makePool_list").append(makePool_html);
      } else {
        console.log("백개넘었을떄 자동화할곳");
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function donationcheck() {
  console.log("donationcheck 진입");
  let donationAmount = $("#donationAmount").val();
  let check_number = parseInt(donationAmount);
  if (user_address == undefined) {
    alert("지갑을 연결 후 진행해주세요");
  } else if (donationAmount == "" || isNaN(check_number)) {
    alert("수량을 확인해주세요");
  } else if (user_address != undefined && donationAmount != "") {
    if (pool_info == undefined) {
      alert("Pool을 선택하세요");
    } else {
      create_approve(donationAmount, "donation");
    }
  }
}
function donationPool(click) {
  var poolInfo = document.querySelector(
    'label[for="' + click.id + '"]'
  ).innerText;
  pool_info = poolInfo;
}

function updateButtonTextA(tokenA) {
  document.getElementById("btnGroupDrop1").innerText = tokenA;
  tokenA_symbol = tokenA;
}
function updateButtonTextB(tokenB) {
  document.getElementById("btnGroupDrop2").innerText = tokenB;
  tokenB_symbol = tokenB;
}
function feeText(fee) {
  document.getElementById("btnGroupDrop3").innerText = fee;
  fee_get = fee;
}
const klaytn = {
  auth: fetch("https://api.kaikas.io/api/v1/k/prepare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bapp: {
        name: "Klaytn Crowds Funding Protocol",
      },

      type: "auth",
    }),
  }).then((response) => response.json()),
};

const kaikas_getResult = (requestKey) => {
  return fetch(`https://api.kaikas.io/api/v1/k/result/${requestKey}`, {
    method: "GET",
  }).then((res) => res.json());
};

async function walletConnect() {
  const kaikasPNG = "../static/logos/kaikaswhite.png";
  Swal.fire({
    title: "지갑을 선택하세요",
    showConfirmButton: true,
    showCancelButton: false,
    confirmButtonText: `<img class="kaikas-image" src="${kaikasPNG}" alt="" /> Connect to Kaikas`,
    cancelButtonText: "Reject",
    showDenyButton: false,
    denyButtonText: "Ignore",
    customClass: {
      actions: "swal-actions-vertical",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      connet_kaikas();
      // } else if (result.isDenied) {
      //   console.log("Ignore button clicked");
      // } else if (result.dismiss === Swal.DismissReason.cancel) {
      //   console.log("Reject button clicked");
      // } else if (result.dismiss === Swal.DismissReason.close) {
      //   console.log("Close button clicked");
      // }
    }
  });
}
async function connet_kaikas() {
  if (typeof window.klaytn !== "undefined") {
    const account = await window.klaytn.enable();
    user_address = account[0];
    address_get();
  } else {
    kaikas_auth();
  }
}

async function kaikas_auth() {
  const auth_connect = await klaytn.auth;
  if (auth_connect.err) {
  } else if (auth_connect.request_key) {
    request_key = auth_connect.request_key;
    window.location.href =
      "kaikas://wallet/api?request_key=" + auth_connect.request_key;
    address_get();
  }
}
async function address_get() {
  if (request_key) {
    const address_info = await kaikas_getResult(request_key);
    if (address_info.err) {
    } else if (address_info) {
      if (address_info.result == null) {
        setTimeout(() => {
          address_get();
        }, 3000);
      } else {
        const keys = Object.values(address_info.result.klaytn_address);
        const address_my = keys.join("");
        user_address = address_my;
        const startText = user_address.slice(0, 5);
        const middleText = "...";
        const endText = user_address.slice(-5);
        const slice_address = startText + middleText + endText;
        change(slice_address);
      }
    }
  } else {
    const startText = user_address.slice(0, 5);
    const middleText = "...";
    const endText = user_address.slice(-5);
    const slice_address = startText + middleText + endText;
    change(slice_address);
  }
}

async function change(slice_address) {
  const printAddress = document.getElementById("user_address");
  printAddress.innerHTML = `  <a
            href="#"
            class="btn btn-primary active"
            role="button"
            data-bs-toggle="button"
            aria-pressed="true"
            onclick="reset_address()"
            >${slice_address}</a`;
}
function reset_address() {
  window.location.reload();
}

// window Kaikas Pool Make Contract
async function callContractFunction(data) {
  const dcontract = new caver.klay.Contract(contractABI, caAddress);
  const from = user_address;
  try {
    // 스마트 컨트랙트의 함수를 호출합니다.
    const result = await dcontract.methods
      .make(data[1], data[2], data[3])
      .send({ from: from, gas: 4000000 });
    requstPost(data[1], data[2], data[3]);
  } catch (error) {
    alert("Failed to call contract function:", error);
  }
}

function donation_call(tokenA, tokenB, fee, donationAmount) {
  if (typeof window.klaytn != "undefined") {
    callContractDonation(tokenA, tokenB, fee, donationAmount);
  } else {
    kaikas_request_donation(tokenA, tokenB, fee, donationAmount);
  }
}

async function callContractDonation(tokenA, tokenB, fee, donationAmount) {
  const value = new BigNumber(donationAmount);
  const contract = new caver.klay.Contract(contractABI, caAddress);
  const from = user_address;
  try {
    // 스마트 컨트랙트의 함수를 호출합니다.
    const result = await contract.methods
      .donation(tokenA, tokenB, fee, value)
      .send({ from: from, gas: 4000000 });
    alert("Crowds Funding 참여가 완료되었습니다.");
    window.location.reload();
  } catch (error) {
    alert("Failed to call contract function:" + error);
  }
}
