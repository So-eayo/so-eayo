async function kaikas_request_make(data) {
  const request_abi = {
    inputs: [
      {
        internalType: "address",
        name: "_tokenA",
        type: "address",
      },
      {
        internalType: "address",
        name: "_tokenB",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "_fee",
        type: "uint24",
      },
    ],
    name: "make",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  };
  let abi_params = JSON.stringify(request_abi);
  let makePool_contract = {
    execute: fetch("https://api.kaikas.io/api/v1/k/prepare", {
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
          abi: abi_params,
          value: "0",
          to: caAddress,
          params: JSON.stringify([
            "" + data["msg"][1],
            "" + data["msg"][2],
            "" + data["msg"][3],
          ]),
        },
      }),
    }).then((response) => response.json()),
  };

  const result = await makePool_contract.execute;

  if (result.err) {
  } else if (result.request_key) {
    make_href(
      result.request_key,
      data["msg"][1],
      data["msg"][2],
      data["msg"][3]
    );
  }
}

function make_href(request_key, tokenA_address, tokenB_address, fee_rate) {
  window.location.href = "kaikas://wallet/api?request_key=" + request_key;
  resultRequest(request_key, tokenA_address, tokenB_address, fee_rate);
}

async function resultRequest(
  request_key,
  tokenA_address,
  tokenB_address,
  fee_rate
) {
  console.log("getResult까지 진입");
  const result_info = await kaikas_getResult(request_key);
  if (result_info.err) {
  } else if (result_info) {
    if (result_info.result == null) {
      setTimeout(() => {
        resultRequest(request_key, tokenA_address, tokenB_address, fee_rate);
      }, 3000);
    } else {
      console.log("진입");
      requstPost(tokenA_address, tokenB_address, fee_rate);
    }
  }
}

function window_kaikas(response) {
  if (typeof window.klaytn !== "undefined") {
    callContractFunction(response["msg"]);
  } else {
    kaikas_request_make(response);
  }
}

function kaikas_approve(num, type) {
  console.log("kaikas approve 진입");
  console.log(num, type);
  if (typeof window.klaytn !== "undefined") {
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
    window_approve(num, type);
  } else {
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
    mobile_approve(num, type);
  }
}

async function window_approve(num, type) {
  const value = new BigNumber(num * 10 ** 18);
  const abi = [
    {
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
    },
  ];
  const dcontract = new caver.klay.Contract(abi, kspAddress);
  const from = user_address;
  try {
    const result = await dcontract.methods
      .approve(caAddress, value)
      .send({ from: from, gas: 4000000 });
    if (type == "make") {
      create_confirm();
    } else if (type == "donation") {
      donationInfo();
    }
  } catch (error) {
    console.error("Failed to call contract function:", error);
  }
}

async function mobile_approve(num, type) {
  console.log("mobile_approve 진입");
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
    execute: fetch("https://api.kaikas.io/api/v1/k/prepare", {
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
    mobile_approve_href(result.request_key, type);
  }
}
function mobile_approve_href(request_key, type) {
  window.location.href = "kaikas://wallet/api?request_key=" + request_key;
  mobile_approve_result(request_key, type);
}

async function mobile_approve_result(request_key, type) {
  const result_info = await kaikas_getResult(request_key);
  if (result_info.err) {
  } else if (result_info.result == null) {
    setTimeout(() => {
      mobile_approve_result(request_key, type);
    }, 3000);
  } else {
    if (type == "make") {
      create_confirm();
    } else if (type == "donation") {
      donationInfo();
    }
  }
}

async function kaikas_request_donation(tokenA, tokenB, fee, donationAmount) {
  const request_abi = {
    inputs: [
      {
        internalType: "address",
        name: "_tokenA",
        type: "address",
      },
      {
        internalType: "address",
        name: "_tokenB",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "_fee",
        type: "uint24",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "donation",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  };
  const amount = new BigNumber(donationAmount);
  let abi_params = JSON.stringify(request_abi);
  let donation_contract = {
    execute: fetch("https://api.kaikas.io/api/v1/k/prepare", {
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
          abi: abi_params,
          value: "0",
          to: caAddress,
          params: JSON.stringify([
            "" + tokenA,
            "" + tokenB,
            "" + fee,
            "" + amount,
          ]),
        },
      }),
    }).then((response) => response.json()),
  };

  const result = await donation_contract.execute;

  if (result.err) {
  } else if (result.request_key) {
    donation_href(result.request_key);
  }
}

function donation_href(request_key) {
  window.location.href = "kaikas://wallet/api?request_key=" + request_key;
  resultRequest_donation(request_key);
}

async function resultRequest_donation(request_key) {
  const result_info = await kaikas_getResult(request_key);
  if (result_info.err) {
  } else if (result_info) {
    if (result_info.result == null) {
      setTimeout(() => {
        resultRequest_donation(request_key);
      }, 3000);
    } else {
      alert("Crowds Funding 참여가 완료되었습니다.");
      window.location.reload();
    }
  }
}
