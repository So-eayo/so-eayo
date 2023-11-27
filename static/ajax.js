$(document).ready(function () {
  show_makePool();
});

// 1. show_makePool("GET")
// -> DB에 저장된 poolList를 프론트단에 표시해주는 함수
function show_makePool() {
  $("#makePool_list").empty();
  let result;
  $.ajax({
    type: "GET",
    url: "/makePool",
    data: {},
    success: function (response) {
      result = response["data"];
      if (response["data"] == false) {
        makePool_html =
          "<h3>현재 진행중인 Crowds Funding V3 Pool이 존재하지 않습니다</h3>";
        $("#makePool_list").append(makePool_html);
      } else {
        display_pool(result);
      }
    },
  });
}

// 2. donationInfo ("POST")
//  -> Pool , Donation 수량 , "참여하기"버튼을 누르면 해당 정보를 백엔드쪽에 전달하는 함수

function donationInfo() {
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
      $.ajax({
        type: "POST",
        url: "/donation",
        data: {
          amount_give: donationAmount,
          userAddress_give: user_address,
          pool_give: pool_info,
        },
        success: function (response) {
          const tokenA = response["msg"].tokenA;
          const tokenA_symbol = response["msg"].tokenA_symbol;
          const tokenB = response["msg"].tokenB;
          const tokenB_symbol = response["msg"].tokenB_symbol;
          const fee = response["msg"].fee;
          const fee_display = response["msg"].fee_display;
          const donationAmount_decimal = response["msg"].amount_decimal;
          if (fee_display == "1") {
            Swal.fire({
              title: "Crowds Funding에 참여해 주셔서 감사합니다.",
              html: `<span style="font-size: 12px;"> 토큰A : ${tokenA_symbol} <br>
              토큰B : ${tokenB_symbol} <br>
              거래 수수료 : ${fee_display}%<br>
              해당 항목으로 Crowds Funding <br>
              <span class="red-text">${donationAmount}KSP를 진행 하시겠습니까?</span></span>`,
              showCancelButton: true,
              confirmButtonText: "진행하기",
              cancelButtonText: "취소하기",
            }).then((result) => {
              if (result.isConfirmed) {
                donation_call(tokenA, tokenB, fee, donationAmount_decimal);
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.reload();
              }
            });
          } else {
            Swal.fire({
              title: "Crowds Funding에 참여해 주셔서 감사합니다.",
              html: `<span style="font-size: 12px;"> 토큰A : ${tokenA_symbol} <br>
            토큰B : ${tokenB_symbol} <br>
            거래 수수료 : 0${fee_display}%<br>
            해당 항목으로 Crowds Funding <br>
            <span class="red-text">${donationAmount}KSP를 진행 하시겠습니까?</span></span>`,
              showCancelButton: true,
              confirmButtonText: "진행하기",
              cancelButtonText: "취소하기",
            }).then((result) => {
              if (result.isConfirmed) {
                donation_call(tokenA, tokenB, fee, donationAmount_decimal);
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.reload();
              }
            });
          }
        },
      });
    }
  }
}

// 3. tokenA , tokenB,fee ("GET")
// -> PoolList를 만들때 tokenA 선택 시, tokenB 선택시 , fee 선택 시 백엔드에게 데이터를 주는 함수

