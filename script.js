/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/arquivos/js/components/CheckoutUI.js":
/*!**************************************************!*\
  !*** ./src/arquivos/js/components/CheckoutUI.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ CheckoutUI; }
  /* harmony export */ });
  /* harmony import */ var _helpers_MediasMatch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/MediasMatch */ "./src/arquivos/js/helpers/MediasMatch.js");
  /* harmony import */ var _helpers_vtexUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/vtexUtils */ "./src/arquivos/js/helpers/vtexUtils.js");
  /* harmony import */ var _helpers_waitForEl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../helpers/waitForEl */ "./src/arquivos/js/helpers/waitForEl.js");
  /* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
  
  
  
  
  class CheckoutUI {
      constructor() {
          this.init();
  
          if (_helpers_MediasMatch__WEBPACK_IMPORTED_MODULE_0__.isSmallerThen768) {
              this.selectors();
              this.events();
              this.setFooterDropdown();
          }
      }
  
      selectors() {
          this.title = $(".footerCheckout__title");
          this.contents = $(".footerCheckout__content");
      }
  
      events() {
          this.title.click(this.toggleFooterDropdown.bind(this));
      }
  
      setFooterDropdown() {
          for (let i = 0; i < this.title.length; i++) {
              this.title[i].classList.add("dropdown__title");
              this.contents[i].classList.add("dropdown__content--closed");
          }
      }
  
      toggleFooterDropdown(event) {
          event.target.classList.toggle("closed");
  
          event.target.nextElementSibling.classList.toggle(
              "dropdown__content--closed"
          );
      }
  
      init() {
          this.configThumb();
          (0,_helpers_waitForEl__WEBPACK_IMPORTED_MODULE_2__.default)(".product-image img", this.resizeImages.bind(this));
          $(window).on("orderFormUpdated.vtex", this.resizeImages.bind(this));
      }
  
      configThumb() {
          if (_helpers_MediasMatch__WEBPACK_IMPORTED_MODULE_0__.isSmallerThen768) {
              this.width = 73;
              this.height = 96;
          } else {
              this.width = 63;
              this.height = 83;
          }
      }
  
      resizeImages() {
          $(".product-image img").each((i, el) => {
              const $el = $(el);
              $el.attr(
                  "src",
                  (0,_helpers_vtexUtils__WEBPACK_IMPORTED_MODULE_1__.alterarTamanhoImagemSrcVtex)(
                      $el.attr("src"),
                      this.width,
                      this.height
                  )
              );
          });
      }
  }
  
  
  /***/ }),
  
  /***/ "./src/arquivos/js/components/CustomInstallmentPerItems.js":
  /*!*****************************************************************!*\
    !*** ./src/arquivos/js/components/CustomInstallmentPerItems.js ***!
    \*****************************************************************/
  /***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {
  
  /* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
  // Injeta estilos do componente de parcelas nos itens do carrinho (uma vez)
  function InsertStylesMinicartItems() {
    if (document.getElementById('custom-installment-item-minicart-style')) return
    const style = document.createElement('style')
    style.id = 'custom-installment-item-minicart-style'
    style.innerHTML = `
      .custom-installment-total {
        font-size: 14px;
        color: #707070;
        display: flex;
        width: 175px;
        max-height: 10px;
        position: absolute;
        font-family: 'Ubuntu', sans-serif;
        font-weight: 400;
        line-height: 16px;
        right: -111px;
        top: -18px;
      }
      @media (min-width: 1024px) {
        .custom-installment-total {
          display: none;
        }
      }
    `
    document.head.appendChild(style)
  }
  
  // Adiciona estilos ao total-selling-price quando tem list-price
  function InsertClassToTotalSellingPrice() {
    document.querySelectorAll('.cart-items .product-item').forEach(el => {
      const listPrice = el.querySelector('.product-price .list-price')
      if (listPrice?.classList.contains('hide')) {
        const totalSellingPrice = el.querySelector('.total-selling-price')
        if (totalSellingPrice && !totalSellingPrice.classList.contains('no-list-price')) {
          totalSellingPrice.classList.add('no-list-price')
        }
      }
    })
  }
  
  // Aguarda VTEX JS (orderForm) estar disponível antes de executar a lógica
  function waitForVtexjs(callback) {
    if (typeof callback !== 'function') return
    if (window.vtexjs && window.vtexjs.checkout && window.vtexjs.checkout.getOrderForm) {
      callback();
    } else {
      setTimeout(() => waitForVtexjs(callback), 2000);
    }
  }
  
  // Bloco principal: registra estados, injeta estilos e amarra eventos de atualização
  waitForVtexjs(function () {
    const renderedLineItemKeys = new Set()
    const inFlightLineItemKeys = new Set()
    const simulationCache = new Map()
  
    // Chama a API de simulação do checkout para obter opções de parcelamento do SKU
    async function simulateItemInstallments(skuId, quantity) {
      const response = await fetch('/api/checkout/pub/orderForms/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          items: [
            { id: skuId, quantity: quantity, seller: '1' },
          ],
          postalCode: '07140-233',
          country: 'BRA',
        }),
      })
      if (!response.ok) throw new Error('Simulation error')
      return response.json()
    }
  
    // Retorna simulação do cache ou executa e armazena antes de retornar
    function getSimulation(skuId, quantity) {
      const cacheKey = `${skuId}:${quantity}`
      if (simulationCache.has(cacheKey)) {
        return Promise.resolve(simulationCache.get(cacheKey))
      }
      return simulateItemInstallments(skuId, quantity).then(res => {
        simulationCache.set(cacheKey, res)
        return res
      })
    }
  
    // Formata valor (arredonda para 2 casas decimais)
    function formatCurrency(valueInCents) {
      return (valueInCents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    }
  
    // Para cada item do carrinho, insere (ou reaproveita) um bloco de parcelas logo após .total-price e preenche com a melhor opção
    function insertPerItemInstallments(orderForm) {
      renderedLineItemKeys.clear()
      orderForm?.items?.forEach((item, index) => {
        const sku = item?.id
        const quantity = item?.quantity
  
        const totalPriceEl = document.querySelectorAll('.total-price')[index]
        if (!sku || !quantity || !totalPriceEl) return
  
        // Chave estável por linha (uniqueId quando disponível)
        const key = item.uniqueId || `${sku}-${index}`
        if (inFlightLineItemKeys.has(key)) return
        inFlightLineItemKeys.add(key)
  
        // Garante a existência do contêiner logo após o total do item
        let customInstallmentComponent = totalPriceEl.parentNode.querySelector('.custom-installment-total')
        if (!customInstallmentComponent) {
          customInstallmentComponent = document.createElement('div')
          customInstallmentComponent.className = 'custom-installment-total'
          totalPriceEl.insertAdjacentElement('afterend', customInstallmentComponent)
        }
  
        // Busca simulação e escreve a melhor opção de parcela
        getSimulation(String(sku), quantity)
          .then(sim => {
            const installments = sim?.paymentData?.installmentOptions?.[0]?.installments
            const best = installments?.[installments.length - 1]
            if (best) {
              customInstallmentComponent.innerText = `ou em até ${best.count}x de ${formatCurrency(best.value)}`
            }
          })
          .catch(() => {
          })
          .finally(() => inFlightLineItemKeys.delete(key))
      })
    }
  
    // Injeta estilos, limpa sobras e renderiza por item
    InsertStylesMinicartItems()
    InsertClassToTotalSellingPrice()
    vtexjs.checkout.getOrderForm().then(orderForm => {
      insertPerItemInstallments(orderForm)
    })
  
    // Atualiza mudanças do orderForm 
    $(window).on('orderFormUpdated.vtex', function (_, orderForm) {
      InsertStylesMinicartItems()
      InsertClassToTotalSellingPrice()
      insertPerItemInstallments(orderForm)
    })
  
    // Reage a navegação dentro do checkout (hashchange)
    window.addEventListener('hashchange', () => {
      vtexjs.checkout.getOrderForm().then(orderForm => {
        insertPerItemInstallments(orderForm)
      })
    })
  })
  
  
  /***/ }),
  
  /***/ "./src/arquivos/js/components/CustomInstallments.js":
  /*!**********************************************************!*\
    !*** ./src/arquivos/js/components/CustomInstallments.js ***!
    \**********************************************************/
  /***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {
  
  /* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
  function waitForVtexjs(callback) {
    if (window.vtexjs && window.vtexjs.checkout && window.vtexjs.checkout.getOrderForm) {
      callback();
    } else {
      setTimeout(() => waitForVtexjs(callback), 200);
    }
  }
  
  waitForVtexjs(function () {
    function insertStyles() {
      if (document.getElementById('custom-installment-style')) return
  
      const style = document.createElement('style')
      style.id = 'custom-installment-style'
      style.innerHTML = `
          .custom-installment-info {
            font-size: 14px;
            color: #707070;
            display: flex;
            width: 171px;
            max-height: 10px;
            position: absolute;
            font-family: 'Ubuntu', sans-serif;
            font-weight: 400;
            line-height: 16px;
            right: -2px;
            bottom: 202px;
          }
          
          @media (min-width: 767px) and (max-width: 1024px) {
            .custom-installment-info {
              bottom: 164px;
            }
          }
    
          @media (min-width: 1024px) {
            .custom-installment-info {
              right: 6px;
              bottom: 122px;
              width: 180px;
            }
          }
        `
      document.head.appendChild(style)
    }
  
    function insertBestInstallmentInfo(orderForm) {
      const summaryTotalizers = document.querySelector('.summary-totalizers')
      if (!orderForm || !summaryTotalizers) {
        document.querySelector('.custom-installment-info')?.remove()
        return
      }
  
      const existing = document.querySelector('.custom-installment-info')
      if (existing) existing.remove()
  
      const installmentOptions = orderForm?.paymentData?.installmentOptions;
      const installments = installmentOptions?.[0]?.installments
      if (!installments || installments.length === 0) return
  
      const best = installments[installments.length - 1]
      if (!best) return
  
      const valueFormatted = (best.value / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
  
      const installmentText = `ou em até ${best.count}x de ${valueFormatted}`
  
      const installmentEl = document.createElement('div')
      installmentEl.className = 'custom-installment-info'
      installmentEl.innerText = installmentText
  
      summaryTotalizers.parentNode.insertBefore(installmentEl, summaryTotalizers.nextSibling)
    }
  
    function waitForSummaryTotalizersAndInsert(orderForm) {
      const interval = setInterval(() => {
        const summaryTotalizers = document.querySelector('.summary-totalizers');
        if (summaryTotalizers) {
          clearInterval(interval);
          insertBestInstallmentInfo(orderForm);
        }
      }, 200);
      // Opcional: timeout para não rodar para sempre
      setTimeout(() => clearInterval(interval), 10000);
    }
  
    insertStyles()
  
    vtexjs.checkout.getOrderForm().then(orderForm => {
      waitForSummaryTotalizersAndInsert(orderForm)
    })
  
    $(window).on('orderFormUpdated.vtex', function (_, orderForm) {  
      insertStyles()
      waitForSummaryTotalizersAndInsert(orderForm)
    })
  
    window.addEventListener('hashchange', () => {
      vtexjs.checkout.getOrderForm().then(waitForSummaryTotalizersAndInsert)
    })
  });
  
  
  /***/ }),
  
  /***/ "./src/arquivos/js/components/Exemple.js":
  /*!***********************************************!*\
    !*** ./src/arquivos/js/components/Exemple.js ***!
    \***********************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ Exemple; }
  /* harmony export */ });
  /* harmony import */ var _helpers_waitForEl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/waitForEl */ "./src/arquivos/js/helpers/waitForEl.js");
  
  
  class Exemple {
      constructor() {
          this.init();
      }
  
      async init() {
          await this.selectors();
          console.log(this.item);
      }
  
      async selectors() {
          this.item = await (0,_helpers_waitForEl__WEBPACK_IMPORTED_MODULE_0__.default)(
              ".summary-cart-template-holder .cart-items"
          );
      }
  }
  
  
  /***/ }),
  
  /***/ "./src/arquivos/js/components/ExempleEvent.js":
  /*!****************************************************!*\
    !*** ./src/arquivos/js/components/ExempleEvent.js ***!
    \****************************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ ExempleEvent; }
  /* harmony export */ });
  /* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
  class ExempleEvent {
      constructor() {
          this.eventos();
      }
      eventos() {
          $(window).on("orderFormUpdated.vtex", this.onUpdate.bind(this));
      }
  
      onUpdate(orderForm) {
          console.log(orderForm);
      }
  }
  
  
  /***/ }),
  
  /***/ "./src/arquivos/js/components/LoginModal.js":
  /*!**************************************************!*\
    !*** ./src/arquivos/js/components/LoginModal.js ***!
    \**************************************************/
  /***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {
  
  /* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
  (function () {
  function verifyLoggedIn() {
      const hash = window.location?.hash;
    
      const interval = setInterval(() => {
        const orderForm = vtexjs?.checkout?.orderForm;
        const isLogged = orderForm?.loggedIn;
        if(isLogged !== undefined) { 
          clearInterval(interval); 
    
          if(!isLogged && hash.includes("/shipping") || hash.includes("/payment")) {
            checkout.login();
          } 
        }
      }, 1000)
    }
    
    $(document).ready(function () {
      verifyLoggedIn();
    })
    
    $(window).on("hashchange", () => {
      verifyLoggedIn();
    })
  })();
  
  /***/ }),
  
  /***/ "./src/arquivos/js/components/StepBar.js":
  /*!***********************************************!*\
    !*** ./src/arquivos/js/components/StepBar.js ***!
    \***********************************************/
  /***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {
  
  /* provided dependency */ var $ = __webpack_require__(/*! jquery */ "jquery");
  (function () {
    function renderCheckoutSteps() {
      const brown = "#D2AE82";   
      const dark = "#2D2D28";    
      const white = "#fff";
      const circleSize = 32;
  
      const steps = ['Carrinho', 'Dados Pessoais', 'Entrega', 'Pagamento'];
  
      let stepsHTML = `<div class="header-checkout-steps" style="width:100%;margin:16px 0 44px 0;position:relative;background:transparent;font-family: 'Montserrat', Arial;">
        <div class="steps-flex" style="display:flex;align-items:center;width:95%;margin:0 auto;position:relative;">`;
  
      steps.forEach((title, i) => {
        if (i > 0) {
          stepsHTML += `<div class="line" style="flex:1;height:2px;align-self:center;background:${brown};transition:background 0.2s;min-width:0;"></div>`;
        }
        stepsHTML += `
          <div class="step-circle-wrap" style="display:flex;flex-direction:column;align-items:center;position:relative;">
            <div class="step-number-circle" id="circle-${i + 1}" style="width:${circleSize}px;height:${circleSize}px;border-radius:50%;border:2px solid ${brown};background:${white};color:${brown};display:flex;align-items:center;justify-content:center;font-weight:400;font-size:12px;line-height:14px;letter-spacing:0%;font-family:'Montserrat', sans-serif;font-weight:400;transition:all 0.2s;z-index:1;">${i + 1}</div>
            <div class="step-title" id="label-${i + 1}" style="position:absolute;top:38px;left:50%;transform:translateX(-50%);text-align:center;font-size:12px;line-height:14px;color:${brown};font-weight:400;letter-spacing:0%;font-family:'Montserrat', sans-serif;vertical-align:middle;transition:color 0.2s;${i === 1 ? 'white-space:nowrap;' : ''}">${title}</div>
          </div>
        `;
      });
  
      stepsHTML += `</div></div>`;
  
      const headerCheckoutContainer = document.querySelector('.headerCheckout .container');
      const existingStepBar = document.querySelector('.header-checkout-steps');
      if (existingStepBar) existingStepBar.remove();
      if (headerCheckoutContainer) {
        headerCheckoutContainer.insertAdjacentHTML('beforeend', stepsHTML);
      }
    }
  
    const stepsHash = ["/checkout#/cart", "/checkout#/profile", "/checkout#/shipping", "/checkout#/payment"];
    const urlMapping = {
      "/checkout#/email": "/checkout#/profile"
    };
  
    function updateProgress() {
      const brown = "#D2AE82";
      const dark = "#2D2D28";
      const white = "#fff";
  
      const hash = window.location.hash;
      const fullPath = `/checkout${hash}`;
      const normalizedPath = urlMapping[fullPath] || fullPath;
      const currentStepIndex = stepsHash.indexOf(normalizedPath);
      if (currentStepIndex === -1) return;
  
      // Bolinhas e textos
      for (let i = 0; i < 4; i++) {
        const circle = document.getElementById(`circle-${i + 1}`);
        const label = document.getElementById(`label-${i + 1}`);
        if (!circle || !label) continue;
        circle.style.background = white;
        circle.style.color = brown;
        circle.style.borderColor = brown;
        label.style.color = brown;
        label.style.fontWeight = "400";
  
        if (i <= currentStepIndex) {
          circle.style.background = dark;
          circle.style.color = white;
          circle.style.borderColor = dark;
          label.style.color = dark;
          label.style.fontWeight = "700";
        }
      }
  
      const lineElements = document.querySelectorAll('.line');
      lineElements.forEach((line, index) => {
        if (index < currentStepIndex) {
          line.style.background = dark;
        } else {
          line.style.background = brown;
        }
      });
    }
  
    window.addEventListener("resize", () => {
      const stepBar = document.querySelector('.header-checkout-steps');
      if (stepBar) stepBar.remove();
      renderCheckoutSteps();
      updateProgress();
    });
  
    window.addEventListener("DOMContentLoaded", () => {
      renderCheckoutSteps();
      updateProgress();
    });
  
    window.addEventListener("hashchange", updateProgress);
  
    $(window).on('orderFormUpdated.vtex', function (evt, orderForm) {
      const hash = window.location.hash;
      if (hash === '#/shipping') {
      }
    });
  
    renderCheckoutSteps();
    updateProgress();
  
  })();
  
  
  /***/ }),
  
  /***/ "./src/arquivos/js/helpers/MediasMatch.js":
  /*!************************************************!*\
    !*** ./src/arquivos/js/helpers/MediasMatch.js ***!
    \************************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "isSmallerThen768": function() { return /* binding */ isSmallerThen768; }
  /* harmony export */ });
  const isSmallerThen768 = window.matchMedia("(max-width:768px)").matches;
  
  
  /***/ }),
  
  /***/ "./src/arquivos/js/helpers/vtexUtils.js":
  /*!**********************************************!*\
    !*** ./src/arquivos/js/helpers/vtexUtils.js ***!
    \**********************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "alterarTamanhoImagemSrcVtex": function() { return /* binding */ alterarTamanhoImagemSrcVtex; },
  /* harmony export */   "getPrice": function() { return /* binding */ getPrice; },
  /* harmony export */   "formatCurrency": function() { return /* binding */ formatCurrency; },
  /* harmony export */   "obterCannalDeVendas": function() { return /* binding */ obterCannalDeVendas; }
  /* harmony export */ });
  /**
   * Altera as dimenções especificadas na url da img
   * @param {string} src url da imagem na VTEX
   * @param {int} width
   * @param {int} height
   * @return {string} url da imagem com o tamanho alterado
   */
  
  function alterarTamanhoImagemSrcVtex(src, width, height) {
      if (typeof src == "undefined") {
          console.warn("Parametro 'src' não recebido.");
  
          return;
      }
      width = typeof width == "undefined" ? 1 : width;
      height = typeof height == "undefined" ? width : height;
  
      src = src.replace(
          /\/(\d+)(-(\d+-\d+)|(_\d+))\//g,
          "/$1-" + width + "-" + height + "/"
      );
      return src;
  }
  
  /**
   * Obtem Preco
   * caso o preco recebido seja um Float ou int,
   * 	'Ex.': 10.2 ->'10,20'
   * Recebendo uma string o valor sera retornado como um float
   * 	'Ex.': 'R$1.234,30' -> 1234.3
   * @param  {FloatZstring} price preço
   * @return {[type]}       [description]
   */
  function getPrice(price) {
      if (!price) {
          return 0;
      }
  
      if (isNaN(price)) {
          let newPrice = parseFloat(
              price.replace("R$", "").replace(".", "").replace(",", ".")
          );
          return newPrice;
      } else {
          price = price || 0;
          price = price.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
  
          return price;
      }
  }
  
  function formatCurrency() {
      return Number(value).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
      });
  }
  
  function obterCannalDeVendas() {
      var name = "VTEXSC=sc=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == " ") c = c.substring(1);
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return 1;
  }
  
  
  /***/ }),
  
  /***/ "./src/arquivos/js/helpers/waitForEl.js":
  /*!**********************************************!*\
    !*** ./src/arquivos/js/helpers/waitForEl.js ***!
    \**********************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ waitForEl; }
  /* harmony export */ });
  /* provided dependency */ var jQuery = __webpack_require__(/*! jquery */ "jquery");
  /**
   * Espera um elemento exitir no dom e executa o callback
   *
   * @param {string} selector seletor do elemento que dejesa esperar pela criação
   * @param {function} callback Função a ser executada quando tal elemento existir
   */
  
  function waitForEl(selector) {
      return new Promise((resolve) => {
          if (jQuery(selector).length) {
              resolve(jQuery(selector));
          } else {
              setTimeout(function () {
                  waitForEl(selector, callback);
              }, 100);
          }
      });
  }
  
  
  /***/ }),
  
  /***/ "../node_modules/@agenciam3/pkg/dist/lib/StateManager/PubSub.js":
  /*!**********************************************************************!*\
    !*** ../node_modules/@agenciam3/pkg/dist/lib/StateManager/PubSub.js ***!
    \**********************************************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ PubSub; }
  /* harmony export */ });
  class PubSub {
      constructor() {
          this.events = {};
      }
      subscribe(event, callback) {
          if (!this.events.hasOwnProperty(event)) {
              this.events[event] = [];
          }
          return this.events[event].push(callback);
      }
      publish(event, data = {}) {
          if (!this.events.hasOwnProperty(event)) {
              return [];
          }
          return this.events[event].map((callback) => callback(event, data));
      }
      unsubscribe(event, cb) {
          this.events[event] = this.events[event].filter((fn) => fn !== cb);
      }
  }
  //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHViU3ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VzL1N0YXRlTWFuYWdlci9QdWJTdWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE9BQU8sT0FBTyxNQUFNO0lBQTNCO1FBQ1MsV0FBTSxHQUFZLEVBQUUsQ0FBQztJQW1COUIsQ0FBQztJQWpCTyxTQUFTLENBQUMsS0FBYSxFQUFFLFFBQWtCO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUN4QjtRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLE9BQU8sQ0FBQyxLQUFhLEVBQUUsSUFBSSxHQUFHLEVBQUU7UUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsRUFBWTtRQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHViU3ViIHtcblx0cHJpdmF0ZSBldmVudHM6IElFdmVudHMgPSB7fTtcblxuXHRwdWJsaWMgc3Vic2NyaWJlKGV2ZW50OiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbikge1xuXHRcdGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnQpKSB7XG5cdFx0XHR0aGlzLmV2ZW50c1tldmVudF0gPSBbXTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZXZlbnRzW2V2ZW50XS5wdXNoKGNhbGxiYWNrKTtcblx0fVxuXG5cdHB1YmxpYyBwdWJsaXNoKGV2ZW50OiBzdHJpbmcsIGRhdGEgPSB7fSkge1xuXHRcdGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnQpKSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmV2ZW50c1tldmVudF0ubWFwKChjYWxsYmFjaykgPT4gY2FsbGJhY2soZXZlbnQsIGRhdGEpKTtcblx0fVxuXG5cdHB1YmxpYyB1bnN1YnNjcmliZShldmVudDogc3RyaW5nLCBjYjogRnVuY3Rpb24pOiB2b2lkIHtcblx0XHR0aGlzLmV2ZW50c1tldmVudF0gPSB0aGlzLmV2ZW50c1tldmVudF0uZmlsdGVyKChmbikgPT4gZm4gIT09IGNiKTtcblx0fVxufVxuXG5pbnRlcmZhY2UgSUV2ZW50cyB7XG5cdFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uW107XG59XG4iXX0=
  
  /***/ }),
  
  /***/ "../node_modules/@agenciam3/pkg/dist/lib/StateManager/Store.js":
  /*!*********************************************************************!*\
    !*** ../node_modules/@agenciam3/pkg/dist/lib/StateManager/Store.js ***!
    \*********************************************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ Store; }
  /* harmony export */ });
  /* harmony import */ var _PubSub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PubSub */ "../node_modules/@agenciam3/pkg/dist/lib/StateManager/PubSub.js");
  
  class Store {
      constructor({ moduleName, actions, mutations, state }) {
          this.actions = Object.assign({}, actions);
          this.mutations = Object.assign({}, mutations);
          this.module = moduleName || "store";
          this.status = "default state";
          this.events = new _PubSub__WEBPACK_IMPORTED_MODULE_0__.default();
          this.state = new Proxy(Object.assign({}, state) || {}, {
              set: (state, key, value) => {
                  state[key] = value;
                  console.log(`module: ${this.module} stateChange: ${key}:`, value);
                  this.events.publish("stateChange", this.state);
                  this.events.publish(`stateChange:${key}`, this.state);
                  if (this.status !== "mutation") {
                      console.log(`You should use a mutation to set ${key}`);
                  }
                  this.status = "resting";
                  return true;
              },
          });
      }
      dispatch(actionKey, payload) {
          if (typeof this.actions[actionKey] !== "function") {
              console.log(`Action "${actionKey} doesn't exist.`);
              return false;
          }
          console.log(`ACTION: ${actionKey}`);
          this.status = "action";
          this.actions[actionKey](this, payload);
          return true;
      }
      commit(mutationKey, payload) {
          if (typeof this.mutations[mutationKey] !== "function") {
              console.log(`Mutation "${mutationKey}" doesn't exist`);
              return false;
          }
          this.status = "mutation";
          let newState = this.mutations[mutationKey](this.state, payload);
          this.state = Object.assign(this.state, newState);
          return true;
      }
  }
  //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcGFja2FnZXMvU3RhdGVNYW5hZ2VyL1N0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFVBQVUsQ0FBQztBQUU5QixNQUFNLENBQUMsT0FBTyxPQUFPLEtBQUs7SUFRekIsWUFBWSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBa0I7UUFDcEUsSUFBSSxDQUFDLE9BQU8scUJBQVEsT0FBTyxDQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFNBQVMscUJBQVEsU0FBUyxDQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLElBQUksT0FBTyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsZUFBZSxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUUzQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFJLGtCQUFLLEtBQUssS0FBTSxFQUFFLEVBQUU7WUFDN0MsR0FBRyxFQUFFLENBQUMsS0FBVSxFQUFFLEdBQVcsRUFBRSxLQUFVLEVBQUUsRUFBRTtnQkFDNUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FDVixXQUFXLElBQUksQ0FBQyxNQUFNLGlCQUFpQixHQUFHLEdBQUcsRUFDN0MsS0FBSyxDQUNMLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7b0JBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEdBQUcsRUFBRSxDQUFDLENBQUM7aUJBQ3ZEO2dCQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRU0sUUFBUSxDQUFDLFNBQWlCLEVBQUUsT0FBWTtRQUM5QyxJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxVQUFVLEVBQUU7WUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLFNBQVMsaUJBQWlCLENBQUMsQ0FBQztZQUNuRCxPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkMsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQW1CLEVBQUUsT0FBWTtRQUM5QyxJQUFJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxVQUFVLEVBQUU7WUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztZQUN2RCxPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7UUFDekIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFB1YlN1YiBmcm9tIFwiLi9QdWJTdWJcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmU8VCBleHRlbmRzIG9iamVjdD4ge1xuXHRwcml2YXRlIGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIChzdG9yZTogU3RvcmU8VD4sIHBheWxvYWQ6IGFueSkgPT4gdm9pZD47XG5cdHByaXZhdGUgbXV0YXRpb25zOiBSZWNvcmQ8c3RyaW5nLCAoc3RhdGU6IFQsIHBheWxvYWQ6IGFueSkgPT4gVD47XG5cdHByaXZhdGUgbW9kdWxlOiBzdHJpbmc7XG5cdHByaXZhdGUgc3RhdHVzOiBcIm11dGF0aW9uXCIgfCBcImFjdGlvblwiIHwgXCJyZXN0aW5nXCIgfCBcImRlZmF1bHQgc3RhdGVcIjtcblx0cHVibGljIGV2ZW50czogUHViU3ViO1xuXHRwdWJsaWMgc3RhdGU6IFQ7XG5cblx0Y29uc3RydWN0b3IoeyBtb2R1bGVOYW1lLCBhY3Rpb25zLCBtdXRhdGlvbnMsIHN0YXRlIH06IFN0b3JlUGFyYW1zPFQ+KSB7XG5cdFx0dGhpcy5hY3Rpb25zID0geyAuLi5hY3Rpb25zIH07XG5cdFx0dGhpcy5tdXRhdGlvbnMgPSB7IC4uLm11dGF0aW9ucyB9O1xuXHRcdHRoaXMubW9kdWxlID0gbW9kdWxlTmFtZSB8fCBcInN0b3JlXCI7XG5cdFx0dGhpcy5zdGF0dXMgPSBcImRlZmF1bHQgc3RhdGVcIjtcblx0XHR0aGlzLmV2ZW50cyA9IG5ldyBQdWJTdWIoKTtcblxuXHRcdHRoaXMuc3RhdGUgPSBuZXcgUHJveHk8VD4oeyAuLi5zdGF0ZSB9IHx8IHt9LCB7XG5cdFx0XHRzZXQ6IChzdGF0ZTogYW55LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRzdGF0ZVtrZXldID0gdmFsdWU7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0XHRcdGBtb2R1bGU6ICR7dGhpcy5tb2R1bGV9IHN0YXRlQ2hhbmdlOiAke2tleX06YCxcblx0XHRcdFx0XHR2YWx1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHR0aGlzLmV2ZW50cy5wdWJsaXNoKFwic3RhdGVDaGFuZ2VcIiwgdGhpcy5zdGF0ZSk7XG5cdFx0XHRcdHRoaXMuZXZlbnRzLnB1Ymxpc2goYHN0YXRlQ2hhbmdlOiR7a2V5fWAsIHRoaXMuc3RhdGUpO1xuXHRcdFx0XHRpZiAodGhpcy5zdGF0dXMgIT09IFwibXV0YXRpb25cIikge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBZb3Ugc2hvdWxkIHVzZSBhIG11dGF0aW9uIHRvIHNldCAke2tleX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnN0YXR1cyA9IFwicmVzdGluZ1wiO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH1cblxuXHRwdWJsaWMgZGlzcGF0Y2goYWN0aW9uS2V5OiBzdHJpbmcsIHBheWxvYWQ6IGFueSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2FjdGlvbktleV0gIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0Y29uc29sZS5sb2coYEFjdGlvbiBcIiR7YWN0aW9uS2V5fSBkb2Vzbid0IGV4aXN0LmApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRjb25zb2xlLmxvZyhgQUNUSU9OOiAke2FjdGlvbktleX1gKTtcblx0XHR0aGlzLnN0YXR1cyA9IFwiYWN0aW9uXCI7XG5cdFx0dGhpcy5hY3Rpb25zW2FjdGlvbktleV0odGhpcywgcGF5bG9hZCk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRwdWJsaWMgY29tbWl0KG11dGF0aW9uS2V5OiBzdHJpbmcsIHBheWxvYWQ6IGFueSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5tdXRhdGlvbnNbbXV0YXRpb25LZXldICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGNvbnNvbGUubG9nKGBNdXRhdGlvbiBcIiR7bXV0YXRpb25LZXl9XCIgZG9lc24ndCBleGlzdGApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHR0aGlzLnN0YXR1cyA9IFwibXV0YXRpb25cIjtcblx0XHRsZXQgbmV3U3RhdGUgPSB0aGlzLm11dGF0aW9uc1ttdXRhdGlvbktleV0odGhpcy5zdGF0ZSwgcGF5bG9hZCk7XG5cdFx0dGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgbmV3U3RhdGUpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvcmVQYXJhbXM8VCBleHRlbmRzIG9iamVjdD4ge1xuXHRtb2R1bGVOYW1lOiBzdHJpbmc7XG5cblx0YWN0aW9uczogUmVjb3JkPHN0cmluZywgKHN0b3JlOiBTdG9yZTxUPiwgcGF5bG9hZDogYW55KSA9PiB2b2lkPjtcblxuXHRtdXRhdGlvbnM6IFJlY29yZDxzdHJpbmcsIChzdGF0ZTogVCwgcGF5bG9hZDogYW55KSA9PiBUPjtcblxuXHRzdGF0ZTogVDtcbn1cbiJdfQ==
  
  /***/ }),
  
  /***/ "../node_modules/@agenciam3/pkg/dist/lib/StateManager/mergeStores.js":
  /*!***************************************************************************!*\
    !*** ../node_modules/@agenciam3/pkg/dist/lib/StateManager/mergeStores.js ***!
    \***************************************************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ mergeStores; }
  /* harmony export */ });
  function mergeStores(...storesObj) {
      const store = {};
      storesObj.forEach((s) => {
          store.state = Object.assign(Object.assign({}, store.state), s.state);
          store.mutations = Object.assign(Object.assign({}, store.mutations), s.mutations);
          store.actions = Object.assign(Object.assign({}, store.actions), s.actions);
      });
      return store;
  }
  //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VTdG9yZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcGFja2FnZXMvU3RhdGVNYW5hZ2VyL21lcmdlU3RvcmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sQ0FBQyxPQUFPLFVBQVUsV0FBVyxDQUFDLEdBQUcsU0FBNkI7SUFDbkUsTUFBTSxLQUFLLEdBQTJCLEVBQUUsQ0FBQztJQUN6QyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDdkIsS0FBSyxDQUFDLEtBQUssbUNBQVEsS0FBSyxDQUFDLEtBQUssR0FBSyxDQUFDLENBQUMsS0FBSyxDQUFFLENBQUM7UUFDN0MsS0FBSyxDQUFDLFNBQVMsbUNBQVEsS0FBSyxDQUFDLFNBQVMsR0FBSyxDQUFDLENBQUMsU0FBUyxDQUFFLENBQUM7UUFDekQsS0FBSyxDQUFDLE9BQU8sbUNBQVEsS0FBSyxDQUFDLE9BQU8sR0FBSyxDQUFDLENBQUMsT0FBTyxDQUFFLENBQUM7SUFDcEQsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLEtBQUssQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdG9yZVBhcmFtcyB9IGZyb20gXCIuL1N0b3JlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1lcmdlU3RvcmVzKC4uLnN0b3Jlc09iajogU3RvcmVQYXJhbXM8YW55PltdKSB7XG5cdGNvbnN0IHN0b3JlOiBTdG9yZVBhcmFtczxhbnk+IHwgYW55ID0ge307XG5cdHN0b3Jlc09iai5mb3JFYWNoKChzKSA9PiB7XG5cdFx0c3RvcmUuc3RhdGUgPSB7IC4uLnN0b3JlLnN0YXRlLCAuLi5zLnN0YXRlIH07XG5cdFx0c3RvcmUubXV0YXRpb25zID0geyAuLi5zdG9yZS5tdXRhdGlvbnMsIC4uLnMubXV0YXRpb25zIH07XG5cdFx0c3RvcmUuYWN0aW9ucyA9IHsgLi4uc3RvcmUuYWN0aW9ucywgLi4ucy5hY3Rpb25zIH07XG5cdH0pO1xuXG5cdHJldHVybiBzdG9yZTtcbn1cbiJdfQ==
  
  /***/ }),
  
  /***/ "../node_modules/@agenciam3/pkg/dist/lib/core/Container.js":
  /*!*****************************************************************!*\
    !*** ../node_modules/@agenciam3/pkg/dist/lib/core/Container.js ***!
    \*****************************************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ Container; }
  /* harmony export */ });
  /* harmony import */ var _isPage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isPage */ "../node_modules/@agenciam3/pkg/dist/lib/core/isPage.js");
  
  class Container {
      constructor({ appName, components, pages, services, config, ruler, }) {
          this.appName = appName;
          this.config = config;
          this.pageComponents = pages ? [...pages] : [];
          this.components = components ? [...components] : [];
          this.services = services ? [...services] : [];
          this.serviceMap = {};
          this.instances = {};
          this.componentsConfig = {};
          this.ruler = ruler ? ruler : new _isPage__WEBPACK_IMPORTED_MODULE_0__.default();
          this.ctx = this.createContext.call(this);
      }
      createContext() {
          return {
              config: this.config,
              getService: this.getService.bind(this),
          };
      }
      instantiateComponent(Component) {
          try {
              if (typeof Component === "function") {
                  if (this.componentsConfig[Component.name]) {
                      this.instances[Component.name] = new Component(this.ctx, this.componentsConfig[Component.name]);
                  }
                  else {
                      this.instances[Component.name] = new Component(this.ctx);
                  }
                  return Component.name;
              }
              else {
                  console.warn("Not an Constructor", Component);
              }
          }
          catch (error) {
              console.warn(error);
          }
      }
      instantiateService(Service) {
          if (typeof Service === "function") {
              try {
                  this.serviceMap[Service.name] = new Service();
              }
              catch (error) {
                  console.warn(error);
              }
          }
          else {
              console.warn("Not an Constructor", Service);
          }
      }
      getService(serviceName) {
          if (this.serviceMap[serviceName])
              return this.serviceMap[serviceName];
          return false;
      }
      buildServices() {
          this.pageComponents.forEach((item) => {
              if (typeof item.services !== "undefined") {
                  if (item.hasOwnProperty("pageRefs"))
                      if (this.ruler.is(item.pageRefs)) {
                          item.services.forEach((service) => this.services.push(service));
                      }
              }
          });
          return this.services.map(this.instantiateService.bind(this));
      }
      buildComponents() {
          return this.components.map(this.instantiateComponent.bind(this));
      }
      buildPageComponents() {
          return this.pageComponents.map((item) => {
              if (item.hasOwnProperty("pageRefs"))
                  if (this.ruler.is(item.pageRefs)) {
                      item.components.forEach((Comp) => this.instantiateComponent(Comp));
                  }
          });
      }
      init() {
          this.buildServices.call(this);
          this.buildComponents.call(this);
          this.buildPageComponents.call(this);
          window["m3Apps"] = { [this.appName]: this };
      }
      bind(compName, config) {
          this.componentsConfig[compName] = config;
      }
      start() {
          if (document.attachEvent
              ? document.readyState === "complete"
              : document.readyState !== "loading") {
              this.init();
          }
          else {
              document.addEventListener("DOMContentLoaded", this.init.bind(this));
          }
      }
  }
  //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VzL2NvcmUvQ29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFVBQVUsQ0FBQztBQW1DOUIsTUFBTSxDQUFDLE9BQU8sT0FBTyxTQUFTO0lBWTdCLFlBQVksRUFDWCxPQUFPLEVBQ1AsVUFBVSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLEtBQUssR0FDWTtRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRXBELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU8sYUFBYTtR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dWxlciBmcm9tIFwiLi9JUnVsZXJcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJQ29udGFpbmVyUHJvcHMge1xuXHRhcHBOYW1lOiBzdHJpbmc7XG5cdGNvbXBvbmVudHM/OiBhbnlbXTtcblx0cGFnZXM/OiBJUGFnZUNvbXBvbmVudHNbXTtcblx0c2VydmljZXM/OiBhbnlbXTtcblx0Y29uZmlnPzogYW55O1xuXHRydWxlcj86IElSdWxlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUGFnZUNvbXBvbmVudHMge1xuXHRwYWdlUmVmczogc3RyaW5nW107XG5cdGNvbXBvbmVudHM6IGFueVtdO1xuXHRzZXJ2aWNlcz86IGFueVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElDb250YWluZXJDb250ZXh0IHtcblx0Y29uZmlnOiBhbnk7XG5cdGdldFNlcnZpY2U6IDxUPihzZXJ2aWNlTmFtZTogc3RyaW5nKSA9PiBUIHwgZmFsc2U7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcblx0aW50ZXJmYWNlIFdpbmRvdyB7XG5cdFx0bTNBcHBzOiBSZWNvcmQ8c3RyaW5nLCBDb250YWluZXI+O1xuXHR9XG5cblx0aW50ZXJmYWNlIERvY3VtZW50IHtcblx0XHRhdHRhY2hFdmVudDpcblx0XHRcdHwgKChldmVudDogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcikgPT4gYm9vbGVhbiB8IGZhbHNlKVxuXHRcdFx0fCB1bmRlZmluZWQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIHtcblx0cHJpdmF0ZSBydWxlcjogSVJ1bGVyO1xuXHRwcml2YXRlIGFwcE5hbWU6IHN0cmluZztcblx0cHJpdmF0ZSBjb25maWc6IGFueTtcblx0cHJpdmF0ZSBjb21wb25lbnRzQ29uZmlnOiBhbnk7XG5cdHByaXZhdGUgY29tcG9uZW50czogYW55W107XG5cdHByaXZhdGUgcGFnZUNvbXBvbmVudHM6IElQYWdlQ29tcG9uZW50c1tdO1xuXHRwcml2YXRlIHNlcnZpY2VzOiBhbnlbXTtcblx0cHJpdmF0ZSBzZXJ2aWNlTWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuXHRwcml2YXRlIGluc3RhbmNlczogUmVjb3JkPHN0cmluZywgb2JqZWN0Pjtcblx0cHJpdmF0ZSBjdHg6IElDb250YWluZXJDb250ZXh0O1xuXG5cdGNvbnN0cnVjdG9yKHtcblx0XHRhcHBOYW1lLFxuXHRcdGNvbXBvbmVudHMsXG5cdFx0cGFnZXMsXG5cdFx0c2VydmljZXMsXG5cdFx0Y29uZmlnLFxuXHRcdHJ1bGVyLFxuXHR9OiBJQ29udGFpbmVyUHJvcHMpIHtcblx0XHR0aGlzLmFwcE5hbWUgPSBhcHBOYW1lO1xuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG5cdFx0dGhpcy5wYWdlQ29tcG9uZW50cyA9IHBhZ2VzID8gWy4uLnBhZ2VzXSA6IFtdO1xuXHRcdHRoaXMuY29tcG9uZW50cyA9IGNvbXBvbmVudHMgPyBbLi4uY29tcG9uZW50c10gOiBbXTtcblxuXHRcdHRoaXMuc2VydmljZXMgPSBzZXJ2aWNlcyA/IFsuLi5zZXJ2aWNlc10gOiBbXTtcblx0XHR0aGlzLnNlcnZpY2VNYXAgPSB7fTtcblxuXHRcdHRoaXMuaW5zdGFuY2VzID0ge307XG5cdFx0dGhpcy5jb21wb25lbnRzQ29uZmlnID0ge307XG5cblx0XHR0aGlzLnJ1bGVyID0gcnVsZXIgPyBydWxlciA6IG5ldyBpc1BhZ2UoKTtcblxuXHRcdHRoaXMuY3R4ID0gdGhpcy5jcmVhdGVDb250ZXh0LmNhbGwodGhpcyk7XG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZUNvbnRleHQoKTogSUNvbnRhaW5lckNvbnRleHQge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjb25maWc6IHRoaXMuY29uZmlnLFxuXHRcdFx0Z2V0U2VydmljZTogdGhpcy5nZXRTZXJ2aWNlLmJpbmQodGhpcyksXG5cdFx0fTtcblx0fVxuXG5cdHByaXZhdGUgaW5zdGFudGlhdGVDb21wb25lbnQoQ29tcG9uZW50OiBhbnkpIHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKHR5cGVvZiBDb21wb25lbnQgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRpZiAodGhpcy5jb21wb25lbnRzQ29uZmlnW0NvbXBvbmVudC5uYW1lXSkge1xuXHRcdFx0XHRcdHRoaXMuaW5zdGFuY2VzW0NvbXBvbmVudC5uYW1lXSA9IG5ldyBDb21wb25lbnQoXG5cdFx0XHRcdFx0XHR0aGlzLmN0eCxcblx0XHRcdFx0XHRcdHRoaXMuY29tcG9uZW50c0NvbmZpZ1tDb21wb25lbnQubmFtZV1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuaW5zdGFuY2VzW0NvbXBvbmVudC5uYW1lXSA9IG5ldyBDb21wb25lbnQodGhpcy5jdHgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBDb21wb25lbnQubmFtZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIk5vdCBhbiBDb25zdHJ1Y3RvclwiLCBDb21wb25lbnQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oZXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgaW5zdGFudGlhdGVTZXJ2aWNlKFNlcnZpY2U6IGFueSkge1xuXHRcdGlmICh0eXBlb2YgU2VydmljZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLnNlcnZpY2VNYXBbU2VydmljZS5uYW1lXSA9IG5ldyBTZXJ2aWNlKCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJOb3QgYW4gQ29uc3RydWN0b3JcIiwgU2VydmljZSk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBnZXRTZXJ2aWNlPFQ+KHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBUIHwgZmFsc2Uge1xuXHRcdGlmICh0aGlzLnNlcnZpY2VNYXBbc2VydmljZU5hbWVdKSByZXR1cm4gdGhpcy5zZXJ2aWNlTWFwW3NlcnZpY2VOYW1lXTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwcml2YXRlIGJ1aWxkU2VydmljZXMoKSB7XG5cdFx0dGhpcy5wYWdlQ29tcG9uZW50cy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIGl0ZW0uc2VydmljZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0aWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoXCJwYWdlUmVmc1wiKSlcblx0XHRcdFx0XHRpZiAodGhpcy5ydWxlci5pcyhpdGVtLnBhZ2VSZWZzKSkge1xuXHRcdFx0XHRcdFx0aXRlbS5zZXJ2aWNlcy5mb3JFYWNoKChzZXJ2aWNlKSA9PlxuXHRcdFx0XHRcdFx0XHR0aGlzLnNlcnZpY2VzLnB1c2goc2VydmljZSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXMuc2VydmljZXMubWFwKHRoaXMuaW5zdGFudGlhdGVTZXJ2aWNlLmJpbmQodGhpcykpO1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZENvbXBvbmVudHMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5tYXAodGhpcy5pbnN0YW50aWF0ZUNvbXBvbmVudC5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdHByaXZhdGUgYnVpbGRQYWdlQ29tcG9uZW50cygpIHtcblx0XHRyZXR1cm4gdGhpcy5wYWdlQ29tcG9uZW50cy5tYXAoKGl0ZW0pID0+IHtcblx0XHRcdGlmIChpdGVtLmhhc093blByb3BlcnR5KFwicGFnZVJlZnNcIikpXG5cdFx0XHRcdGlmICh0aGlzLnJ1bGVyLmlzKGl0ZW0ucGFnZVJlZnMpKSB7XG5cdFx0XHRcdFx0aXRlbS5jb21wb25lbnRzLmZvckVhY2goKENvbXApID0+XG5cdFx0XHRcdFx0XHR0aGlzLmluc3RhbnRpYXRlQ29tcG9uZW50KENvbXApXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHVibGljIGluaXQoKSB7XG5cdFx0dGhpcy5idWlsZFNlcnZpY2VzLmNhbGwodGhpcyk7XG5cdFx0dGhpcy5idWlsZENvbXBvbmVudHMuY2FsbCh0aGlzKTtcblx0XHR0aGlzLmJ1aWxkUGFnZUNvbXBvbmVudHMuY2FsbCh0aGlzKTtcblxuXHRcdHdpbmRvd1tcIm0zQXBwc1wiXSA9IHsgW3RoaXMuYXBwTmFtZV06IHRoaXMgfTtcblx0fVxuXG5cdHB1YmxpYyBiaW5kKGNvbXBOYW1lOiBzdHJpbmcsIGNvbmZpZzogYW55KSB7XG5cdFx0dGhpcy5jb21wb25lbnRzQ29uZmlnW2NvbXBOYW1lXSA9IGNvbmZpZztcblx0fVxuXG5cdHB1YmxpYyBzdGFydCgpIHtcblx0XHRpZiAoXG5cdFx0XHRkb2N1bWVudC5hdHRhY2hFdmVudFxuXHRcdFx0XHQ/IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIlxuXHRcdFx0XHQ6IGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiXG5cdFx0KSB7XG5cdFx0XHR0aGlzLmluaXQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgdGhpcy5pbml0LmJpbmQodGhpcykpO1xuXHRcdH1cblx0fVxufVxuIl19
  
  /***/ }),
  
  /***/ "../node_modules/@agenciam3/pkg/dist/lib/core/isPage.js":
  /*!**************************************************************!*\
    !*** ../node_modules/@agenciam3/pkg/dist/lib/core/isPage.js ***!
    \**************************************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": function() { return /* binding */ isPage; }
  /* harmony export */ });
  class isPage {
      constructor() {
          var _a;
          const metaPage = document.querySelector('meta[name="page"]');
          this.identificacaoMetaPage = metaPage
              ? metaPage.getAttribute("content") || ""
              : "";
          this.classTagBody = Array.from(document.body.classList);
          this.pageDataLayer = "";
          if (typeof window.dataLayer !== "undefined") {
              this.pageDataLayer = (_a = window.dataLayer[0]) === null || _a === void 0 ? void 0 : _a.pageCategory;
          }
      }
      is(rules) {
          let is = false;
          rules.forEach((rule) => {
              if (this.identificacaoMetaPage.search(rule) >= 0 ||
                  this.pageDataLayer === rule ||
                  this.classTagBody.includes(rule)) {
                  is = true;
              }
          });
          return is;
      }
  }
  //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNQYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VzL2NvcmUvaXNQYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWdCQSxNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFLMUI7O1FBQ0MsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRO1lBQ3BDLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUU7WUFDeEMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVOLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksT0FBTyxNQUFNLENBQUMsU0FBUyxLQUFLLFdBQVcsRUFBRTtZQUM1QyxJQUFJLENBQUMsYUFBYSxTQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDBDQUFFLFlBQVksQ0FBQztTQUN2RDtJQUNGLENBQUM7SUFPRCxFQUFFLENBQUMsS0FBZTtRQUNqQixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFZixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDdEIsSUFDQyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSTtnQkFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQy9CO2dCQUNELEVBQUUsR0FBRyxJQUFJLENBQUM7YUFDVjtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxFQUFFLENBQUM7SUFDWCxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSVJ1bGVyIGZyb20gXCIuL0lSdWxlclwiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG5cdGludGVyZmFjZSBXaW5kb3cge1xuXHRcdGRhdGFMYXllcjogRGF0YUxheWVyT2JqZWN0W10gfCB1bmRlZmluZWQ7XG5cdH1cblxuXHRpbnRlcmZhY2UgRGF0YUxheWVyT2JqZWN0IHtcblx0XHRwYWdlQ2F0ZWdvcnk6IHN0cmluZztcblx0fVxufVxuLyoqXG4gKiAgQ2xhc3NlIHBhcmEgdmVyaWZpY2FyIHNlIGVzdGFtb3MgZW0gdW1hIGRhcyBwYWdpbmFzXG4gKiAgcXVlIHPDo28gcGFzc2FkYXMgcG9yIGFyZ3VtZW50b1xuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGlzUGFnZSBpbXBsZW1lbnRzIElSdWxlciB7XG5cdHByaXZhdGUgaWRlbnRpZmljYWNhb01ldGFQYWdlOiBzdHJpbmc7XG5cdHByaXZhdGUgY2xhc3NUYWdCb2R5OiBzdHJpbmdbXTtcblx0cHJpdmF0ZSBwYWdlRGF0YUxheWVyOiBzdHJpbmc7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0Y29uc3QgbWV0YVBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJwYWdlXCJdJyk7XG5cdFx0dGhpcy5pZGVudGlmaWNhY2FvTWV0YVBhZ2UgPSBtZXRhUGFnZVxuXHRcdFx0PyBtZXRhUGFnZS5nZXRBdHRyaWJ1dGUoXCJjb250ZW50XCIpIHx8IFwiXCJcblx0XHRcdDogXCJcIjtcblxuXHRcdHRoaXMuY2xhc3NUYWdCb2R5ID0gQXJyYXkuZnJvbShkb2N1bWVudC5ib2R5LmNsYXNzTGlzdCk7XG5cdFx0dGhpcy5wYWdlRGF0YUxheWVyID0gXCJcIjtcblx0XHRpZiAodHlwZW9mIHdpbmRvdy5kYXRhTGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdHRoaXMucGFnZURhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXJbMF0/LnBhZ2VDYXRlZ29yeTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogKiBAcGFyYW0ge2FycmF5fSBbYXJnc10gdW0gb3UgdW0gYXJyYXkgZGUgc3RyaW5ncyBjb250ZW5kbyBhIHBhbGF2cmEgY2hhdmUgcGFyYSBpZGVudGlmaWNhciBhIHBhZ2luYVxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSByZXRvcm5hIHRydWUgc2UgdW0gZG9zIGFyZ3VtZW50b3MgZXN0aXZlciBuYSBtZXRhL2JvZHlDbGFzcy90YWdcblx0ICovXG5cblx0aXMocnVsZXM6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG5cdFx0bGV0IGlzID0gZmFsc2U7XG5cblx0XHRydWxlcy5mb3JFYWNoKChydWxlKSA9PiB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHRoaXMuaWRlbnRpZmljYWNhb01ldGFQYWdlLnNlYXJjaChydWxlKSA+PSAwIHx8XG5cdFx0XHRcdHRoaXMucGFnZURhdGFMYXllciA9PT0gcnVsZSB8fFxuXHRcdFx0XHR0aGlzLmNsYXNzVGFnQm9keS5pbmNsdWRlcyhydWxlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGlzID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBpcztcblx0fVxufVxuIl19
  
  /***/ }),
  
  /***/ "../node_modules/@agenciam3/pkg/dist/lib/index.js":
  /*!********************************************************!*\
    !*** ../node_modules/@agenciam3/pkg/dist/lib/index.js ***!
    \********************************************************/
  /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "Container": function() { return /* reexport safe */ _core_Container__WEBPACK_IMPORTED_MODULE_0__.default; },
  /* harmony export */   "IsPage": function() { return /* reexport safe */ _core_isPage__WEBPACK_IMPORTED_MODULE_1__.default; },
  /* harmony export */   "PubSub": function() { return /* reexport safe */ _StateManager_PubSub__WEBPACK_IMPORTED_MODULE_2__.default; },
  /* harmony export */   "Store": function() { return /* reexport safe */ _StateManager_Store__WEBPACK_IMPORTED_MODULE_3__.default; },
  /* harmony export */   "mergeStores": function() { return /* reexport safe */ _StateManager_mergeStores__WEBPACK_IMPORTED_MODULE_4__.default; }
  /* harmony export */ });
  /* harmony import */ var _core_Container__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/Container */ "../node_modules/@agenciam3/pkg/dist/lib/core/Container.js");
  /* harmony import */ var _core_isPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/isPage */ "../node_modules/@agenciam3/pkg/dist/lib/core/isPage.js");
  /* harmony import */ var _StateManager_PubSub__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./StateManager/PubSub */ "../node_modules/@agenciam3/pkg/dist/lib/StateManager/PubSub.js");
  /* harmony import */ var _StateManager_Store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./StateManager/Store */ "../node_modules/@agenciam3/pkg/dist/lib/StateManager/Store.js");
  /* harmony import */ var _StateManager_mergeStores__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./StateManager/mergeStores */ "../node_modules/@agenciam3/pkg/dist/lib/StateManager/mergeStores.js");
  
  
  
  
  
  //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGFja2FnZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sSUFBSSxTQUFTLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RCxPQUFPLEVBQUUsT0FBTyxJQUFJLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUUsT0FBTyxJQUFJLE1BQU0sRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxPQUFPLElBQUksS0FBSyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE9BQU8sSUFBSSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7IGRlZmF1bHQgYXMgQ29udGFpbmVyIH0gZnJvbSBcIi4vY29yZS9Db250YWluZXJcIjtcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSXNQYWdlIH0gZnJvbSBcIi4vY29yZS9pc1BhZ2VcIjtcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUHViU3ViIH0gZnJvbSBcIi4vU3RhdGVNYW5hZ2VyL1B1YlN1YlwiO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTdG9yZSB9IGZyb20gXCIuL1N0YXRlTWFuYWdlci9TdG9yZVwiO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBtZXJnZVN0b3JlcyB9IGZyb20gXCIuL1N0YXRlTWFuYWdlci9tZXJnZVN0b3Jlc1wiO1xuIl19
  
  /***/ }),
  
  /***/ "jquery":
  /*!*************************!*\
    !*** external "jQuery" ***!
    \*************************/
  /***/ (function(module) {
  
  "use strict";
  module.exports = jQuery;
  
  /***/ })
  
  /******/ 	});
  /************************************************************************/
  /******/ 	// The module cache
  /******/ 	var __webpack_module_cache__ = {};
  /******/ 	
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
  /******/ 		// Check if module is in cache
  /******/ 		var cachedModule = __webpack_module_cache__[moduleId];
  /******/ 		if (cachedModule !== undefined) {
  /******/ 			return cachedModule.exports;
  /******/ 		}
  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = __webpack_module_cache__[moduleId] = {
  /******/ 			// no module.id needed
  /******/ 			// no module.loaded needed
  /******/ 			exports: {}
  /******/ 		};
  /******/ 	
  /******/ 		// Execute the module function
  /******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  /******/ 	
  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}
  /******/ 	
  /************************************************************************/
  /******/ 	/* webpack/runtime/compat get default export */
  /******/ 	!function() {
  /******/ 		// getDefaultExport function for compatibility with non-harmony modules
  /******/ 		__webpack_require__.n = function(module) {
  /******/ 			var getter = module && module.__esModule ?
  /******/ 				function() { return module['default']; } :
  /******/ 				function() { return module; };
  /******/ 			__webpack_require__.d(getter, { a: getter });
  /******/ 			return getter;
  /******/ 		};
  /******/ 	}();
  /******/ 	
  /******/ 	/* webpack/runtime/define property getters */
  /******/ 	!function() {
  /******/ 		// define getter functions for harmony exports
  /******/ 		__webpack_require__.d = function(exports, definition) {
  /******/ 			for(var key in definition) {
  /******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
  /******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
  /******/ 				}
  /******/ 			}
  /******/ 		};
  /******/ 	}();
  /******/ 	
  /******/ 	/* webpack/runtime/hasOwnProperty shorthand */
  /******/ 	!function() {
  /******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
  /******/ 	}();
  /******/ 	
  /******/ 	/* webpack/runtime/make namespace object */
  /******/ 	!function() {
  /******/ 		// define __esModule on exports
  /******/ 		__webpack_require__.r = function(exports) {
  /******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  /******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  /******/ 			}
  /******/ 			Object.defineProperty(exports, '__esModule', { value: true });
  /******/ 		};
  /******/ 	}();
  /******/ 	
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  !function() {
  "use strict";
  /*!*************************************!*\
    !*** ./src/arquivos/js/checkout.js ***!
    \*************************************/
  __webpack_require__.r(__webpack_exports__);
  /* harmony import */ var _components_CheckoutUI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/CheckoutUI */ "./src/arquivos/js/components/CheckoutUI.js");
  /* harmony import */ var _agenciam3_pkg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @agenciam3/pkg */ "../node_modules/@agenciam3/pkg/dist/lib/index.js");
  /* harmony import */ var _components_Exemple__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/Exemple */ "./src/arquivos/js/components/Exemple.js");
  /* harmony import */ var _components_ExempleEvent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/ExempleEvent */ "./src/arquivos/js/components/ExempleEvent.js");
  /* harmony import */ var _components_StepBar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/StepBar */ "./src/arquivos/js/components/StepBar.js");
  /* harmony import */ var _components_StepBar__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_components_StepBar__WEBPACK_IMPORTED_MODULE_4__);
  /* harmony import */ var _components_CustomInstallments__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/CustomInstallments */ "./src/arquivos/js/components/CustomInstallments.js");
  /* harmony import */ var _components_CustomInstallments__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_components_CustomInstallments__WEBPACK_IMPORTED_MODULE_5__);
  /* harmony import */ var _components_CustomInstallmentPerItems__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/CustomInstallmentPerItems */ "./src/arquivos/js/components/CustomInstallmentPerItems.js");
  /* harmony import */ var _components_CustomInstallmentPerItems__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_components_CustomInstallmentPerItems__WEBPACK_IMPORTED_MODULE_6__);
  /* harmony import */ var _components_LoginModal__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/LoginModal */ "./src/arquivos/js/components/LoginModal.js");
  /* harmony import */ var _components_LoginModal__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_components_LoginModal__WEBPACK_IMPORTED_MODULE_7__);
  
  
  
  
  
  
  
  
  
  const m3Checkout = new _agenciam3_pkg__WEBPACK_IMPORTED_MODULE_1__.Container({
      appName: "m3-checkout",
      components: [_components_CheckoutUI__WEBPACK_IMPORTED_MODULE_0__.default, _components_Exemple__WEBPACK_IMPORTED_MODULE_2__.default, _components_ExempleEvent__WEBPACK_IMPORTED_MODULE_3__.default, (_components_StepBar__WEBPACK_IMPORTED_MODULE_4___default()), (_components_CustomInstallments__WEBPACK_IMPORTED_MODULE_5___default()), (_components_CustomInstallmentPerItems__WEBPACK_IMPORTED_MODULE_6___default()), (_components_LoginModal__WEBPACK_IMPORTED_MODULE_7___default())],
  });
  
  m3Checkout.start();
  
  
  }();
  /******/ })()
  ;
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0NoZWNrb3V0VUkuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvY29tcG9uZW50cy9DdXN0b21JbnN0YWxsbWVudFBlckl0ZW1zLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2NvbXBvbmVudHMvQ3VzdG9tSW5zdGFsbG1lbnRzLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2NvbXBvbmVudHMvRXhlbXBsZS5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0V4ZW1wbGVFdmVudC5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0xvZ2luTW9kYWwuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvY29tcG9uZW50cy9TdGVwQmFyLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2hlbHBlcnMvTWVkaWFzTWF0Y2guanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvaGVscGVycy92dGV4VXRpbHMuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvaGVscGVycy93YWl0Rm9yRWwuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL1N0YXRlTWFuYWdlci9QdWJTdWIuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL1N0YXRlTWFuYWdlci9TdG9yZS5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uLi9ub2RlX21vZHVsZXMvQGFnZW5jaWFtMy9wa2cvZGlzdC9saWIvU3RhdGVNYW5hZ2VyL21lcmdlU3RvcmVzLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4uL25vZGVfbW9kdWxlcy9AYWdlbmNpYW0zL3BrZy9kaXN0L2xpYi9jb3JlL0NvbnRhaW5lci5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uLi9ub2RlX21vZHVsZXMvQGFnZW5jaWFtMy9wa2cvZGlzdC9saWIvY29yZS9pc1BhZ2UuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL2luZGV4LmpzIiwid2VicGFjazovL2NoZWNrb3V0L2V4dGVybmFsIFwialF1ZXJ5XCIiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NoZWNrb3V0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jaGVja291dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBMEQ7QUFDUztBQUN0Qjs7QUFFOUI7QUFDZjtBQUNBOztBQUVBLFlBQVksa0VBQWdCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsQ0FBQztBQUN0Qix3QkFBd0IsQ0FBQztBQUN6Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUIsdUJBQXVCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFD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UEEsNkNBQTZDLHdEQUF3RCxFOzs7OztXQ0FyRztXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTmlEO0FBQ047QUFDQTtBQUNVO0FBQ1Y7QUFDc0I7QUFDYztBQUM5Qjs7QUFFakQsdUJBQXVCLHFEQUFTO0FBQ2hDO0FBQ0EsaUJBQWlCLDJEQUFVLEVBQUUsd0RBQU8sRUFBRSw2REFBWSxFQUFFLDREQUFPLEVBQUUsdUVBQWtCLEVBQUUsOEVBQXlCLEVBQUUsK0RBQVU7QUFDdEgsQ0FBQzs7QUFFRCIsImZpbGUiOiJndWFyYXJhcGVzLXRlbXBsYXRlLS1jaGVja291dC1idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1NtYWxsZXJUaGVuNzY4IH0gZnJvbSBcIi4uL2hlbHBlcnMvTWVkaWFzTWF0Y2hcIjtcbmltcG9ydCB7IGFsdGVyYXJUYW1hbmhvSW1hZ2VtU3JjVnRleCB9IGZyb20gXCIuLi9oZWxwZXJzL3Z0ZXhVdGlsc1wiO1xuaW1wb3J0IHdhaXRGb3JFbCBmcm9tIFwiLi4vaGVscGVycy93YWl0Rm9yRWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hlY2tvdXRVSSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgICAgIGlmIChpc1NtYWxsZXJUaGVuNzY4KSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycygpO1xuICAgICAgICAgICAgdGhpcy5ldmVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Rm9vdGVyRHJvcGRvd24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdG9ycygpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9ICQoXCIuZm9vdGVyQ2hlY2tvdXRfX3RpdGxlXCIpO1xuICAgICAgICB0aGlzLmNvbnRlbnRzID0gJChcIi5mb290ZXJDaGVja291dF9fY29udGVudFwiKTtcbiAgICB9XG5cbiAgICBldmVudHMoKSB7XG4gICAgICAgIHRoaXMudGl0bGUuY2xpY2sodGhpcy50b2dnbGVGb290ZXJEcm9wZG93bi5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzZXRGb290ZXJEcm9wZG93bigpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRpdGxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnRpdGxlW2ldLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bl9fdGl0bGVcIik7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzW2ldLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bl9fY29udGVudC0tY2xvc2VkXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlRm9vdGVyRHJvcGRvd24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoXCJjbG9zZWRcIik7XG5cbiAgICAgICAgZXZlbnQudGFyZ2V0Lm5leHRFbGVtZW50U2libGluZy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAgICAgXCJkcm9wZG93bl9fY29udGVudC0tY2xvc2VkXCJcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLmNvbmZpZ1RodW1iKCk7XG4gICAgICAgIHdhaXRGb3JFbChcIi5wcm9kdWN0LWltYWdlIGltZ1wiLCB0aGlzLnJlc2l6ZUltYWdlcy5iaW5kKHRoaXMpKTtcbiAgICAgICAgJCh3aW5kb3cpLm9uKFwib3JkZXJGb3JtVXBkYXRlZC52dGV4XCIsIHRoaXMucmVzaXplSW1hZ2VzLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbmZpZ1RodW1iKCkge1xuICAgICAgICBpZiAoaXNTbWFsbGVyVGhlbjc2OCkge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IDczO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSA5NjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSA2MztcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gODM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNpemVJbWFnZXMoKSB7XG4gICAgICAgICQoXCIucHJvZHVjdC1pbWFnZSBpbWdcIikuZWFjaCgoaSwgZWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0ICRlbCA9ICQoZWwpO1xuICAgICAgICAgICAgJGVsLmF0dHIoXG4gICAgICAgICAgICAgICAgXCJzcmNcIixcbiAgICAgICAgICAgICAgICBhbHRlcmFyVGFtYW5ob0ltYWdlbVNyY1Z0ZXgoXG4gICAgICAgICAgICAgICAgICAgICRlbC5hdHRyKFwic3JjXCIpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vIEluamV0YSBlc3RpbG9zIGRvIGNvbXBvbmVudGUgZGUgcGFyY2VsYXMgbm9zIGl0ZW5zIGRvIGNhcnJpbmhvICh1bWEgdmV6KVxuZnVuY3Rpb24gSW5zZXJ0U3R5bGVzTWluaWNhcnRJdGVtcygpIHtcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXN0b20taW5zdGFsbG1lbnQtaXRlbS1taW5pY2FydC1zdHlsZScpKSByZXR1cm5cbiAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gIHN0eWxlLmlkID0gJ2N1c3RvbS1pbnN0YWxsbWVudC1pdGVtLW1pbmljYXJ0LXN0eWxlJ1xuICBzdHlsZS5pbm5lckhUTUwgPSBgXG4gICAgLmN1c3RvbS1pbnN0YWxsbWVudC10b3RhbCB7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBjb2xvcjogIzcwNzA3MDtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICB3aWR0aDogMTc1cHg7XG4gICAgICBtYXgtaGVpZ2h0OiAxMHB4O1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgZm9udC1mYW1pbHk6ICdVYnVudHUnLCBzYW5zLXNlcmlmO1xuICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICAgICAgcmlnaHQ6IC0xMTFweDtcbiAgICAgIHRvcDogLTE4cHg7XG4gICAgfVxuICAgIEBtZWRpYSAobWluLXdpZHRoOiAxMDI0cHgpIHtcbiAgICAgIC5jdXN0b20taW5zdGFsbG1lbnQtdG90YWwge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgfVxuICAgIH1cbiAgYFxuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKVxufVxuXG4vLyBBZGljaW9uYSBlc3RpbG9zIGFvIHRvdGFsLXNlbGxpbmctcHJpY2UgcXVhbmRvIHRlbSBsaXN0LXByaWNlXG5mdW5jdGlvbiBJbnNlcnRDbGFzc1RvVG90YWxTZWxsaW5nUHJpY2UoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJ0LWl0ZW1zIC5wcm9kdWN0LWl0ZW0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICBjb25zdCBsaXN0UHJpY2UgPSBlbC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1wcmljZSAubGlzdC1wcmljZScpXG4gICAgaWYgKGxpc3RQcmljZT8uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRlJykpIHtcbiAgICAgIGNvbnN0IHRvdGFsU2VsbGluZ1ByaWNlID0gZWwucXVlcnlTZWxlY3RvcignLnRvdGFsLXNlbGxpbmctcHJpY2UnKVxuICAgICAgaWYgKHRvdGFsU2VsbGluZ1ByaWNlICYmICF0b3RhbFNlbGxpbmdQcmljZS5jbGFzc0xpc3QuY29udGFpbnMoJ25vLWxpc3QtcHJpY2UnKSkge1xuICAgICAgICB0b3RhbFNlbGxpbmdQcmljZS5jbGFzc0xpc3QuYWRkKCduby1saXN0LXByaWNlJylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbi8vIEFndWFyZGEgVlRFWCBKUyAob3JkZXJGb3JtKSBlc3RhciBkaXNwb27DrXZlbCBhbnRlcyBkZSBleGVjdXRhciBhIGzDs2dpY2FcbmZ1bmN0aW9uIHdhaXRGb3JWdGV4anMoY2FsbGJhY2spIHtcbiAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuXG4gIGlmICh3aW5kb3cudnRleGpzICYmIHdpbmRvdy52dGV4anMuY2hlY2tvdXQgJiYgd2luZG93LnZ0ZXhqcy5jaGVja291dC5nZXRPcmRlckZvcm0pIHtcbiAgICBjYWxsYmFjaygpO1xuICB9IGVsc2Uge1xuICAgIHNldFRpbWVvdXQoKCkgPT4gd2FpdEZvclZ0ZXhqcyhjYWxsYmFjayksIDIwMDApO1xuICB9XG59XG5cbi8vIEJsb2NvIHByaW5jaXBhbDogcmVnaXN0cmEgZXN0YWRvcywgaW5qZXRhIGVzdGlsb3MgZSBhbWFycmEgZXZlbnRvcyBkZSBhdHVhbGl6YcOnw6NvXG53YWl0Rm9yVnRleGpzKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcmVuZGVyZWRMaW5lSXRlbUtleXMgPSBuZXcgU2V0KClcbiAgY29uc3QgaW5GbGlnaHRMaW5lSXRlbUtleXMgPSBuZXcgU2V0KClcbiAgY29uc3Qgc2ltdWxhdGlvbkNhY2hlID0gbmV3IE1hcCgpXG5cbiAgLy8gQ2hhbWEgYSBBUEkgZGUgc2ltdWxhw6fDo28gZG8gY2hlY2tvdXQgcGFyYSBvYnRlciBvcMOnw7VlcyBkZSBwYXJjZWxhbWVudG8gZG8gU0tVXG4gIGFzeW5jIGZ1bmN0aW9uIHNpbXVsYXRlSXRlbUluc3RhbGxtZW50cyhza3VJZCwgcXVhbnRpdHkpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvYXBpL2NoZWNrb3V0L3B1Yi9vcmRlckZvcm1zL3NpbXVsYXRpb24nLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHsgaWQ6IHNrdUlkLCBxdWFudGl0eTogcXVhbnRpdHksIHNlbGxlcjogJzEnIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHBvc3RhbENvZGU6ICcwNzE0MC0yMzMnLFxuICAgICAgICBjb3VudHJ5OiAnQlJBJyxcbiAgICAgIH0pLFxuICAgIH0pXG4gICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKCdTaW11bGF0aW9uIGVycm9yJylcbiAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICAvLyBSZXRvcm5hIHNpbXVsYcOnw6NvIGRvIGNhY2hlIG91IGV4ZWN1dGEgZSBhcm1hemVuYSBhbnRlcyBkZSByZXRvcm5hclxuICBmdW5jdGlvbiBnZXRTaW11bGF0aW9uKHNrdUlkLCBxdWFudGl0eSkge1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gYCR7c2t1SWR9OiR7cXVhbnRpdHl9YFxuICAgIGlmIChzaW11bGF0aW9uQ2FjaGUuaGFzKGNhY2hlS2V5KSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShzaW11bGF0aW9uQ2FjaGUuZ2V0KGNhY2hlS2V5KSlcbiAgICB9XG4gICAgcmV0dXJuIHNpbXVsYXRlSXRlbUluc3RhbGxtZW50cyhza3VJZCwgcXVhbnRpdHkpLnRoZW4ocmVzID0+IHtcbiAgICAgIHNpbXVsYXRpb25DYWNoZS5zZXQoY2FjaGVLZXksIHJlcylcbiAgICAgIHJldHVybiByZXNcbiAgICB9KVxuICB9XG5cbiAgLy8gRm9ybWF0YSB2YWxvciAoYXJyZWRvbmRhIHBhcmEgMiBjYXNhcyBkZWNpbWFpcylcbiAgZnVuY3Rpb24gZm9ybWF0Q3VycmVuY3kodmFsdWVJbkNlbnRzKSB7XG4gICAgcmV0dXJuICh2YWx1ZUluQ2VudHMgLyAxMDApLnRvTG9jYWxlU3RyaW5nKCdwdC1CUicsIHtcbiAgICAgIHN0eWxlOiAnY3VycmVuY3knLFxuICAgICAgY3VycmVuY3k6ICdCUkwnXG4gICAgfSlcbiAgfVxuXG4gIC8vIFBhcmEgY2FkYSBpdGVtIGRvIGNhcnJpbmhvLCBpbnNlcmUgKG91IHJlYXByb3ZlaXRhKSB1bSBibG9jbyBkZSBwYXJjZWxhcyBsb2dvIGFww7NzIC50b3RhbC1wcmljZSBlIHByZWVuY2hlIGNvbSBhIG1lbGhvciBvcMOnw6NvXG4gIGZ1bmN0aW9uIGluc2VydFBlckl0ZW1JbnN0YWxsbWVudHMob3JkZXJGb3JtKSB7XG4gICAgcmVuZGVyZWRMaW5lSXRlbUtleXMuY2xlYXIoKVxuICAgIG9yZGVyRm9ybT8uaXRlbXM/LmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBza3UgPSBpdGVtPy5pZFxuICAgICAgY29uc3QgcXVhbnRpdHkgPSBpdGVtPy5xdWFudGl0eVxuXG4gICAgICBjb25zdCB0b3RhbFByaWNlRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG90YWwtcHJpY2UnKVtpbmRleF1cbiAgICAgIGlmICghc2t1IHx8ICFxdWFudGl0eSB8fCAhdG90YWxQcmljZUVsKSByZXR1cm5cblxuICAgICAgLy8gQ2hhdmUgZXN0w6F2ZWwgcG9yIGxpbmhhICh1bmlxdWVJZCBxdWFuZG8gZGlzcG9uw612ZWwpXG4gICAgICBjb25zdCBrZXkgPSBpdGVtLnVuaXF1ZUlkIHx8IGAke3NrdX0tJHtpbmRleH1gXG4gICAgICBpZiAoaW5GbGlnaHRMaW5lSXRlbUtleXMuaGFzKGtleSkpIHJldHVyblxuICAgICAgaW5GbGlnaHRMaW5lSXRlbUtleXMuYWRkKGtleSlcblxuICAgICAgLy8gR2FyYW50ZSBhIGV4aXN0w6puY2lhIGRvIGNvbnTDqmluZXIgbG9nbyBhcMOzcyBvIHRvdGFsIGRvIGl0ZW1cbiAgICAgIGxldCBjdXN0b21JbnN0YWxsbWVudENvbXBvbmVudCA9IHRvdGFsUHJpY2VFbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJy5jdXN0b20taW5zdGFsbG1lbnQtdG90YWwnKVxuICAgICAgaWYgKCFjdXN0b21JbnN0YWxsbWVudENvbXBvbmVudCkge1xuICAgICAgICBjdXN0b21JbnN0YWxsbWVudENvbXBvbmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGN1c3RvbUluc3RhbGxtZW50Q29tcG9uZW50LmNsYXNzTmFtZSA9ICdjdXN0b20taW5zdGFsbG1lbnQtdG90YWwnXG4gICAgICAgIHRvdGFsUHJpY2VFbC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgY3VzdG9tSW5zdGFsbG1lbnRDb21wb25lbnQpXG4gICAgICB9XG5cbiAgICAgIC8vIEJ1c2NhIHNpbXVsYcOnw6NvIGUgZXNjcmV2ZSBhIG1lbGhvciBvcMOnw6NvIGRlIHBhcmNlbGFcbiAgICAgIGdldFNpbXVsYXRpb24oU3RyaW5nKHNrdSksIHF1YW50aXR5KVxuICAgICAgICAudGhlbihzaW0gPT4ge1xuICAgICAgICAgIGNvbnN0IGluc3RhbGxtZW50cyA9IHNpbT8ucGF5bWVudERhdGE/Lmluc3RhbGxtZW50T3B0aW9ucz8uWzBdPy5pbnN0YWxsbWVudHNcbiAgICAgICAgICBjb25zdCBiZXN0ID0gaW5zdGFsbG1lbnRzPy5baW5zdGFsbG1lbnRzLmxlbmd0aCAtIDFdXG4gICAgICAgICAgaWYgKGJlc3QpIHtcbiAgICAgICAgICAgIGN1c3RvbUluc3RhbGxtZW50Q29tcG9uZW50LmlubmVyVGV4dCA9IGBvdSBlbSBhdMOpICR7YmVzdC5jb3VudH14IGRlICR7Zm9ybWF0Q3VycmVuY3koYmVzdC52YWx1ZSl9YFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbmFsbHkoKCkgPT4gaW5GbGlnaHRMaW5lSXRlbUtleXMuZGVsZXRlKGtleSkpXG4gICAgfSlcbiAgfVxuXG4gIC8vIEluamV0YSBlc3RpbG9zLCBsaW1wYSBzb2JyYXMgZSByZW5kZXJpemEgcG9yIGl0ZW1cbiAgSW5zZXJ0U3R5bGVzTWluaWNhcnRJdGVtcygpXG4gIEluc2VydENsYXNzVG9Ub3RhbFNlbGxpbmdQcmljZSgpXG4gIHZ0ZXhqcy5jaGVja291dC5nZXRPcmRlckZvcm0oKS50aGVuKG9yZGVyRm9ybSA9PiB7XG4gICAgaW5zZXJ0UGVySXRlbUluc3RhbGxtZW50cyhvcmRlckZvcm0pXG4gIH0pXG5cbiAgLy8gQXR1YWxpemEgbXVkYW7Dp2FzIGRvIG9yZGVyRm9ybSBcbiAgJCh3aW5kb3cpLm9uKCdvcmRlckZvcm1VcGRhdGVkLnZ0ZXgnLCBmdW5jdGlvbiAoXywgb3JkZXJGb3JtKSB7XG4gICAgSW5zZXJ0U3R5bGVzTWluaWNhcnRJdGVtcygpXG4gICAgSW5zZXJ0Q2xhc3NUb1RvdGFsU2VsbGluZ1ByaWNlKClcbiAgICBpbnNlcnRQZXJJdGVtSW5zdGFsbG1lbnRzKG9yZGVyRm9ybSlcbiAgfSlcblxuICAvLyBSZWFnZSBhIG5hdmVnYcOnw6NvIGRlbnRybyBkbyBjaGVja291dCAoaGFzaGNoYW5nZSlcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgdnRleGpzLmNoZWNrb3V0LmdldE9yZGVyRm9ybSgpLnRoZW4ob3JkZXJGb3JtID0+IHtcbiAgICAgIGluc2VydFBlckl0ZW1JbnN0YWxsbWVudHMob3JkZXJGb3JtKVxuICAgIH0pXG4gIH0pXG59KVxuIiwiZnVuY3Rpb24gd2FpdEZvclZ0ZXhqcyhjYWxsYmFjaykge1xuICBpZiAod2luZG93LnZ0ZXhqcyAmJiB3aW5kb3cudnRleGpzLmNoZWNrb3V0ICYmIHdpbmRvdy52dGV4anMuY2hlY2tvdXQuZ2V0T3JkZXJGb3JtKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfSBlbHNlIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHdhaXRGb3JWdGV4anMoY2FsbGJhY2spLCAyMDApO1xuICB9XG59XG5cbndhaXRGb3JWdGV4anMoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBpbnNlcnRTdHlsZXMoKSB7XG4gICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXN0b20taW5zdGFsbG1lbnQtc3R5bGUnKSkgcmV0dXJuXG5cbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICBzdHlsZS5pZCA9ICdjdXN0b20taW5zdGFsbG1lbnQtc3R5bGUnXG4gICAgc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgICAuY3VzdG9tLWluc3RhbGxtZW50LWluZm8ge1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgICBjb2xvcjogIzcwNzA3MDtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIHdpZHRoOiAxNzFweDtcbiAgICAgICAgICBtYXgtaGVpZ2h0OiAxMHB4O1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICBmb250LWZhbWlseTogJ1VidW50dScsIHNhbnMtc2VyaWY7XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICAgICAgICBsaW5lLWhlaWdodDogMTZweDtcbiAgICAgICAgICByaWdodDogLTJweDtcbiAgICAgICAgICBib3R0b206IDIwMnB4O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBAbWVkaWEgKG1pbi13aWR0aDogNzY3cHgpIGFuZCAobWF4LXdpZHRoOiAxMDI0cHgpIHtcbiAgICAgICAgICAuY3VzdG9tLWluc3RhbGxtZW50LWluZm8ge1xuICAgICAgICAgICAgYm90dG9tOiAxNjRweDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgXG4gICAgICAgIEBtZWRpYSAobWluLXdpZHRoOiAxMDI0cHgpIHtcbiAgICAgICAgICAuY3VzdG9tLWluc3RhbGxtZW50LWluZm8ge1xuICAgICAgICAgICAgcmlnaHQ6IDZweDtcbiAgICAgICAgICAgIGJvdHRvbTogMTIycHg7XG4gICAgICAgICAgICB3aWR0aDogMTgwcHg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBgXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2VydEJlc3RJbnN0YWxsbWVudEluZm8ob3JkZXJGb3JtKSB7XG4gICAgY29uc3Qgc3VtbWFyeVRvdGFsaXplcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3VtbWFyeS10b3RhbGl6ZXJzJylcbiAgICBpZiAoIW9yZGVyRm9ybSB8fCAhc3VtbWFyeVRvdGFsaXplcnMpIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jdXN0b20taW5zdGFsbG1lbnQtaW5mbycpPy5yZW1vdmUoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY3VzdG9tLWluc3RhbGxtZW50LWluZm8nKVxuICAgIGlmIChleGlzdGluZykgZXhpc3RpbmcucmVtb3ZlKClcblxuICAgIGNvbnN0IGluc3RhbGxtZW50T3B0aW9ucyA9IG9yZGVyRm9ybT8ucGF5bWVudERhdGE/Lmluc3RhbGxtZW50T3B0aW9ucztcbiAgICBjb25zdCBpbnN0YWxsbWVudHMgPSBpbnN0YWxsbWVudE9wdGlvbnM/LlswXT8uaW5zdGFsbG1lbnRzXG4gICAgaWYgKCFpbnN0YWxsbWVudHMgfHwgaW5zdGFsbG1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgICBjb25zdCBiZXN0ID0gaW5zdGFsbG1lbnRzW2luc3RhbGxtZW50cy5sZW5ndGggLSAxXVxuICAgIGlmICghYmVzdCkgcmV0dXJuXG5cbiAgICBjb25zdCB2YWx1ZUZvcm1hdHRlZCA9IChiZXN0LnZhbHVlIC8gMTAwKS50b0xvY2FsZVN0cmluZygncHQtQlInLCB7XG4gICAgICBzdHlsZTogJ2N1cnJlbmN5JyxcbiAgICAgIGN1cnJlbmN5OiAnQlJMJyxcbiAgICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMixcbiAgICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMixcbiAgICB9KVxuXG4gICAgY29uc3QgaW5zdGFsbG1lbnRUZXh0ID0gYG91IGVtIGF0w6kgJHtiZXN0LmNvdW50fXggZGUgJHt2YWx1ZUZvcm1hdHRlZH1gXG5cbiAgICBjb25zdCBpbnN0YWxsbWVudEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBpbnN0YWxsbWVudEVsLmNsYXNzTmFtZSA9ICdjdXN0b20taW5zdGFsbG1lbnQtaW5mbydcbiAgICBpbnN0YWxsbWVudEVsLmlubmVyVGV4dCA9IGluc3RhbGxtZW50VGV4dFxuXG4gICAgc3VtbWFyeVRvdGFsaXplcnMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaW5zdGFsbG1lbnRFbCwgc3VtbWFyeVRvdGFsaXplcnMubmV4dFNpYmxpbmcpXG4gIH1cblxuICBmdW5jdGlvbiB3YWl0Rm9yU3VtbWFyeVRvdGFsaXplcnNBbmRJbnNlcnQob3JkZXJGb3JtKSB7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBjb25zdCBzdW1tYXJ5VG90YWxpemVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdW1tYXJ5LXRvdGFsaXplcnMnKTtcbiAgICAgIGlmIChzdW1tYXJ5VG90YWxpemVycykge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgaW5zZXJ0QmVzdEluc3RhbGxtZW50SW5mbyhvcmRlckZvcm0pO1xuICAgICAgfVxuICAgIH0sIDIwMCk7XG4gICAgLy8gT3BjaW9uYWw6IHRpbWVvdXQgcGFyYSBuw6NvIHJvZGFyIHBhcmEgc2VtcHJlXG4gICAgc2V0VGltZW91dCgoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKSwgMTAwMDApO1xuICB9XG5cbiAgaW5zZXJ0U3R5bGVzKClcblxuICB2dGV4anMuY2hlY2tvdXQuZ2V0T3JkZXJGb3JtKCkudGhlbihvcmRlckZvcm0gPT4ge1xuICAgIHdhaXRGb3JTdW1tYXJ5VG90YWxpemVyc0FuZEluc2VydChvcmRlckZvcm0pXG4gIH0pXG5cbiAgJCh3aW5kb3cpLm9uKCdvcmRlckZvcm1VcGRhdGVkLnZ0ZXgnLCBmdW5jdGlvbiAoXywgb3JkZXJGb3JtKSB7ICBcbiAgICBpbnNlcnRTdHlsZXMoKVxuICAgIHdhaXRGb3JTdW1tYXJ5VG90YWxpemVyc0FuZEluc2VydChvcmRlckZvcm0pXG4gIH0pXG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgdnRleGpzLmNoZWNrb3V0LmdldE9yZGVyRm9ybSgpLnRoZW4od2FpdEZvclN1bW1hcnlUb3RhbGl6ZXJzQW5kSW5zZXJ0KVxuICB9KVxufSk7XG4iLCJpbXBvcnQgd2FpdEZvckVsIGZyb20gXCIuLi9oZWxwZXJzL3dhaXRGb3JFbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeGVtcGxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdCgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zZWxlY3RvcnMoKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5pdGVtKTtcbiAgICB9XG5cbiAgICBhc3luYyBzZWxlY3RvcnMoKSB7XG4gICAgICAgIHRoaXMuaXRlbSA9IGF3YWl0IHdhaXRGb3JFbChcbiAgICAgICAgICAgIFwiLnN1bW1hcnktY2FydC10ZW1wbGF0ZS1ob2xkZXIgLmNhcnQtaXRlbXNcIlxuICAgICAgICApO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4ZW1wbGVFdmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRvcygpO1xuICAgIH1cbiAgICBldmVudG9zKCkge1xuICAgICAgICAkKHdpbmRvdykub24oXCJvcmRlckZvcm1VcGRhdGVkLnZ0ZXhcIiwgdGhpcy5vblVwZGF0ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblVwZGF0ZShvcmRlckZvcm0pIHtcbiAgICAgICAgY29uc29sZS5sb2cob3JkZXJGb3JtKTtcbiAgICB9XG59XG4iLCIoZnVuY3Rpb24gKCkge1xuZnVuY3Rpb24gdmVyaWZ5TG9nZ2VkSW4oKSB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbj8uaGFzaDtcbiAgXG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBjb25zdCBvcmRlckZvcm0gPSB2dGV4anM/LmNoZWNrb3V0Py5vcmRlckZvcm07XG4gICAgICBjb25zdCBpc0xvZ2dlZCA9IG9yZGVyRm9ybT8ubG9nZ2VkSW47XG4gICAgICBpZihpc0xvZ2dlZCAhPT0gdW5kZWZpbmVkKSB7IFxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTsgXG4gIFxuICAgICAgICBpZighaXNMb2dnZWQgJiYgaGFzaC5pbmNsdWRlcyhcIi9zaGlwcGluZ1wiKSB8fCBoYXNoLmluY2x1ZGVzKFwiL3BheW1lbnRcIikpIHtcbiAgICAgICAgICBjaGVja291dC5sb2dpbigpO1xuICAgICAgICB9IFxuICAgICAgfVxuICAgIH0sIDEwMDApXG4gIH1cbiAgXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICB2ZXJpZnlMb2dnZWRJbigpO1xuICB9KVxuICBcbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoKSA9PiB7XG4gICAgdmVyaWZ5TG9nZ2VkSW4oKTtcbiAgfSlcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gcmVuZGVyQ2hlY2tvdXRTdGVwcygpIHtcbiAgICBjb25zdCBicm93biA9IFwiI0QyQUU4MlwiOyAgIFxuICAgIGNvbnN0IGRhcmsgPSBcIiMyRDJEMjhcIjsgICAgXG4gICAgY29uc3Qgd2hpdGUgPSBcIiNmZmZcIjtcbiAgICBjb25zdCBjaXJjbGVTaXplID0gMzI7XG5cbiAgICBjb25zdCBzdGVwcyA9IFsnQ2FycmluaG8nLCAnRGFkb3MgUGVzc29haXMnLCAnRW50cmVnYScsICdQYWdhbWVudG8nXTtcblxuICAgIGxldCBzdGVwc0hUTUwgPSBgPGRpdiBjbGFzcz1cImhlYWRlci1jaGVja291dC1zdGVwc1wiIHN0eWxlPVwid2lkdGg6MTAwJTttYXJnaW46MTZweCAwIDQ0cHggMDtwb3NpdGlvbjpyZWxhdGl2ZTtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2ZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCcsIEFyaWFsO1wiPlxuICAgICAgPGRpdiBjbGFzcz1cInN0ZXBzLWZsZXhcIiBzdHlsZT1cImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7d2lkdGg6OTUlO21hcmdpbjowIGF1dG87cG9zaXRpb246cmVsYXRpdmU7XCI+YDtcblxuICAgIHN0ZXBzLmZvckVhY2goKHRpdGxlLCBpKSA9PiB7XG4gICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgc3RlcHNIVE1MICs9IGA8ZGl2IGNsYXNzPVwibGluZVwiIHN0eWxlPVwiZmxleDoxO2hlaWdodDoycHg7YWxpZ24tc2VsZjpjZW50ZXI7YmFja2dyb3VuZDoke2Jyb3dufTt0cmFuc2l0aW9uOmJhY2tncm91bmQgMC4yczttaW4td2lkdGg6MDtcIj48L2Rpdj5gO1xuICAgICAgfVxuICAgICAgc3RlcHNIVE1MICs9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInN0ZXAtY2lyY2xlLXdyYXBcIiBzdHlsZT1cImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6Y2VudGVyO3Bvc2l0aW9uOnJlbGF0aXZlO1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGVwLW51bWJlci1jaXJjbGVcIiBpZD1cImNpcmNsZS0ke2kgKyAxfVwiIHN0eWxlPVwid2lkdGg6JHtjaXJjbGVTaXplfXB4O2hlaWdodDoke2NpcmNsZVNpemV9cHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjJweCBzb2xpZCAke2Jyb3dufTtiYWNrZ3JvdW5kOiR7d2hpdGV9O2NvbG9yOiR7YnJvd259O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LXdlaWdodDo0MDA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTRweDtsZXR0ZXItc3BhY2luZzowJTtmb250LWZhbWlseTonTW9udHNlcnJhdCcsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NDAwO3RyYW5zaXRpb246YWxsIDAuMnM7ei1pbmRleDoxO1wiPiR7aSArIDF9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0ZXAtdGl0bGVcIiBpZD1cImxhYmVsLSR7aSArIDF9XCIgc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MzhweDtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtNTAlKTt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxNHB4O2NvbG9yOiR7YnJvd259O2ZvbnQtd2VpZ2h0OjQwMDtsZXR0ZXItc3BhY2luZzowJTtmb250LWZhbWlseTonTW9udHNlcnJhdCcsIHNhbnMtc2VyaWY7dmVydGljYWwtYWxpZ246bWlkZGxlO3RyYW5zaXRpb246Y29sb3IgMC4yczske2kgPT09IDEgPyAnd2hpdGUtc3BhY2U6bm93cmFwOycgOiAnJ31cIj4ke3RpdGxlfTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGA7XG4gICAgfSk7XG5cbiAgICBzdGVwc0hUTUwgKz0gYDwvZGl2PjwvZGl2PmA7XG5cbiAgICBjb25zdCBoZWFkZXJDaGVja291dENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXJDaGVja291dCAuY29udGFpbmVyJyk7XG4gICAgY29uc3QgZXhpc3RpbmdTdGVwQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlYWRlci1jaGVja291dC1zdGVwcycpO1xuICAgIGlmIChleGlzdGluZ1N0ZXBCYXIpIGV4aXN0aW5nU3RlcEJhci5yZW1vdmUoKTtcbiAgICBpZiAoaGVhZGVyQ2hlY2tvdXRDb250YWluZXIpIHtcbiAgICAgIGhlYWRlckNoZWNrb3V0Q29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgc3RlcHNIVE1MKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdGVwc0hhc2ggPSBbXCIvY2hlY2tvdXQjL2NhcnRcIiwgXCIvY2hlY2tvdXQjL3Byb2ZpbGVcIiwgXCIvY2hlY2tvdXQjL3NoaXBwaW5nXCIsIFwiL2NoZWNrb3V0Iy9wYXltZW50XCJdO1xuICBjb25zdCB1cmxNYXBwaW5nID0ge1xuICAgIFwiL2NoZWNrb3V0Iy9lbWFpbFwiOiBcIi9jaGVja291dCMvcHJvZmlsZVwiXG4gIH07XG5cbiAgZnVuY3Rpb24gdXBkYXRlUHJvZ3Jlc3MoKSB7XG4gICAgY29uc3QgYnJvd24gPSBcIiNEMkFFODJcIjtcbiAgICBjb25zdCBkYXJrID0gXCIjMkQyRDI4XCI7XG4gICAgY29uc3Qgd2hpdGUgPSBcIiNmZmZcIjtcblxuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBjb25zdCBmdWxsUGF0aCA9IGAvY2hlY2tvdXQke2hhc2h9YDtcbiAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IHVybE1hcHBpbmdbZnVsbFBhdGhdIHx8IGZ1bGxQYXRoO1xuICAgIGNvbnN0IGN1cnJlbnRTdGVwSW5kZXggPSBzdGVwc0hhc2guaW5kZXhPZihub3JtYWxpemVkUGF0aCk7XG4gICAgaWYgKGN1cnJlbnRTdGVwSW5kZXggPT09IC0xKSByZXR1cm47XG5cbiAgICAvLyBCb2xpbmhhcyBlIHRleHRvc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICBjb25zdCBjaXJjbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgY2lyY2xlLSR7aSArIDF9YCk7XG4gICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBsYWJlbC0ke2kgKyAxfWApO1xuICAgICAgaWYgKCFjaXJjbGUgfHwgIWxhYmVsKSBjb250aW51ZTtcbiAgICAgIGNpcmNsZS5zdHlsZS5iYWNrZ3JvdW5kID0gd2hpdGU7XG4gICAgICBjaXJjbGUuc3R5bGUuY29sb3IgPSBicm93bjtcbiAgICAgIGNpcmNsZS5zdHlsZS5ib3JkZXJDb2xvciA9IGJyb3duO1xuICAgICAgbGFiZWwuc3R5bGUuY29sb3IgPSBicm93bjtcbiAgICAgIGxhYmVsLnN0eWxlLmZvbnRXZWlnaHQgPSBcIjQwMFwiO1xuXG4gICAgICBpZiAoaSA8PSBjdXJyZW50U3RlcEluZGV4KSB7XG4gICAgICAgIGNpcmNsZS5zdHlsZS5iYWNrZ3JvdW5kID0gZGFyaztcbiAgICAgICAgY2lyY2xlLnN0eWxlLmNvbG9yID0gd2hpdGU7XG4gICAgICAgIGNpcmNsZS5zdHlsZS5ib3JkZXJDb2xvciA9IGRhcms7XG4gICAgICAgIGxhYmVsLnN0eWxlLmNvbG9yID0gZGFyaztcbiAgICAgICAgbGFiZWwuc3R5bGUuZm9udFdlaWdodCA9IFwiNzAwXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGluZUVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmxpbmUnKTtcbiAgICBsaW5lRWxlbWVudHMuZm9yRWFjaCgobGluZSwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA8IGN1cnJlbnRTdGVwSW5kZXgpIHtcbiAgICAgICAgbGluZS5zdHlsZS5iYWNrZ3JvdW5kID0gZGFyaztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpbmUuc3R5bGUuYmFja2dyb3VuZCA9IGJyb3duO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xuICAgIGNvbnN0IHN0ZXBCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVhZGVyLWNoZWNrb3V0LXN0ZXBzJyk7XG4gICAgaWYgKHN0ZXBCYXIpIHN0ZXBCYXIucmVtb3ZlKCk7XG4gICAgcmVuZGVyQ2hlY2tvdXRTdGVwcygpO1xuICAgIHVwZGF0ZVByb2dyZXNzKCk7XG4gIH0pO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgcmVuZGVyQ2hlY2tvdXRTdGVwcygpO1xuICAgIHVwZGF0ZVByb2dyZXNzKCk7XG4gIH0pO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLCB1cGRhdGVQcm9ncmVzcyk7XG5cbiAgJCh3aW5kb3cpLm9uKCdvcmRlckZvcm1VcGRhdGVkLnZ0ZXgnLCBmdW5jdGlvbiAoZXZ0LCBvcmRlckZvcm0pIHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2ggPT09ICcjL3NoaXBwaW5nJykge1xuICAgIH1cbiAgfSk7XG5cbiAgcmVuZGVyQ2hlY2tvdXRTdGVwcygpO1xuICB1cGRhdGVQcm9ncmVzcygpO1xuXG59KSgpO1xuIiwiZXhwb3J0IGNvbnN0IGlzU21hbGxlclRoZW43NjggPSB3aW5kb3cubWF0Y2hNZWRpYShcIihtYXgtd2lkdGg6NzY4cHgpXCIpLm1hdGNoZXM7XG4iLCIvKipcbiAqIEFsdGVyYSBhcyBkaW1lbsOnw7VlcyBlc3BlY2lmaWNhZGFzIG5hIHVybCBkYSBpbWdcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmMgdXJsIGRhIGltYWdlbSBuYSBWVEVYXG4gKiBAcGFyYW0ge2ludH0gd2lkdGhcbiAqIEBwYXJhbSB7aW50fSBoZWlnaHRcbiAqIEByZXR1cm4ge3N0cmluZ30gdXJsIGRhIGltYWdlbSBjb20gbyB0YW1hbmhvIGFsdGVyYWRvXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFsdGVyYXJUYW1hbmhvSW1hZ2VtU3JjVnRleChzcmMsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBpZiAodHlwZW9mIHNyYyA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIlBhcmFtZXRybyAnc3JjJyBuw6NvIHJlY2ViaWRvLlwiKTtcblxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHdpZHRoID0gdHlwZW9mIHdpZHRoID09IFwidW5kZWZpbmVkXCIgPyAxIDogd2lkdGg7XG4gICAgaGVpZ2h0ID0gdHlwZW9mIGhlaWdodCA9PSBcInVuZGVmaW5lZFwiID8gd2lkdGggOiBoZWlnaHQ7XG5cbiAgICBzcmMgPSBzcmMucmVwbGFjZShcbiAgICAgICAgL1xcLyhcXGQrKSgtKFxcZCstXFxkKyl8KF9cXGQrKSlcXC8vZyxcbiAgICAgICAgXCIvJDEtXCIgKyB3aWR0aCArIFwiLVwiICsgaGVpZ2h0ICsgXCIvXCJcbiAgICApO1xuICAgIHJldHVybiBzcmM7XG59XG5cbi8qKlxuICogT2J0ZW0gUHJlY29cbiAqIGNhc28gbyBwcmVjbyByZWNlYmlkbyBzZWphIHVtIEZsb2F0IG91IGludCxcbiAqIFx0J0V4Lic6IDEwLjIgLT4nMTAsMjAnXG4gKiBSZWNlYmVuZG8gdW1hIHN0cmluZyBvIHZhbG9yIHNlcmEgcmV0b3JuYWRvIGNvbW8gdW0gZmxvYXRcbiAqIFx0J0V4Lic6ICdSJDEuMjM0LDMwJyAtPiAxMjM0LjNcbiAqIEBwYXJhbSAge0Zsb2F0WnN0cmluZ30gcHJpY2UgcHJlw6dvXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByaWNlKHByaWNlKSB7XG4gICAgaWYgKCFwcmljZSkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBpZiAoaXNOYU4ocHJpY2UpKSB7XG4gICAgICAgIGxldCBuZXdQcmljZSA9IHBhcnNlRmxvYXQoXG4gICAgICAgICAgICBwcmljZS5yZXBsYWNlKFwiUiRcIiwgXCJcIikucmVwbGFjZShcIi5cIiwgXCJcIikucmVwbGFjZShcIixcIiwgXCIuXCIpXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBuZXdQcmljZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwcmljZSA9IHByaWNlIHx8IDA7XG4gICAgICAgIHByaWNlID0gcHJpY2UudG9Mb2NhbGVTdHJpbmcoXCJwdC1CUlwiLCB7XG4gICAgICAgICAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG4gICAgICAgICAgICBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwcmljZTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRDdXJyZW5jeSgpIHtcbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKS50b0xvY2FsZVN0cmluZyhcInB0LUJSXCIsIHtcbiAgICAgICAgc3R5bGU6IFwiY3VycmVuY3lcIixcbiAgICAgICAgY3VycmVuY3k6IFwiQlJMXCIsXG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYnRlckNhbm5hbERlVmVuZGFzKCkge1xuICAgIHZhciBuYW1lID0gXCJWVEVYU0M9c2M9XCI7XG4gICAgdmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjID0gY2FbaV07XG4gICAgICAgIHdoaWxlIChjLmNoYXJBdCgwKSA9PSBcIiBcIikgYyA9IGMuc3Vic3RyaW5nKDEpO1xuICAgICAgICBpZiAoYy5pbmRleE9mKG5hbWUpID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjLnN1YnN0cmluZyhuYW1lLmxlbmd0aCwgYy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAxO1xufVxuIiwiLyoqXG4gKiBFc3BlcmEgdW0gZWxlbWVudG8gZXhpdGlyIG5vIGRvbSBlIGV4ZWN1dGEgbyBjYWxsYmFja1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciBzZWxldG9yIGRvIGVsZW1lbnRvIHF1ZSBkZWplc2EgZXNwZXJhciBwZWxhIGNyaWHDp8Ojb1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgRnVuw6fDo28gYSBzZXIgZXhlY3V0YWRhIHF1YW5kbyB0YWwgZWxlbWVudG8gZXhpc3RpclxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdhaXRGb3JFbChzZWxlY3Rvcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBpZiAoalF1ZXJ5KHNlbGVjdG9yKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc29sdmUoalF1ZXJ5KHNlbGVjdG9yKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3YWl0Rm9yRWwoc2VsZWN0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFB1YlN1YiB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmV2ZW50cyA9IHt9O1xyXG4gICAgfVxyXG4gICAgc3Vic2NyaWJlKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHNbZXZlbnRdLnB1c2goY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgcHVibGlzaChldmVudCwgZGF0YSA9IHt9KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50cy5oYXNPd25Qcm9wZXJ0eShldmVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHNbZXZlbnRdLm1hcCgoY2FsbGJhY2spID0+IGNhbGxiYWNrKGV2ZW50LCBkYXRhKSk7XHJcbiAgICB9XHJcbiAgICB1bnN1YnNjcmliZShldmVudCwgY2IpIHtcclxuICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0gPSB0aGlzLmV2ZW50c1tldmVudF0uZmlsdGVyKChmbikgPT4gZm4gIT09IGNiKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVSFZpVTNWaUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwzQmhZMnRoWjJWekwxTjBZWFJsVFdGdVlXZGxjaTlRZFdKVGRXSXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFOUJRVThzVDBGQlR5eE5RVUZOTzBsQlFUTkNPMUZCUTFNc1YwRkJUU3hIUVVGWkxFVkJRVVVzUTBGQlF6dEpRVzFDT1VJc1EwRkJRenRKUVdwQ1R5eFRRVUZUTEVOQlFVTXNTMEZCWVN4RlFVRkZMRkZCUVd0Q08xRkJRMnBFTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExHTkJRV01zUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUlR0WlFVTjJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJRenRUUVVONFFqdFJRVU5FTEU5QlFVOHNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1NVRkRNVU1zUTBGQlF6dEpRVVZOTEU5QlFVOHNRMEZCUXl4TFFVRmhMRVZCUVVVc1NVRkJTU3hIUVVGSExFVkJRVVU3VVVGRGRFTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkZPMWxCUTNaRExFOUJRVThzUlVGQlJTeERRVUZETzFOQlExWTdVVUZEUkN4UFFVRlBMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hGUVVGRkxFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRGNFVXNRMEZCUXp0SlFVVk5MRmRCUVZjc1EwRkJReXhMUVVGaExFVkJRVVVzUlVGQldUdFJRVU0zUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRVZCUVVVc1EwRkJReXhGUVVGRkxFdEJRVXNzUlVGQlJTeERRVUZETEVOQlFVTTdTVUZEYmtVc1EwRkJRenREUVVORUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2laWGh3YjNKMElHUmxabUYxYkhRZ1kyeGhjM01nVUhWaVUzVmlJSHRjYmx4MGNISnBkbUYwWlNCbGRtVnVkSE02SUVsRmRtVnVkSE1nUFNCN2ZUdGNibHh1WEhSd2RXSnNhV01nYzNWaWMyTnlhV0psS0dWMlpXNTBPaUJ6ZEhKcGJtY3NJR05oYkd4aVlXTnJPaUJHZFc1amRHbHZiaWtnZTF4dVhIUmNkR2xtSUNnaGRHaHBjeTVsZG1WdWRITXVhR0Z6VDNkdVVISnZjR1Z5ZEhrb1pYWmxiblFwS1NCN1hHNWNkRngwWEhSMGFHbHpMbVYyWlc1MGMxdGxkbVZ1ZEYwZ1BTQmJYVHRjYmx4MFhIUjlYRzVjZEZ4MGNtVjBkWEp1SUhSb2FYTXVaWFpsYm5SelcyVjJaVzUwWFM1d2RYTm9LR05oYkd4aVlXTnJLVHRjYmx4MGZWeHVYRzVjZEhCMVlteHBZeUJ3ZFdKc2FYTm9LR1YyWlc1ME9pQnpkSEpwYm1jc0lHUmhkR0VnUFNCN2ZTa2dlMXh1WEhSY2RHbG1JQ2doZEdocGN5NWxkbVZ1ZEhNdWFHRnpUM2R1VUhKdmNHVnlkSGtvWlhabGJuUXBLU0I3WEc1Y2RGeDBYSFJ5WlhSMWNtNGdXMTA3WEc1Y2RGeDBmVnh1WEhSY2RISmxkSFZ5YmlCMGFHbHpMbVYyWlc1MGMxdGxkbVZ1ZEYwdWJXRndLQ2hqWVd4c1ltRmpheWtnUFQ0Z1kyRnNiR0poWTJzb1pYWmxiblFzSUdSaGRHRXBLVHRjYmx4MGZWeHVYRzVjZEhCMVlteHBZeUIxYm5OMVluTmpjbWxpWlNobGRtVnVkRG9nYzNSeWFXNW5MQ0JqWWpvZ1JuVnVZM1JwYjI0cE9pQjJiMmxrSUh0Y2JseDBYSFIwYUdsekxtVjJaVzUwYzF0bGRtVnVkRjBnUFNCMGFHbHpMbVYyWlc1MGMxdGxkbVZ1ZEYwdVptbHNkR1Z5S0NobWJpa2dQVDRnWm00Z0lUMDlJR05pS1R0Y2JseDBmVnh1ZlZ4dVhHNXBiblJsY21aaFkyVWdTVVYyWlc1MGN5QjdYRzVjZEZ0clpYazZJSE4wY21sdVoxMDZJRVoxYm1OMGFXOXVXMTA3WEc1OVhHNGlYWDA9IiwiaW1wb3J0IFB1YlN1YiBmcm9tIFwiLi9QdWJTdWJcIjtcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmUge1xyXG4gICAgY29uc3RydWN0b3IoeyBtb2R1bGVOYW1lLCBhY3Rpb25zLCBtdXRhdGlvbnMsIHN0YXRlIH0pIHtcclxuICAgICAgICB0aGlzLmFjdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBhY3Rpb25zKTtcclxuICAgICAgICB0aGlzLm11dGF0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG11dGF0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5tb2R1bGUgPSBtb2R1bGVOYW1lIHx8IFwic3RvcmVcIjtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IFwiZGVmYXVsdCBzdGF0ZVwiO1xyXG4gICAgICAgIHRoaXMuZXZlbnRzID0gbmV3IFB1YlN1YigpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBuZXcgUHJveHkoT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpIHx8IHt9LCB7XHJcbiAgICAgICAgICAgIHNldDogKHN0YXRlLCBrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZVtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgbW9kdWxlOiAke3RoaXMubW9kdWxlfSBzdGF0ZUNoYW5nZTogJHtrZXl9OmAsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzLnB1Ymxpc2goXCJzdGF0ZUNoYW5nZVwiLCB0aGlzLnN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzLnB1Ymxpc2goYHN0YXRlQ2hhbmdlOiR7a2V5fWAsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzICE9PSBcIm11dGF0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgWW91IHNob3VsZCB1c2UgYSBtdXRhdGlvbiB0byBzZXQgJHtrZXl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXR1cyA9IFwicmVzdGluZ1wiO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBkaXNwYXRjaChhY3Rpb25LZXksIHBheWxvYWQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYWN0aW9uc1thY3Rpb25LZXldICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYEFjdGlvbiBcIiR7YWN0aW9uS2V5fSBkb2Vzbid0IGV4aXN0LmApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBBQ1RJT046ICR7YWN0aW9uS2V5fWApO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gXCJhY3Rpb25cIjtcclxuICAgICAgICB0aGlzLmFjdGlvbnNbYWN0aW9uS2V5XSh0aGlzLCBwYXlsb2FkKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNvbW1pdChtdXRhdGlvbktleSwgcGF5bG9hZCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5tdXRhdGlvbnNbbXV0YXRpb25LZXldICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYE11dGF0aW9uIFwiJHttdXRhdGlvbktleX1cIiBkb2Vzbid0IGV4aXN0YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBcIm11dGF0aW9uXCI7XHJcbiAgICAgICAgbGV0IG5ld1N0YXRlID0gdGhpcy5tdXRhdGlvbnNbbXV0YXRpb25LZXldKHRoaXMuc3RhdGUsIHBheWxvYWQpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIG5ld1N0YXRlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVM1J2Y21VdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOHVMaTl6Y21NdmNHRmphMkZuWlhNdlUzUmhkR1ZOWVc1aFoyVnlMMU4wYjNKbExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEU5QlFVOHNUVUZCVFN4TlFVRk5MRlZCUVZVc1EwRkJRenRCUVVVNVFpeE5RVUZOTEVOQlFVTXNUMEZCVHl4UFFVRlBMRXRCUVVzN1NVRlJla0lzV1VGQldTeEZRVUZGTEZWQlFWVXNSVUZCUlN4UFFVRlBMRVZCUVVVc1UwRkJVeXhGUVVGRkxFdEJRVXNzUlVGQmEwSTdVVUZEY0VVc1NVRkJTU3hEUVVGRExFOUJRVThzY1VKQlFWRXNUMEZCVHl4RFFVRkZMRU5CUVVNN1VVRkRPVUlzU1VGQlNTeERRVUZETEZOQlFWTXNjVUpCUVZFc1UwRkJVeXhEUVVGRkxFTkJRVU03VVVGRGJFTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJSeXhWUVVGVkxFbEJRVWtzVDBGQlR5eERRVUZETzFGQlEzQkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzWlVGQlpTeERRVUZETzFGQlF6bENMRWxCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzU1VGQlNTeE5RVUZOTEVWQlFVVXNRMEZCUXp0UlFVVXpRaXhKUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZITEVsQlFVa3NTMEZCU3l4RFFVRkpMR3RDUVVGTExFdEJRVXNzUzBGQlRTeEZRVUZGTEVWQlFVVTdXVUZETjBNc1IwRkJSeXhGUVVGRkxFTkJRVU1zUzBGQlZTeEZRVUZGTEVkQlFWY3NSVUZCUlN4TFFVRlZMRVZCUVVVc1JVRkJSVHRuUWtGRE5VTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF6dG5Ra0ZEYmtJc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGRFZpeFhRVUZYTEVsQlFVa3NRMEZCUXl4TlFVRk5MR2xDUVVGcFFpeEhRVUZITEVkQlFVY3NSVUZETjBNc1MwRkJTeXhEUVVOTUxFTkJRVU03WjBKQlEwWXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zWVVGQllTeEZRVUZGTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRuUWtGREwwTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zWlVGQlpTeEhRVUZITEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03WjBKQlEzUkVMRWxCUVVrc1NVRkJTU3hEUVVGRExFMUJRVTBzUzBGQlN5eFZRVUZWTEVWQlFVVTdiMEpCUXk5Q0xFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNiME5CUVc5RExFZEJRVWNzUlVGQlJTeERRVUZETEVOQlFVTTdhVUpCUTNaRU8yZENRVU5FTEVsQlFVa3NRMEZCUXl4TlFVRk5MRWRCUVVjc1UwRkJVeXhEUVVGRE8yZENRVU40UWl4UFFVRlBMRWxCUVVrc1EwRkJRenRaUVVOaUxFTkJRVU03VTBGRFJDeERRVUZETEVOQlFVTTdTVUZEU2l4RFFVRkRPMGxCUlUwc1VVRkJVU3hEUVVGRExGTkJRV2xDTEVWQlFVVXNUMEZCV1R0UlFVTTVReXhKUVVGSkxFOUJRVThzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhWUVVGVkxFVkJRVVU3V1VGRGJFUXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGWExGTkJRVk1zYVVKQlFXbENMRU5CUVVNc1EwRkJRenRaUVVOdVJDeFBRVUZQTEV0QlFVc3NRMEZCUXp0VFFVTmlPMUZCUTBRc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFhRVUZYTEZOQlFWTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkRjRU1zU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4UlFVRlJMRU5CUVVNN1VVRkRka0lzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdVVUZEZGtNc1QwRkJUeXhKUVVGSkxFTkJRVU03U1VGRFlpeERRVUZETzBsQlJVMHNUVUZCVFN4RFFVRkRMRmRCUVcxQ0xFVkJRVVVzVDBGQldUdFJRVU01UXl4SlFVRkpMRTlCUVU4c1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eFhRVUZYTEVOQlFVTXNTMEZCU3l4VlFVRlZMRVZCUVVVN1dVRkRkRVFzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4aFFVRmhMRmRCUVZjc2FVSkJRV2xDTEVOQlFVTXNRMEZCUXp0WlFVTjJSQ3hQUVVGUExFdEJRVXNzUTBGQlF6dFRRVU5pTzFGQlEwUXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJSeXhWUVVGVkxFTkJRVU03VVVGRGVrSXNTVUZCU1N4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZETzFGQlEyaEZMRWxCUVVrc1EwRkJReXhMUVVGTExFZEJRVWNzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzFGQlEycEVMRTlCUVU4c1NVRkJTU3hEUVVGRE8wbEJRMklzUTBGQlF6dERRVU5FSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWFXMXdiM0owSUZCMVlsTjFZaUJtY205dElGd2lMaTlRZFdKVGRXSmNJanRjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnWTJ4aGMzTWdVM1J2Y21VOFZDQmxlSFJsYm1SeklHOWlhbVZqZEQ0Z2UxeHVYSFJ3Y21sMllYUmxJR0ZqZEdsdmJuTTZJRkpsWTI5eVpEeHpkSEpwYm1jc0lDaHpkRzl5WlRvZ1UzUnZjbVU4VkQ0c0lIQmhlV3h2WVdRNklHRnVlU2tnUFQ0Z2RtOXBaRDQ3WEc1Y2RIQnlhWFpoZEdVZ2JYVjBZWFJwYjI1ek9pQlNaV052Y21ROGMzUnlhVzVuTENBb2MzUmhkR1U2SUZRc0lIQmhlV3h2WVdRNklHRnVlU2tnUFQ0Z1ZENDdYRzVjZEhCeWFYWmhkR1VnYlc5a2RXeGxPaUJ6ZEhKcGJtYzdYRzVjZEhCeWFYWmhkR1VnYzNSaGRIVnpPaUJjSW0xMWRHRjBhVzl1WENJZ2ZDQmNJbUZqZEdsdmJsd2lJSHdnWENKeVpYTjBhVzVuWENJZ2ZDQmNJbVJsWm1GMWJIUWdjM1JoZEdWY0lqdGNibHgwY0hWaWJHbGpJR1YyWlc1MGN6b2dVSFZpVTNWaU8xeHVYSFJ3ZFdKc2FXTWdjM1JoZEdVNklGUTdYRzVjYmx4MFkyOXVjM1J5ZFdOMGIzSW9leUJ0YjJSMWJHVk9ZVzFsTENCaFkzUnBiMjV6TENCdGRYUmhkR2x2Ym5Nc0lITjBZWFJsSUgwNklGTjBiM0psVUdGeVlXMXpQRlErS1NCN1hHNWNkRngwZEdocGN5NWhZM1JwYjI1eklEMGdleUF1TGk1aFkzUnBiMjV6SUgwN1hHNWNkRngwZEdocGN5NXRkWFJoZEdsdmJuTWdQU0I3SUM0dUxtMTFkR0YwYVc5dWN5QjlPMXh1WEhSY2RIUm9hWE11Ylc5a2RXeGxJRDBnYlc5a2RXeGxUbUZ0WlNCOGZDQmNJbk4wYjNKbFhDSTdYRzVjZEZ4MGRHaHBjeTV6ZEdGMGRYTWdQU0JjSW1SbFptRjFiSFFnYzNSaGRHVmNJanRjYmx4MFhIUjBhR2x6TG1WMlpXNTBjeUE5SUc1bGR5QlFkV0pUZFdJb0tUdGNibHh1WEhSY2RIUm9hWE11YzNSaGRHVWdQU0J1WlhjZ1VISnZlSGs4VkQ0b2V5QXVMaTV6ZEdGMFpTQjlJSHg4SUh0OUxDQjdYRzVjZEZ4MFhIUnpaWFE2SUNoemRHRjBaVG9nWVc1NUxDQnJaWGs2SUhOMGNtbHVaeXdnZG1Gc2RXVTZJR0Z1ZVNrZ1BUNGdlMXh1WEhSY2RGeDBYSFJ6ZEdGMFpWdHJaWGxkSUQwZ2RtRnNkV1U3WEc1Y2RGeDBYSFJjZEdOdmJuTnZiR1V1Ykc5bktGeHVYSFJjZEZ4MFhIUmNkR0J0YjJSMWJHVTZJQ1I3ZEdocGN5NXRiMlIxYkdWOUlITjBZWFJsUTJoaGJtZGxPaUFrZTJ0bGVYMDZZQ3hjYmx4MFhIUmNkRngwWEhSMllXeDFaVnh1WEhSY2RGeDBYSFFwTzF4dVhIUmNkRngwWEhSMGFHbHpMbVYyWlc1MGN5NXdkV0pzYVhOb0tGd2ljM1JoZEdWRGFHRnVaMlZjSWl3Z2RHaHBjeTV6ZEdGMFpTazdYRzVjZEZ4MFhIUmNkSFJvYVhNdVpYWmxiblJ6TG5CMVlteHBjMmdvWUhOMFlYUmxRMmhoYm1kbE9pUjdhMlY1ZldBc0lIUm9hWE11YzNSaGRHVXBPMXh1WEhSY2RGeDBYSFJwWmlBb2RHaHBjeTV6ZEdGMGRYTWdJVDA5SUZ3aWJYVjBZWFJwYjI1Y0lpa2dlMXh1WEhSY2RGeDBYSFJjZEdOdmJuTnZiR1V1Ykc5bktHQlpiM1VnYzJodmRXeGtJSFZ6WlNCaElHMTFkR0YwYVc5dUlIUnZJSE5sZENBa2UydGxlWDFnS1R0Y2JseDBYSFJjZEZ4MGZWeHVYSFJjZEZ4MFhIUjBhR2x6TG5OMFlYUjFjeUE5SUZ3aWNtVnpkR2x1WjF3aU8xeHVYSFJjZEZ4MFhIUnlaWFIxY200Z2RISjFaVHRjYmx4MFhIUmNkSDBzWEc1Y2RGeDBmU2s3WEc1Y2RIMWNibHh1WEhSd2RXSnNhV01nWkdsemNHRjBZMmdvWVdOMGFXOXVTMlY1T2lCemRISnBibWNzSUhCaGVXeHZZV1E2SUdGdWVTazZJR0p2YjJ4bFlXNGdlMXh1WEhSY2RHbG1JQ2gwZVhCbGIyWWdkR2hwY3k1aFkzUnBiMjV6VzJGamRHbHZia3RsZVYwZ0lUMDlJRndpWm5WdVkzUnBiMjVjSWlrZ2UxeHVYSFJjZEZ4MFkyOXVjMjlzWlM1c2IyY29ZRUZqZEdsdmJpQmNJaVI3WVdOMGFXOXVTMlY1ZlNCa2IyVnpiaWQwSUdWNGFYTjBMbUFwTzF4dVhIUmNkRngwY21WMGRYSnVJR1poYkhObE8xeHVYSFJjZEgxY2JseDBYSFJqYjI1emIyeGxMbXh2WnloZ1FVTlVTVTlPT2lBa2UyRmpkR2x2Ymt0bGVYMWdLVHRjYmx4MFhIUjBhR2x6TG5OMFlYUjFjeUE5SUZ3aVlXTjBhVzl1WENJN1hHNWNkRngwZEdocGN5NWhZM1JwYjI1elcyRmpkR2x2Ymt0bGVWMG9kR2hwY3l3Z2NHRjViRzloWkNrN1hHNWNkRngwY21WMGRYSnVJSFJ5ZFdVN1hHNWNkSDFjYmx4dVhIUndkV0pzYVdNZ1kyOXRiV2wwS0cxMWRHRjBhVzl1UzJWNU9pQnpkSEpwYm1jc0lIQmhlV3h2WVdRNklHRnVlU2s2SUdKdmIyeGxZVzRnZTF4dVhIUmNkR2xtSUNoMGVYQmxiMllnZEdocGN5NXRkWFJoZEdsdmJuTmJiWFYwWVhScGIyNUxaWGxkSUNFOVBTQmNJbVoxYm1OMGFXOXVYQ0lwSUh0Y2JseDBYSFJjZEdOdmJuTnZiR1V1Ykc5bktHQk5kWFJoZEdsdmJpQmNJaVI3YlhWMFlYUnBiMjVMWlhsOVhDSWdaRzlsYzI0bmRDQmxlR2x6ZEdBcE8xeHVYSFJjZEZ4MGNtVjBkWEp1SUdaaGJITmxPMXh1WEhSY2RIMWNibHgwWEhSMGFHbHpMbk4wWVhSMWN5QTlJRndpYlhWMFlYUnBiMjVjSWp0Y2JseDBYSFJzWlhRZ2JtVjNVM1JoZEdVZ1BTQjBhR2x6TG0xMWRHRjBhVzl1YzF0dGRYUmhkR2x2Ymt0bGVWMG9kR2hwY3k1emRHRjBaU3dnY0dGNWJHOWhaQ2s3WEc1Y2RGeDBkR2hwY3k1emRHRjBaU0E5SUU5aWFtVmpkQzVoYzNOcFoyNG9kR2hwY3k1emRHRjBaU3dnYm1WM1UzUmhkR1VwTzF4dVhIUmNkSEpsZEhWeWJpQjBjblZsTzF4dVhIUjlYRzU5WEc1Y2JtVjRjRzl5ZENCcGJuUmxjbVpoWTJVZ1UzUnZjbVZRWVhKaGJYTThWQ0JsZUhSbGJtUnpJRzlpYW1WamRENGdlMXh1WEhSdGIyUjFiR1ZPWVcxbE9pQnpkSEpwYm1jN1hHNWNibHgwWVdOMGFXOXVjem9nVW1WamIzSmtQSE4wY21sdVp5d2dLSE4wYjNKbE9pQlRkRzl5WlR4VVBpd2djR0Y1Ykc5aFpEb2dZVzU1S1NBOVBpQjJiMmxrUGp0Y2JseHVYSFJ0ZFhSaGRHbHZibk02SUZKbFkyOXlaRHh6ZEhKcGJtY3NJQ2h6ZEdGMFpUb2dWQ3dnY0dGNWJHOWhaRG9nWVc1NUtTQTlQaUJVUGp0Y2JseHVYSFJ6ZEdGMFpUb2dWRHRjYm4xY2JpSmRmUT09IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWVyZ2VTdG9yZXMoLi4uc3RvcmVzT2JqKSB7XHJcbiAgICBjb25zdCBzdG9yZSA9IHt9O1xyXG4gICAgc3RvcmVzT2JqLmZvckVhY2goKHMpID0+IHtcclxuICAgICAgICBzdG9yZS5zdGF0ZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgc3RvcmUuc3RhdGUpLCBzLnN0YXRlKTtcclxuICAgICAgICBzdG9yZS5tdXRhdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHN0b3JlLm11dGF0aW9ucyksIHMubXV0YXRpb25zKTtcclxuICAgICAgICBzdG9yZS5hY3Rpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBzdG9yZS5hY3Rpb25zKSwgcy5hY3Rpb25zKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHN0b3JlO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWJXVnlaMlZUZEc5eVpYTXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTh1TGk5emNtTXZjR0ZqYTJGblpYTXZVM1JoZEdWTllXNWhaMlZ5TDIxbGNtZGxVM1J2Y21WekxuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVVZCTEUxQlFVMHNRMEZCUXl4UFFVRlBMRlZCUVZVc1YwRkJWeXhEUVVGRExFZEJRVWNzVTBGQk5rSTdTVUZEYmtVc1RVRkJUU3hMUVVGTExFZEJRVEpDTEVWQlFVVXNRMEZCUXp0SlFVTjZReXhUUVVGVExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVN1VVRkRka0lzUzBGQlN5eERRVUZETEV0QlFVc3NiVU5CUVZFc1MwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlN5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkZMRU5CUVVNN1VVRkROME1zUzBGQlN5eERRVUZETEZOQlFWTXNiVU5CUVZFc1MwRkJTeXhEUVVGRExGTkJRVk1zUjBGQlN5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkZMRU5CUVVNN1VVRkRla1FzUzBGQlN5eERRVUZETEU5QlFVOHNiVU5CUVZFc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlN5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkZMRU5CUVVNN1NVRkRjRVFzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZGU0N4UFFVRlBMRXRCUVVzc1EwRkJRenRCUVVOa0xFTkJRVU1pTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKcGJYQnZjblFnZXlCVGRHOXlaVkJoY21GdGN5QjlJR1p5YjIwZ1hDSXVMMU4wYjNKbFhDSTdYRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJR1oxYm1OMGFXOXVJRzFsY21kbFUzUnZjbVZ6S0M0dUxuTjBiM0psYzA5aWFqb2dVM1J2Y21WUVlYSmhiWE04WVc1NVBsdGRLU0I3WEc1Y2RHTnZibk4wSUhOMGIzSmxPaUJUZEc5eVpWQmhjbUZ0Y3p4aGJuaytJSHdnWVc1NUlEMGdlMzA3WEc1Y2RITjBiM0psYzA5aWFpNW1iM0pGWVdOb0tDaHpLU0E5UGlCN1hHNWNkRngwYzNSdmNtVXVjM1JoZEdVZ1BTQjdJQzR1TG5OMGIzSmxMbk4wWVhSbExDQXVMaTV6TG5OMFlYUmxJSDA3WEc1Y2RGeDBjM1J2Y21VdWJYVjBZWFJwYjI1eklEMGdleUF1TGk1emRHOXlaUzV0ZFhSaGRHbHZibk1zSUM0dUxuTXViWFYwWVhScGIyNXpJSDA3WEc1Y2RGeDBjM1J2Y21VdVlXTjBhVzl1Y3lBOUlIc2dMaTR1YzNSdmNtVXVZV04wYVc5dWN5d2dMaTR1Y3k1aFkzUnBiMjV6SUgwN1hHNWNkSDBwTzF4dVhHNWNkSEpsZEhWeWJpQnpkRzl5WlR0Y2JuMWNiaUpkZlE9PSIsImltcG9ydCBpc1BhZ2UgZnJvbSBcIi4vaXNQYWdlXCI7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhaW5lciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih7IGFwcE5hbWUsIGNvbXBvbmVudHMsIHBhZ2VzLCBzZXJ2aWNlcywgY29uZmlnLCBydWxlciwgfSkge1xyXG4gICAgICAgIHRoaXMuYXBwTmFtZSA9IGFwcE5hbWU7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgdGhpcy5wYWdlQ29tcG9uZW50cyA9IHBhZ2VzID8gWy4uLnBhZ2VzXSA6IFtdO1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IGNvbXBvbmVudHMgPyBbLi4uY29tcG9uZW50c10gOiBbXTtcclxuICAgICAgICB0aGlzLnNlcnZpY2VzID0gc2VydmljZXMgPyBbLi4uc2VydmljZXNdIDogW107XHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZXMgPSB7fTtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudHNDb25maWcgPSB7fTtcclxuICAgICAgICB0aGlzLnJ1bGVyID0gcnVsZXIgPyBydWxlciA6IG5ldyBpc1BhZ2UoKTtcclxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY3JlYXRlQ29udGV4dC5jYWxsKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgY3JlYXRlQ29udGV4dCgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxyXG4gICAgICAgICAgICBnZXRTZXJ2aWNlOiB0aGlzLmdldFNlcnZpY2UuYmluZCh0aGlzKSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgaW5zdGFudGlhdGVDb21wb25lbnQoQ29tcG9uZW50KSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBDb21wb25lbnQgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50c0NvbmZpZ1tDb21wb25lbnQubmFtZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlc1tDb21wb25lbnQubmFtZV0gPSBuZXcgQ29tcG9uZW50KHRoaXMuY3R4LCB0aGlzLmNvbXBvbmVudHNDb25maWdbQ29tcG9uZW50Lm5hbWVdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzW0NvbXBvbmVudC5uYW1lXSA9IG5ldyBDb21wb25lbnQodGhpcy5jdHgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIENvbXBvbmVudC5uYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiTm90IGFuIENvbnN0cnVjdG9yXCIsIENvbXBvbmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaW5zdGFudGlhdGVTZXJ2aWNlKFNlcnZpY2UpIHtcclxuICAgICAgICBpZiAodHlwZW9mIFNlcnZpY2UgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlTWFwW1NlcnZpY2UubmFtZV0gPSBuZXcgU2VydmljZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiTm90IGFuIENvbnN0cnVjdG9yXCIsIFNlcnZpY2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldFNlcnZpY2Uoc2VydmljZU5hbWUpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXJ2aWNlTWFwW3NlcnZpY2VOYW1lXSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZU1hcFtzZXJ2aWNlTmFtZV07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgYnVpbGRTZXJ2aWNlcygpIHtcclxuICAgICAgICB0aGlzLnBhZ2VDb21wb25lbnRzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtLnNlcnZpY2VzICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eShcInBhZ2VSZWZzXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJ1bGVyLmlzKGl0ZW0ucGFnZVJlZnMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc2VydmljZXMuZm9yRWFjaCgoc2VydmljZSkgPT4gdGhpcy5zZXJ2aWNlcy5wdXNoKHNlcnZpY2UpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5tYXAodGhpcy5pbnN0YW50aWF0ZVNlcnZpY2UuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbiAgICBidWlsZENvbXBvbmVudHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5tYXAodGhpcy5pbnN0YW50aWF0ZUNvbXBvbmVudC5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuICAgIGJ1aWxkUGFnZUNvbXBvbmVudHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFnZUNvbXBvbmVudHMubWFwKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KFwicGFnZVJlZnNcIikpXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ydWxlci5pcyhpdGVtLnBhZ2VSZWZzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY29tcG9uZW50cy5mb3JFYWNoKChDb21wKSA9PiB0aGlzLmluc3RhbnRpYXRlQ29tcG9uZW50KENvbXApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5idWlsZFNlcnZpY2VzLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idWlsZENvbXBvbmVudHMuY2FsbCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJ1aWxkUGFnZUNvbXBvbmVudHMuY2FsbCh0aGlzKTtcclxuICAgICAgICB3aW5kb3dbXCJtM0FwcHNcIl0gPSB7IFt0aGlzLmFwcE5hbWVdOiB0aGlzIH07XHJcbiAgICB9XHJcbiAgICBiaW5kKGNvbXBOYW1lLCBjb25maWcpIHtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudHNDb25maWdbY29tcE5hbWVdID0gY29uZmlnO1xyXG4gICAgfVxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmF0dGFjaEV2ZW50XHJcbiAgICAgICAgICAgID8gZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiXHJcbiAgICAgICAgICAgIDogZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCB0aGlzLmluaXQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVEyOXVkR0ZwYm1WeUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwzQmhZMnRoWjJWekwyTnZjbVV2UTI5dWRHRnBibVZ5TG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTlCUVU4c1RVRkJUU3hOUVVGTkxGVkJRVlVzUTBGQlF6dEJRVzFET1VJc1RVRkJUU3hEUVVGRExFOUJRVThzVDBGQlR5eFRRVUZUTzBsQldUZENMRmxCUVZrc1JVRkRXQ3hQUVVGUExFVkJRMUFzVlVGQlZTeEZRVU5XTEV0QlFVc3NSVUZEVEN4UlFVRlJMRVZCUTFJc1RVRkJUU3hGUVVOT0xFdEJRVXNzUjBGRFdUdFJRVU5xUWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExFOUJRVThzUTBGQlF6dFJRVU4yUWl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF6dFJRVVZ5UWl4SlFVRkpMRU5CUVVNc1kwRkJZeXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTTdVVUZET1VNc1NVRkJTU3hEUVVGRExGVkJRVlVzUjBGQlJ5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUlhCRUxFbEJRVWtzUTBGQlF5eFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVNNVF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVWeVFpeEpRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVOd1FpeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFZEJRVWNzUlVGQlJTeERRVUZETzFGQlJUTkNMRWxCUVVrc1EwRkJReXhMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzVFVGQlRTeEZRVUZGTEVOQlFVTTdVVUZGTVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dEpRVU14UXl4RFFVRkRPMGxCUlU4c1lVRkJZVHRSUVVOd1FpeFBRVUZQTzFsQlEwNHNUVUZCVFN4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTk8xbEJRMjVDTEZWQlFWVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTTdVMEZEZEVNc1EwRkJRenRKUVVOSUxFTkJRVU03U1VGRlR5eHZRa0ZCYjBJc1EwRkJReXhUUVVGak8xRkJRekZETEVsQlFVazdXVUZEU0N4SlFVRkpMRTlCUVU4c1UwRkJVeXhMUVVGTExGVkJRVlVzUlVGQlJUdG5Ra0ZEY0VNc1NVRkJTU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTzI5Q1FVTXhReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhKUVVGSkxGTkJRVk1zUTBGRE4wTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkRVaXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVU55UXl4RFFVRkRPMmxDUVVOR08zRkNRVUZOTzI5Q1FVTk9MRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRWxCUVVrc1UwRkJVeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0cFFrRkRla1E3WjBKQlEwUXNUMEZCVHl4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRE8yRkJRM1JDTzJsQ1FVRk5PMmRDUVVOT0xFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNiMEpCUVc5Q0xFVkJRVVVzVTBGQlV5eERRVUZETEVOQlFVTTdZVUZET1VNN1UwRkRSRHRSUVVGRExFOUJRVThzUzBGQlN5eEZRVUZGTzFsQlEyWXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFRRVU53UWp0SlFVTkdMRU5CUVVNN1NVRkZUeXhyUWtGQmEwSXNRMEZCUXl4UFFVRlpPMUZCUTNSRExFbEJRVWtzVDBGQlR5eFBRVUZQTEV0QlFVc3NWVUZCVlN4RlFVRkZPMWxCUTJ4RExFbEJRVWs3WjBKQlEwZ3NTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NTVUZCU1N4UFFVRlBMRVZCUVVVc1EwRkJRenRoUVVNNVF6dFpRVUZETEU5QlFVOHNTMEZCU3l4RlFVRkZPMmRDUVVObUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1lVRkRjRUk3VTBGRFJEdGhRVUZOTzFsQlEwNHNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXh2UWtGQmIwSXNSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRUUVVNMVF6dEpRVU5HTEVOQlFVTTdTVUZGVHl4VlFVRlZMRU5CUVVrc1YwRkJiVUk3VVVGRGVFTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExGZEJRVmNzUTBGQlF6dFpRVUZGTEU5QlFVOHNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dFJRVU4wUlN4UFFVRlBMRXRCUVVzc1EwRkJRenRKUVVOa0xFTkJRVU03U1VGRlR5eGhRVUZoTzFGQlEzQkNMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVN1dVRkRjRU1zU1VGQlNTeFBRVUZQTEVsQlFVa3NRMEZCUXl4UlFVRlJMRXRCUVVzc1YwRkJWeXhGUVVGRk8yZENRVU42UXl4SlFVRkpMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVlVGQlZTeERRVUZETzI5Q1FVTnNReXhKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJUdDNRa0ZEYWtNc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hEUVVOcVF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGRE0wSXNRMEZCUXp0eFFrRkRSanRoUVVOR08xRkJRMFlzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZGU0N4UFFVRlBMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVNNVJDeERRVUZETzBsQlJVOHNaVUZCWlR0UlFVTjBRaXhQUVVGUExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXh2UWtGQmIwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU5zUlN4RFFVRkRPMGxCUlU4c2JVSkJRVzFDTzFGQlF6RkNMRTlCUVU4c1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSVHRaUVVOMlF5eEpRVUZKTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1ZVRkJWU3hEUVVGRE8yZENRVU5zUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSVHR2UWtGRGFrTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4RFFVTm9ReXhKUVVGSkxFTkJRVU1zYjBKQlFXOUNMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJReTlDTEVOQlFVTTdhVUpCUTBZN1VVRkRTQ3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU5LTEVOQlFVTTdTVUZGVFN4SlFVRkpPMUZCUTFZc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRPVUlzU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRGFFTXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVWd1F5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1EwRkJRenRKUVVNM1F5eERRVUZETzBsQlJVMHNTVUZCU1N4RFFVRkRMRkZCUVdkQ0xFVkJRVVVzVFVGQlZ6dFJRVU40UXl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWRCUVVjc1RVRkJUU3hEUVVGRE8wbEJRekZETEVOQlFVTTdTVUZGVFN4TFFVRkxPMUZCUTFnc1NVRkRReXhSUVVGUkxFTkJRVU1zVjBGQlZ6dFpRVU51UWl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExGVkJRVlVzUzBGQlN5eFZRVUZWTzFsQlEzQkRMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeExRVUZMTEZOQlFWTXNSVUZEYmtNN1dVRkRSQ3hKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdVMEZEV2p0aFFVRk5PMWxCUTA0c1VVRkJVU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMR3RDUVVGclFpeEZRVUZGTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdVMEZEY0VVN1NVRkRSaXhEUVVGRE8wTkJRMFFpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKcGJYQnZjblFnYVhOUVlXZGxJR1p5YjIwZ1hDSXVMMmx6VUdGblpWd2lPMXh1YVcxd2IzSjBJRWxTZFd4bGNpQm1jbTl0SUZ3aUxpOUpVblZzWlhKY0lqdGNibHh1Wlhod2IzSjBJR2x1ZEdWeVptRmpaU0JKUTI5dWRHRnBibVZ5VUhKdmNITWdlMXh1WEhSaGNIQk9ZVzFsT2lCemRISnBibWM3WEc1Y2RHTnZiWEJ2Ym1WdWRITS9PaUJoYm5sYlhUdGNibHgwY0dGblpYTS9PaUJKVUdGblpVTnZiWEJ2Ym1WdWRITmJYVHRjYmx4MGMyVnlkbWxqWlhNL09pQmhibmxiWFR0Y2JseDBZMjl1Wm1sblB6b2dZVzU1TzF4dVhIUnlkV3hsY2o4NklFbFNkV3hsY2p0Y2JuMWNibHh1Wlhod2IzSjBJR2x1ZEdWeVptRmpaU0JKVUdGblpVTnZiWEJ2Ym1WdWRITWdlMXh1WEhSd1lXZGxVbVZtY3pvZ2MzUnlhVzVuVzEwN1hHNWNkR052YlhCdmJtVnVkSE02SUdGdWVWdGRPMXh1WEhSelpYSjJhV05sY3o4NklHRnVlVnRkTzF4dWZWeHVYRzVsZUhCdmNuUWdhVzUwWlhKbVlXTmxJRWxEYjI1MFlXbHVaWEpEYjI1MFpYaDBJSHRjYmx4MFkyOXVabWxuT2lCaGJuazdYRzVjZEdkbGRGTmxjblpwWTJVNklEeFVQaWh6WlhKMmFXTmxUbUZ0WlRvZ2MzUnlhVzVuS1NBOVBpQlVJSHdnWm1Gc2MyVTdYRzU5WEc1Y2JtUmxZMnhoY21VZ1oyeHZZbUZzSUh0Y2JseDBhVzUwWlhKbVlXTmxJRmRwYm1SdmR5QjdYRzVjZEZ4MGJUTkJjSEJ6T2lCU1pXTnZjbVE4YzNSeWFXNW5MQ0JEYjI1MFlXbHVaWEkrTzF4dVhIUjlYRzVjYmx4MGFXNTBaWEptWVdObElFUnZZM1Z0Wlc1MElIdGNibHgwWEhSaGRIUmhZMmhGZG1WdWREcGNibHgwWEhSY2RId2dLQ2hsZG1WdWREb2djM1J5YVc1bkxDQnNhWE4wWlc1bGNqb2dSWFpsYm5STWFYTjBaVzVsY2lrZ1BUNGdZbTl2YkdWaGJpQjhJR1poYkhObEtWeHVYSFJjZEZ4MGZDQjFibVJsWm1sdVpXUTdYRzVjZEgxY2JuMWNibHh1Wlhod2IzSjBJR1JsWm1GMWJIUWdZMnhoYzNNZ1EyOXVkR0ZwYm1WeUlIdGNibHgwY0hKcGRtRjBaU0J5ZFd4bGNqb2dTVkoxYkdWeU8xeHVYSFJ3Y21sMllYUmxJR0Z3Y0U1aGJXVTZJSE4wY21sdVp6dGNibHgwY0hKcGRtRjBaU0JqYjI1bWFXYzZJR0Z1ZVR0Y2JseDBjSEpwZG1GMFpTQmpiMjF3YjI1bGJuUnpRMjl1Wm1sbk9pQmhibms3WEc1Y2RIQnlhWFpoZEdVZ1kyOXRjRzl1Wlc1MGN6b2dZVzU1VzEwN1hHNWNkSEJ5YVhaaGRHVWdjR0ZuWlVOdmJYQnZibVZ1ZEhNNklFbFFZV2RsUTI5dGNHOXVaVzUwYzF0ZE8xeHVYSFJ3Y21sMllYUmxJSE5sY25acFkyVnpPaUJoYm5sYlhUdGNibHgwY0hKcGRtRjBaU0J6WlhKMmFXTmxUV0Z3T2lCU1pXTnZjbVE4YzNSeWFXNW5MQ0JoYm5rK08xeHVYSFJ3Y21sMllYUmxJR2x1YzNSaGJtTmxjem9nVW1WamIzSmtQSE4wY21sdVp5d2diMkpxWldOMFBqdGNibHgwY0hKcGRtRjBaU0JqZEhnNklFbERiMjUwWVdsdVpYSkRiMjUwWlhoME8xeHVYRzVjZEdOdmJuTjBjblZqZEc5eUtIdGNibHgwWEhSaGNIQk9ZVzFsTEZ4dVhIUmNkR052YlhCdmJtVnVkSE1zWEc1Y2RGeDBjR0ZuWlhNc1hHNWNkRngwYzJWeWRtbGpaWE1zWEc1Y2RGeDBZMjl1Wm1sbkxGeHVYSFJjZEhKMWJHVnlMRnh1WEhSOU9pQkpRMjl1ZEdGcGJtVnlVSEp2Y0hNcElIdGNibHgwWEhSMGFHbHpMbUZ3Y0U1aGJXVWdQU0JoY0hCT1lXMWxPMXh1WEhSY2RIUm9hWE11WTI5dVptbG5JRDBnWTI5dVptbG5PMXh1WEc1Y2RGeDBkR2hwY3k1d1lXZGxRMjl0Y0c5dVpXNTBjeUE5SUhCaFoyVnpJRDhnV3k0dUxuQmhaMlZ6WFNBNklGdGRPMXh1WEhSY2RIUm9hWE11WTI5dGNHOXVaVzUwY3lBOUlHTnZiWEJ2Ym1WdWRITWdQeUJiTGk0dVkyOXRjRzl1Wlc1MGMxMGdPaUJiWFR0Y2JseHVYSFJjZEhSb2FYTXVjMlZ5ZG1salpYTWdQU0J6WlhKMmFXTmxjeUEvSUZzdUxpNXpaWEoyYVdObGMxMGdPaUJiWFR0Y2JseDBYSFIwYUdsekxuTmxjblpwWTJWTllYQWdQU0I3ZlR0Y2JseHVYSFJjZEhSb2FYTXVhVzV6ZEdGdVkyVnpJRDBnZTMwN1hHNWNkRngwZEdocGN5NWpiMjF3YjI1bGJuUnpRMjl1Wm1sbklEMGdlMzA3WEc1Y2JseDBYSFIwYUdsekxuSjFiR1Z5SUQwZ2NuVnNaWElnUHlCeWRXeGxjaUE2SUc1bGR5QnBjMUJoWjJVb0tUdGNibHh1WEhSY2RIUm9hWE11WTNSNElEMGdkR2hwY3k1amNtVmhkR1ZEYjI1MFpYaDBMbU5oYkd3b2RHaHBjeWs3WEc1Y2RIMWNibHh1WEhSd2NtbDJZWFJsSUdOeVpXRjBaVU52Ym5SbGVIUW9LVG9nU1VOdmJuUmhhVzVsY2tOdmJuUmxlSFFnZTF4dVhIUmNkSEpsZEhWeWJpQjdYRzVjZEZ4MFhIUmpiMjVtYVdjNklIUm9hWE11WTI5dVptbG5MRnh1WEhSY2RGeDBaMlYwVTJWeWRtbGpaVG9nZEdocGN5NW5aWFJUWlhKMmFXTmxMbUpwYm1Rb2RHaHBjeWtzWEc1Y2RGeDBmVHRjYmx4MGZWeHVYRzVjZEhCeWFYWmhkR1VnYVc1emRHRnVkR2xoZEdWRGIyMXdiMjVsYm5Rb1EyOXRjRzl1Wlc1ME9pQmhibmtwSUh0Y2JseDBYSFIwY25rZ2UxeHVYSFJjZEZ4MGFXWWdLSFI1Y0dWdlppQkRiMjF3YjI1bGJuUWdQVDA5SUZ3aVpuVnVZM1JwYjI1Y0lpa2dlMXh1WEhSY2RGeDBYSFJwWmlBb2RHaHBjeTVqYjIxd2IyNWxiblJ6UTI5dVptbG5XME52YlhCdmJtVnVkQzV1WVcxbFhTa2dlMXh1WEhSY2RGeDBYSFJjZEhSb2FYTXVhVzV6ZEdGdVkyVnpXME52YlhCdmJtVnVkQzV1WVcxbFhTQTlJRzVsZHlCRGIyMXdiMjVsYm5Rb1hHNWNkRngwWEhSY2RGeDBYSFIwYUdsekxtTjBlQ3hjYmx4MFhIUmNkRngwWEhSY2RIUm9hWE11WTI5dGNHOXVaVzUwYzBOdmJtWnBaMXREYjIxd2IyNWxiblF1Ym1GdFpWMWNibHgwWEhSY2RGeDBYSFFwTzF4dVhIUmNkRngwWEhSOUlHVnNjMlVnZTF4dVhIUmNkRngwWEhSY2RIUm9hWE11YVc1emRHRnVZMlZ6VzBOdmJYQnZibVZ1ZEM1dVlXMWxYU0E5SUc1bGR5QkRiMjF3YjI1bGJuUW9kR2hwY3k1amRIZ3BPMXh1WEhSY2RGeDBYSFI5WEc1Y2RGeDBYSFJjZEhKbGRIVnliaUJEYjIxd2IyNWxiblF1Ym1GdFpUdGNibHgwWEhSY2RIMGdaV3h6WlNCN1hHNWNkRngwWEhSY2RHTnZibk52YkdVdWQyRnliaWhjSWs1dmRDQmhiaUJEYjI1emRISjFZM1J2Y2x3aUxDQkRiMjF3YjI1bGJuUXBPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMGdZMkYwWTJnZ0tHVnljbTl5S1NCN1hHNWNkRngwWEhSamIyNXpiMnhsTG5kaGNtNG9aWEp5YjNJcE8xeHVYSFJjZEgxY2JseDBmVnh1WEc1Y2RIQnlhWFpoZEdVZ2FXNXpkR0Z1ZEdsaGRHVlRaWEoyYVdObEtGTmxjblpwWTJVNklHRnVlU2tnZTF4dVhIUmNkR2xtSUNoMGVYQmxiMllnVTJWeWRtbGpaU0E5UFQwZ1hDSm1kVzVqZEdsdmJsd2lLU0I3WEc1Y2RGeDBYSFIwY25rZ2UxeHVYSFJjZEZ4MFhIUjBhR2x6TG5ObGNuWnBZMlZOWVhCYlUyVnlkbWxqWlM1dVlXMWxYU0E5SUc1bGR5QlRaWEoyYVdObEtDazdYRzVjZEZ4MFhIUjlJR05oZEdOb0lDaGxjbkp2Y2lrZ2UxeHVYSFJjZEZ4MFhIUmpiMjV6YjJ4bExuZGhjbTRvWlhKeWIzSXBPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMGdaV3h6WlNCN1hHNWNkRngwWEhSamIyNXpiMnhsTG5kaGNtNG9YQ0pPYjNRZ1lXNGdRMjl1YzNSeWRXTjBiM0pjSWl3Z1UyVnlkbWxqWlNrN1hHNWNkRngwZlZ4dVhIUjlYRzVjYmx4MGNISnBkbUYwWlNCblpYUlRaWEoyYVdObFBGUStLSE5sY25acFkyVk9ZVzFsT2lCemRISnBibWNwT2lCVUlId2dabUZzYzJVZ2UxeHVYSFJjZEdsbUlDaDBhR2x6TG5ObGNuWnBZMlZOWVhCYmMyVnlkbWxqWlU1aGJXVmRLU0J5WlhSMWNtNGdkR2hwY3k1elpYSjJhV05sVFdGd1czTmxjblpwWTJWT1lXMWxYVHRjYmx4MFhIUnlaWFIxY200Z1ptRnNjMlU3WEc1Y2RIMWNibHh1WEhSd2NtbDJZWFJsSUdKMWFXeGtVMlZ5ZG1salpYTW9LU0I3WEc1Y2RGeDBkR2hwY3k1d1lXZGxRMjl0Y0c5dVpXNTBjeTVtYjNKRllXTm9LQ2hwZEdWdEtTQTlQaUI3WEc1Y2RGeDBYSFJwWmlBb2RIbHdaVzltSUdsMFpXMHVjMlZ5ZG1salpYTWdJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSXBJSHRjYmx4MFhIUmNkRngwYVdZZ0tHbDBaVzB1YUdGelQzZHVVSEp2Y0dWeWRIa29YQ0p3WVdkbFVtVm1jMXdpS1NsY2JseDBYSFJjZEZ4MFhIUnBaaUFvZEdocGN5NXlkV3hsY2k1cGN5aHBkR1Z0TG5CaFoyVlNaV1p6S1NrZ2UxeHVYSFJjZEZ4MFhIUmNkRngwYVhSbGJTNXpaWEoyYVdObGN5NW1iM0pGWVdOb0tDaHpaWEoyYVdObEtTQTlQbHh1WEhSY2RGeDBYSFJjZEZ4MFhIUjBhR2x6TG5ObGNuWnBZMlZ6TG5CMWMyZ29jMlZ5ZG1salpTbGNibHgwWEhSY2RGeDBYSFJjZENrN1hHNWNkRngwWEhSY2RGeDBmVnh1WEhSY2RGeDBmVnh1WEhSY2RIMHBPMXh1WEc1Y2RGeDBjbVYwZFhKdUlIUm9hWE11YzJWeWRtbGpaWE11YldGd0tIUm9hWE11YVc1emRHRnVkR2xoZEdWVFpYSjJhV05sTG1KcGJtUW9kR2hwY3lrcE8xeHVYSFI5WEc1Y2JseDBjSEpwZG1GMFpTQmlkV2xzWkVOdmJYQnZibVZ1ZEhNb0tTQjdYRzVjZEZ4MGNtVjBkWEp1SUhSb2FYTXVZMjl0Y0c5dVpXNTBjeTV0WVhBb2RHaHBjeTVwYm5OMFlXNTBhV0YwWlVOdmJYQnZibVZ1ZEM1aWFXNWtLSFJvYVhNcEtUdGNibHgwZlZ4dVhHNWNkSEJ5YVhaaGRHVWdZblZwYkdSUVlXZGxRMjl0Y0c5dVpXNTBjeWdwSUh0Y2JseDBYSFJ5WlhSMWNtNGdkR2hwY3k1d1lXZGxRMjl0Y0c5dVpXNTBjeTV0WVhBb0tHbDBaVzBwSUQwK0lIdGNibHgwWEhSY2RHbG1JQ2hwZEdWdExtaGhjMDkzYmxCeWIzQmxjblI1S0Z3aWNHRm5aVkpsWm5OY0lpa3BYRzVjZEZ4MFhIUmNkR2xtSUNoMGFHbHpMbkoxYkdWeUxtbHpLR2wwWlcwdWNHRm5aVkpsWm5NcEtTQjdYRzVjZEZ4MFhIUmNkRngwYVhSbGJTNWpiMjF3YjI1bGJuUnpMbVp2Y2tWaFkyZ29LRU52YlhBcElEMCtYRzVjZEZ4MFhIUmNkRngwWEhSMGFHbHpMbWx1YzNSaGJuUnBZWFJsUTI5dGNHOXVaVzUwS0VOdmJYQXBYRzVjZEZ4MFhIUmNkRngwS1R0Y2JseDBYSFJjZEZ4MGZWeHVYSFJjZEgwcE8xeHVYSFI5WEc1Y2JseDBjSFZpYkdsaklHbHVhWFFvS1NCN1hHNWNkRngwZEdocGN5NWlkV2xzWkZObGNuWnBZMlZ6TG1OaGJHd29kR2hwY3lrN1hHNWNkRngwZEdocGN5NWlkV2xzWkVOdmJYQnZibVZ1ZEhNdVkyRnNiQ2gwYUdsektUdGNibHgwWEhSMGFHbHpMbUoxYVd4a1VHRm5aVU52YlhCdmJtVnVkSE11WTJGc2JDaDBhR2x6S1R0Y2JseHVYSFJjZEhkcGJtUnZkMXRjSW0welFYQndjMXdpWFNBOUlIc2dXM1JvYVhNdVlYQndUbUZ0WlYwNklIUm9hWE1nZlR0Y2JseDBmVnh1WEc1Y2RIQjFZbXhwWXlCaWFXNWtLR052YlhCT1lXMWxPaUJ6ZEhKcGJtY3NJR052Ym1acFp6b2dZVzU1S1NCN1hHNWNkRngwZEdocGN5NWpiMjF3YjI1bGJuUnpRMjl1Wm1sblcyTnZiWEJPWVcxbFhTQTlJR052Ym1acFp6dGNibHgwZlZ4dVhHNWNkSEIxWW14cFl5QnpkR0Z5ZENncElIdGNibHgwWEhScFppQW9YRzVjZEZ4MFhIUmtiMk4xYldWdWRDNWhkSFJoWTJoRmRtVnVkRnh1WEhSY2RGeDBYSFEvSUdSdlkzVnRaVzUwTG5KbFlXUjVVM1JoZEdVZ1BUMDlJRndpWTI5dGNHeGxkR1ZjSWx4dVhIUmNkRngwWEhRNklHUnZZM1Z0Wlc1MExuSmxZV1I1VTNSaGRHVWdJVDA5SUZ3aWJHOWhaR2x1WjF3aVhHNWNkRngwS1NCN1hHNWNkRngwWEhSMGFHbHpMbWx1YVhRb0tUdGNibHgwWEhSOUlHVnNjMlVnZTF4dVhIUmNkRngwWkc5amRXMWxiblF1WVdSa1JYWmxiblJNYVhOMFpXNWxjaWhjSWtSUFRVTnZiblJsYm5STWIyRmtaV1JjSWl3Z2RHaHBjeTVwYm1sMExtSnBibVFvZEdocGN5a3BPMXh1WEhSY2RIMWNibHgwZlZ4dWZWeHVJbDE5IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgaXNQYWdlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICBjb25zdCBtZXRhUGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cInBhZ2VcIl0nKTtcclxuICAgICAgICB0aGlzLmlkZW50aWZpY2FjYW9NZXRhUGFnZSA9IG1ldGFQYWdlXHJcbiAgICAgICAgICAgID8gbWV0YVBhZ2UuZ2V0QXR0cmlidXRlKFwiY29udGVudFwiKSB8fCBcIlwiXHJcbiAgICAgICAgICAgIDogXCJcIjtcclxuICAgICAgICB0aGlzLmNsYXNzVGFnQm9keSA9IEFycmF5LmZyb20oZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QpO1xyXG4gICAgICAgIHRoaXMucGFnZURhdGFMYXllciA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuZGF0YUxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZURhdGFMYXllciA9IChfYSA9IHdpbmRvdy5kYXRhTGF5ZXJbMF0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5wYWdlQ2F0ZWdvcnk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaXMocnVsZXMpIHtcclxuICAgICAgICBsZXQgaXMgPSBmYWxzZTtcclxuICAgICAgICBydWxlcy5mb3JFYWNoKChydWxlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlkZW50aWZpY2FjYW9NZXRhUGFnZS5zZWFyY2gocnVsZSkgPj0gMCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlRGF0YUxheWVyID09PSBydWxlIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzVGFnQm9keS5pbmNsdWRlcyhydWxlKSkge1xyXG4gICAgICAgICAgICAgICAgaXMgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGlzO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFYTlFZV2RsTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDNCaFkydGhaMlZ6TDJOdmNtVXZhWE5RWVdkbExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRV2RDUVN4TlFVRk5MRU5CUVVNc1QwRkJUeXhQUVVGUExFMUJRVTA3U1VGTE1VSTdPMUZCUTBNc1RVRkJUU3hSUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEdGQlFXRXNRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eERRVUZETzFGQlF6ZEVMRWxCUVVrc1EwRkJReXh4UWtGQmNVSXNSMEZCUnl4UlFVRlJPMWxCUTNCRExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNXVUZCV1N4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFVkJRVVU3V1VGRGVFTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVWT0xFbEJRVWtzUTBGQlF5eFpRVUZaTEVkQlFVY3NTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMUZCUTNoRUxFbEJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTNoQ0xFbEJRVWtzVDBGQlR5eE5RVUZOTEVOQlFVTXNVMEZCVXl4TFFVRkxMRmRCUVZjc1JVRkJSVHRaUVVNMVF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4VFFVRkhMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETERCRFFVRkZMRmxCUVZrc1EwRkJRenRUUVVOMlJEdEpRVU5HTEVOQlFVTTdTVUZQUkN4RlFVRkZMRU5CUVVNc1MwRkJaVHRSUVVOcVFpeEpRVUZKTEVWQlFVVXNSMEZCUnl4TFFVRkxMRU5CUVVNN1VVRkZaaXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVN1dVRkRkRUlzU1VGRFF5eEpRVUZKTEVOQlFVTXNjVUpCUVhGQ0xFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNN1owSkJRelZETEVsQlFVa3NRMEZCUXl4aFFVRmhMRXRCUVVzc1NVRkJTVHRuUWtGRE0wSXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlF5OUNPMmRDUVVORUxFVkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTTdZVUZEVmp0UlFVTkdMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJSVWdzVDBGQlR5eEZRVUZGTEVOQlFVTTdTVUZEV0N4RFFVRkRPME5CUTBRaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SnBiWEJ2Y25RZ1NWSjFiR1Z5SUdaeWIyMGdYQ0l1TDBsU2RXeGxjbHdpTzF4dVhHNWtaV05zWVhKbElHZHNiMkpoYkNCN1hHNWNkR2x1ZEdWeVptRmpaU0JYYVc1a2IzY2dlMXh1WEhSY2RHUmhkR0ZNWVhsbGNqb2dSR0YwWVV4aGVXVnlUMkpxWldOMFcxMGdmQ0IxYm1SbFptbHVaV1E3WEc1Y2RIMWNibHh1WEhScGJuUmxjbVpoWTJVZ1JHRjBZVXhoZVdWeVQySnFaV04wSUh0Y2JseDBYSFJ3WVdkbFEyRjBaV2R2Y25rNklITjBjbWx1Wnp0Y2JseDBmVnh1ZlZ4dUx5b3FYRzRnS2lBZ1EyeGhjM05sSUhCaGNtRWdkbVZ5YVdacFkyRnlJSE5sSUdWemRHRnRiM01nWlcwZ2RXMWhJR1JoY3lCd1lXZHBibUZ6WEc0Z0tpQWdjWFZsSUhQRG8yOGdjR0Z6YzJGa1lYTWdjRzl5SUdGeVozVnRaVzUwYjF4dUlDb3ZYRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJR05zWVhOeklHbHpVR0ZuWlNCcGJYQnNaVzFsYm5SeklFbFNkV3hsY2lCN1hHNWNkSEJ5YVhaaGRHVWdhV1JsYm5ScFptbGpZV05oYjAxbGRHRlFZV2RsT2lCemRISnBibWM3WEc1Y2RIQnlhWFpoZEdVZ1kyeGhjM05VWVdkQ2IyUjVPaUJ6ZEhKcGJtZGJYVHRjYmx4MGNISnBkbUYwWlNCd1lXZGxSR0YwWVV4aGVXVnlPaUJ6ZEhKcGJtYzdYRzVjYmx4MFkyOXVjM1J5ZFdOMGIzSW9LU0I3WEc1Y2RGeDBZMjl1YzNRZ2JXVjBZVkJoWjJVZ1BTQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5S0NkdFpYUmhXMjVoYldVOVhDSndZV2RsWENKZEp5azdYRzVjZEZ4MGRHaHBjeTVwWkdWdWRHbG1hV05oWTJGdlRXVjBZVkJoWjJVZ1BTQnRaWFJoVUdGblpWeHVYSFJjZEZ4MFB5QnRaWFJoVUdGblpTNW5aWFJCZEhSeWFXSjFkR1VvWENKamIyNTBaVzUwWENJcElIeDhJRndpWENKY2JseDBYSFJjZERvZ1hDSmNJanRjYmx4dVhIUmNkSFJvYVhNdVkyeGhjM05VWVdkQ2IyUjVJRDBnUVhKeVlYa3Vabkp2YlNoa2IyTjFiV1Z1ZEM1aWIyUjVMbU5zWVhOelRHbHpkQ2s3WEc1Y2RGeDBkR2hwY3k1d1lXZGxSR0YwWVV4aGVXVnlJRDBnWENKY0lqdGNibHgwWEhScFppQW9kSGx3Wlc5bUlIZHBibVJ2ZHk1a1lYUmhUR0Y1WlhJZ0lUMDlJRndpZFc1a1pXWnBibVZrWENJcElIdGNibHgwWEhSY2RIUm9hWE11Y0dGblpVUmhkR0ZNWVhsbGNpQTlJSGRwYm1SdmR5NWtZWFJoVEdGNVpYSmJNRjAvTG5CaFoyVkRZWFJsWjI5eWVUdGNibHgwWEhSOVhHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MElDb2dLaUJBY0dGeVlXMGdlMkZ5Y21GNWZTQmJZWEpuYzEwZ2RXMGdiM1VnZFcwZ1lYSnlZWGtnWkdVZ2MzUnlhVzVuY3lCamIyNTBaVzVrYnlCaElIQmhiR0YyY21FZ1kyaGhkbVVnY0dGeVlTQnBaR1Z1ZEdsbWFXTmhjaUJoSUhCaFoybHVZVnh1WEhRZ0tpQkFjbVYwZFhKdUlIdENiMjlzWldGdWZTQnlaWFJ2Y201aElIUnlkV1VnYzJVZ2RXMGdaRzl6SUdGeVozVnRaVzUwYjNNZ1pYTjBhWFpsY2lCdVlTQnRaWFJoTDJKdlpIbERiR0Z6Y3k5MFlXZGNibHgwSUNvdlhHNWNibHgwYVhNb2NuVnNaWE02SUhOMGNtbHVaMXRkS1RvZ1ltOXZiR1ZoYmlCN1hHNWNkRngwYkdWMElHbHpJRDBnWm1Gc2MyVTdYRzVjYmx4MFhIUnlkV3hsY3k1bWIzSkZZV05vS0NoeWRXeGxLU0E5UGlCN1hHNWNkRngwWEhScFppQW9YRzVjZEZ4MFhIUmNkSFJvYVhNdWFXUmxiblJwWm1sallXTmhiMDFsZEdGUVlXZGxMbk5sWVhKamFDaHlkV3hsS1NBK1BTQXdJSHg4WEc1Y2RGeDBYSFJjZEhSb2FYTXVjR0ZuWlVSaGRHRk1ZWGxsY2lBOVBUMGdjblZzWlNCOGZGeHVYSFJjZEZ4MFhIUjBhR2x6TG1Oc1lYTnpWR0ZuUW05a2VTNXBibU5zZFdSbGN5aHlkV3hsS1Z4dVhIUmNkRngwS1NCN1hHNWNkRngwWEhSY2RHbHpJRDBnZEhKMVpUdGNibHgwWEhSY2RIMWNibHgwWEhSOUtUdGNibHh1WEhSY2RISmxkSFZ5YmlCcGN6dGNibHgwZlZ4dWZWeHVJbDE5IiwiZXhwb3J0IHsgZGVmYXVsdCBhcyBDb250YWluZXIgfSBmcm9tIFwiLi9jb3JlL0NvbnRhaW5lclwiO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIElzUGFnZSB9IGZyb20gXCIuL2NvcmUvaXNQYWdlXCI7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUHViU3ViIH0gZnJvbSBcIi4vU3RhdGVNYW5hZ2VyL1B1YlN1YlwiO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFN0b3JlIH0gZnJvbSBcIi4vU3RhdGVNYW5hZ2VyL1N0b3JlXCI7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgbWVyZ2VTdG9yZXMgfSBmcm9tIFwiLi9TdGF0ZU1hbmFnZXIvbWVyZ2VTdG9yZXNcIjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1a1pYZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdmNHRmphMkZuWlhNdmFXNWtaWGd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUMEZCVHl4RlFVRkZMRTlCUVU4c1NVRkJTU3hUUVVGVExFVkJRVVVzVFVGQlRTeHJRa0ZCYTBJc1EwRkJRenRCUVVONFJDeFBRVUZQTEVWQlFVVXNUMEZCVHl4SlFVRkpMRTFCUVUwc1JVRkJSU3hOUVVGTkxHVkJRV1VzUTBGQlF6dEJRVU5zUkN4UFFVRlBMRVZCUVVVc1QwRkJUeXhKUVVGSkxFMUJRVTBzUlVGQlJTeE5RVUZOTEhWQ1FVRjFRaXhEUVVGRE8wRkJRekZFTEU5QlFVOHNSVUZCUlN4UFFVRlBMRWxCUVVrc1MwRkJTeXhGUVVGRkxFMUJRVTBzYzBKQlFYTkNMRU5CUVVNN1FVRkRlRVFzVDBGQlR5eEZRVUZGTEU5QlFVOHNTVUZCU1N4WFFVRlhMRVZCUVVVc1RVRkJUU3cwUWtGQk5FSXNRMEZCUXlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYkltVjRjRzl5ZENCN0lHUmxabUYxYkhRZ1lYTWdRMjl1ZEdGcGJtVnlJSDBnWm5KdmJTQmNJaTR2WTI5eVpTOURiMjUwWVdsdVpYSmNJanRjYm1WNGNHOXlkQ0I3SUdSbFptRjFiSFFnWVhNZ1NYTlFZV2RsSUgwZ1puSnZiU0JjSWk0dlkyOXlaUzlwYzFCaFoyVmNJanRjYm1WNGNHOXlkQ0I3SUdSbFptRjFiSFFnWVhNZ1VIVmlVM1ZpSUgwZ1puSnZiU0JjSWk0dlUzUmhkR1ZOWVc1aFoyVnlMMUIxWWxOMVlsd2lPMXh1Wlhod2IzSjBJSHNnWkdWbVlYVnNkQ0JoY3lCVGRHOXlaU0I5SUdaeWIyMGdYQ0l1TDFOMFlYUmxUV0Z1WVdkbGNpOVRkRzl5WlZ3aU8xeHVaWGh3YjNKMElIc2daR1ZtWVhWc2RDQmhjeUJ0WlhKblpWTjBiM0psY3lCOUlHWnliMjBnWENJdUwxTjBZWFJsVFdGdVlXZGxjaTl0WlhKblpWTjBiM0psYzF3aU8xeHVJbDE5IiwibW9kdWxlLmV4cG9ydHMgPSBqUXVlcnk7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH0iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBDaGVja291dFVJIGZyb20gXCIuL2NvbXBvbmVudHMvQ2hlY2tvdXRVSVwiO1xuaW1wb3J0IHsgQ29udGFpbmVyIH0gZnJvbSBcIkBhZ2VuY2lhbTMvcGtnXCI7XG5pbXBvcnQgRXhlbXBsZSBmcm9tIFwiLi9jb21wb25lbnRzL0V4ZW1wbGVcIjtcbmltcG9ydCBFeGVtcGxlRXZlbnQgZnJvbSBcIi4vY29tcG9uZW50cy9FeGVtcGxlRXZlbnRcIjtcbmltcG9ydCBTdGVwQmFyIGZyb20gXCIuL2NvbXBvbmVudHMvU3RlcEJhclwiO1xuaW1wb3J0IEN1c3RvbUluc3RhbGxtZW50cyBmcm9tIFwiLi9jb21wb25lbnRzL0N1c3RvbUluc3RhbGxtZW50c1wiO1xuaW1wb3J0IEN1c3RvbUluc3RhbGxtZW50UGVySXRlbXMgZnJvbSBcIi4vY29tcG9uZW50cy9DdXN0b21JbnN0YWxsbWVudFBlckl0ZW1zXCI7XG5pbXBvcnQgTG9naW5Nb2RhbCBmcm9tIFwiLi9jb21wb25lbnRzL0xvZ2luTW9kYWxcIjtcblxuY29uc3QgbTNDaGVja291dCA9IG5ldyBDb250YWluZXIoe1xuICAgIGFwcE5hbWU6IFwibTMtY2hlY2tvdXRcIixcbiAgICBjb21wb25lbnRzOiBbQ2hlY2tvdXRVSSwgRXhlbXBsZSwgRXhlbXBsZUV2ZW50LCBTdGVwQmFyLCBDdXN0b21JbnN0YWxsbWVudHMsIEN1c3RvbUluc3RhbGxtZW50UGVySXRlbXMsIExvZ2luTW9kYWxdLFxufSk7XG5cbm0zQ2hlY2tvdXQuc3RhcnQoKTtcblxuIl0sInNvdXJjZVJvb3QiOiIifQ==