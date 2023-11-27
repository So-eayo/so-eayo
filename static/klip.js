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
  return fetch(`https://api.kaikas.io/api/v1/k/result/${requestKey}`, {
    method: "GET",
  }).then((res) => res.json());
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
  }
}