function tokenA() {
  $("#tokenA_dropbutton").empty();
  $.ajax({
    type: "GET",
    url: "/tokenA",
    data: {},
    success: function (response) {
      let tokenList = response.token_list;
      let tokenA_html = "";
      for (let i = 0; i < tokenList.length; i++) {
        let tokenSymbol = tokenList[i].symbol;
        if (tokenSymbol == tokenB_symbol) {
          tokenA_html = `
              <li>
                <a class="dropdown-item disabled" onclick="updateButtonTextA('${tokenSymbol}')"
                  >${tokenSymbol}</a>
              </li>`;
        } else {
          tokenA_html = `
              <li>
                <a class="dropdown-item"  onclick="updateButtonTextA('${tokenSymbol}')"
                  >${tokenSymbol}</a>
              </li>`;
        }
        $("#tokenA_dropbutton").append(tokenA_html);
      }
    },
  });
}
function tokenB() {
  $("#tokenB_dropbutton").empty();
  $.ajax({
    type: "GET",
    url: "/tokenB",
    data: {},
    success: function (response) {
      let tokenList = response.token_list;
      let tokenB_html = "";
      for (let i = 0; i < tokenList.length; i++) {
        let tokenSymbol = tokenList[i].symbol;
        if (tokenSymbol == tokenA_symbol) {
          tokenB_html = `
              <li>
                <a class="dropdown-item disabled"  onclick="updateButtonTextB('${tokenSymbol}')"
                  >${tokenSymbol}</a>
              </li>`;
        } else {
          tokenB_html = `
              <li>
                <a class="dropdown-item"  onclick="updateButtonTextB('${tokenSymbol}')"
                  >${tokenSymbol}</a>
              </li>`;
        }
        $("#tokenB_dropbutton").append(tokenB_html);
      }
    },
  });
}
function fee() {
  if (tokenA_symbol != "" && tokenB_symbol != "") {
    document.getElementById(`fee${100}`).classList.remove("disabled");
    document.getElementById(`fee${500}`).classList.remove("disabled");
    document.getElementById(`fee${1000}`).classList.remove("disabled");
    document.getElementById(`fee${2000}`).classList.remove("disabled");
    document.getElementById(`fee${10000}`).classList.remove("disabled");
    $.ajax({
      type: "POST",
      url: "/fee",
      data: { tokenA_give: tokenA_symbol, tokenB_give: tokenB_symbol },
      success: function (response) {
        let fee_kind = response["data"];
        for (let i = 0; i < fee_kind.length; i++) {
          if (fee_kind[0] == 0) {
            break;
          }
          if (fee_kind[i] == 100) {
            document.getElementById(`fee${100}`).classList.add("disabled");
          }
          if (fee_kind[i] == 500) {
            document.getElementById(`fee${500}`).classList.add("disabled");
          }
          if (fee_kind[i] == 1000) {
            document.getElementById(`fee${1000}`).classList.add("disabled");
          }
          if (fee_kind[i] == 2000) {
            document.getElementById(`fee${2000}`).classList.add("disabled");
          }
          if (fee_kind[i] == 10000) {
            document.getElementById(`fee${10000}`).classList.add("disabled");
          }
        }
      },
    });
  } else {
    document.getElementById(`fee${100}`).classList.add("disabled");
    document.getElementById(`fee${500}`).classList.add("disabled");
    document.getElementById(`fee${1000}`).classList.add("disabled");
    document.getElementById(`fee${2000}`).classList.add("disabled");
    document.getElementById(`fee${10000}`).classList.add("disabled");
  }
}
function create_approve(num, type) {
  if (user_address) {
    Swal.fire({
      title:
        "본 서비스는 사용자의 보안을 위해 필요한 수량만큼 Approve 후에 진행됩니다.",
      html: `<span class="red-text" style="font-size: 12px;"> ${num} KSP의 전송을 Approve 하시겠습니까?</span>`,
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        if (wallet == "kaikas") {
          kaikas_approve(num, type);
        }
        if (wallet == "klip") {
          klip_approve(num, type);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.reload();
      }
    });
  } else {
    alert("지갑을 연결하세요");
  }
}

function create_confirm() {
  let msg = " 등록비용 1KSP";
  Swal.fire({
    title: "Create Pool 정보를 확인 하세요",
    html: `tokenA : ${tokenA_symbol} <br> tokenB : ${tokenB_symbol} <br> Fee : ${fee_get} <br>
              <span class="red-text">${msg}</span>`,
    showCancelButton: true,
    confirmButtonText: "만들기",
    cancelButtonText: "돌아가기",
    customClass: {
      popup: "custom-confirm",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      if (
        tokenA_symbol != "" &&
        tokenB_symbol != "" &&
        fee_get != "" &&
        user_address != undefined
      ) {
        $.ajax({
          type: "POST",
          url: "/makePool",
          data: {
            tokenA_give: tokenA_symbol,
            tokenB_give: tokenB_symbol,
            fee_give: fee_get,
            user_address_give: user_address,
          },
          success: function (response) {
            window_kaikas(response);
          },
        });
      } else {
        alert("지갑연결, 토큰명, 거래수수료를 확인하세요");
      }
    } else {
      alert("다시 시도해주세요");
      window.location.reload();
    }
  });
}

function requstPost(tokenA, tokenB, fee) {
  if (tokenA != undefined) {
    $.ajax({
      type: "POST",
      url: "/aftermake",
      data: {
        tokenA_give: tokenA,
        tokenB_give: tokenB,
        fee_give: fee,
      },
      success: function (response) {
        if (response["msg"]) {
          const tokenA = response["msg"].tokenA;
          const tokenB = response["msg"].tokenB;
          const fee = response["msg"].fee;
          alert(
            "token A : " +
              tokenA +
              " " +
              "token B : " +
              tokenB +
              " " +
              "Fee : " +
              fee +
              " " +
              "을 생성하는 Fund 컨트랙트가 개설되었습니다"
          );
          window.location.reload();
        }
      },
    });
  }
}
