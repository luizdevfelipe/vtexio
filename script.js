try{var waitUntilExists=function(t,a){var n=setInterval(function(){var e=$(t);e.length&&(clearInterval(n),a(e))},300)};function updateSteps(){let n=["cart","email","profile","shipping","payment"],o=window?.location?.hash.split("/");waitUntilExists(".cart-container",e=>{var t=o.includes(n[0]),a=0<n.indexOf(o[1]);vendorCoupon(),e.toggleClass("cart-container--active",t),e.toggleClass("cart-container--success",a)}),waitUntilExists(".profile-container",e=>{var t=o.includes(n[1])||o.includes(n[2]),a=2<n.indexOf(o[1]);e.toggleClass("profile-container--active",t),e.toggleClass("profile-container--success",a)}),waitUntilExists(".shipping-container",e=>{var t=o.includes(n[3]),a=3<n.indexOf(o[1]);e.toggleClass("shipping-container--active",t),e.toggleClass("shipping-container--success",a)}),waitUntilExists(".payment-container",e=>{var t=o.includes(n[4]),a=4<n.indexOf(o[1]);e.toggleClass("payment-container--active",t),e.toggleClass("payment-container--success",a)}),waitUntilExists(".payment-data",e=>{var t=o.includes(n[3]);e.toggleClass("shipping--active",t)}),waitUntilExists("#shipping-data",e=>{var t=o.includes(n[4]);e.toggleClass("payment--active",t)})}$(window).on("hashchange",()=>{updateSteps()}),$(document).ready(function(){updateSteps()})}catch(e){console.log(e)}var intervalo1=setInterval(()=>{0<$(".btn-place-order-wrapper").length&&0<$(".free-shipping").length&&($(".btn-place-order-wrapper").insertAfter(".free-shipping"),clearInterval(intervalo1))},100);function updateCartToOrderForm(){let e=$(".btn-place-order-wrapper"),t="#/payment"===window.location.hash,a=setInterval(()=>{0<e.length&&t?(e.style.display="none")===!e.style.display&&clearInterval(a):0<e.length&&!t&&(e.style.display="",clearInterval(a))},500)}$(document).ready(function(){updateCartToOrderForm(),$(window).on("hashchange",updateCartToOrderForm)});var intervalo2=setInterval(()=>{0<$(".link-choose-more-products-wrapper").length&&0<$(".free-shipping").length&&($(".link-choose-more-products-wrapper").insertBefore(".free-shipping"),clearInterval(intervalo2))},100);function tamanhoImg(){var e=setInterval(()=>{0<$(".product-item .product-image img").length&&($(".product-item .product-image img").each(function(e,t){var a=$(t).attr("src").replace("55-55","100-100");$(t).attr("src",a)}),clearInterval(e))},500)}function findPackaging(n){let e=setInterval(()=>{0<$(".product-item").length&&(clearInterval(e),$(".product-item").each(function(e,t){let a=$(t).attr("data-sku");n.items.map(e=>{e.id===a&&(0<e.attachmentOfferings.length&&e.attachmentOfferings.map(e=>{"vtex.subscription.assinatura"===e.name&&$(t).addClass("haveRecorrence")}),0<e.attachments.length)&&e.attachments.map(e=>{"vtex.subscription.assinatura"===e.name&&$(t).addClass("haveRecorrenceAdd")})})}))},200)}$(window).on("orderFormUpdated.vtex",function(e,t){tamanhoImg(),findPackaging(t)}),$(document).ready(function(){tamanhoImg();var e=setInterval(()=>{0<$(".srp-data #shipping-calculate-link").length&&($(".srp-data #shipping-calculate-link").click(),clearInterval(e))},100)});let verifyCode=async t=>{if(!t)return{isValid:!1,sellerName:""};try{var e=(await(await fetch("/api/dataentities/SS/search?_fields=Name,RCA",{headers:{"REST-Range":"resources=0-2000"}})).json()).find(e=>e.RCA===t);return{isValid:!!e,sellerName:e?e.name:""}}catch(e){return console.error("Error verifying seller code:",e),{isValid:!1,sellerName:""}}},vendorCoupon=()=>{vtexjs.checkout.getOrderForm().then(function(a){var e=a.marketingData&&a.marketingData.utmiCampaign;let t;t=e?`
        <div class="summary-coupon">
          <form class="form-vendor-coupon">
            <fieldset class="coupon-fieldset-vendor">
            <p class="coupon-vendor-label">Código de vendedor</p>
              <div class="is-using-coupon-vendor-added">
                <p class="coupon-vendor-label-added">${e}</p>
                <div class="coupon-vendor-input-wrapper-added">
                  <button class="remove-button-vendor" type="button"></button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>`:`
        <div class="summary-coupon">
          <form class="form-vendor-coupon">
            <fieldset class="coupon-fieldset-vendor">
              <div class="is-using-coupon-vendor">
                <p class="coupon-vendor-label">
                   <span>Possui Código Do Vendedor?</span>
                   <button type="button" class="link-coupon-vendor" style="display: none;">Adicionar</button>
                </p>
                <div class="coupon-vendor-input-wrapper" style="display: block;">
                  <input type="text" class="coupon-vendor-value" placeholder="Digite o código">
                  <button class="submit-button-vendor btn" type="submit">Adicionar</button>
                </div>
                <p class="error-message" style="color: red; text-align: start; font-size: 12px; display: none;">Código inválido</p>
              </div>
            </fieldset>
          </form>
        </div>`,$(".form-vendor-coupon").length||($(".summary-coupon-wrap").append(t),$(".form-vendor-coupon").on("submit",async function(e){e.preventDefault();var e=$(".coupon-vendor-value:visible").val(),t=(await verifyCode(e)).isValid;t?(a.marketingData=a.marketingData||{},a.marketingData.utmiCampaign=e,vtexjs.checkout.sendAttachment("marketingData",a.marketingData).then(function(){location.reload()})):$(".error-message").show()}),e&&$(".remove-button-vendor").on("click",function(){a.marketingData.utmiCampaign=null,vtexjs.checkout.sendAttachment("marketingData",a.marketingData).then(function(){location.reload()})}))})},deleteAllModalIds={container:"delete-all-modal-container",root:"delete-all-modal",overlay:"delete-all-modal-overlay",label:"delete-all-modal-label",description:"delete-all-modal-description",button:{close:"delete-all-modal-button-close",cancel:"delete-all-modal-button-cancel",confirm:"delete-all-modal-button-confirm"}},deleteAllModalTexts={label:"Esvaziar sacola",description:"Tem certeza que deseja excluir todos os itens do carrinho?",button:{cancel:"Cancelar",confirm:"Esvaziar sacola"}},deleteAllModalVisibilityClasses={visible:"visible",hidden:"hidden"},deleteAllButtonId="delete-all-btn",titlevitrineSelector="body.body-cart .title-bottom-vitrine",deleteAllModalSpinner='<svg class="deleteAllModalSpinner"  width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><style>.spinner_aj0A{transform-origin:center;animation:spinner_KYSC .75s infinite linear}@keyframes spinner_KYSC{100%{transform:rotate(360deg)}}</style><path class="spinner_aj0A" d="M10.0001 3.33326C11.5799 3.33399 13.1081 3.8957 14.3123 4.91827C15.5165 5.94084 16.3184 7.35781 16.5751 8.9166C16.6204 9.21489 16.7701 9.48744 16.9974 9.6858C17.2248 9.88416 17.5151 9.99546 17.8168 9.99993C17.9986 10 18.1783 9.96049 18.3433 9.88401C18.5083 9.80753 18.6546 9.69597 18.772 9.55711C18.8895 9.41826 18.9752 9.25546 19.0232 9.08006C19.0712 8.90467 19.0804 8.7209 19.0501 8.5416C18.7036 6.39086 17.6026 4.43382 15.9442 3.02121C14.2858 1.60859 12.1786 0.832764 10.0001 0.832764C7.82164 0.832764 5.71439 1.60859 4.05602 3.02121C2.39764 4.43382 1.29655 6.39086 0.950101 8.5416C0.919792 8.7209 0.928972 8.90467 0.977 9.08006C1.02503 9.25546 1.11075 9.41826 1.22818 9.55711C1.34561 9.69597 1.49192 9.80753 1.65691 9.88401C1.82189 9.96049 2.00158 10 2.18343 9.99993C2.48512 9.99546 2.77544 9.88416 3.00279 9.6858C3.23014 9.48744 3.37978 9.21489 3.4251 8.9166C3.68182 7.35781 4.48374 5.94084 5.68793 4.91827C6.89212 3.8957 8.42032 3.33399 10.0001 3.33326Z" fill="currentColor"/></svg>',deleteAllModalIcon=`
 <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.0024 0.988281C12.0357 0.988281 9.13563 1.86802 6.66889 3.51624C4.20216 5.16446 2.27957 7.50714 1.14426 10.248C0.00894067 12.9889 -0.288109 16.0049 0.290669 18.9146C0.869447 21.8244 2.29806 24.4971 4.39585 26.5949C6.49363 28.6927 9.16638 30.1213 12.0761 30.7001C14.9858 31.2788 18.0018 30.9818 20.7427 29.8465C23.4836 28.7112 25.8263 26.7886 27.4745 24.3218C29.1227 21.8551 30.0024 18.955 30.0024 15.9883C30.0024 14.0185 29.6145 12.0679 28.8606 10.248C28.1068 8.42815 27.0019 6.77456 25.609 5.38168C24.2162 3.9888 22.5626 2.88391 20.7427 2.13009C18.9228 1.37627 16.9723 0.988281 15.0024 0.988281ZM15.0024 27.9883C12.6291 27.9883 10.309 27.2845 8.3356 25.9659C6.36222 24.6473 4.82415 22.7732 3.91589 20.5805C3.00764 18.3878 2.77 15.975 3.23303 13.6472C3.69605 11.3194 4.83894 9.18123 6.51717 7.503C8.1954 5.82477 10.3336 4.68188 12.6614 4.21886C14.9891 3.75584 17.4019 3.99348 19.5947 4.90173C21.7874 5.80998 23.6615 7.34805 24.9801 9.32144C26.2987 11.2948 27.0024 13.6149 27.0024 15.9883C27.0024 19.1709 25.7382 22.2231 23.4877 24.4736C21.2373 26.724 18.185 27.9883 15.0024 27.9883Z" fill="black"/>
<path d="M15.0059 23.493C15.8343 23.493 16.5059 22.8214 16.5059 21.993C16.5059 21.1646 15.8343 20.493 15.0059 20.493C14.1774 20.493 13.5059 21.1646 13.5059 21.993C13.5059 22.8214 14.1774 23.493 15.0059 23.493Z" fill="black"/>
<path d="M15.0059 8.49063C14.608 8.49063 14.2265 8.64867 13.9452 8.92997C13.6639 9.21128 13.5059 9.59281 13.5059 9.99063V17.4906C13.5059 17.8885 13.6639 18.27 13.9452 18.5513C14.2265 18.8326 14.608 18.9906 15.0059 18.9906C15.4037 18.9906 15.7852 18.8326 16.0665 18.5513C16.3478 18.27 16.5059 17.8885 16.5059 17.4906V9.99063C16.5059 9.59281 16.3478 9.21128 16.0665 8.92997C15.7852 8.64867 15.4037 8.49063 15.0059 8.49063Z" fill="black"/>
</svg>
`,deleteAllModalIconClose=`
  <svg
    class="deleteAllModalIconClose"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 17.2399L11.5055 21.7343C11.3284 21.9114 11.1218 22 10.8856 22C10.6494 22 10.4428 21.9114 10.2657 21.7343C10.0886 21.5572 10 21.3506 10 21.1144C10 20.8782 10.0886 20.6716 10.2657 20.4945L14.7601 16L10.2657 11.5055C10.0886 11.3284 10 11.1218 10 10.8856C10 10.6494 10.0886 10.4428 10.2657 10.2657C10.4428 10.0886 10.6494 10 10.8856 10C11.1218 10 11.3284 10.0886 11.5055 10.2657L16 14.7601L20.4945 10.2657C20.6716 10.0886 20.8782 10 21.1144 10C21.3506 10 21.5572 10.0886 21.7343 10.2657C21.9114 10.4428 22 10.6494 22 10.8856C22 11.1218 21.9114 11.3284 21.7343 11.5055L17.2399 16L21.7343 20.4945C21.9114 20.6716 22 20.8782 22 21.1144C22 21.3506 21.9114 21.5572 21.7343 21.7343C21.5572 21.9114 21.3506 22 21.1144 22C20.8782 22 20.6716 21.9114 20.4945 21.7343L16 17.2399Z"
      fill="#181818"
    />
  </svg>

`,openDeleteAllModal=e=>{var t=$("#"+deleteAllModalIds.container),a=$("#"+deleteAllModalIds.button.confirm);t.removeClass(deleteAllModalVisibilityClasses.hidden).addClass(deleteAllModalVisibilityClasses.visible).attr("aria-hidden","false"),a.focus()},closeDeleteAllModal=e=>{$("#"+deleteAllModalIds.container).addClass(deleteAllModalVisibilityClasses.hidden).removeClass(deleteAllModalVisibilityClasses.visible).attr("aria-hidden","true")},deleteAllHandler=e=>{let t=$("#"+deleteAllModalIds.button.confirm);t.html(deleteAllModalSpinner),window.scroll({top:0,behavior:"instant"}),vtexjs.checkout.removeAllItems().done(function(){setTimeout(()=>{t.html(deleteAllModalTexts.button.confirm),closeDeleteAllModal(e)},500)})};try{$(document).ready(function(){let n=$(`
        <button
          id="${deleteAllButtonId}"
          class="deleteAllButton"
          onclick="openDeleteAllModal(event)"
        >
          Esvaziar sacola
        </button>
      `);var e=$(`
        <div
          id="${deleteAllModalIds.container}"
          class="deleteAllModalContainer hidden"
        >
          <div
            class="deleteAllModal"
            id="${deleteAllModalIds.root}"
            role="alertdialog"
            aria-labelledby="${deleteAllModalIds.label}"
            aria-describedby="${deleteAllModalIds.description}"
            aria-modal="true"
            aria-hidden="true"
          >
            <button
              class="deleteAllModalButtonClose"
              id="${deleteAllModalIds.button.close}"
              onclick="closeDeleteAllModal(event)"
            >
              ${deleteAllModalIconClose}
            </button>
            ${deleteAllModalIcon}
            <h2
              class="deleteAllModalLabel"
              id="${deleteAllModalIds.label}"
            >
              ${deleteAllModalTexts.label}
            </h2>
            <p
              class="deleteAllModalDescription"
              id="${deleteAllModalIds.description}"
            >
              ${deleteAllModalTexts.description}
            </p>
            <div class="deleteAllModalButtons">
              <button
                id="${deleteAllModalIds.button.cancel}"
                class="deleteAllModalButtonCancel"
                onclick="closeDeleteAllModal(event)"
              >
                ${deleteAllModalTexts.button.cancel}
              </button>
              <button
                id="${deleteAllModalIds.button.confirm}"
                class="deleteAllModalButtonConfirm"
                onclick="deleteAllHandler(event)"
              >
                ${deleteAllModalTexts.button.confirm}
              </button>
            </div>
          </div>
          <div
            id="${deleteAllModalIds.overlay}"
            class="deleteAllModalOverlay"
            onclick="closeDeleteAllModal(event)"
          ></div>
        </div>
      `);$(document.body).append(e),waitUntilExists(titlevitrineSelector,e=>{n.insertAfter(e)}),$(window).on("orderFormUpdated.vtex",function(e,t){var t=t.items.length<=0,a=$("#"+deleteAllButtonId);t?a.remove():1<=a.length||waitUntilExists(titlevitrineSelector,e=>{n.insertAfter(e)})})})}catch(e){console.error("delete-all err",e)}async function insertModal(){await new Promise(e=>{document.body.insertAdjacentHTML("beforeend",`
             <div class="bf-shared-cart__overlay hidden">
               <div class="bf-shared-cart__modal">
               <span id="bf-shared-modal__close-button"></span>
               <p class="icon-check-in-modal"></p>
                 <p class="title-modal">Carrinho gerado com sucesso</p>
                 <p class="subtitle-modal">Link para compartilhamento:</p>
                 <a href="#"></a>
                 <br><button class="bf-shared-cart__button" id="bf-shared-cart__copy">Copiar</button>
                 <p class="bf-shared-cart__info-text" style="display:none">*Link copiado!</p>
               </div>
           </div>
           `),e(!0)})}async function insertShareCart(n){return vtexjs.checkout.getOrderForm().then(e=>{if(0<document.querySelectorAll(".orderform-template .custom-div").length)return!1;var t=document.querySelector(".custom-div"),a=document.querySelector(n);a&&!t&&a.insertAdjacentHTML("beforebegin",`
            <div class='custom-div'>         
               <div id="bf-shared-cart-container">
                  <button id="bf-shared-cart"><span class="icon-cart-share"><svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.69694 2.99971C9.69694 1.34371 11.1087 1.09319e-05 12.848 1.09319e-05C13.261 -0.00105405 13.6701 0.0757039 14.0521 0.225899C14.434 0.376093 14.7812 0.596781 15.074 0.875353C15.3667 1.15392 15.5991 1.48492 15.758 1.84942C15.9169 2.21393 15.9991 2.6048 16 2.99971C16 4.65661 14.5882 6.0003 12.848 6.0003C12.4307 6.0006 12.0175 5.92167 11.6323 5.76811C11.2472 5.61454 10.8977 5.38939 10.6042 5.10571L6.24188 7.9461C6.36315 8.52481 6.30357 9.12485 6.07059 9.6714L10.8536 12.6774C11.4172 12.2383 12.122 11.9989 12.8489 11.9997C13.2619 11.9988 13.671 12.0756 14.0529 12.2259C14.4348 12.3762 14.782 12.597 15.0746 12.8757C15.3673 13.1543 15.5996 13.4854 15.7584 13.8499C15.9172 14.2145 15.9993 14.6054 16 15.0003C16 16.6563 14.5882 18 12.848 18C12.4351 18.0009 12.0261 17.9241 11.6442 17.7738C11.2624 17.6236 10.9153 17.4029 10.6226 17.1243C10.33 16.8458 10.0977 16.5148 9.93884 16.1504C9.78 15.7859 9.69781 15.3951 9.69694 15.0003C9.69621 14.5797 9.78892 14.1637 9.96894 13.7799L5.22353 10.8C4.64868 11.2775 3.91253 11.54 3.15106 11.5389C2.73809 11.5398 2.32897 11.463 1.94707 11.3127C1.56518 11.1624 1.218 10.9416 0.925376 10.6629C0.632748 10.3843 0.400406 10.0532 0.241626 9.68865C0.0828465 9.3241 0.000740683 8.93321 0 8.5383C0.000864162 8.14347 0.0830612 7.75267 0.241896 7.38823C0.400731 7.02378 0.633092 6.69282 0.925708 6.41427C1.21832 6.13571 1.56546 5.915 1.94729 5.76475C2.32912 5.6145 2.73817 5.53766 3.15106 5.53861C4.15247 5.53861 5.04282 5.9823 5.61976 6.6735L9.84847 3.92041C9.7476 3.62305 9.69646 3.31232 9.69694 2.99971Z" fill="black"/>
</svg></span> Compartilhar sacola</button>
                </div>
              </div>
      `)})}function getBrasiliaDateInfo(){var e=new Intl.DateTimeFormat("en-US",{timeZone:"America/Sao_Paulo",hour:"numeric",hour12:!1,weekday:"short"}).formatToParts(new Date);let t=Number(e.find(e=>"hour"===e.type).value);24===t&&(t=0);e=e.find(e=>"weekday"===e.type).value;return{hour:t,day:{Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[e]}}function isExpressShipping(e){return!!e&&("expresso"===(e=String(e).trim().toLowerCase())||"expressa"===e)}function getExpressDeliveryMessage(e){var{hour:t,day:a}=getBrasiliaDateInfo();return 0===a||6===a&&18<=t?"Em até 60 minutos a partir de segunda-feira às 11h00":t<11?"Em até 60 minutos a partir das 11h00":18<=t?"Em até 60 minutos a partir de amanhã às 11h00":e||"Em até 60 minutos"}function checkShippingOptions(){$("#r").remove(),$(".srp-delivery-select-container").css("display","none");let s=$('<div id="r"></div>').insertAfter(".srp-result");$(".srp-delivery-select option").each(function(e,t){var a=$(this).parent().attr("label")||$(this).val();let n=$.trim(this.textContent.split("-")[0]||"");(isExpressShipping(a)||isExpressShipping($(this).val()))&&(n=getExpressDeliveryMessage(n));var a=$("<div class='shipping-option-info'><div class='shipping-option-info-container'><label><b>"+$(this).parent().attr("label")+"</b><span class='shipping-option-text'>"+n+"</span></label><span class='shipping-option-price'>"+this.textContent.split("-")[1]+"</span></div></div>"),o=$("<div class='shipping-option-info-input'><div></div></div>").attr("value",$(this).val()),i=$("<input type='radio' name='r' />").attr("value",$(this).val()).attr("checked",!!$(this).is(":selected")).click(function(){$(".srp-delivery-select").val($(this).val());var e=$(this).closest(".shipping-option-info").find("span.shipping-option-text").text();e?$("span.shipping-estimate-date:not(.shipping-estimate-detail)").text(e):$("span.shipping-estimate-date:not(.shipping-estimate-detail)").text(this.textContent.split("-")[0])});o.prepend(i),a.prepend(o),s.append(a),$(this).is(":selected")&&$("span.shipping-estimate-date:not(.shipping-estimate-detail)").text(n)})}function renderModal(){var e=document.createElement("div");return e.className="modal-signature",e.innerHTML=`
    <div class="modal-overlay" style="display:none;">
      <div class="modal-content assinatura-modal-content">
        <button class="close-btn" style="position:absolute;top:10px;right:10px;background:transparent;border:none;cursor:pointer;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="#211E1E" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div style="text-align:left;padding:10px 10px 0 10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.1667 3.49996H21V1.16663H18.6667V3.49996H9.33333V1.16663H7V3.49996H5.83333C4.55 3.49996 3.5 4.54996 3.5 5.83329V22.1666C3.5 23.45 4.55 24.5 5.83333 24.5H16.3333C15.6333 23.9166 15.05 23.1 14.5833 22.1666H5.83333V10.5H22.1667V12.3666C22.9833 12.4833 23.8 12.7166 24.5 13.1833V5.83329C24.5 4.54996 23.45 3.49996 22.1667 3.49996ZM22.1667 8.16663H5.83333V5.83329H22.1667M21 14.5833C22.2833 14.5833 23.45 15.05 24.2667 15.9833L25.6667 14.5833V19.25H21L23.1 17.15C22.5167 16.6833 21.8167 16.3333 21 16.3333C19.3667 16.3333 18.0833 17.6166 18.0833 19.25C18.0833 20.8833 19.3667 22.1666 21 22.1666C21.9333 22.1666 22.75 21.7 23.3333 21H25.3167C24.6167 22.75 22.9833 23.9166 21 23.9166C18.4333 23.9166 16.3333 21.8166 16.3333 19.25C16.3333 16.6833 18.4333 14.5833 21 14.5833Z" fill="#006EA8"/>
            </svg>
            <span style="color:#006EA8;font-weight:700;font-size:16px;">ASSINATURA DE PRODUTO</span>
          </div>
          <div style="margin:10px 0 20px 0;color:#211E1E;font-size:16px;">Programe sua compra e receba em casa os produtos essenciais na frequência desejada.</div>
          <div class="assinatura-modal-box">
            <div class="assinatura-modal-item">
              <span style="display:flex;align-items:center;gap:8px;">
                <i><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.8379 3.66666H9.16209C5.69709 3.66666 3.96459 3.66666 2.88751 4.74099C2.14501 5.47982 1.91492 6.52941 1.84251 8.23991C1.82876 8.57907 1.82142 8.74957 1.88467 8.86232C1.94884 8.97507 2.20092 9.11716 2.70692 9.39949C2.99195 9.55839 3.22937 9.79052 3.39465 10.0719C3.55993 10.3533 3.64707 10.6737 3.64707 11C3.64707 11.3263 3.55993 11.6467 3.39465 11.9281C3.22937 12.2095 2.99195 12.4416 2.70692 12.6005C2.20092 12.8837 1.94792 13.0249 1.88467 13.1377C1.82142 13.2504 1.82876 13.42 1.84342 13.7592C1.91492 15.4706 2.14592 16.5202 2.88751 17.259C3.96367 18.3333 5.69617 18.3333 9.16209 18.3333H12.8379C16.3029 18.3333 18.0354 18.3333 19.1125 17.259C19.855 16.5202 20.0851 15.4706 20.1575 13.7601C20.1713 13.4209 20.1786 13.2504 20.1153 13.1377C20.0512 13.0249 19.7991 12.8837 19.2931 12.6005C19.0081 12.4416 18.7706 12.2095 18.6054 11.9281C18.4401 11.6467 18.3529 11.3263 18.3529 11C18.3529 10.6737 18.4401 10.3533 18.6054 10.0719C18.7706 9.79052 19.0081 9.55839 19.2931 9.39949C19.7991 9.11716 20.0521 8.97507 20.1153 8.86232C20.1786 8.74957 20.1713 8.57999 20.1566 8.23991C20.0851 6.52941 19.8541 5.48074 19.1125 4.74099C18.0363 3.66666 16.3038 3.66666 12.8379 3.66666Z" stroke="#211E1E" stroke-width="2"/>
<path d="M8.25 13.75L13.75 8.25" stroke="#211E1E" stroke-width="2" stroke-linecap="round"/>
<path d="M14.2084 13.2917C14.2084 13.5348 14.1118 13.7679 13.9399 13.9398C13.768 14.1117 13.5348 14.2083 13.2917 14.2083C13.0486 14.2083 12.8154 14.1117 12.6435 13.9398C12.4716 13.7679 12.375 13.5348 12.375 13.2917C12.375 13.0485 12.4716 12.8154 12.6435 12.6435C12.8154 12.4716 13.0486 12.375 13.2917 12.375C13.5348 12.375 13.768 12.4716 13.9399 12.6435C14.1118 12.8154 14.2084 13.0485 14.2084 13.2917ZM9.62502 8.70832C9.62502 8.95144 9.52844 9.1846 9.35653 9.3565C9.18463 9.52841 8.95147 9.62499 8.70835 9.62499C8.46524 9.62499 8.23208 9.52841 8.06017 9.3565C7.88826 9.1846 7.79169 8.95144 7.79169 8.70832C7.79169 8.46521 7.88826 8.23205 8.06017 8.06014C8.23208 7.88823 8.46524 7.79166 8.70835 7.79166C8.95147 7.79166 9.18463 7.88823 9.35653 8.06014C9.52844 8.23205 9.62502 8.46521 9.62502 8.70832Z" fill="#211E1E"/>
</svg></i>

                Ative a compra recorrente e ganhe na próxima compra 10% de desconto no produto de assinatura.
              </span>
            </div>
            <div class="assinatura-modal-item">
              <span style="display:flex;align-items:center;gap:8px;">
                <i><svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="26" height="34" fill="white"/>
<path d="M19.5455 23.9062C20.4509 23.9062 21.1818 23.1944 21.1818 22.3125C21.1818 21.4306 20.4509 20.7188 19.5455 20.7188C18.64 20.7188 17.9091 21.4306 17.9091 22.3125C17.9091 23.1944 18.64 23.9062 19.5455 23.9062ZM21.1818 14.3438H18.4545V17H23.32L21.1818 14.3438ZM6.45455 23.9062C7.36 23.9062 8.09091 23.1944 8.09091 22.3125C8.09091 21.4306 7.36 20.7188 6.45455 20.7188C5.54909 20.7188 4.81818 21.4306 4.81818 22.3125C4.81818 23.1944 5.54909 23.9062 6.45455 23.9062ZM21.7273 12.75L25 17V22.3125H22.8182C22.8182 24.0763 21.3564 25.5 19.5455 25.5C17.7345 25.5 16.2727 24.0763 16.2727 22.3125H9.72727C9.72727 24.0763 8.26545 25.5 6.45455 25.5C4.64364 25.5 3.18182 24.0763 3.18182 22.3125H1V10.625C1 9.44563 1.97091 8.5 3.18182 8.5H18.4545V12.75H21.7273ZM3.18182 10.625V20.1875H4.01091C4.61091 19.5394 5.48364 19.125 6.45455 19.125C7.42545 19.125 8.29818 19.5394 8.89818 20.1875H16.2727V10.625H3.18182ZM5.36364 15.4062L7 13.8125L8.63636 15.4062L12.4545 11.6875L14.0909 13.2812L8.63636 18.5938L5.36364 15.4062Z" fill="#211E1E"/>
</svg></i>
                Frete grátis nas próximas compras recorrentes acima de R$ 80,00.
              </span>
            </div>
            <div class="assinatura-modal-item">
              <span style="display:flex;align-items:center;gap:8px;">
                <i>
                <svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="26" height="34" fill="white"/>
<path d="M9.66667 15.9H7.44444V18.1H9.66667V15.9ZM14.1111 15.9H11.8889V18.1H14.1111V15.9ZM18.5556 15.9H16.3333V18.1H18.5556V15.9ZM20.7778 8.2H19.6667V6H17.4444V8.2H8.55556V6H6.33333V8.2H5.22222C3.98889 8.2 3 9.19 3 10.4V25.8C3 26.3834 3.23412 26.943 3.65088 27.3556C4.06762 27.7682 4.63286 28 5.22222 28H20.7778C21.3671 28 21.9323 27.7682 22.3491 27.3556C22.7659 26.943 23 26.3834 23 25.8V10.4C23 9.81653 22.7659 9.25695 22.3491 8.84437C21.9323 8.43178 21.3671 8.2 20.7778 8.2ZM20.7778 25.8H5.22222V13.7H20.7778V25.8Z" fill="#211E1E"/>
</svg>
                </i>
                Crie, altere pule ou cancele sua assinatura sempre que quiser.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,document.body.appendChild(e),$(document).on("click",".openModal",function(){$(".modal-overlay").css({display:"flex"}),$(".modal-overlay").fadeIn()}),$(document).on("click",".close-btn",function(){$(".modal-overlay").fadeOut()}),$(document).on("click",".modal-overlay",function(e){e.target===this&&$(".modal-overlay").fadeOut()}),e}function createSelectElement(n,o,e=!1){var t=$("<div>",{class:"optionGroup"}),a=$("<div>",{class:"optionSelected"}),i=$("<div>",{class:"container-select"});let s=!o,l=s?"COMPRA RECORRENTE":"";s||([r]=o.trim().split(" "),d=1<parseInt(r)?"meses":"mês",l=`A cada <strong>${r} ${d}</strong>`);var r=$("<span>",{class:"text",html:l}),d=$("<span>",{class:"icon",text:""}),r=(a.append(r,d),s?a.addClass("button-initial"):a.addClass("selected"),n.map(e=>{var[e]=e.trim().split(" ");return e+" "+(1<parseInt(e)?"meses":"mês")}));let c=$("<div>",{class:"options",style:"display:none"});r.forEach((e,t)=>{var a=!s&&o&&o.trim()===n[t].trim(),t=$(`<div id="${n[t]}" class="option${a?" selected":""}">A cada&nbsp;<strong>${e}</strong></div>`);c.append(t)}),c.prepend('<div class="option" id="remove" style="cursor:no-drop;pointer-events:none">Selecione a frequência</div>'),i.append(a,c),t.append(i),t.append("<div class='buttons-container'></div>");d=t.find(".buttons-container");return e&&d.append(`<button class="removeSignature">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.6094 11.761L6.00049 7.15202L1.3916 11.761C1.31617 11.8367 1.2266 11.8967 1.12793 11.9376C1.02926 11.9786 0.923237 11.9997 0.816406 11.9997C0.709575 11.9997 0.60404 11.9786 0.505371 11.9376C0.406702 11.8967 0.316643 11.8367 0.241211 11.761C0.1655 11.6854 0.105434 11.5956 0.0644531 11.4968C0.0234723 11.398 0.00244141 11.292 0.00244141 11.185C0.00244141 11.078 0.0234723 10.9721 0.0644531 10.8732C0.105434 10.7744 0.1655 10.6846 0.241211 10.609L4.84961 6.00101L0.239258 1.39101C0.163546 1.31541 0.103481 1.22563 0.0625 1.12679C0.0215192 1.02796 0.000488281 0.922005 0.000488281 0.81501C0.000488281 0.708015 0.0215192 0.60207 0.0625 0.503235C0.103481 0.404399 0.163546 0.314616 0.239258 0.239014C0.31486 0.163302 0.404582 0.103237 0.503418 0.0622559C0.602253 0.0212751 0.708435 0.000183105 0.81543 0.000183105C0.922424 0.000183105 1.02861 0.0212751 1.12744 0.0622559C1.22628 0.103237 1.316 0.163302 1.3916 0.239014L6.00146 4.84901L10.6113 0.239014C10.6869 0.163302 10.7767 0.103237 10.8755 0.0622559C10.9743 0.0212751 11.0805 0.000183105 11.1875 0.000183105C11.2945 0.000183105 11.4002 0.0212751 11.499 0.0622559C11.5979 0.103237 11.6876 0.163302 11.7632 0.239014C11.9151 0.392218 12.0005 0.599243 12.0005 0.81501C12.0005 1.03078 11.9151 1.23781 11.7632 1.39101L7.15234 6.00101L11.7612 10.61C11.9139 10.7628 12 10.97 12 11.186C12 11.402 11.9139 11.6092 11.7612 11.762C11.6857 11.8378 11.5959 11.8979 11.4971 11.9389C11.3982 11.9799 11.2926 12.001 11.1855 12.001C11.0785 12.001 10.9724 11.9797 10.8735 11.9386C10.7747 11.8974 10.6848 11.837 10.6094 11.761Z" fill="#707070"/>
</svg>
    </button>`),d.append(`<button class='openModal'><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 15C10.2833 15 10.521 14.904 10.713 14.712C10.905 14.52 11.0007 14.2827 11 14V10C11 9.71667 10.904 9.47933 10.712 9.288C10.52 9.09667 10.2827 9.00067 10 9C9.71733 8.99933 9.48 9.09533 9.288 9.288C9.096 9.48067 9 9.718 9 10V14C9 14.2833 9.096 14.521 9.288 14.713C9.48 14.905 9.71733 15.0007 10 15ZM10 7C10.2833 7 10.521 6.904 10.713 6.712C10.905 6.52 11.0007 6.28267 11 6C10.9993 5.71733 10.9033 5.48 10.712 5.288C10.5207 5.096 10.2833 5 10 5C9.71667 5 9.47933 5.096 9.288 5.288C9.09667 5.48 9.00067 5.71733 9 6C8.99933 6.28267 9.09533 6.52033 9.288 6.713C9.48067 6.90567 9.718 7.00133 10 7ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88334 18.6867 3.825 17.9743 2.925 17.075C2.025 16.1757 1.31267 15.1173 0.788001 13.9C0.263335 12.6827 0.000667933 11.3827 1.26582e-06 10C-0.000665401 8.61733 0.262001 7.31733 0.788001 6.1C1.314 4.88267 2.02633 3.82433 2.925 2.925C3.82367 2.02567 4.882 1.31333 6.1 0.788C7.318 0.262667 8.618 0 10 0C11.382 0 12.682 0.262667 13.9 0.788C15.118 1.31333 16.1763 2.02567 17.075 2.925C17.9737 3.82433 18.6863 4.88267 19.213 6.1C19.7397 7.31733 20.002 8.61733 20 10C19.998 11.3827 19.7353 12.6827 19.212 13.9C18.6887 15.1173 17.9763 16.1757 17.075 17.075C16.1737 17.9743 15.1153 18.687 13.9 19.213C12.6847 19.739 11.3847 20.0013 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="black"/>
</svg></button>`),t}function sendActionSignature({index:e,method:t,frequency:a,callback:n}){fetch(`/api/checkout/pub/orderForm/${vtexjs.checkout.orderFormId}/items/${e}/attachments/vtex.subscription.assinatura`,{method:t,headers:{"Content-Type":"application/json"},body:JSON.stringify({content:{"vtex.subscription.key.frequency":a||""}})}).then(e=>e.json()).then(e=>{n&&n()}).catch(e=>console.error("Erro:",e))}function hideIcon(e){e=e.find(".icon");e.hide(),e.css({display:"none",visibility:"hidden",opacity:"0",position:"absolute","pointer-events":"none"}),e.addClass("hidden")}$(window).on("load",async function(){await insertModal();var e=document.querySelector(".custom-div");e&&e.remove(),"#/cart"===location.hash?await insertShareCart("body.body-cart .cart-more-options",!0):await insertShareCart("body.body-cart .orderform-template",!1);let t=document.querySelector(".bf-shared-cart__modal"),a=document.querySelector(".bf-shared-cart__modal a"),n=document.querySelector(".bf-shared-cart__overlay");var e=document.querySelector("#bf-shared-cart"),o=document.getElementById("bf-shared-cart__copy"),i=document.getElementById("bf-shared-modal__close-button");e&&e.addEventListener("click",async function(e){e.preventDefault(),e.stopPropagation();e=vtexjs.checkout.orderForm.orderFormId;a.innerHTML=`https://www.pensefarma.com.br/checkout/?orderFormId=${e}#/cart`,n.classList.remove("hidden"),t.classList.remove("hidden")}),n.addEventListener("click",function(e){e.stopPropagation(),e.target.classList.contains("bf-shared-cart__overlay")&&(n.classList.add("hidden"),t.classList.add("hidden"))}),o.addEventListener("click",function(e){var t=document.createRange();t.selectNode(a),window.getSelection().addRange(t),document.execCommand("copy"),window.getSelection().removeAllRanges(),$(".bf-shared-cart__info-text").fadeIn(),setTimeout(()=>$(".bf-shared-cart__info-text").fadeOut(),2500)}),i.addEventListener("click",function(){n.classList.add("hidden"),t.classList.add("hidden")})}),$(window).on("hashchange",()=>{updateSteps(),"#/cart"===location.hash?insertShareCart("body.body-cart .cart-more-options",!0):insertShareCart("body.body-cart .orderform-template",!1)}),$("body").on("click","#r .shipping-option-info",function(){$(".shipping-option-info-input").removeClass("clicado"),$(".shipping-option-info").removeClass("clicado"),$(this).addClass("clicado"),$(this).find(".shipping-option-info-input").addClass("clicado");var e=$("tr.Items td.monetary").text().split("R$ ")[1],t=$(this).find("span.shipping-option-price")[0],a=0,t=(t&&(a=parseFloat(t.innerText.replace("R$","").replace(",","."))),descontoElement=$("tr.Discounts td.monetary"),desconto=0,$(this).find("span.shipping-option-text").text()),t=(t?$("span.shipping-estimate-date:not(.shipping-estimate-detail)").text(t):(t=$(this).find("input[type='radio']").val(),0<(t=$(".srp-delivery-select option[value='"+t+"']")).length&&(t=t.text().split("-")[0],$("span.shipping-estimate-date:not(.shipping-estimate-detail)").text(t))),e=Number.isNaN(e)?0:parseFloat(e.replace(",",".")),0<descontoElement.length&&(t=descontoElement.text().split("R$ ")[1],desconto=Number.isNaN(t)?0:parseFloat(t.replace(",","."))),desconto=-desconto,a=Number.isNaN(a)?0:a,$(".srp-summary-result td.monetary").text("R$ "+a.toFixed(2).replace(".",",")),$(".srp-summary-result td.monetary").closest("table").find("tfoot td.monetary").text("R$ "+e.toFixed(2).replace(".",",")),e+a-desconto);$(".accordion-inner tfoot td.monetary").text("R$ "+t.toFixed(2).replace(".",","))}),$(window).on("orderFormUpdated.vtex",function(e,t){var a=setInterval(function(){$(".srp-delivery-select").length&&(checkShippingOptions(),clearInterval(a))},100);localStorage.getItem("activeDeliveryChannel")&&"pickup-in-point"==localStorage.getItem("activeDeliveryChannel")?$("#r").hide():$("#r").show()}),$(document).ready(function(){var e=setInterval(function(){$(".srp-delivery-select").length&&(checkShippingOptions(),clearInterval(e))},100);setInterval(function(){$(".srp-postal-code").length&&$("#r").remove()},100)}),$(window).on("hashchange",function(){window.location.hash.match(/shipping/g)&&$("#delivery-packages-options .shp-lean-option").each(function(e,t){$("#r input.clicado").attr("value")==$(this).attr("id")&&$(this).click()}),S}),$(".srp-address-title").click(function(){setInterval(function(){orderForm.shippingData.logisticsInfo[0].selectedDeliveryChannel;var e=("best-pickupPoint-"+orderForm.shippingData.logisticsInfo[0].selectedSla).replace(/([.*+?^=!:${}()|\[\]\/\\])/g,"\\$1");0<$("."+e).length&&$("."+e).addClass("selected-pickuppoint")},100)}),document.addEventListener("DOMContentLoaded",function(){function a(){var e,t=document.querySelector(".free-shipping__barActive");t&&(e=(t.getAttribute("style")||"").match(/width:\s*([\d.]+)%/))&&(e=parseFloat(e[1]),t.style.backgroundColor=100<=e?"#0D986A":"#211E1E")}!function e(){var t=document.querySelector(".free-shipping__barActive");t?(a(),new MutationObserver(function(e){a()}).observe(t,{attributes:!0,attributeFilter:["style"]})):setTimeout(e,500)}()}),$(document).ready(function(){renderModal(),$(window).on("orderFormUpdated.vtex",function(e,o){o.items.map((e,t)=>{var a,n;0<e.attachmentOfferings.length&&((a=$(`tr.product-item[data-sku="${e.id}"] td.product-name`)).find(".optionGroup").remove(),(e=createSelectElement((n=e.attachmentOfferings[0].schema)[Object.keys(n)[0]].domain,(n=e.attachments?.find(e=>"vtex.subscription.assinatura"===e.name))?.content?.["vtex.subscription.key.frequency"],!!n)).attr("data-index",t),e.attr("data-orderform-id",o.orderFormId),a.append(e))})}),$(document).on("click",".optionSelected",function(){var e=$(this),t=e.siblings(".options");e.find(".icon").css({opacity:"1"}),t.is(":visible")?(t.hide(),"COMPRA RECORRENTE"===e.find(".text").text().trim().toUpperCase()&&(e.removeClass("selected").addClass("button-initial"),e.find(".text").text("COMPRA RECORRENTE"),e.css({border:"1.5px solid #006ea8",color:"#006ea8","text-transform":"uppercase","font-weight":"700","justify-content":"center"}),e.find(".icon").css({opacity:"0"}))):($(".options").hide(),t.show()),e.hasClass("button-initial")&&(e.removeClass("button-initial").addClass("selected"),e.find(".icon").show(),e.find(".icon").css({transform:"rotate(-180deg)"}))}),$(document).on("click",".option",function(){var e=$(this),t=e.closest(".optionGroup"),a=t.find(".optionSelected"),n=e.html(),n=(a.find(".text").html(n),a.removeClass("button-initial").addClass("selected"),a.find(".icon").show(),t.find(".options").hide(),t.find(".option").removeClass("selected"),e.addClass("selected"),e.attr("id"));sendActionSignature({index:t.data("index"),method:"POST",frequency:n,callback:function(){vtexjs.checkout.getOrderForm().done(function(e){$(window).trigger("orderFormUpdated.vtex",e)})}})}),$(document).on("click",".removeSignature",function(){sendActionSignature({index:$(this).closest(".optionGroup").data("index"),method:"DELETE",callback:function(){vtexjs.checkout.getOrderForm().done(function(e){$(window).trigger("orderFormUpdated.vtex",e)})}})})}),$(window).on("orderFormUpdated.vtex",function(e,t){let a=$(".empty-cart-content"),n=$(".title-bottom-vitrine"),o=("display: block;"==a.attr("style")&&(n.attr("style","display: none !important;"),clearInterval(o)),setInterval(()=>{"display: block;"==a.attr("style")&&(n.attr("style","display: none !important;"),clearInterval(o))},50));clearInterval(o)}),document.body.insertAdjacentHTML("beforeend",`
      <div id="custom-payment-modal" style="display:none">
          <div class="modal-content">
              <span class="modal-close" aria-label="Fechar modal">&times;</span>
              <div class="modal-header">
                  <img src="https://pensefarma.vtexassets.com/assets/vtex.file-manager-graphql/images/bec3ae15-0258-4575-b474-387dfb867aba___51c978ce3938d2452bcf9925c851ec7f.svg" alt="alerta">
              </div>
              <div class="modal-body-attention">
                  <p class="attention">Atenção:</p>
                  <p class="attention-text">A compensação bancária para boletos pode levar <b>até 3 dias úteis.</b> Seu pedido será liberado somente após esta confirmação.</p>
              </div>
              <div class="modal-footer">
                  <button class="btn-modal btn-confirm" onclick="document.getElementById('custom-payment-modal').style.display='none'">Entendi</button>
              </div>
          </div>
      </div>
  `),$(document).on("click",".payment-group-item#payment-group-bankInvoicePaymentGroup",function(e){$("#custom-payment-modal").css("display","flex").hide().fadeIn(200)}),$(document).on("click","#custom-payment-modal .modal-close",function(){$("#custom-payment-modal").fadeOut(200)}),(()=>{if(!window.__receitaSelectorInitialized){window.__receitaSelectorInitialized=!0;let i="receita-modal-overlay",s="isReceitaFisica",l="pensefarma_receita_fisica",r=null;function t(){var e=document.querySelector(".srp-toggle__pickup");return e&&e.classList.contains("blue")}function a(){var e;return t()||((e=document.querySelector(".srp-toggle__pickup"))&&e.click(),t())}function d(){var e;document.body.classList.contains(s)&&(a()?r&&(clearInterval(r),r=null):r||(e=0,r=setInterval(function(){e++,(a()||30<=e)&&(clearInterval(r),r=null)},500)))}function c(e){let t=e.nextElementSibling;for(;t&&!t.classList.contains("product-item");){if(t.classList.contains("receita-container"))return t;t=t.nextElementSibling}return null}function e(){var e=document.querySelectorAll(".product-item");e.length&&e.forEach(e=>{var t;!e.querySelector(".info-receita")||e.nextElementSibling&&e.nextElementSibling.classList.contains("custom-selector-row")||(t=c(e))&&(t.style.display="none",(t=document.createElement("tr")).className="custom-selector-row",t.innerHTML=`
      <td colspan="7">
        <div class="selector-box">
          <div class="selector-text">
          <div class="selector-text-icon">
          <img src="https://pensefarma.vtexassets.com/assets/vtex.file-manager-graphql/images/739a3672-0393-46c1-9ec5-c683f5031333___ca5ae4a61cba9ac311d94471f3e0d9f0.svg" alt="Seta">
          </div>
          <div class="selector-text-content">
              <h4>Este medicamento exige retenção da receita original:</h4>
              <p>Informe o tipo da receita para finalizar seu pedido.</p>
            </div>
          </div>
          <div class="btn-group-custom">
            <button class="btn-sel btn-digital-trigger" type="button">Receita Digital</button>
            <span style="font-size:10px; color:#999">OU</span>
            <button class="btn-sel btn-fisica-trigger" type="button">Receita Física</button>
          </div>
        </div>
      </td>
    `,e.insertAdjacentElement("afterend",t))})}document.addEventListener("click",e=>{var t,a,n,o;e.target.closest(".m-close")?(t=document.getElementById(i))&&(t.style.display="none"):(t=e.target.closest(".btn-digital-trigger"))?(document.body.classList.remove(s),sessionStorage.removeItem(l),r&&(clearInterval(r),r=null),(n=(n=t).closest(".custom-selector-row"))&&(n=n.previousElementSibling)&&n.classList.contains("product-item")&&(n=c(n))&&(a="none"===getComputedStyle(n).display,n.style.display=a?"":"none",a)&&n.scrollIntoView({behavior:"smooth",block:"start"})):(a=e.target.closest(".btn-fisica-trigger"))?((o=(o=(n=a.closest(".custom-selector-row"))?n.previousElementSibling:null)&&o.classList.contains("product-item")?c(o):null)&&(o.style.display="none"),(o=document.getElementById(i))||((o=document.createElement("div")).id=i,o.className="m-overlay",o.style.display="none",o.innerHTML=`
      <div class="m-box">
        <span class="m-close">&times;</span>
        <div>
        <img src="https://pensefarma.vtexassets.com/assets/vtex.file-manager-graphql/images/aa47569c-1802-44fc-a509-0c53a15ca57d___7ca5538c76008d1d2e321bc6db2b48fc.svg" alt="alerta">
        </div>
        <h3>Medicamento exige retenção de receita original:</h3>
        <p><bold style="font-weight: 700;">Termo de aceite:</bold> Ao comprar este produto, estou ciente de que será necessário a apresentação, avaliação e retenção de receita médica original do mesmo no momento da Retirada em Loja. A não apresentação de receita na retirada implica no cancelamento automático da compra do produto.</p>
        <label class="check-modal-label">
          <input type="checkbox" id="check-modal" class="check-modal-input">
          <span class="check-modal-control" aria-hidden="true"></span>
          <span>Li e aceito os termos de compra.</span>
        </label>
        <button class="m-btn" id="btn-modal-confirm" disabled>Continuar</button>
      </div>
    `,document.body.appendChild(o)),o.style.display="flex"):(o=e.target.closest("#btn-modal-confirm"))&&!o.disabled&&(document.body.classList.add(s),sessionStorage.setItem(l,"1"),d(),e=document.getElementById(i))&&(e.style.display="none")}),document.addEventListener("change",e=>{var t,e=e.target.closest("#check-modal");e&&(t=document.getElementById("btn-modal-confirm"))&&(t.disabled=!e.checked,t.classList.toggle("active",e.checked))}),"1"===sessionStorage.getItem(l)&&(document.body.classList.add(s),d()),e(),setTimeout(e,500),setTimeout(e,1500),$(window).on("orderFormUpdated.vtex",function(){d()}),new MutationObserver(function(){e(),d()}).observe(document.body,{childList:!0,subtree:!0})}})();