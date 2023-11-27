const klip_prepare = {
  auth: fetch("https://a2a-api.klipwallet.com/v2/a2a/prepare", {
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
const klip_getResult = (requestKey) => {
  return fetch(
    `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${requestKey}`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
};
async function connet_klip() {
  var ua = util.userAgent();
  console.log("connet_clip 진입");
  if (ua.platform == "pc") {
    alert(
      `모바일 기기에서 이용가능한 지갑입니다. \r 클립이 설치된 스마트폰에서 이용해주세요`
    );
  } else {
    const auth_connect = await klip_prepare.auth;
    if (auth_connect.err) {
    } else if (auth_connect.request_key) {
      request_key = auth_connect.request_key;
      console.log(request_key);
      window.location.href =
        "kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=" +
        auth_connect.request_key;
      klip_address_get();
    }
  }
}
async function klip_address_get() {
  console.log("klip_address_get 진입");
  if (request_key) {
    const address_info = await klip_getResult(request_key);
    console.log(address_info);
    if (address_info.err) {
    } else if (address_info) {
      if (address_info.result == null) {
        setTimeout(() => {
          klip_address_get();
        }, 3000);
      } else {
        address_post(address_info);
      }
    }
  }
}

function klip_approve(num, type) {
  console.log("klip_approve에 진입하였습니다");
  if (type == "make") {
    const print_loading = document.getElementById("change_make");
    print_loading.innerHTML = `          <button
      class="btn btn-outline-danger active"
      type="button"
      id="button-addon2"
      onclick="reset_address()"
    >
      Loading.....
    </button>`;
  } else if (type == "donation") {
    console.log("donation type으로 진입하였습니다.");
    const print_loading = document.getElementById("change_donation");
    print_loading.innerHTML = `         <button
        onclick="reset_address()"
        class="btn btn-outline-primary active"
        type="button"
        id="button-addon2"
      >
        Loading.....
      </button>`;
  }
  klip_mobile_approve(num, type);
}

async function klip_mobile_approve(num, type) {
  console.log("klip_mobile_approve에 진입하였습니다.");
  const value = new BigNumber(num * 10 ** 18).toNumber();
  const abi = {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  };

  let abi_params = JSON.stringify(abi);
  let approve_contract = {
    execute: fetch("https://a2a-api.klipwallet.com/v2/a2a/prepare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bapp: {
          name: "Klaytn Crowds Funding Protocol",
        },
        type: "execute_contract",
        transaction: {
          from: user_address,
          abi: abi_params,
          value: "0",
          to: kspAddress,
          params: JSON.stringify(["" + caAddress, "" + value + ""]),
        },
      }),
    }).then((response) => response.json()),
  };

  const result = await approve_contract.execute;
  if (result.err) {
  } else if (result.request_key) {
    console.log(result.request_key + "를 획득하였습니다");
    mobile_approve_href(result.request_key, type);
  }
}
