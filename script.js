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
        display: block;
        width: 190px;
        height: auto;
        grid-area: 2 / 1 / 2 / -1;
        font-family: 'Ubuntu', sans-serif;
        font-weight: 400;
        line-height: 16px;
        text-align: left;
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
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0NoZWNrb3V0VUkuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvY29tcG9uZW50cy9DdXN0b21JbnN0YWxsbWVudFBlckl0ZW1zLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2NvbXBvbmVudHMvQ3VzdG9tSW5zdGFsbG1lbnRzLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2NvbXBvbmVudHMvRXhlbXBsZS5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0V4ZW1wbGVFdmVudC5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0xvZ2luTW9kYWwuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvY29tcG9uZW50cy9TdGVwQmFyLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2hlbHBlcnMvTWVkaWFzTWF0Y2guanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvaGVscGVycy92dGV4VXRpbHMuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvaGVscGVycy93YWl0Rm9yRWwuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL1N0YXRlTWFuYWdlci9QdWJTdWIuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL1N0YXRlTWFuYWdlci9TdG9yZS5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uLi9ub2RlX21vZHVsZXMvQGFnZW5jaWFtMy9wa2cvZGlzdC9saWIvU3RhdGVNYW5hZ2VyL21lcmdlU3RvcmVzLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4uL25vZGVfbW9kdWxlcy9AYWdlbmNpYW0zL3BrZy9kaXN0L2xpYi9jb3JlL0NvbnRhaW5lci5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uLi9ub2RlX21vZHVsZXMvQGFnZW5jaWFtMy9wa2cvZGlzdC9saWIvY29yZS9pc1BhZ2UuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL2luZGV4LmpzIiwid2VicGFjazovL2NoZWNrb3V0L2V4dGVybmFsIFwialF1ZXJ5XCIiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NoZWNrb3V0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jaGVja291dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBMEQ7QUFDUztBQUN0Qjs7QUFFOUI7QUFDZjtBQUNBOztBQUVBLFlBQVksa0VBQWdCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsQ0FBQztBQUN0Qix3QkFBd0IsQ0FBQztBQUN6Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUIsdUJBQXVCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFD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QUE2Qyx3REFBd0QsRTs7Ozs7V0NBckc7V0FDQTtXQUNBO1dBQ0Esc0RBQXNELGtCQUFrQjtXQUN4RTtXQUNBLCtDQUErQyxjQUFjO1dBQzdELEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05pRDtBQUNOO0FBQ0E7QUFDVTtBQUNWO0FBQ3NCO0FBQ2M7QUFDOUI7O0FBRWpELHVCQUF1QixxREFBUztBQUNoQztBQUNBLGlCQUFpQiwyREFBVSxFQUFFLHdEQUFPLEVBQUUsNkRBQVksRUFBRSw0REFBTyxFQUFFLHVFQUFrQixFQUFFLDhFQUF5QixFQUFFLCtEQUFVO0FBQ3RILENBQUM7O0FBRUQiLCJmaWxlIjoiZ3VhcmFyYXBlcy10ZW1wbGF0ZS0tY2hlY2tvdXQtYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNTbWFsbGVyVGhlbjc2OCB9IGZyb20gXCIuLi9oZWxwZXJzL01lZGlhc01hdGNoXCI7XG5pbXBvcnQgeyBhbHRlcmFyVGFtYW5ob0ltYWdlbVNyY1Z0ZXggfSBmcm9tIFwiLi4vaGVscGVycy92dGV4VXRpbHNcIjtcbmltcG9ydCB3YWl0Rm9yRWwgZnJvbSBcIi4uL2hlbHBlcnMvd2FpdEZvckVsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoZWNrb3V0VUkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmluaXQoKTtcblxuICAgICAgICBpZiAoaXNTbWFsbGVyVGhlbjc2OCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMoKTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzKCk7XG4gICAgICAgICAgICB0aGlzLnNldEZvb3RlckRyb3Bkb3duKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3RvcnMoKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSAkKFwiLmZvb3RlckNoZWNrb3V0X190aXRsZVwiKTtcbiAgICAgICAgdGhpcy5jb250ZW50cyA9ICQoXCIuZm9vdGVyQ2hlY2tvdXRfX2NvbnRlbnRcIik7XG4gICAgfVxuXG4gICAgZXZlbnRzKCkge1xuICAgICAgICB0aGlzLnRpdGxlLmNsaWNrKHRoaXMudG9nZ2xlRm9vdGVyRHJvcGRvd24uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgc2V0Rm9vdGVyRHJvcGRvd24oKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50aXRsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy50aXRsZVtpXS5jbGFzc0xpc3QuYWRkKFwiZHJvcGRvd25fX3RpdGxlXCIpO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50c1tpXS5jbGFzc0xpc3QuYWRkKFwiZHJvcGRvd25fX2NvbnRlbnQtLWNsb3NlZFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvZ2dsZUZvb3RlckRyb3Bkb3duKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKFwiY2xvc2VkXCIpO1xuXG4gICAgICAgIGV2ZW50LnRhcmdldC5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICAgICAgIFwiZHJvcGRvd25fX2NvbnRlbnQtLWNsb3NlZFwiXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5jb25maWdUaHVtYigpO1xuICAgICAgICB3YWl0Rm9yRWwoXCIucHJvZHVjdC1pbWFnZSBpbWdcIiwgdGhpcy5yZXNpemVJbWFnZXMuYmluZCh0aGlzKSk7XG4gICAgICAgICQod2luZG93KS5vbihcIm9yZGVyRm9ybVVwZGF0ZWQudnRleFwiLCB0aGlzLnJlc2l6ZUltYWdlcy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb25maWdUaHVtYigpIHtcbiAgICAgICAgaWYgKGlzU21hbGxlclRoZW43NjgpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSA3MztcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gOTY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gNjM7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IDgzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzaXplSW1hZ2VzKCkge1xuICAgICAgICAkKFwiLnByb2R1Y3QtaW1hZ2UgaW1nXCIpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCAkZWwgPSAkKGVsKTtcbiAgICAgICAgICAgICRlbC5hdHRyKFxuICAgICAgICAgICAgICAgIFwic3JjXCIsXG4gICAgICAgICAgICAgICAgYWx0ZXJhclRhbWFuaG9JbWFnZW1TcmNWdGV4KFxuICAgICAgICAgICAgICAgICAgICAkZWwuYXR0cihcInNyY1wiKSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oZWlnaHRcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLyBJbmpldGEgZXN0aWxvcyBkbyBjb21wb25lbnRlIGRlIHBhcmNlbGFzIG5vcyBpdGVucyBkbyBjYXJyaW5obyAodW1hIHZleilcbmZ1bmN0aW9uIEluc2VydFN0eWxlc01pbmljYXJ0SXRlbXMoKSB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLWluc3RhbGxtZW50LWl0ZW0tbWluaWNhcnQtc3R5bGUnKSkgcmV0dXJuXG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICBzdHlsZS5pZCA9ICdjdXN0b20taW5zdGFsbG1lbnQtaXRlbS1taW5pY2FydC1zdHlsZSdcbiAgc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgIC5jdXN0b20taW5zdGFsbG1lbnQtdG90YWwge1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgY29sb3I6ICM3MDcwNzA7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgIHdpZHRoOiAxOTBweDtcbiAgICAgIGhlaWdodDogYXV0bztcbiAgICAgIGdyaWQtYXJlYTogMiAvIDEgLyAyIC8gLTE7XG4gICAgICBmb250LWZhbWlseTogJ1VidW50dScsIHNhbnMtc2VyaWY7XG4gICAgICBmb250LXdlaWdodDogNDAwO1xuICAgICAgbGluZS1oZWlnaHQ6IDE2cHg7XG4gICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgIH1cbiAgICBAbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG4gICAgICAuY3VzdG9tLWluc3RhbGxtZW50LXRvdGFsIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgIH1cbiAgICB9XG4gIGBcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSlcbn1cblxuLy8gQWRpY2lvbmEgZXN0aWxvcyBhbyB0b3RhbC1zZWxsaW5nLXByaWNlIHF1YW5kbyB0ZW0gbGlzdC1wcmljZVxuZnVuY3Rpb24gSW5zZXJ0Q2xhc3NUb1RvdGFsU2VsbGluZ1ByaWNlKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2FydC1pdGVtcyAucHJvZHVjdC1pdGVtJykuZm9yRWFjaChlbCA9PiB7XG4gICAgY29uc3QgbGlzdFByaWNlID0gZWwucXVlcnlTZWxlY3RvcignLnByb2R1Y3QtcHJpY2UgLmxpc3QtcHJpY2UnKVxuICAgIGlmIChsaXN0UHJpY2U/LmNsYXNzTGlzdC5jb250YWlucygnaGlkZScpKSB7XG4gICAgICBjb25zdCB0b3RhbFNlbGxpbmdQcmljZSA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy50b3RhbC1zZWxsaW5nLXByaWNlJylcbiAgICAgIGlmICh0b3RhbFNlbGxpbmdQcmljZSAmJiAhdG90YWxTZWxsaW5nUHJpY2UuY2xhc3NMaXN0LmNvbnRhaW5zKCduby1saXN0LXByaWNlJykpIHtcbiAgICAgICAgdG90YWxTZWxsaW5nUHJpY2UuY2xhc3NMaXN0LmFkZCgnbm8tbGlzdC1wcmljZScpXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG4vLyBBZ3VhcmRhIFZURVggSlMgKG9yZGVyRm9ybSkgZXN0YXIgZGlzcG9uw612ZWwgYW50ZXMgZGUgZXhlY3V0YXIgYSBsw7NnaWNhXG5mdW5jdGlvbiB3YWl0Rm9yVnRleGpzKGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHJldHVyblxuICBpZiAod2luZG93LnZ0ZXhqcyAmJiB3aW5kb3cudnRleGpzLmNoZWNrb3V0ICYmIHdpbmRvdy52dGV4anMuY2hlY2tvdXQuZ2V0T3JkZXJGb3JtKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfSBlbHNlIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHdhaXRGb3JWdGV4anMoY2FsbGJhY2spLCAyMDAwKTtcbiAgfVxufVxuXG4vLyBCbG9jbyBwcmluY2lwYWw6IHJlZ2lzdHJhIGVzdGFkb3MsIGluamV0YSBlc3RpbG9zIGUgYW1hcnJhIGV2ZW50b3MgZGUgYXR1YWxpemHDp8Ojb1xud2FpdEZvclZ0ZXhqcyhmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHJlbmRlcmVkTGluZUl0ZW1LZXlzID0gbmV3IFNldCgpXG4gIGNvbnN0IGluRmxpZ2h0TGluZUl0ZW1LZXlzID0gbmV3IFNldCgpXG4gIGNvbnN0IHNpbXVsYXRpb25DYWNoZSA9IG5ldyBNYXAoKVxuXG4gIC8vIENoYW1hIGEgQVBJIGRlIHNpbXVsYcOnw6NvIGRvIGNoZWNrb3V0IHBhcmEgb2J0ZXIgb3DDp8O1ZXMgZGUgcGFyY2VsYW1lbnRvIGRvIFNLVVxuICBhc3luYyBmdW5jdGlvbiBzaW11bGF0ZUl0ZW1JbnN0YWxsbWVudHMoc2t1SWQsIHF1YW50aXR5KSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL2FwaS9jaGVja291dC9wdWIvb3JkZXJGb3Jtcy9zaW11bGF0aW9uJywge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7IGlkOiBza3VJZCwgcXVhbnRpdHk6IHF1YW50aXR5LCBzZWxsZXI6ICcxJyB9LFxuICAgICAgICBdLFxuICAgICAgICBwb3N0YWxDb2RlOiAnMDcxNDAtMjMzJyxcbiAgICAgICAgY291bnRyeTogJ0JSQScsXG4gICAgICB9KSxcbiAgICB9KVxuICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcignU2ltdWxhdGlvbiBlcnJvcicpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgLy8gUmV0b3JuYSBzaW11bGHDp8OjbyBkbyBjYWNoZSBvdSBleGVjdXRhIGUgYXJtYXplbmEgYW50ZXMgZGUgcmV0b3JuYXJcbiAgZnVuY3Rpb24gZ2V0U2ltdWxhdGlvbihza3VJZCwgcXVhbnRpdHkpIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGAke3NrdUlkfToke3F1YW50aXR5fWBcbiAgICBpZiAoc2ltdWxhdGlvbkNhY2hlLmhhcyhjYWNoZUtleSkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc2ltdWxhdGlvbkNhY2hlLmdldChjYWNoZUtleSkpXG4gICAgfVxuICAgIHJldHVybiBzaW11bGF0ZUl0ZW1JbnN0YWxsbWVudHMoc2t1SWQsIHF1YW50aXR5KS50aGVuKHJlcyA9PiB7XG4gICAgICBzaW11bGF0aW9uQ2FjaGUuc2V0KGNhY2hlS2V5LCByZXMpXG4gICAgICByZXR1cm4gcmVzXG4gICAgfSlcbiAgfVxuXG4gIC8vIEZvcm1hdGEgdmFsb3IgKGFycmVkb25kYSBwYXJhIDIgY2FzYXMgZGVjaW1haXMpXG4gIGZ1bmN0aW9uIGZvcm1hdEN1cnJlbmN5KHZhbHVlSW5DZW50cykge1xuICAgIHJldHVybiAodmFsdWVJbkNlbnRzIC8gMTAwKS50b0xvY2FsZVN0cmluZygncHQtQlInLCB7XG4gICAgICBzdHlsZTogJ2N1cnJlbmN5JyxcbiAgICAgIGN1cnJlbmN5OiAnQlJMJ1xuICAgIH0pXG4gIH1cblxuICAvLyBQYXJhIGNhZGEgaXRlbSBkbyBjYXJyaW5obywgaW5zZXJlIChvdSByZWFwcm92ZWl0YSkgdW0gYmxvY28gZGUgcGFyY2VsYXMgbG9nbyBhcMOzcyAudG90YWwtcHJpY2UgZSBwcmVlbmNoZSBjb20gYSBtZWxob3Igb3DDp8Ojb1xuICBmdW5jdGlvbiBpbnNlcnRQZXJJdGVtSW5zdGFsbG1lbnRzKG9yZGVyRm9ybSkge1xuICAgIHJlbmRlcmVkTGluZUl0ZW1LZXlzLmNsZWFyKClcbiAgICBvcmRlckZvcm0/Lml0ZW1zPy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3Qgc2t1ID0gaXRlbT8uaWRcbiAgICAgIGNvbnN0IHF1YW50aXR5ID0gaXRlbT8ucXVhbnRpdHlcblxuICAgICAgY29uc3QgdG90YWxQcmljZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRvdGFsLXByaWNlJylbaW5kZXhdXG4gICAgICBpZiAoIXNrdSB8fCAhcXVhbnRpdHkgfHwgIXRvdGFsUHJpY2VFbCkgcmV0dXJuXG5cbiAgICAgIC8vIENoYXZlIGVzdMOhdmVsIHBvciBsaW5oYSAodW5pcXVlSWQgcXVhbmRvIGRpc3BvbsOtdmVsKVxuICAgICAgY29uc3Qga2V5ID0gaXRlbS51bmlxdWVJZCB8fCBgJHtza3V9LSR7aW5kZXh9YFxuICAgICAgaWYgKGluRmxpZ2h0TGluZUl0ZW1LZXlzLmhhcyhrZXkpKSByZXR1cm5cbiAgICAgIGluRmxpZ2h0TGluZUl0ZW1LZXlzLmFkZChrZXkpXG5cbiAgICAgIC8vIEdhcmFudGUgYSBleGlzdMOqbmNpYSBkbyBjb250w6ppbmVyIGxvZ28gYXDDs3MgbyB0b3RhbCBkbyBpdGVtXG4gICAgICBsZXQgY3VzdG9tSW5zdGFsbG1lbnRDb21wb25lbnQgPSB0b3RhbFByaWNlRWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCcuY3VzdG9tLWluc3RhbGxtZW50LXRvdGFsJylcbiAgICAgIGlmICghY3VzdG9tSW5zdGFsbG1lbnRDb21wb25lbnQpIHtcbiAgICAgICAgY3VzdG9tSW5zdGFsbG1lbnRDb21wb25lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBjdXN0b21JbnN0YWxsbWVudENvbXBvbmVudC5jbGFzc05hbWUgPSAnY3VzdG9tLWluc3RhbGxtZW50LXRvdGFsJ1xuICAgICAgICB0b3RhbFByaWNlRWwuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGN1c3RvbUluc3RhbGxtZW50Q29tcG9uZW50KVxuICAgICAgfVxuXG4gICAgICAvLyBCdXNjYSBzaW11bGHDp8OjbyBlIGVzY3JldmUgYSBtZWxob3Igb3DDp8OjbyBkZSBwYXJjZWxhXG4gICAgICBnZXRTaW11bGF0aW9uKFN0cmluZyhza3UpLCBxdWFudGl0eSlcbiAgICAgICAgLnRoZW4oc2ltID0+IHtcbiAgICAgICAgICBjb25zdCBpbnN0YWxsbWVudHMgPSBzaW0/LnBheW1lbnREYXRhPy5pbnN0YWxsbWVudE9wdGlvbnM/LlswXT8uaW5zdGFsbG1lbnRzXG4gICAgICAgICAgY29uc3QgYmVzdCA9IGluc3RhbGxtZW50cz8uW2luc3RhbGxtZW50cy5sZW5ndGggLSAxXVxuICAgICAgICAgIGlmIChiZXN0KSB7XG4gICAgICAgICAgICBjdXN0b21JbnN0YWxsbWVudENvbXBvbmVudC5pbm5lclRleHQgPSBgb3UgZW0gYXTDqSAke2Jlc3QuY291bnR9eCBkZSAke2Zvcm1hdEN1cnJlbmN5KGJlc3QudmFsdWUpfWBcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIH0pXG4gICAgICAgIC5maW5hbGx5KCgpID0+IGluRmxpZ2h0TGluZUl0ZW1LZXlzLmRlbGV0ZShrZXkpKVxuICAgIH0pXG4gIH1cblxuICAvLyBJbmpldGEgZXN0aWxvcywgbGltcGEgc29icmFzIGUgcmVuZGVyaXphIHBvciBpdGVtXG4gIEluc2VydFN0eWxlc01pbmljYXJ0SXRlbXMoKVxuICBJbnNlcnRDbGFzc1RvVG90YWxTZWxsaW5nUHJpY2UoKVxuICB2dGV4anMuY2hlY2tvdXQuZ2V0T3JkZXJGb3JtKCkudGhlbihvcmRlckZvcm0gPT4ge1xuICAgIGluc2VydFBlckl0ZW1JbnN0YWxsbWVudHMob3JkZXJGb3JtKVxuICB9KVxuXG4gIC8vIEF0dWFsaXphIG11ZGFuw6dhcyBkbyBvcmRlckZvcm0gXG4gICQod2luZG93KS5vbignb3JkZXJGb3JtVXBkYXRlZC52dGV4JywgZnVuY3Rpb24gKF8sIG9yZGVyRm9ybSkge1xuICAgIEluc2VydFN0eWxlc01pbmljYXJ0SXRlbXMoKVxuICAgIEluc2VydENsYXNzVG9Ub3RhbFNlbGxpbmdQcmljZSgpXG4gICAgaW5zZXJ0UGVySXRlbUluc3RhbGxtZW50cyhvcmRlckZvcm0pXG4gIH0pXG5cbiAgLy8gUmVhZ2UgYSBuYXZlZ2HDp8OjbyBkZW50cm8gZG8gY2hlY2tvdXQgKGhhc2hjaGFuZ2UpXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgKCkgPT4ge1xuICAgIHZ0ZXhqcy5jaGVja291dC5nZXRPcmRlckZvcm0oKS50aGVuKG9yZGVyRm9ybSA9PiB7XG4gICAgICBpbnNlcnRQZXJJdGVtSW5zdGFsbG1lbnRzKG9yZGVyRm9ybSlcbiAgICB9KVxuICB9KVxufSlcbiIsImZ1bmN0aW9uIHdhaXRGb3JWdGV4anMoY2FsbGJhY2spIHtcbiAgaWYgKHdpbmRvdy52dGV4anMgJiYgd2luZG93LnZ0ZXhqcy5jaGVja291dCAmJiB3aW5kb3cudnRleGpzLmNoZWNrb3V0LmdldE9yZGVyRm9ybSkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH0gZWxzZSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB3YWl0Rm9yVnRleGpzKGNhbGxiYWNrKSwgMjAwKTtcbiAgfVxufVxuXG53YWl0Rm9yVnRleGpzKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gaW5zZXJ0U3R5bGVzKCkge1xuICAgIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VzdG9tLWluc3RhbGxtZW50LXN0eWxlJykpIHJldHVyblxuXG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgc3R5bGUuaWQgPSAnY3VzdG9tLWluc3RhbGxtZW50LXN0eWxlJ1xuICAgIHN0eWxlLmlubmVySFRNTCA9IGBcbiAgICAgICAgLmN1c3RvbS1pbnN0YWxsbWVudC1pbmZvIHtcbiAgICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgICAgY29sb3I6ICM3MDcwNzA7XG4gICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICB3aWR0aDogMTcxcHg7XG4gICAgICAgICAgbWF4LWhlaWdodDogMTBweDtcbiAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgZm9udC1mYW1pbHk6ICdVYnVudHUnLCBzYW5zLXNlcmlmO1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDE2cHg7XG4gICAgICAgICAgcmlnaHQ6IC0ycHg7XG4gICAgICAgICAgYm90dG9tOiAyMDJweDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgQG1lZGlhIChtaW4td2lkdGg6IDc2N3B4KSBhbmQgKG1heC13aWR0aDogMTAyNHB4KSB7XG4gICAgICAgICAgLmN1c3RvbS1pbnN0YWxsbWVudC1pbmZvIHtcbiAgICAgICAgICAgIGJvdHRvbTogMTY0cHg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gIFxuICAgICAgICBAbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG4gICAgICAgICAgLmN1c3RvbS1pbnN0YWxsbWVudC1pbmZvIHtcbiAgICAgICAgICAgIHJpZ2h0OiA2cHg7XG4gICAgICAgICAgICBib3R0b206IDEyMnB4O1xuICAgICAgICAgICAgd2lkdGg6IDE4MHB4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgYFxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpXG4gIH1cblxuICBmdW5jdGlvbiBpbnNlcnRCZXN0SW5zdGFsbG1lbnRJbmZvKG9yZGVyRm9ybSkge1xuICAgIGNvbnN0IHN1bW1hcnlUb3RhbGl6ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1bW1hcnktdG90YWxpemVycycpXG4gICAgaWYgKCFvcmRlckZvcm0gfHwgIXN1bW1hcnlUb3RhbGl6ZXJzKSB7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY3VzdG9tLWluc3RhbGxtZW50LWluZm8nKT8ucmVtb3ZlKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmN1c3RvbS1pbnN0YWxsbWVudC1pbmZvJylcbiAgICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnJlbW92ZSgpXG5cbiAgICBjb25zdCBpbnN0YWxsbWVudE9wdGlvbnMgPSBvcmRlckZvcm0/LnBheW1lbnREYXRhPy5pbnN0YWxsbWVudE9wdGlvbnM7XG4gICAgY29uc3QgaW5zdGFsbG1lbnRzID0gaW5zdGFsbG1lbnRPcHRpb25zPy5bMF0/Lmluc3RhbGxtZW50c1xuICAgIGlmICghaW5zdGFsbG1lbnRzIHx8IGluc3RhbGxtZW50cy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gICAgY29uc3QgYmVzdCA9IGluc3RhbGxtZW50c1tpbnN0YWxsbWVudHMubGVuZ3RoIC0gMV1cbiAgICBpZiAoIWJlc3QpIHJldHVyblxuXG4gICAgY29uc3QgdmFsdWVGb3JtYXR0ZWQgPSAoYmVzdC52YWx1ZSAvIDEwMCkudG9Mb2NhbGVTdHJpbmcoJ3B0LUJSJywge1xuICAgICAgc3R5bGU6ICdjdXJyZW5jeScsXG4gICAgICBjdXJyZW5jeTogJ0JSTCcsXG4gICAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG4gICAgICBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG4gICAgfSlcblxuICAgIGNvbnN0IGluc3RhbGxtZW50VGV4dCA9IGBvdSBlbSBhdMOpICR7YmVzdC5jb3VudH14IGRlICR7dmFsdWVGb3JtYXR0ZWR9YFxuXG4gICAgY29uc3QgaW5zdGFsbG1lbnRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgaW5zdGFsbG1lbnRFbC5jbGFzc05hbWUgPSAnY3VzdG9tLWluc3RhbGxtZW50LWluZm8nXG4gICAgaW5zdGFsbG1lbnRFbC5pbm5lclRleHQgPSBpbnN0YWxsbWVudFRleHRcblxuICAgIHN1bW1hcnlUb3RhbGl6ZXJzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGluc3RhbGxtZW50RWwsIHN1bW1hcnlUb3RhbGl6ZXJzLm5leHRTaWJsaW5nKVxuICB9XG5cbiAgZnVuY3Rpb24gd2FpdEZvclN1bW1hcnlUb3RhbGl6ZXJzQW5kSW5zZXJ0KG9yZGVyRm9ybSkge1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgY29uc3Qgc3VtbWFyeVRvdGFsaXplcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3VtbWFyeS10b3RhbGl6ZXJzJyk7XG4gICAgICBpZiAoc3VtbWFyeVRvdGFsaXplcnMpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIGluc2VydEJlc3RJbnN0YWxsbWVudEluZm8ob3JkZXJGb3JtKTtcbiAgICAgIH1cbiAgICB9LCAyMDApO1xuICAgIC8vIE9wY2lvbmFsOiB0aW1lb3V0IHBhcmEgbsOjbyByb2RhciBwYXJhIHNlbXByZVxuICAgIHNldFRpbWVvdXQoKCkgPT4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCksIDEwMDAwKTtcbiAgfVxuXG4gIGluc2VydFN0eWxlcygpXG5cbiAgdnRleGpzLmNoZWNrb3V0LmdldE9yZGVyRm9ybSgpLnRoZW4ob3JkZXJGb3JtID0+IHtcbiAgICB3YWl0Rm9yU3VtbWFyeVRvdGFsaXplcnNBbmRJbnNlcnQob3JkZXJGb3JtKVxuICB9KVxuXG4gICQod2luZG93KS5vbignb3JkZXJGb3JtVXBkYXRlZC52dGV4JywgZnVuY3Rpb24gKF8sIG9yZGVyRm9ybSkgeyAgXG4gICAgaW5zZXJ0U3R5bGVzKClcbiAgICB3YWl0Rm9yU3VtbWFyeVRvdGFsaXplcnNBbmRJbnNlcnQob3JkZXJGb3JtKVxuICB9KVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgKCkgPT4ge1xuICAgIHZ0ZXhqcy5jaGVja291dC5nZXRPcmRlckZvcm0oKS50aGVuKHdhaXRGb3JTdW1tYXJ5VG90YWxpemVyc0FuZEluc2VydClcbiAgfSlcbn0pO1xuIiwiaW1wb3J0IHdhaXRGb3JFbCBmcm9tIFwiLi4vaGVscGVycy93YWl0Rm9yRWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhlbXBsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXQoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2VsZWN0b3JzKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuaXRlbSk7XG4gICAgfVxuXG4gICAgYXN5bmMgc2VsZWN0b3JzKCkge1xuICAgICAgICB0aGlzLml0ZW0gPSBhd2FpdCB3YWl0Rm9yRWwoXG4gICAgICAgICAgICBcIi5zdW1tYXJ5LWNhcnQtdGVtcGxhdGUtaG9sZGVyIC5jYXJ0LWl0ZW1zXCJcbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBFeGVtcGxlRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50b3MoKTtcbiAgICB9XG4gICAgZXZlbnRvcygpIHtcbiAgICAgICAgJCh3aW5kb3cpLm9uKFwib3JkZXJGb3JtVXBkYXRlZC52dGV4XCIsIHRoaXMub25VcGRhdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25VcGRhdGUob3JkZXJGb3JtKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG9yZGVyRm9ybSk7XG4gICAgfVxufVxuIiwiKGZ1bmN0aW9uICgpIHtcbmZ1bmN0aW9uIHZlcmlmeUxvZ2dlZEluKCkge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24/Lmhhc2g7XG4gIFxuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgY29uc3Qgb3JkZXJGb3JtID0gdnRleGpzPy5jaGVja291dD8ub3JkZXJGb3JtO1xuICAgICAgY29uc3QgaXNMb2dnZWQgPSBvcmRlckZvcm0/LmxvZ2dlZEluO1xuICAgICAgaWYoaXNMb2dnZWQgIT09IHVuZGVmaW5lZCkgeyBcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7IFxuICBcbiAgICAgICAgaWYoIWlzTG9nZ2VkICYmIGhhc2guaW5jbHVkZXMoXCIvc2hpcHBpbmdcIikgfHwgaGFzaC5pbmNsdWRlcyhcIi9wYXltZW50XCIpKSB7XG4gICAgICAgICAgY2hlY2tvdXQubG9naW4oKTtcbiAgICAgICAgfSBcbiAgICAgIH1cbiAgICB9LCAxMDAwKVxuICB9XG4gIFxuICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgdmVyaWZ5TG9nZ2VkSW4oKTtcbiAgfSlcbiAgXG4gICQod2luZG93KS5vbihcImhhc2hjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIHZlcmlmeUxvZ2dlZEluKCk7XG4gIH0pXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHJlbmRlckNoZWNrb3V0U3RlcHMoKSB7XG4gICAgY29uc3QgYnJvd24gPSBcIiNEMkFFODJcIjsgICBcbiAgICBjb25zdCBkYXJrID0gXCIjMkQyRDI4XCI7ICAgIFxuICAgIGNvbnN0IHdoaXRlID0gXCIjZmZmXCI7XG4gICAgY29uc3QgY2lyY2xlU2l6ZSA9IDMyO1xuXG4gICAgY29uc3Qgc3RlcHMgPSBbJ0NhcnJpbmhvJywgJ0RhZG9zIFBlc3NvYWlzJywgJ0VudHJlZ2EnLCAnUGFnYW1lbnRvJ107XG5cbiAgICBsZXQgc3RlcHNIVE1MID0gYDxkaXYgY2xhc3M9XCJoZWFkZXItY2hlY2tvdXQtc3RlcHNcIiBzdHlsZT1cIndpZHRoOjEwMCU7bWFyZ2luOjE2cHggMCA0NHB4IDA7cG9zaXRpb246cmVsYXRpdmU7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtmb250LWZhbWlseTogJ01vbnRzZXJyYXQnLCBBcmlhbDtcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdGVwcy1mbGV4XCIgc3R5bGU9XCJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO3dpZHRoOjk1JTttYXJnaW46MCBhdXRvO3Bvc2l0aW9uOnJlbGF0aXZlO1wiPmA7XG5cbiAgICBzdGVwcy5mb3JFYWNoKCh0aXRsZSwgaSkgPT4ge1xuICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgIHN0ZXBzSFRNTCArPSBgPGRpdiBjbGFzcz1cImxpbmVcIiBzdHlsZT1cImZsZXg6MTtoZWlnaHQ6MnB4O2FsaWduLXNlbGY6Y2VudGVyO2JhY2tncm91bmQ6JHticm93bn07dHJhbnNpdGlvbjpiYWNrZ3JvdW5kIDAuMnM7bWluLXdpZHRoOjA7XCI+PC9kaXY+YDtcbiAgICAgIH1cbiAgICAgIHN0ZXBzSFRNTCArPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzdGVwLWNpcmNsZS13cmFwXCIgc3R5bGU9XCJkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtwb3NpdGlvbjpyZWxhdGl2ZTtcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RlcC1udW1iZXItY2lyY2xlXCIgaWQ9XCJjaXJjbGUtJHtpICsgMX1cIiBzdHlsZT1cIndpZHRoOiR7Y2lyY2xlU2l6ZX1weDtoZWlnaHQ6JHtjaXJjbGVTaXplfXB4O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlcjoycHggc29saWQgJHticm93bn07YmFja2dyb3VuZDoke3doaXRlfTtjb2xvcjoke2Jyb3dufTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC13ZWlnaHQ6NDAwO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE0cHg7bGV0dGVyLXNwYWNpbmc6MCU7Zm9udC1mYW1pbHk6J01vbnRzZXJyYXQnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjQwMDt0cmFuc2l0aW9uOmFsbCAwLjJzO3otaW5kZXg6MTtcIj4ke2kgKyAxfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGVwLXRpdGxlXCIgaWQ9XCJsYWJlbC0ke2kgKyAxfVwiIHN0eWxlPVwicG9zaXRpb246YWJzb2x1dGU7dG9wOjM4cHg7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSk7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTRweDtjb2xvcjoke2Jyb3dufTtmb250LXdlaWdodDo0MDA7bGV0dGVyLXNwYWNpbmc6MCU7Zm9udC1mYW1pbHk6J01vbnRzZXJyYXQnLCBzYW5zLXNlcmlmO3ZlcnRpY2FsLWFsaWduOm1pZGRsZTt0cmFuc2l0aW9uOmNvbG9yIDAuMnM7JHtpID09PSAxID8gJ3doaXRlLXNwYWNlOm5vd3JhcDsnIDogJyd9XCI+JHt0aXRsZX08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBgO1xuICAgIH0pO1xuXG4gICAgc3RlcHNIVE1MICs9IGA8L2Rpdj48L2Rpdj5gO1xuXG4gICAgY29uc3QgaGVhZGVyQ2hlY2tvdXRDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVhZGVyQ2hlY2tvdXQgLmNvbnRhaW5lcicpO1xuICAgIGNvbnN0IGV4aXN0aW5nU3RlcEJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXItY2hlY2tvdXQtc3RlcHMnKTtcbiAgICBpZiAoZXhpc3RpbmdTdGVwQmFyKSBleGlzdGluZ1N0ZXBCYXIucmVtb3ZlKCk7XG4gICAgaWYgKGhlYWRlckNoZWNrb3V0Q29udGFpbmVyKSB7XG4gICAgICBoZWFkZXJDaGVja291dENvbnRhaW5lci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIHN0ZXBzSFRNTCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3RlcHNIYXNoID0gW1wiL2NoZWNrb3V0Iy9jYXJ0XCIsIFwiL2NoZWNrb3V0Iy9wcm9maWxlXCIsIFwiL2NoZWNrb3V0Iy9zaGlwcGluZ1wiLCBcIi9jaGVja291dCMvcGF5bWVudFwiXTtcbiAgY29uc3QgdXJsTWFwcGluZyA9IHtcbiAgICBcIi9jaGVja291dCMvZW1haWxcIjogXCIvY2hlY2tvdXQjL3Byb2ZpbGVcIlxuICB9O1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZVByb2dyZXNzKCkge1xuICAgIGNvbnN0IGJyb3duID0gXCIjRDJBRTgyXCI7XG4gICAgY29uc3QgZGFyayA9IFwiIzJEMkQyOFwiO1xuICAgIGNvbnN0IHdoaXRlID0gXCIjZmZmXCI7XG5cbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgY29uc3QgZnVsbFBhdGggPSBgL2NoZWNrb3V0JHtoYXNofWA7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSB1cmxNYXBwaW5nW2Z1bGxQYXRoXSB8fCBmdWxsUGF0aDtcbiAgICBjb25zdCBjdXJyZW50U3RlcEluZGV4ID0gc3RlcHNIYXNoLmluZGV4T2Yobm9ybWFsaXplZFBhdGgpO1xuICAgIGlmIChjdXJyZW50U3RlcEluZGV4ID09PSAtMSkgcmV0dXJuO1xuXG4gICAgLy8gQm9saW5oYXMgZSB0ZXh0b3NcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgY29uc3QgY2lyY2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGNpcmNsZS0ke2kgKyAxfWApO1xuICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgbGFiZWwtJHtpICsgMX1gKTtcbiAgICAgIGlmICghY2lyY2xlIHx8ICFsYWJlbCkgY29udGludWU7XG4gICAgICBjaXJjbGUuc3R5bGUuYmFja2dyb3VuZCA9IHdoaXRlO1xuICAgICAgY2lyY2xlLnN0eWxlLmNvbG9yID0gYnJvd247XG4gICAgICBjaXJjbGUuc3R5bGUuYm9yZGVyQ29sb3IgPSBicm93bjtcbiAgICAgIGxhYmVsLnN0eWxlLmNvbG9yID0gYnJvd247XG4gICAgICBsYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gXCI0MDBcIjtcblxuICAgICAgaWYgKGkgPD0gY3VycmVudFN0ZXBJbmRleCkge1xuICAgICAgICBjaXJjbGUuc3R5bGUuYmFja2dyb3VuZCA9IGRhcms7XG4gICAgICAgIGNpcmNsZS5zdHlsZS5jb2xvciA9IHdoaXRlO1xuICAgICAgICBjaXJjbGUuc3R5bGUuYm9yZGVyQ29sb3IgPSBkYXJrO1xuICAgICAgICBsYWJlbC5zdHlsZS5jb2xvciA9IGRhcms7XG4gICAgICAgIGxhYmVsLnN0eWxlLmZvbnRXZWlnaHQgPSBcIjcwMFwiO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGxpbmVFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5saW5lJyk7XG4gICAgbGluZUVsZW1lbnRzLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaW5kZXggPCBjdXJyZW50U3RlcEluZGV4KSB7XG4gICAgICAgIGxpbmUuc3R5bGUuYmFja2dyb3VuZCA9IGRhcms7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaW5lLnN0eWxlLmJhY2tncm91bmQgPSBicm93bjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHtcbiAgICBjb25zdCBzdGVwQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlYWRlci1jaGVja291dC1zdGVwcycpO1xuICAgIGlmIChzdGVwQmFyKSBzdGVwQmFyLnJlbW92ZSgpO1xuICAgIHJlbmRlckNoZWNrb3V0U3RlcHMoKTtcbiAgICB1cGRhdGVQcm9ncmVzcygpO1xuICB9KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgIHJlbmRlckNoZWNrb3V0U3RlcHMoKTtcbiAgICB1cGRhdGVQcm9ncmVzcygpO1xuICB9KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgdXBkYXRlUHJvZ3Jlc3MpO1xuXG4gICQod2luZG93KS5vbignb3JkZXJGb3JtVXBkYXRlZC52dGV4JywgZnVuY3Rpb24gKGV2dCwgb3JkZXJGb3JtKSB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoID09PSAnIy9zaGlwcGluZycpIHtcbiAgICB9XG4gIH0pO1xuXG4gIHJlbmRlckNoZWNrb3V0U3RlcHMoKTtcbiAgdXBkYXRlUHJvZ3Jlc3MoKTtcblxufSkoKTtcbiIsImV4cG9ydCBjb25zdCBpc1NtYWxsZXJUaGVuNzY4ID0gd2luZG93Lm1hdGNoTWVkaWEoXCIobWF4LXdpZHRoOjc2OHB4KVwiKS5tYXRjaGVzO1xuIiwiLyoqXG4gKiBBbHRlcmEgYXMgZGltZW7Dp8O1ZXMgZXNwZWNpZmljYWRhcyBuYSB1cmwgZGEgaW1nXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjIHVybCBkYSBpbWFnZW0gbmEgVlRFWFxuICogQHBhcmFtIHtpbnR9IHdpZHRoXG4gKiBAcGFyYW0ge2ludH0gaGVpZ2h0XG4gKiBAcmV0dXJuIHtzdHJpbmd9IHVybCBkYSBpbWFnZW0gY29tIG8gdGFtYW5obyBhbHRlcmFkb1xuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhbHRlcmFyVGFtYW5ob0ltYWdlbVNyY1Z0ZXgoc3JjLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgaWYgKHR5cGVvZiBzcmMgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJQYXJhbWV0cm8gJ3NyYycgbsOjbyByZWNlYmlkby5cIik7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3aWR0aCA9IHR5cGVvZiB3aWR0aCA9PSBcInVuZGVmaW5lZFwiID8gMSA6IHdpZHRoO1xuICAgIGhlaWdodCA9IHR5cGVvZiBoZWlnaHQgPT0gXCJ1bmRlZmluZWRcIiA/IHdpZHRoIDogaGVpZ2h0O1xuXG4gICAgc3JjID0gc3JjLnJlcGxhY2UoXG4gICAgICAgIC9cXC8oXFxkKykoLShcXGQrLVxcZCspfChfXFxkKykpXFwvL2csXG4gICAgICAgIFwiLyQxLVwiICsgd2lkdGggKyBcIi1cIiArIGhlaWdodCArIFwiL1wiXG4gICAgKTtcbiAgICByZXR1cm4gc3JjO1xufVxuXG4vKipcbiAqIE9idGVtIFByZWNvXG4gKiBjYXNvIG8gcHJlY28gcmVjZWJpZG8gc2VqYSB1bSBGbG9hdCBvdSBpbnQsXG4gKiBcdCdFeC4nOiAxMC4yIC0+JzEwLDIwJ1xuICogUmVjZWJlbmRvIHVtYSBzdHJpbmcgbyB2YWxvciBzZXJhIHJldG9ybmFkbyBjb21vIHVtIGZsb2F0XG4gKiBcdCdFeC4nOiAnUiQxLjIzNCwzMCcgLT4gMTIzNC4zXG4gKiBAcGFyYW0gIHtGbG9hdFpzdHJpbmd9IHByaWNlIHByZcOnb1xuICogQHJldHVybiB7W3R5cGVdfSAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmljZShwcmljZSkge1xuICAgIGlmICghcHJpY2UpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgaWYgKGlzTmFOKHByaWNlKSkge1xuICAgICAgICBsZXQgbmV3UHJpY2UgPSBwYXJzZUZsb2F0KFxuICAgICAgICAgICAgcHJpY2UucmVwbGFjZShcIlIkXCIsIFwiXCIpLnJlcGxhY2UoXCIuXCIsIFwiXCIpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gbmV3UHJpY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJpY2UgPSBwcmljZSB8fCAwO1xuICAgICAgICBwcmljZSA9IHByaWNlLnRvTG9jYWxlU3RyaW5nKFwicHQtQlJcIiwge1xuICAgICAgICAgICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuICAgICAgICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcHJpY2U7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0Q3VycmVuY3koKSB7XG4gICAgcmV0dXJuIE51bWJlcih2YWx1ZSkudG9Mb2NhbGVTdHJpbmcoXCJwdC1CUlwiLCB7XG4gICAgICAgIHN0eWxlOiBcImN1cnJlbmN5XCIsXG4gICAgICAgIGN1cnJlbmN5OiBcIkJSTFwiLFxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2J0ZXJDYW5uYWxEZVZlbmRhcygpIHtcbiAgICB2YXIgbmFtZSA9IFwiVlRFWFNDPXNjPVwiO1xuICAgIHZhciBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdChcIjtcIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IGNhW2ldO1xuICAgICAgICB3aGlsZSAoYy5jaGFyQXQoMCkgPT0gXCIgXCIpIGMgPSBjLnN1YnN0cmluZygxKTtcbiAgICAgICAgaWYgKGMuaW5kZXhPZihuYW1lKSA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gYy5zdWJzdHJpbmcobmFtZS5sZW5ndGgsIGMubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gMTtcbn1cbiIsIi8qKlxuICogRXNwZXJhIHVtIGVsZW1lbnRvIGV4aXRpciBubyBkb20gZSBleGVjdXRhIG8gY2FsbGJhY2tcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3Igc2VsZXRvciBkbyBlbGVtZW50byBxdWUgZGVqZXNhIGVzcGVyYXIgcGVsYSBjcmlhw6fDo29cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIEZ1bsOnw6NvIGEgc2VyIGV4ZWN1dGFkYSBxdWFuZG8gdGFsIGVsZW1lbnRvIGV4aXN0aXJcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3YWl0Rm9yRWwoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgaWYgKGpRdWVyeShzZWxlY3RvcikubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXNvbHZlKGpRdWVyeShzZWxlY3RvcikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2FpdEZvckVsKHNlbGVjdG9yLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBQdWJTdWIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcclxuICAgIH1cclxuICAgIHN1YnNjcmliZShldmVudCwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50KSkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzW2V2ZW50XS5wdXNoKGNhbGxiYWNrKTtcclxuICAgIH1cclxuICAgIHB1Ymxpc2goZXZlbnQsIGRhdGEgPSB7fSkge1xyXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzW2V2ZW50XS5tYXAoKGNhbGxiYWNrKSA9PiBjYWxsYmFjayhldmVudCwgZGF0YSkpO1xyXG4gICAgfVxyXG4gICAgdW5zdWJzY3JpYmUoZXZlbnQsIGNiKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gdGhpcy5ldmVudHNbZXZlbnRdLmZpbHRlcigoZm4pID0+IGZuICE9PSBjYik7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUhWaVUzVmlMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMM0JoWTJ0aFoyVnpMMU4wWVhSbFRXRnVZV2RsY2k5UWRXSlRkV0l1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRTlCUVU4c1QwRkJUeXhOUVVGTk8wbEJRVE5DTzFGQlExTXNWMEZCVFN4SFFVRlpMRVZCUVVVc1EwRkJRenRKUVcxQ09VSXNRMEZCUXp0SlFXcENUeXhUUVVGVExFTkJRVU1zUzBGQllTeEZRVUZGTEZGQlFXdENPMUZCUTJwRUxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMR05CUVdNc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJUdFpRVU4yUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0VFFVTjRRanRSUVVORUxFOUJRVThzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdTVUZETVVNc1EwRkJRenRKUVVWTkxFOUJRVThzUTBGQlF5eExRVUZoTEVWQlFVVXNTVUZCU1N4SFFVRkhMRVZCUVVVN1VVRkRkRU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTzFsQlEzWkRMRTlCUVU4c1JVRkJSU3hEUVVGRE8xTkJRMVk3VVVGRFJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRVZCUVVVc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRjRVVzUTBGQlF6dEpRVVZOTEZkQlFWY3NRMEZCUXl4TFFVRmhMRVZCUVVVc1JVRkJXVHRSUVVNM1F5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRXRCUVVzc1JVRkJSU3hEUVVGRExFTkJRVU03U1VGRGJrVXNRMEZCUXp0RFFVTkVJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpWlhod2IzSjBJR1JsWm1GMWJIUWdZMnhoYzNNZ1VIVmlVM1ZpSUh0Y2JseDBjSEpwZG1GMFpTQmxkbVZ1ZEhNNklFbEZkbVZ1ZEhNZ1BTQjdmVHRjYmx4dVhIUndkV0pzYVdNZ2MzVmljMk55YVdKbEtHVjJaVzUwT2lCemRISnBibWNzSUdOaGJHeGlZV05yT2lCR2RXNWpkR2x2YmlrZ2UxeHVYSFJjZEdsbUlDZ2hkR2hwY3k1bGRtVnVkSE11YUdGelQzZHVVSEp2Y0dWeWRIa29aWFpsYm5RcEtTQjdYRzVjZEZ4MFhIUjBhR2x6TG1WMlpXNTBjMXRsZG1WdWRGMGdQU0JiWFR0Y2JseDBYSFI5WEc1Y2RGeDBjbVYwZFhKdUlIUm9hWE11WlhabGJuUnpXMlYyWlc1MFhTNXdkWE5vS0dOaGJHeGlZV05yS1R0Y2JseDBmVnh1WEc1Y2RIQjFZbXhwWXlCd2RXSnNhWE5vS0dWMlpXNTBPaUJ6ZEhKcGJtY3NJR1JoZEdFZ1BTQjdmU2tnZTF4dVhIUmNkR2xtSUNnaGRHaHBjeTVsZG1WdWRITXVhR0Z6VDNkdVVISnZjR1Z5ZEhrb1pYWmxiblFwS1NCN1hHNWNkRngwWEhSeVpYUjFjbTRnVzEwN1hHNWNkRngwZlZ4dVhIUmNkSEpsZEhWeWJpQjBhR2x6TG1WMlpXNTBjMXRsZG1WdWRGMHViV0Z3S0NoallXeHNZbUZqYXlrZ1BUNGdZMkZzYkdKaFkyc29aWFpsYm5Rc0lHUmhkR0VwS1R0Y2JseDBmVnh1WEc1Y2RIQjFZbXhwWXlCMWJuTjFZbk5qY21saVpTaGxkbVZ1ZERvZ2MzUnlhVzVuTENCallqb2dSblZ1WTNScGIyNHBPaUIyYjJsa0lIdGNibHgwWEhSMGFHbHpMbVYyWlc1MGMxdGxkbVZ1ZEYwZ1BTQjBhR2x6TG1WMlpXNTBjMXRsZG1WdWRGMHVabWxzZEdWeUtDaG1iaWtnUFQ0Z1ptNGdJVDA5SUdOaUtUdGNibHgwZlZ4dWZWeHVYRzVwYm5SbGNtWmhZMlVnU1VWMlpXNTBjeUI3WEc1Y2RGdHJaWGs2SUhOMGNtbHVaMTA2SUVaMWJtTjBhVzl1VzEwN1hHNTlYRzRpWFgwPSIsImltcG9ydCBQdWJTdWIgZnJvbSBcIi4vUHViU3ViXCI7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JlIHtcclxuICAgIGNvbnN0cnVjdG9yKHsgbW9kdWxlTmFtZSwgYWN0aW9ucywgbXV0YXRpb25zLCBzdGF0ZSB9KSB7XHJcbiAgICAgICAgdGhpcy5hY3Rpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgYWN0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5tdXRhdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBtdXRhdGlvbnMpO1xyXG4gICAgICAgIHRoaXMubW9kdWxlID0gbW9kdWxlTmFtZSB8fCBcInN0b3JlXCI7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBcImRlZmF1bHQgc3RhdGVcIjtcclxuICAgICAgICB0aGlzLmV2ZW50cyA9IG5ldyBQdWJTdWIoKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gbmV3IFByb3h5KE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKSB8fCB7fSwge1xyXG4gICAgICAgICAgICBzZXQ6IChzdGF0ZSwga2V5LCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3RhdGVba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYG1vZHVsZTogJHt0aGlzLm1vZHVsZX0gc3RhdGVDaGFuZ2U6ICR7a2V5fTpgLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50cy5wdWJsaXNoKFwic3RhdGVDaGFuZ2VcIiwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50cy5wdWJsaXNoKGBzdGF0ZUNoYW5nZToke2tleX1gLCB0aGlzLnN0YXRlKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyAhPT0gXCJtdXRhdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFlvdSBzaG91bGQgdXNlIGEgbXV0YXRpb24gdG8gc2V0ICR7a2V5fWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBcInJlc3RpbmdcIjtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZGlzcGF0Y2goYWN0aW9uS2V5LCBwYXlsb2FkKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFjdGlvbnNbYWN0aW9uS2V5XSAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBY3Rpb24gXCIke2FjdGlvbktleX0gZG9lc24ndCBleGlzdC5gKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZyhgQUNUSU9OOiAke2FjdGlvbktleX1gKTtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IFwiYWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5hY3Rpb25zW2FjdGlvbktleV0odGhpcywgcGF5bG9hZCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjb21taXQobXV0YXRpb25LZXksIHBheWxvYWQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMubXV0YXRpb25zW211dGF0aW9uS2V5XSAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNdXRhdGlvbiBcIiR7bXV0YXRpb25LZXl9XCIgZG9lc24ndCBleGlzdGApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gXCJtdXRhdGlvblwiO1xyXG4gICAgICAgIGxldCBuZXdTdGF0ZSA9IHRoaXMubXV0YXRpb25zW211dGF0aW9uS2V5XSh0aGlzLnN0YXRlLCBwYXlsb2FkKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVTNSdmNtVXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTh1TGk5emNtTXZjR0ZqYTJGblpYTXZVM1JoZEdWTllXNWhaMlZ5TDFOMGIzSmxMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFOUJRVThzVFVGQlRTeE5RVUZOTEZWQlFWVXNRMEZCUXp0QlFVVTVRaXhOUVVGTkxFTkJRVU1zVDBGQlR5eFBRVUZQTEV0QlFVczdTVUZSZWtJc1dVRkJXU3hGUVVGRkxGVkJRVlVzUlVGQlJTeFBRVUZQTEVWQlFVVXNVMEZCVXl4RlFVRkZMRXRCUVVzc1JVRkJhMEk3VVVGRGNFVXNTVUZCU1N4RFFVRkRMRTlCUVU4c2NVSkJRVkVzVDBGQlR5eERRVUZGTEVOQlFVTTdVVUZET1VJc1NVRkJTU3hEUVVGRExGTkJRVk1zY1VKQlFWRXNVMEZCVXl4RFFVRkZMRU5CUVVNN1VVRkRiRU1zU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4VlFVRlZMRWxCUVVrc1QwRkJUeXhEUVVGRE8xRkJRM0JETEVsQlFVa3NRMEZCUXl4TlFVRk5MRWRCUVVjc1pVRkJaU3hEUVVGRE8xRkJRemxDTEVsQlFVa3NRMEZCUXl4TlFVRk5MRWRCUVVjc1NVRkJTU3hOUVVGTkxFVkJRVVVzUTBGQlF6dFJRVVV6UWl4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExFbEJRVWtzUzBGQlN5eERRVUZKTEd0Q1FVRkxMRXRCUVVzc1MwRkJUU3hGUVVGRkxFVkJRVVU3V1VGRE4wTXNSMEZCUnl4RlFVRkZMRU5CUVVNc1MwRkJWU3hGUVVGRkxFZEJRVmNzUlVGQlJTeExRVUZWTEVWQlFVVXNSVUZCUlR0blFrRkROVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJRenRuUWtGRGJrSXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkRWaXhYUVVGWExFbEJRVWtzUTBGQlF5eE5RVUZOTEdsQ1FVRnBRaXhIUVVGSExFZEJRVWNzUlVGRE4wTXNTMEZCU3l4RFFVTk1MRU5CUVVNN1owSkJRMFlzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1lVRkJZU3hGUVVGRkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0blFrRkRMME1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1pVRkJaU3hIUVVGSExFVkJRVVVzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1owSkJRM1JFTEVsQlFVa3NTVUZCU1N4RFFVRkRMRTFCUVUwc1MwRkJTeXhWUVVGVkxFVkJRVVU3YjBKQlF5OUNMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zYjBOQlFXOURMRWRCUVVjc1JVRkJSU3hEUVVGRExFTkJRVU03YVVKQlEzWkVPMmRDUVVORUxFbEJRVWtzUTBGQlF5eE5RVUZOTEVkQlFVY3NVMEZCVXl4RFFVRkRPMmRDUVVONFFpeFBRVUZQTEVsQlFVa3NRMEZCUXp0WlFVTmlMRU5CUVVNN1UwRkRSQ3hEUVVGRExFTkJRVU03U1VGRFNpeERRVUZETzBsQlJVMHNVVUZCVVN4RFFVRkRMRk5CUVdsQ0xFVkJRVVVzVDBGQldUdFJRVU01UXl4SlFVRkpMRTlCUVU4c1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4VlFVRlZMRVZCUVVVN1dVRkRiRVFzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4WFFVRlhMRk5CUVZNc2FVSkJRV2xDTEVOQlFVTXNRMEZCUXp0WlFVTnVSQ3hQUVVGUExFdEJRVXNzUTBGQlF6dFRRVU5pTzFGQlEwUXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGWExGTkJRVk1zUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEY0VNc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTTdVVUZEZGtJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRGRrTXNUMEZCVHl4SlFVRkpMRU5CUVVNN1NVRkRZaXhEUVVGRE8wbEJSVTBzVFVGQlRTeERRVUZETEZkQlFXMUNMRVZCUVVVc1QwRkJXVHRSUVVNNVF5eEpRVUZKTEU5QlFVOHNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhYUVVGWExFTkJRVU1zUzBGQlN5eFZRVUZWTEVWQlFVVTdXVUZEZEVRc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eGhRVUZoTEZkQlFWY3NhVUpCUVdsQ0xFTkJRVU1zUTBGQlF6dFpRVU4yUkN4UFFVRlBMRXRCUVVzc1EwRkJRenRUUVVOaU8xRkJRMFFzU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4VlFVRlZMRU5CUVVNN1VVRkRla0lzU1VGQlNTeFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8xRkJRMmhGTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJRMnBFTEU5QlFVOHNTVUZCU1N4RFFVRkRPMGxCUTJJc1EwRkJRenREUVVORUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lhVzF3YjNKMElGQjFZbE4xWWlCbWNtOXRJRndpTGk5UWRXSlRkV0pjSWp0Y2JseHVaWGh3YjNKMElHUmxabUYxYkhRZ1kyeGhjM01nVTNSdmNtVThWQ0JsZUhSbGJtUnpJRzlpYW1WamRENGdlMXh1WEhSd2NtbDJZWFJsSUdGamRHbHZibk02SUZKbFkyOXlaRHh6ZEhKcGJtY3NJQ2h6ZEc5eVpUb2dVM1J2Y21VOFZENHNJSEJoZVd4dllXUTZJR0Z1ZVNrZ1BUNGdkbTlwWkQ0N1hHNWNkSEJ5YVhaaGRHVWdiWFYwWVhScGIyNXpPaUJTWldOdmNtUThjM1J5YVc1bkxDQW9jM1JoZEdVNklGUXNJSEJoZVd4dllXUTZJR0Z1ZVNrZ1BUNGdWRDQ3WEc1Y2RIQnlhWFpoZEdVZ2JXOWtkV3hsT2lCemRISnBibWM3WEc1Y2RIQnlhWFpoZEdVZ2MzUmhkSFZ6T2lCY0ltMTFkR0YwYVc5dVhDSWdmQ0JjSW1GamRHbHZibHdpSUh3Z1hDSnlaWE4wYVc1blhDSWdmQ0JjSW1SbFptRjFiSFFnYzNSaGRHVmNJanRjYmx4MGNIVmliR2xqSUdWMlpXNTBjem9nVUhWaVUzVmlPMXh1WEhSd2RXSnNhV01nYzNSaGRHVTZJRlE3WEc1Y2JseDBZMjl1YzNSeWRXTjBiM0lvZXlCdGIyUjFiR1ZPWVcxbExDQmhZM1JwYjI1ekxDQnRkWFJoZEdsdmJuTXNJSE4wWVhSbElIMDZJRk4wYjNKbFVHRnlZVzF6UEZRK0tTQjdYRzVjZEZ4MGRHaHBjeTVoWTNScGIyNXpJRDBnZXlBdUxpNWhZM1JwYjI1eklIMDdYRzVjZEZ4MGRHaHBjeTV0ZFhSaGRHbHZibk1nUFNCN0lDNHVMbTExZEdGMGFXOXVjeUI5TzF4dVhIUmNkSFJvYVhNdWJXOWtkV3hsSUQwZ2JXOWtkV3hsVG1GdFpTQjhmQ0JjSW5OMGIzSmxYQ0k3WEc1Y2RGeDBkR2hwY3k1emRHRjBkWE1nUFNCY0ltUmxabUYxYkhRZ2MzUmhkR1ZjSWp0Y2JseDBYSFIwYUdsekxtVjJaVzUwY3lBOUlHNWxkeUJRZFdKVGRXSW9LVHRjYmx4dVhIUmNkSFJvYVhNdWMzUmhkR1VnUFNCdVpYY2dVSEp2ZUhrOFZENG9leUF1TGk1emRHRjBaU0I5SUh4OElIdDlMQ0I3WEc1Y2RGeDBYSFJ6WlhRNklDaHpkR0YwWlRvZ1lXNTVMQ0JyWlhrNklITjBjbWx1Wnl3Z2RtRnNkV1U2SUdGdWVTa2dQVDRnZTF4dVhIUmNkRngwWEhSemRHRjBaVnRyWlhsZElEMGdkbUZzZFdVN1hHNWNkRngwWEhSY2RHTnZibk52YkdVdWJHOW5LRnh1WEhSY2RGeDBYSFJjZEdCdGIyUjFiR1U2SUNSN2RHaHBjeTV0YjJSMWJHVjlJSE4wWVhSbFEyaGhibWRsT2lBa2UydGxlWDA2WUN4Y2JseDBYSFJjZEZ4MFhIUjJZV3gxWlZ4dVhIUmNkRngwWEhRcE8xeHVYSFJjZEZ4MFhIUjBhR2x6TG1WMlpXNTBjeTV3ZFdKc2FYTm9LRndpYzNSaGRHVkRhR0Z1WjJWY0lpd2dkR2hwY3k1emRHRjBaU2s3WEc1Y2RGeDBYSFJjZEhSb2FYTXVaWFpsYm5SekxuQjFZbXhwYzJnb1lITjBZWFJsUTJoaGJtZGxPaVI3YTJWNWZXQXNJSFJvYVhNdWMzUmhkR1VwTzF4dVhIUmNkRngwWEhScFppQW9kR2hwY3k1emRHRjBkWE1nSVQwOUlGd2liWFYwWVhScGIyNWNJaWtnZTF4dVhIUmNkRngwWEhSY2RHTnZibk52YkdVdWJHOW5LR0JaYjNVZ2MyaHZkV3hrSUhWelpTQmhJRzExZEdGMGFXOXVJSFJ2SUhObGRDQWtlMnRsZVgxZ0tUdGNibHgwWEhSY2RGeDBmVnh1WEhSY2RGeDBYSFIwYUdsekxuTjBZWFIxY3lBOUlGd2ljbVZ6ZEdsdVoxd2lPMXh1WEhSY2RGeDBYSFJ5WlhSMWNtNGdkSEoxWlR0Y2JseDBYSFJjZEgwc1hHNWNkRngwZlNrN1hHNWNkSDFjYmx4dVhIUndkV0pzYVdNZ1pHbHpjR0YwWTJnb1lXTjBhVzl1UzJWNU9pQnpkSEpwYm1jc0lIQmhlV3h2WVdRNklHRnVlU2s2SUdKdmIyeGxZVzRnZTF4dVhIUmNkR2xtSUNoMGVYQmxiMllnZEdocGN5NWhZM1JwYjI1elcyRmpkR2x2Ymt0bGVWMGdJVDA5SUZ3aVpuVnVZM1JwYjI1Y0lpa2dlMXh1WEhSY2RGeDBZMjl1YzI5c1pTNXNiMmNvWUVGamRHbHZiaUJjSWlSN1lXTjBhVzl1UzJWNWZTQmtiMlZ6YmlkMElHVjRhWE4wTG1BcE8xeHVYSFJjZEZ4MGNtVjBkWEp1SUdaaGJITmxPMXh1WEhSY2RIMWNibHgwWEhSamIyNXpiMnhsTG14dlp5aGdRVU5VU1U5T09pQWtlMkZqZEdsdmJrdGxlWDFnS1R0Y2JseDBYSFIwYUdsekxuTjBZWFIxY3lBOUlGd2lZV04wYVc5dVhDSTdYRzVjZEZ4MGRHaHBjeTVoWTNScGIyNXpXMkZqZEdsdmJrdGxlVjBvZEdocGN5d2djR0Y1Ykc5aFpDazdYRzVjZEZ4MGNtVjBkWEp1SUhSeWRXVTdYRzVjZEgxY2JseHVYSFJ3ZFdKc2FXTWdZMjl0YldsMEtHMTFkR0YwYVc5dVMyVjVPaUJ6ZEhKcGJtY3NJSEJoZVd4dllXUTZJR0Z1ZVNrNklHSnZiMnhsWVc0Z2UxeHVYSFJjZEdsbUlDaDBlWEJsYjJZZ2RHaHBjeTV0ZFhSaGRHbHZibk5iYlhWMFlYUnBiMjVMWlhsZElDRTlQU0JjSW1aMWJtTjBhVzl1WENJcElIdGNibHgwWEhSY2RHTnZibk52YkdVdWJHOW5LR0JOZFhSaGRHbHZiaUJjSWlSN2JYVjBZWFJwYjI1TFpYbDlYQ0lnWkc5bGMyNG5kQ0JsZUdsemRHQXBPMXh1WEhSY2RGeDBjbVYwZFhKdUlHWmhiSE5sTzF4dVhIUmNkSDFjYmx4MFhIUjBhR2x6TG5OMFlYUjFjeUE5SUZ3aWJYVjBZWFJwYjI1Y0lqdGNibHgwWEhSc1pYUWdibVYzVTNSaGRHVWdQU0IwYUdsekxtMTFkR0YwYVc5dWMxdHRkWFJoZEdsdmJrdGxlVjBvZEdocGN5NXpkR0YwWlN3Z2NHRjViRzloWkNrN1hHNWNkRngwZEdocGN5NXpkR0YwWlNBOUlFOWlhbVZqZEM1aGMzTnBaMjRvZEdocGN5NXpkR0YwWlN3Z2JtVjNVM1JoZEdVcE8xeHVYSFJjZEhKbGRIVnliaUIwY25WbE8xeHVYSFI5WEc1OVhHNWNibVY0Y0c5eWRDQnBiblJsY21aaFkyVWdVM1J2Y21WUVlYSmhiWE04VkNCbGVIUmxibVJ6SUc5aWFtVmpkRDRnZTF4dVhIUnRiMlIxYkdWT1lXMWxPaUJ6ZEhKcGJtYzdYRzVjYmx4MFlXTjBhVzl1Y3pvZ1VtVmpiM0prUEhOMGNtbHVaeXdnS0hOMGIzSmxPaUJUZEc5eVpUeFVQaXdnY0dGNWJHOWhaRG9nWVc1NUtTQTlQaUIyYjJsa1BqdGNibHh1WEhSdGRYUmhkR2x2Ym5NNklGSmxZMjl5WkR4emRISnBibWNzSUNoemRHRjBaVG9nVkN3Z2NHRjViRzloWkRvZ1lXNTVLU0E5UGlCVVBqdGNibHh1WEhSemRHRjBaVG9nVkR0Y2JuMWNiaUpkZlE9PSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1lcmdlU3RvcmVzKC4uLnN0b3Jlc09iaikge1xyXG4gICAgY29uc3Qgc3RvcmUgPSB7fTtcclxuICAgIHN0b3Jlc09iai5mb3JFYWNoKChzKSA9PiB7XHJcbiAgICAgICAgc3RvcmUuc3RhdGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHN0b3JlLnN0YXRlKSwgcy5zdGF0ZSk7XHJcbiAgICAgICAgc3RvcmUubXV0YXRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBzdG9yZS5tdXRhdGlvbnMpLCBzLm11dGF0aW9ucyk7XHJcbiAgICAgICAgc3RvcmUuYWN0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgc3RvcmUuYWN0aW9ucyksIHMuYWN0aW9ucyk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzdG9yZTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liV1Z5WjJWVGRHOXlaWE11YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12Y0dGamEyRm5aWE12VTNSaGRHVk5ZVzVoWjJWeUwyMWxjbWRsVTNSdmNtVnpMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVWQkxFMUJRVTBzUTBGQlF5eFBRVUZQTEZWQlFWVXNWMEZCVnl4RFFVRkRMRWRCUVVjc1UwRkJOa0k3U1VGRGJrVXNUVUZCVFN4TFFVRkxMRWRCUVRKQ0xFVkJRVVVzUTBGQlF6dEpRVU42UXl4VFFVRlRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVTdVVUZEZGtJc1MwRkJTeXhEUVVGRExFdEJRVXNzYlVOQlFWRXNTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJTeXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZGTEVOQlFVTTdVVUZETjBNc1MwRkJTeXhEUVVGRExGTkJRVk1zYlVOQlFWRXNTMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJTeXhEUVVGRExFTkJRVU1zVTBGQlV5eERRVUZGTEVOQlFVTTdVVUZEZWtRc1MwRkJTeXhEUVVGRExFOUJRVThzYlVOQlFWRXNTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJTeXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZGTEVOQlFVTTdTVUZEY0VRc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRlNDeFBRVUZQTEV0QlFVc3NRMEZCUXp0QlFVTmtMRU5CUVVNaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SnBiWEJ2Y25RZ2V5QlRkRzl5WlZCaGNtRnRjeUI5SUdaeWIyMGdYQ0l1TDFOMGIzSmxYQ0k3WEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdaMWJtTjBhVzl1SUcxbGNtZGxVM1J2Y21WektDNHVMbk4wYjNKbGMwOWlham9nVTNSdmNtVlFZWEpoYlhNOFlXNTVQbHRkS1NCN1hHNWNkR052Ym5OMElITjBiM0psT2lCVGRHOXlaVkJoY21GdGN6eGhibmsrSUh3Z1lXNTVJRDBnZTMwN1hHNWNkSE4wYjNKbGMwOWlhaTVtYjNKRllXTm9LQ2h6S1NBOVBpQjdYRzVjZEZ4MGMzUnZjbVV1YzNSaGRHVWdQU0I3SUM0dUxuTjBiM0psTG5OMFlYUmxMQ0F1TGk1ekxuTjBZWFJsSUgwN1hHNWNkRngwYzNSdmNtVXViWFYwWVhScGIyNXpJRDBnZXlBdUxpNXpkRzl5WlM1dGRYUmhkR2x2Ym5Nc0lDNHVMbk11YlhWMFlYUnBiMjV6SUgwN1hHNWNkRngwYzNSdmNtVXVZV04wYVc5dWN5QTlJSHNnTGk0dWMzUnZjbVV1WVdOMGFXOXVjeXdnTGk0dWN5NWhZM1JwYjI1eklIMDdYRzVjZEgwcE8xeHVYRzVjZEhKbGRIVnliaUJ6ZEc5eVpUdGNibjFjYmlKZGZRPT0iLCJpbXBvcnQgaXNQYWdlIGZyb20gXCIuL2lzUGFnZVwiO1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIge1xyXG4gICAgY29uc3RydWN0b3IoeyBhcHBOYW1lLCBjb21wb25lbnRzLCBwYWdlcywgc2VydmljZXMsIGNvbmZpZywgcnVsZXIsIH0pIHtcclxuICAgICAgICB0aGlzLmFwcE5hbWUgPSBhcHBOYW1lO1xyXG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIHRoaXMucGFnZUNvbXBvbmVudHMgPSBwYWdlcyA/IFsuLi5wYWdlc10gOiBbXTtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBjb21wb25lbnRzID8gWy4uLmNvbXBvbmVudHNdIDogW107XHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlcyA9IHNlcnZpY2VzID8gWy4uLnNlcnZpY2VzXSA6IFtdO1xyXG4gICAgICAgIHRoaXMuc2VydmljZU1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzID0ge307XHJcbiAgICAgICAgdGhpcy5jb21wb25lbnRzQ29uZmlnID0ge307XHJcbiAgICAgICAgdGhpcy5ydWxlciA9IHJ1bGVyID8gcnVsZXIgOiBuZXcgaXNQYWdlKCk7XHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNyZWF0ZUNvbnRleHQuY2FsbCh0aGlzKTtcclxuICAgIH1cclxuICAgIGNyZWF0ZUNvbnRleHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcclxuICAgICAgICAgICAgZ2V0U2VydmljZTogdGhpcy5nZXRTZXJ2aWNlLmJpbmQodGhpcyksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGluc3RhbnRpYXRlQ29tcG9uZW50KENvbXBvbmVudCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgQ29tcG9uZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbXBvbmVudHNDb25maWdbQ29tcG9uZW50Lm5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZXNbQ29tcG9uZW50Lm5hbWVdID0gbmV3IENvbXBvbmVudCh0aGlzLmN0eCwgdGhpcy5jb21wb25lbnRzQ29uZmlnW0NvbXBvbmVudC5uYW1lXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlc1tDb21wb25lbnQubmFtZV0gPSBuZXcgQ29tcG9uZW50KHRoaXMuY3R4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBDb21wb25lbnQubmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIk5vdCBhbiBDb25zdHJ1Y3RvclwiLCBDb21wb25lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGluc3RhbnRpYXRlU2VydmljZShTZXJ2aWNlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBTZXJ2aWNlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZU1hcFtTZXJ2aWNlLm5hbWVdID0gbmV3IFNlcnZpY2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIk5vdCBhbiBDb25zdHJ1Y3RvclwiLCBTZXJ2aWNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRTZXJ2aWNlKHNlcnZpY2VOYW1lKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VydmljZU1hcFtzZXJ2aWNlTmFtZV0pXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VNYXBbc2VydmljZU5hbWVdO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGJ1aWxkU2VydmljZXMoKSB7XHJcbiAgICAgICAgdGhpcy5wYWdlQ29tcG9uZW50cy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbS5zZXJ2aWNlcyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoXCJwYWdlUmVmc1wiKSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ydWxlci5pcyhpdGVtLnBhZ2VSZWZzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnNlcnZpY2VzLmZvckVhY2goKHNlcnZpY2UpID0+IHRoaXMuc2VydmljZXMucHVzaChzZXJ2aWNlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMubWFwKHRoaXMuaW5zdGFudGlhdGVTZXJ2aWNlLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG4gICAgYnVpbGRDb21wb25lbnRzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMubWFwKHRoaXMuaW5zdGFudGlhdGVDb21wb25lbnQuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbiAgICBidWlsZFBhZ2VDb21wb25lbnRzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhZ2VDb21wb25lbnRzLm1hcCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eShcInBhZ2VSZWZzXCIpKVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucnVsZXIuaXMoaXRlbS5wYWdlUmVmcykpIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbXBvbmVudHMuZm9yRWFjaCgoQ29tcCkgPT4gdGhpcy5pbnN0YW50aWF0ZUNvbXBvbmVudChDb21wKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuYnVpbGRTZXJ2aWNlcy5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnVpbGRDb21wb25lbnRzLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idWlsZFBhZ2VDb21wb25lbnRzLmNhbGwodGhpcyk7XHJcbiAgICAgICAgd2luZG93W1wibTNBcHBzXCJdID0geyBbdGhpcy5hcHBOYW1lXTogdGhpcyB9O1xyXG4gICAgfVxyXG4gICAgYmluZChjb21wTmFtZSwgY29uZmlnKSB7XHJcbiAgICAgICAgdGhpcy5jb21wb25lbnRzQ29uZmlnW2NvbXBOYW1lXSA9IGNvbmZpZztcclxuICAgIH1cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGlmIChkb2N1bWVudC5hdHRhY2hFdmVudFxyXG4gICAgICAgICAgICA/IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIlxyXG4gICAgICAgICAgICA6IGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgdGhpcy5pbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRMjl1ZEdGcGJtVnlMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMM0JoWTJ0aFoyVnpMMk52Y21VdlEyOXVkR0ZwYm1WeUxuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEU5QlFVOHNUVUZCVFN4TlFVRk5MRlZCUVZVc1EwRkJRenRCUVcxRE9VSXNUVUZCVFN4RFFVRkRMRTlCUVU4c1QwRkJUeXhUUVVGVE8wbEJXVGRDTEZsQlFWa3NSVUZEV0N4UFFVRlBMRVZCUTFBc1ZVRkJWU3hGUVVOV0xFdEJRVXNzUlVGRFRDeFJRVUZSTEVWQlExSXNUVUZCVFN4RlFVTk9MRXRCUVVzc1IwRkRXVHRSUVVOcVFpeEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRTlCUVU4c1EwRkJRenRSUVVOMlFpeEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJRenRSUVVWeVFpeEpRVUZKTEVOQlFVTXNZMEZCWXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU03VVVGRE9VTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1IwRkJSeXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETzFGQlJYQkVMRWxCUVVrc1EwRkJReXhSUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXp0UlFVTTVReXhKUVVGSkxFTkJRVU1zVlVGQlZTeEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVVnlRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTndRaXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1JVRkJSU3hEUVVGRE8xRkJSVE5DTEVsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1RVRkJUU3hGUVVGRkxFTkJRVU03VVVGRk1VTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRKUVVNeFF5eERRVUZETzBsQlJVOHNZVUZCWVR0UlFVTndRaXhQUVVGUE8xbEJRMDRzVFVGQlRTeEZRVUZGTEVsQlFVa3NRMEZCUXl4TlFVRk5PMWxCUTI1Q0xGVkJRVlVzUlVGQlJTeEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU03VTBGRGRFTXNRMEZCUXp0SlFVTklMRU5CUVVNN1NVRkZUeXh2UWtGQmIwSXNRMEZCUXl4VFFVRmpPMUZCUXpGRExFbEJRVWs3V1VGRFNDeEpRVUZKTEU5QlFVOHNVMEZCVXl4TFFVRkxMRlZCUVZVc1JVRkJSVHRuUWtGRGNFTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRk8yOUNRVU14UXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4SlFVRkpMRk5CUVZNc1EwRkROME1zU1VGQlNTeERRVUZETEVkQlFVY3NSVUZEVWl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVOeVF5eERRVUZETzJsQ1FVTkdPM0ZDUVVGTk8yOUNRVU5PTEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVsQlFVa3NVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dHBRa0ZEZWtRN1owSkJRMFFzVDBGQlR5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRPMkZCUTNSQ08ybENRVUZOTzJkQ1FVTk9MRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zYjBKQlFXOUNMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU03WVVGRE9VTTdVMEZEUkR0UlFVRkRMRTlCUVU4c1MwRkJTeXhGUVVGRk8xbEJRMllzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRUUVVOd1FqdEpRVU5HTEVOQlFVTTdTVUZGVHl4clFrRkJhMElzUTBGQlF5eFBRVUZaTzFGQlEzUkRMRWxCUVVrc1QwRkJUeXhQUVVGUExFdEJRVXNzVlVGQlZTeEZRVUZGTzFsQlEyeERMRWxCUVVrN1owSkJRMGdzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzU1VGQlNTeFBRVUZQTEVWQlFVVXNRMEZCUXp0aFFVTTVRenRaUVVGRExFOUJRVThzUzBGQlN5eEZRVUZGTzJkQ1FVTm1MRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdZVUZEY0VJN1UwRkRSRHRoUVVGTk8xbEJRMDRzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4dlFrRkJiMElzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUXp0VFFVTTFRenRKUVVOR0xFTkJRVU03U1VGRlR5eFZRVUZWTEVOQlFVa3NWMEZCYlVJN1VVRkRlRU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVGRkxFOUJRVThzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRSUVVOMFJTeFBRVUZQTEV0QlFVc3NRMEZCUXp0SlFVTmtMRU5CUVVNN1NVRkZUeXhoUVVGaE8xRkJRM0JDTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVTdXVUZEY0VNc1NVRkJTU3hQUVVGUExFbEJRVWtzUTBGQlF5eFJRVUZSTEV0QlFVc3NWMEZCVnl4RlFVRkZPMmRDUVVONlF5eEpRVUZKTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1ZVRkJWU3hEUVVGRE8yOUNRVU5zUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJSVHQzUWtGRGFrTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlN4RFFVTnFReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkRNMElzUTBGQlF6dHhRa0ZEUmp0aFFVTkdPMUZCUTBZc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRlNDeFBRVUZQTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTTVSQ3hEUVVGRE8wbEJSVThzWlVGQlpUdFJRVU4wUWl4UFFVRlBMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4dlFrRkJiMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVOc1JTeERRVUZETzBsQlJVOHNiVUpCUVcxQ08xRkJRekZDTEU5QlFVOHNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlR0WlFVTjJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNWVUZCVlN4RFFVRkRPMmRDUVVOc1F5eEpRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlR0dlFrRkRha01zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVU5vUXl4SlFVRkpMRU5CUVVNc2IwSkJRVzlDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUXk5Q0xFTkJRVU03YVVKQlEwWTdVVUZEU0N4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVOS0xFTkJRVU03U1VGRlRTeEpRVUZKTzFGQlExWXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZET1VJc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRhRU1zU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVVndReXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNRMEZCUXp0SlFVTTNReXhEUVVGRE8wbEJSVTBzU1VGQlNTeERRVUZETEZGQlFXZENMRVZCUVVVc1RVRkJWenRSUVVONFF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRPMGxCUXpGRExFTkJRVU03U1VGRlRTeExRVUZMTzFGQlExZ3NTVUZEUXl4UlFVRlJMRU5CUVVNc1YwRkJWenRaUVVOdVFpeERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1MwRkJTeXhWUVVGVk8xbEJRM0JETEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hMUVVGTExGTkJRVk1zUlVGRGJrTTdXVUZEUkN4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03VTBGRFdqdGhRVUZOTzFsQlEwNHNVVUZCVVN4RFFVRkRMR2RDUVVGblFpeERRVUZETEd0Q1FVRnJRaXhGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03VTBGRGNFVTdTVUZEUml4RFFVRkRPME5CUTBRaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SnBiWEJ2Y25RZ2FYTlFZV2RsSUdaeWIyMGdYQ0l1TDJselVHRm5aVndpTzF4dWFXMXdiM0owSUVsU2RXeGxjaUJtY205dElGd2lMaTlKVW5Wc1pYSmNJanRjYmx4dVpYaHdiM0owSUdsdWRHVnlabUZqWlNCSlEyOXVkR0ZwYm1WeVVISnZjSE1nZTF4dVhIUmhjSEJPWVcxbE9pQnpkSEpwYm1jN1hHNWNkR052YlhCdmJtVnVkSE0vT2lCaGJubGJYVHRjYmx4MGNHRm5aWE0vT2lCSlVHRm5aVU52YlhCdmJtVnVkSE5iWFR0Y2JseDBjMlZ5ZG1salpYTS9PaUJoYm5sYlhUdGNibHgwWTI5dVptbG5Qem9nWVc1NU8xeHVYSFJ5ZFd4bGNqODZJRWxTZFd4bGNqdGNibjFjYmx4dVpYaHdiM0owSUdsdWRHVnlabUZqWlNCSlVHRm5aVU52YlhCdmJtVnVkSE1nZTF4dVhIUndZV2RsVW1WbWN6b2djM1J5YVc1blcxMDdYRzVjZEdOdmJYQnZibVZ1ZEhNNklHRnVlVnRkTzF4dVhIUnpaWEoyYVdObGN6ODZJR0Z1ZVZ0ZE8xeHVmVnh1WEc1bGVIQnZjblFnYVc1MFpYSm1ZV05sSUVsRGIyNTBZV2x1WlhKRGIyNTBaWGgwSUh0Y2JseDBZMjl1Wm1sbk9pQmhibms3WEc1Y2RHZGxkRk5sY25acFkyVTZJRHhVUGloelpYSjJhV05sVG1GdFpUb2djM1J5YVc1bktTQTlQaUJVSUh3Z1ptRnNjMlU3WEc1OVhHNWNibVJsWTJ4aGNtVWdaMnh2WW1Gc0lIdGNibHgwYVc1MFpYSm1ZV05sSUZkcGJtUnZkeUI3WEc1Y2RGeDBiVE5CY0hCek9pQlNaV052Y21ROGMzUnlhVzVuTENCRGIyNTBZV2x1WlhJK08xeHVYSFI5WEc1Y2JseDBhVzUwWlhKbVlXTmxJRVJ2WTNWdFpXNTBJSHRjYmx4MFhIUmhkSFJoWTJoRmRtVnVkRHBjYmx4MFhIUmNkSHdnS0NobGRtVnVkRG9nYzNSeWFXNW5MQ0JzYVhOMFpXNWxjam9nUlhabGJuUk1hWE4wWlc1bGNpa2dQVDRnWW05dmJHVmhiaUI4SUdaaGJITmxLVnh1WEhSY2RGeDBmQ0IxYm1SbFptbHVaV1E3WEc1Y2RIMWNibjFjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnWTJ4aGMzTWdRMjl1ZEdGcGJtVnlJSHRjYmx4MGNISnBkbUYwWlNCeWRXeGxjam9nU1ZKMWJHVnlPMXh1WEhSd2NtbDJZWFJsSUdGd2NFNWhiV1U2SUhOMGNtbHVaenRjYmx4MGNISnBkbUYwWlNCamIyNW1hV2M2SUdGdWVUdGNibHgwY0hKcGRtRjBaU0JqYjIxd2IyNWxiblJ6UTI5dVptbG5PaUJoYm5rN1hHNWNkSEJ5YVhaaGRHVWdZMjl0Y0c5dVpXNTBjem9nWVc1NVcxMDdYRzVjZEhCeWFYWmhkR1VnY0dGblpVTnZiWEJ2Ym1WdWRITTZJRWxRWVdkbFEyOXRjRzl1Wlc1MGMxdGRPMXh1WEhSd2NtbDJZWFJsSUhObGNuWnBZMlZ6T2lCaGJubGJYVHRjYmx4MGNISnBkbUYwWlNCelpYSjJhV05sVFdGd09pQlNaV052Y21ROGMzUnlhVzVuTENCaGJuaytPMXh1WEhSd2NtbDJZWFJsSUdsdWMzUmhibU5sY3pvZ1VtVmpiM0prUEhOMGNtbHVaeXdnYjJKcVpXTjBQanRjYmx4MGNISnBkbUYwWlNCamRIZzZJRWxEYjI1MFlXbHVaWEpEYjI1MFpYaDBPMXh1WEc1Y2RHTnZibk4wY25WamRHOXlLSHRjYmx4MFhIUmhjSEJPWVcxbExGeHVYSFJjZEdOdmJYQnZibVZ1ZEhNc1hHNWNkRngwY0dGblpYTXNYRzVjZEZ4MGMyVnlkbWxqWlhNc1hHNWNkRngwWTI5dVptbG5MRnh1WEhSY2RISjFiR1Z5TEZ4dVhIUjlPaUJKUTI5dWRHRnBibVZ5VUhKdmNITXBJSHRjYmx4MFhIUjBhR2x6TG1Gd2NFNWhiV1VnUFNCaGNIQk9ZVzFsTzF4dVhIUmNkSFJvYVhNdVkyOXVabWxuSUQwZ1kyOXVabWxuTzF4dVhHNWNkRngwZEdocGN5NXdZV2RsUTI5dGNHOXVaVzUwY3lBOUlIQmhaMlZ6SUQ4Z1d5NHVMbkJoWjJWelhTQTZJRnRkTzF4dVhIUmNkSFJvYVhNdVkyOXRjRzl1Wlc1MGN5QTlJR052YlhCdmJtVnVkSE1nUHlCYkxpNHVZMjl0Y0c5dVpXNTBjMTBnT2lCYlhUdGNibHh1WEhSY2RIUm9hWE11YzJWeWRtbGpaWE1nUFNCelpYSjJhV05sY3lBL0lGc3VMaTV6WlhKMmFXTmxjMTBnT2lCYlhUdGNibHgwWEhSMGFHbHpMbk5sY25acFkyVk5ZWEFnUFNCN2ZUdGNibHh1WEhSY2RIUm9hWE11YVc1emRHRnVZMlZ6SUQwZ2UzMDdYRzVjZEZ4MGRHaHBjeTVqYjIxd2IyNWxiblJ6UTI5dVptbG5JRDBnZTMwN1hHNWNibHgwWEhSMGFHbHpMbkoxYkdWeUlEMGdjblZzWlhJZ1B5QnlkV3hsY2lBNklHNWxkeUJwYzFCaFoyVW9LVHRjYmx4dVhIUmNkSFJvYVhNdVkzUjRJRDBnZEdocGN5NWpjbVZoZEdWRGIyNTBaWGgwTG1OaGJHd29kR2hwY3lrN1hHNWNkSDFjYmx4dVhIUndjbWwyWVhSbElHTnlaV0YwWlVOdmJuUmxlSFFvS1RvZ1NVTnZiblJoYVc1bGNrTnZiblJsZUhRZ2UxeHVYSFJjZEhKbGRIVnliaUI3WEc1Y2RGeDBYSFJqYjI1bWFXYzZJSFJvYVhNdVkyOXVabWxuTEZ4dVhIUmNkRngwWjJWMFUyVnlkbWxqWlRvZ2RHaHBjeTVuWlhSVFpYSjJhV05sTG1KcGJtUW9kR2hwY3lrc1hHNWNkRngwZlR0Y2JseDBmVnh1WEc1Y2RIQnlhWFpoZEdVZ2FXNXpkR0Z1ZEdsaGRHVkRiMjF3YjI1bGJuUW9RMjl0Y0c5dVpXNTBPaUJoYm5rcElIdGNibHgwWEhSMGNua2dlMXh1WEhSY2RGeDBhV1lnS0hSNWNHVnZaaUJEYjIxd2IyNWxiblFnUFQwOUlGd2lablZ1WTNScGIyNWNJaWtnZTF4dVhIUmNkRngwWEhScFppQW9kR2hwY3k1amIyMXdiMjVsYm5SelEyOXVabWxuVzBOdmJYQnZibVZ1ZEM1dVlXMWxYU2tnZTF4dVhIUmNkRngwWEhSY2RIUm9hWE11YVc1emRHRnVZMlZ6VzBOdmJYQnZibVZ1ZEM1dVlXMWxYU0E5SUc1bGR5QkRiMjF3YjI1bGJuUW9YRzVjZEZ4MFhIUmNkRngwWEhSMGFHbHpMbU4wZUN4Y2JseDBYSFJjZEZ4MFhIUmNkSFJvYVhNdVkyOXRjRzl1Wlc1MGMwTnZibVpwWjF0RGIyMXdiMjVsYm5RdWJtRnRaVjFjYmx4MFhIUmNkRngwWEhRcE8xeHVYSFJjZEZ4MFhIUjlJR1ZzYzJVZ2UxeHVYSFJjZEZ4MFhIUmNkSFJvYVhNdWFXNXpkR0Z1WTJWelcwTnZiWEJ2Ym1WdWRDNXVZVzFsWFNBOUlHNWxkeUJEYjIxd2IyNWxiblFvZEdocGN5NWpkSGdwTzF4dVhIUmNkRngwWEhSOVhHNWNkRngwWEhSY2RISmxkSFZ5YmlCRGIyMXdiMjVsYm5RdWJtRnRaVHRjYmx4MFhIUmNkSDBnWld4elpTQjdYRzVjZEZ4MFhIUmNkR052Ym5OdmJHVXVkMkZ5YmloY0lrNXZkQ0JoYmlCRGIyNXpkSEoxWTNSdmNsd2lMQ0JEYjIxd2IyNWxiblFwTzF4dVhIUmNkRngwZlZ4dVhIUmNkSDBnWTJGMFkyZ2dLR1Z5Y205eUtTQjdYRzVjZEZ4MFhIUmpiMjV6YjJ4bExuZGhjbTRvWlhKeWIzSXBPMXh1WEhSY2RIMWNibHgwZlZ4dVhHNWNkSEJ5YVhaaGRHVWdhVzV6ZEdGdWRHbGhkR1ZUWlhKMmFXTmxLRk5sY25acFkyVTZJR0Z1ZVNrZ2UxeHVYSFJjZEdsbUlDaDBlWEJsYjJZZ1UyVnlkbWxqWlNBOVBUMGdYQ0ptZFc1amRHbHZibHdpS1NCN1hHNWNkRngwWEhSMGNua2dlMXh1WEhSY2RGeDBYSFIwYUdsekxuTmxjblpwWTJWTllYQmJVMlZ5ZG1salpTNXVZVzFsWFNBOUlHNWxkeUJUWlhKMmFXTmxLQ2s3WEc1Y2RGeDBYSFI5SUdOaGRHTm9JQ2hsY25KdmNpa2dlMXh1WEhSY2RGeDBYSFJqYjI1emIyeGxMbmRoY200b1pYSnliM0lwTzF4dVhIUmNkRngwZlZ4dVhIUmNkSDBnWld4elpTQjdYRzVjZEZ4MFhIUmpiMjV6YjJ4bExuZGhjbTRvWENKT2IzUWdZVzRnUTI5dWMzUnlkV04wYjNKY0lpd2dVMlZ5ZG1salpTazdYRzVjZEZ4MGZWeHVYSFI5WEc1Y2JseDBjSEpwZG1GMFpTQm5aWFJUWlhKMmFXTmxQRlErS0hObGNuWnBZMlZPWVcxbE9pQnpkSEpwYm1jcE9pQlVJSHdnWm1Gc2MyVWdlMXh1WEhSY2RHbG1JQ2gwYUdsekxuTmxjblpwWTJWTllYQmJjMlZ5ZG1salpVNWhiV1ZkS1NCeVpYUjFjbTRnZEdocGN5NXpaWEoyYVdObFRXRndXM05sY25acFkyVk9ZVzFsWFR0Y2JseDBYSFJ5WlhSMWNtNGdabUZzYzJVN1hHNWNkSDFjYmx4dVhIUndjbWwyWVhSbElHSjFhV3hrVTJWeWRtbGpaWE1vS1NCN1hHNWNkRngwZEdocGN5NXdZV2RsUTI5dGNHOXVaVzUwY3k1bWIzSkZZV05vS0NocGRHVnRLU0E5UGlCN1hHNWNkRngwWEhScFppQW9kSGx3Wlc5bUlHbDBaVzB1YzJWeWRtbGpaWE1nSVQwOUlGd2lkVzVrWldacGJtVmtYQ0lwSUh0Y2JseDBYSFJjZEZ4MGFXWWdLR2wwWlcwdWFHRnpUM2R1VUhKdmNHVnlkSGtvWENKd1lXZGxVbVZtYzF3aUtTbGNibHgwWEhSY2RGeDBYSFJwWmlBb2RHaHBjeTV5ZFd4bGNpNXBjeWhwZEdWdExuQmhaMlZTWldaektTa2dlMXh1WEhSY2RGeDBYSFJjZEZ4MGFYUmxiUzV6WlhKMmFXTmxjeTVtYjNKRllXTm9LQ2h6WlhKMmFXTmxLU0E5UGx4dVhIUmNkRngwWEhSY2RGeDBYSFIwYUdsekxuTmxjblpwWTJWekxuQjFjMmdvYzJWeWRtbGpaU2xjYmx4MFhIUmNkRngwWEhSY2RDazdYRzVjZEZ4MFhIUmNkRngwZlZ4dVhIUmNkRngwZlZ4dVhIUmNkSDBwTzF4dVhHNWNkRngwY21WMGRYSnVJSFJvYVhNdWMyVnlkbWxqWlhNdWJXRndLSFJvYVhNdWFXNXpkR0Z1ZEdsaGRHVlRaWEoyYVdObExtSnBibVFvZEdocGN5a3BPMXh1WEhSOVhHNWNibHgwY0hKcGRtRjBaU0JpZFdsc1pFTnZiWEJ2Ym1WdWRITW9LU0I3WEc1Y2RGeDBjbVYwZFhKdUlIUm9hWE11WTI5dGNHOXVaVzUwY3k1dFlYQW9kR2hwY3k1cGJuTjBZVzUwYVdGMFpVTnZiWEJ2Ym1WdWRDNWlhVzVrS0hSb2FYTXBLVHRjYmx4MGZWeHVYRzVjZEhCeWFYWmhkR1VnWW5WcGJHUlFZV2RsUTI5dGNHOXVaVzUwY3lncElIdGNibHgwWEhSeVpYUjFjbTRnZEdocGN5NXdZV2RsUTI5dGNHOXVaVzUwY3k1dFlYQW9LR2wwWlcwcElEMCtJSHRjYmx4MFhIUmNkR2xtSUNocGRHVnRMbWhoYzA5M2JsQnliM0JsY25SNUtGd2ljR0ZuWlZKbFpuTmNJaWtwWEc1Y2RGeDBYSFJjZEdsbUlDaDBhR2x6TG5KMWJHVnlMbWx6S0dsMFpXMHVjR0ZuWlZKbFpuTXBLU0I3WEc1Y2RGeDBYSFJjZEZ4MGFYUmxiUzVqYjIxd2IyNWxiblJ6TG1admNrVmhZMmdvS0VOdmJYQXBJRDArWEc1Y2RGeDBYSFJjZEZ4MFhIUjBhR2x6TG1sdWMzUmhiblJwWVhSbFEyOXRjRzl1Wlc1MEtFTnZiWEFwWEc1Y2RGeDBYSFJjZEZ4MEtUdGNibHgwWEhSY2RGeDBmVnh1WEhSY2RIMHBPMXh1WEhSOVhHNWNibHgwY0hWaWJHbGpJR2x1YVhRb0tTQjdYRzVjZEZ4MGRHaHBjeTVpZFdsc1pGTmxjblpwWTJWekxtTmhiR3dvZEdocGN5azdYRzVjZEZ4MGRHaHBjeTVpZFdsc1pFTnZiWEJ2Ym1WdWRITXVZMkZzYkNoMGFHbHpLVHRjYmx4MFhIUjBhR2x6TG1KMWFXeGtVR0ZuWlVOdmJYQnZibVZ1ZEhNdVkyRnNiQ2gwYUdsektUdGNibHh1WEhSY2RIZHBibVJ2ZDF0Y0ltMHpRWEJ3YzF3aVhTQTlJSHNnVzNSb2FYTXVZWEJ3VG1GdFpWMDZJSFJvYVhNZ2ZUdGNibHgwZlZ4dVhHNWNkSEIxWW14cFl5QmlhVzVrS0dOdmJYQk9ZVzFsT2lCemRISnBibWNzSUdOdmJtWnBaem9nWVc1NUtTQjdYRzVjZEZ4MGRHaHBjeTVqYjIxd2IyNWxiblJ6UTI5dVptbG5XMk52YlhCT1lXMWxYU0E5SUdOdmJtWnBaenRjYmx4MGZWeHVYRzVjZEhCMVlteHBZeUJ6ZEdGeWRDZ3BJSHRjYmx4MFhIUnBaaUFvWEc1Y2RGeDBYSFJrYjJOMWJXVnVkQzVoZEhSaFkyaEZkbVZ1ZEZ4dVhIUmNkRngwWEhRL0lHUnZZM1Z0Wlc1MExuSmxZV1I1VTNSaGRHVWdQVDA5SUZ3aVkyOXRjR3hsZEdWY0lseHVYSFJjZEZ4MFhIUTZJR1J2WTNWdFpXNTBMbkpsWVdSNVUzUmhkR1VnSVQwOUlGd2liRzloWkdsdVoxd2lYRzVjZEZ4MEtTQjdYRzVjZEZ4MFhIUjBhR2x6TG1sdWFYUW9LVHRjYmx4MFhIUjlJR1ZzYzJVZ2UxeHVYSFJjZEZ4MFpHOWpkVzFsYm5RdVlXUmtSWFpsYm5STWFYTjBaVzVsY2loY0lrUlBUVU52Ym5SbGJuUk1iMkZrWldSY0lpd2dkR2hwY3k1cGJtbDBMbUpwYm1Rb2RHaHBjeWtwTzF4dVhIUmNkSDFjYmx4MGZWeHVmVnh1SWwxOSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIGlzUGFnZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgY29uc3QgbWV0YVBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJwYWdlXCJdJyk7XHJcbiAgICAgICAgdGhpcy5pZGVudGlmaWNhY2FvTWV0YVBhZ2UgPSBtZXRhUGFnZVxyXG4gICAgICAgICAgICA/IG1ldGFQYWdlLmdldEF0dHJpYnV0ZShcImNvbnRlbnRcIikgfHwgXCJcIlxyXG4gICAgICAgICAgICA6IFwiXCI7XHJcbiAgICAgICAgdGhpcy5jbGFzc1RhZ0JvZHkgPSBBcnJheS5mcm9tKGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0KTtcclxuICAgICAgICB0aGlzLnBhZ2VEYXRhTGF5ZXIgPSBcIlwiO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LmRhdGFMYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VEYXRhTGF5ZXIgPSAoX2EgPSB3aW5kb3cuZGF0YUxheWVyWzBdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EucGFnZUNhdGVnb3J5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlzKHJ1bGVzKSB7XHJcbiAgICAgICAgbGV0IGlzID0gZmFsc2U7XHJcbiAgICAgICAgcnVsZXMuZm9yRWFjaCgocnVsZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pZGVudGlmaWNhY2FvTWV0YVBhZ2Uuc2VhcmNoKHJ1bGUpID49IDAgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMucGFnZURhdGFMYXllciA9PT0gcnVsZSB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc1RhZ0JvZHkuaW5jbHVkZXMocnVsZSkpIHtcclxuICAgICAgICAgICAgICAgIGlzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBpcztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhWE5RWVdkbExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwzQmhZMnRoWjJWekwyTnZjbVV2YVhOUVlXZGxMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVdkQ1FTeE5RVUZOTEVOQlFVTXNUMEZCVHl4UFFVRlBMRTFCUVUwN1NVRkxNVUk3TzFGQlEwTXNUVUZCVFN4UlFVRlJMRWRCUVVjc1VVRkJVU3hEUVVGRExHRkJRV0VzUTBGQlF5eHRRa0ZCYlVJc1EwRkJReXhEUVVGRE8xRkJRemRFTEVsQlFVa3NRMEZCUXl4eFFrRkJjVUlzUjBGQlJ5eFJRVUZSTzFsQlEzQkRMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zV1VGQldTeERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRVZCUVVVN1dVRkRlRU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXp0UlFVVk9MRWxCUVVrc1EwRkJReXhaUVVGWkxFZEJRVWNzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFGQlEzaEVMRWxCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzUlVGQlJTeERRVUZETzFGQlEzaENMRWxCUVVrc1QwRkJUeXhOUVVGTkxFTkJRVU1zVTBGQlV5eExRVUZMTEZkQlFWY3NSVUZCUlR0WlFVTTFReXhKUVVGSkxFTkJRVU1zWVVGQllTeFRRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExEQkRRVUZGTEZsQlFWa3NRMEZCUXp0VFFVTjJSRHRKUVVOR0xFTkJRVU03U1VGUFJDeEZRVUZGTEVOQlFVTXNTMEZCWlR0UlFVTnFRaXhKUVVGSkxFVkJRVVVzUjBGQlJ5eExRVUZMTEVOQlFVTTdVVUZGWml4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVTdXVUZEZEVJc1NVRkRReXhKUVVGSkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTTdaMEpCUXpWRExFbEJRVWtzUTBGQlF5eGhRVUZoTEV0QlFVc3NTVUZCU1R0blFrRkRNMElzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJReTlDTzJkQ1FVTkVMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU03WVVGRFZqdFJRVU5HTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUlVnc1QwRkJUeXhGUVVGRkxFTkJRVU03U1VGRFdDeERRVUZETzBOQlEwUWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpwYlhCdmNuUWdTVkoxYkdWeUlHWnliMjBnWENJdUwwbFNkV3hsY2x3aU8xeHVYRzVrWldOc1lYSmxJR2RzYjJKaGJDQjdYRzVjZEdsdWRHVnlabUZqWlNCWGFXNWtiM2NnZTF4dVhIUmNkR1JoZEdGTVlYbGxjam9nUkdGMFlVeGhlV1Z5VDJKcVpXTjBXMTBnZkNCMWJtUmxabWx1WldRN1hHNWNkSDFjYmx4dVhIUnBiblJsY21aaFkyVWdSR0YwWVV4aGVXVnlUMkpxWldOMElIdGNibHgwWEhSd1lXZGxRMkYwWldkdmNuazZJSE4wY21sdVp6dGNibHgwZlZ4dWZWeHVMeW9xWEc0Z0tpQWdRMnhoYzNObElIQmhjbUVnZG1WeWFXWnBZMkZ5SUhObElHVnpkR0Z0YjNNZ1pXMGdkVzFoSUdSaGN5QndZV2RwYm1GelhHNGdLaUFnY1hWbElIUERvMjhnY0dGemMyRmtZWE1nY0c5eUlHRnlaM1Z0Wlc1MGIxeHVJQ292WEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdOc1lYTnpJR2x6VUdGblpTQnBiWEJzWlcxbGJuUnpJRWxTZFd4bGNpQjdYRzVjZEhCeWFYWmhkR1VnYVdSbGJuUnBabWxqWVdOaGIwMWxkR0ZRWVdkbE9pQnpkSEpwYm1jN1hHNWNkSEJ5YVhaaGRHVWdZMnhoYzNOVVlXZENiMlI1T2lCemRISnBibWRiWFR0Y2JseDBjSEpwZG1GMFpTQndZV2RsUkdGMFlVeGhlV1Z5T2lCemRISnBibWM3WEc1Y2JseDBZMjl1YzNSeWRXTjBiM0lvS1NCN1hHNWNkRngwWTI5dWMzUWdiV1YwWVZCaFoyVWdQU0JrYjJOMWJXVnVkQzV4ZFdWeWVWTmxiR1ZqZEc5eUtDZHRaWFJoVzI1aGJXVTlYQ0p3WVdkbFhDSmRKeWs3WEc1Y2RGeDBkR2hwY3k1cFpHVnVkR2xtYVdOaFkyRnZUV1YwWVZCaFoyVWdQU0J0WlhSaFVHRm5aVnh1WEhSY2RGeDBQeUJ0WlhSaFVHRm5aUzVuWlhSQmRIUnlhV0oxZEdVb1hDSmpiMjUwWlc1MFhDSXBJSHg4SUZ3aVhDSmNibHgwWEhSY2REb2dYQ0pjSWp0Y2JseHVYSFJjZEhSb2FYTXVZMnhoYzNOVVlXZENiMlI1SUQwZ1FYSnlZWGt1Wm5KdmJTaGtiMk4xYldWdWRDNWliMlI1TG1Oc1lYTnpUR2x6ZENrN1hHNWNkRngwZEdocGN5NXdZV2RsUkdGMFlVeGhlV1Z5SUQwZ1hDSmNJanRjYmx4MFhIUnBaaUFvZEhsd1pXOW1JSGRwYm1SdmR5NWtZWFJoVEdGNVpYSWdJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSXBJSHRjYmx4MFhIUmNkSFJvYVhNdWNHRm5aVVJoZEdGTVlYbGxjaUE5SUhkcGJtUnZkeTVrWVhSaFRHRjVaWEpiTUYwL0xuQmhaMlZEWVhSbFoyOXllVHRjYmx4MFhIUjlYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBJQ29nS2lCQWNHRnlZVzBnZTJGeWNtRjVmU0JiWVhKbmMxMGdkVzBnYjNVZ2RXMGdZWEp5WVhrZ1pHVWdjM1J5YVc1bmN5QmpiMjUwWlc1a2J5QmhJSEJoYkdGMmNtRWdZMmhoZG1VZ2NHRnlZU0JwWkdWdWRHbG1hV05oY2lCaElIQmhaMmx1WVZ4dVhIUWdLaUJBY21WMGRYSnVJSHRDYjI5c1pXRnVmU0J5WlhSdmNtNWhJSFJ5ZFdVZ2MyVWdkVzBnWkc5eklHRnlaM1Z0Wlc1MGIzTWdaWE4wYVhabGNpQnVZU0J0WlhSaEwySnZaSGxEYkdGemN5OTBZV2RjYmx4MElDb3ZYRzVjYmx4MGFYTW9jblZzWlhNNklITjBjbWx1WjF0ZEtUb2dZbTl2YkdWaGJpQjdYRzVjZEZ4MGJHVjBJR2x6SUQwZ1ptRnNjMlU3WEc1Y2JseDBYSFJ5ZFd4bGN5NW1iM0pGWVdOb0tDaHlkV3hsS1NBOVBpQjdYRzVjZEZ4MFhIUnBaaUFvWEc1Y2RGeDBYSFJjZEhSb2FYTXVhV1JsYm5ScFptbGpZV05oYjAxbGRHRlFZV2RsTG5ObFlYSmphQ2h5ZFd4bEtTQStQU0F3SUh4OFhHNWNkRngwWEhSY2RIUm9hWE11Y0dGblpVUmhkR0ZNWVhsbGNpQTlQVDBnY25Wc1pTQjhmRnh1WEhSY2RGeDBYSFIwYUdsekxtTnNZWE56VkdGblFtOWtlUzVwYm1Oc2RXUmxjeWh5ZFd4bEtWeHVYSFJjZEZ4MEtTQjdYRzVjZEZ4MFhIUmNkR2x6SUQwZ2RISjFaVHRjYmx4MFhIUmNkSDFjYmx4MFhIUjlLVHRjYmx4dVhIUmNkSEpsZEhWeWJpQnBjenRjYmx4MGZWeHVmVnh1SWwxOSIsImV4cG9ydCB7IGRlZmF1bHQgYXMgQ29udGFpbmVyIH0gZnJvbSBcIi4vY29yZS9Db250YWluZXJcIjtcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBJc1BhZ2UgfSBmcm9tIFwiLi9jb3JlL2lzUGFnZVwiO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFB1YlN1YiB9IGZyb20gXCIuL1N0YXRlTWFuYWdlci9QdWJTdWJcIjtcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBTdG9yZSB9IGZyb20gXCIuL1N0YXRlTWFuYWdlci9TdG9yZVwiO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIG1lcmdlU3RvcmVzIH0gZnJvbSBcIi4vU3RhdGVNYW5hZ2VyL21lcmdlU3RvcmVzXCI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFXNWtaWGd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZjR0ZqYTJGblpYTXZhVzVrWlhndWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzVDBGQlR5eEZRVUZGTEU5QlFVOHNTVUZCU1N4VFFVRlRMRVZCUVVVc1RVRkJUU3hyUWtGQmEwSXNRMEZCUXp0QlFVTjRSQ3hQUVVGUExFVkJRVVVzVDBGQlR5eEpRVUZKTEUxQlFVMHNSVUZCUlN4TlFVRk5MR1ZCUVdVc1EwRkJRenRCUVVOc1JDeFBRVUZQTEVWQlFVVXNUMEZCVHl4SlFVRkpMRTFCUVUwc1JVRkJSU3hOUVVGTkxIVkNRVUYxUWl4RFFVRkRPMEZCUXpGRUxFOUJRVThzUlVGQlJTeFBRVUZQTEVsQlFVa3NTMEZCU3l4RlFVRkZMRTFCUVUwc2MwSkJRWE5DTEVOQlFVTTdRVUZEZUVRc1QwRkJUeXhGUVVGRkxFOUJRVThzU1VGQlNTeFhRVUZYTEVWQlFVVXNUVUZCVFN3MFFrRkJORUlzUTBGQlF5SXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJbVY0Y0c5eWRDQjdJR1JsWm1GMWJIUWdZWE1nUTI5dWRHRnBibVZ5SUgwZ1puSnZiU0JjSWk0dlkyOXlaUzlEYjI1MFlXbHVaWEpjSWp0Y2JtVjRjRzl5ZENCN0lHUmxabUYxYkhRZ1lYTWdTWE5RWVdkbElIMGdabkp2YlNCY0lpNHZZMjl5WlM5cGMxQmhaMlZjSWp0Y2JtVjRjRzl5ZENCN0lHUmxabUYxYkhRZ1lYTWdVSFZpVTNWaUlIMGdabkp2YlNCY0lpNHZVM1JoZEdWTllXNWhaMlZ5TDFCMVlsTjFZbHdpTzF4dVpYaHdiM0owSUhzZ1pHVm1ZWFZzZENCaGN5QlRkRzl5WlNCOUlHWnliMjBnWENJdUwxTjBZWFJsVFdGdVlXZGxjaTlUZEc5eVpWd2lPMXh1Wlhod2IzSjBJSHNnWkdWbVlYVnNkQ0JoY3lCdFpYSm5aVk4wYjNKbGN5QjlJR1p5YjIwZ1hDSXVMMU4wWVhSbFRXRnVZV2RsY2k5dFpYSm5aVk4wYjNKbGMxd2lPMXh1SWwxOSIsIm1vZHVsZS5leHBvcnRzID0galF1ZXJ5OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuXHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgZGVmaW5pdGlvbikge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmosIHByb3ApIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApOyB9IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgQ2hlY2tvdXRVSSBmcm9tIFwiLi9jb21wb25lbnRzL0NoZWNrb3V0VUlcIjtcbmltcG9ydCB7IENvbnRhaW5lciB9IGZyb20gXCJAYWdlbmNpYW0zL3BrZ1wiO1xuaW1wb3J0IEV4ZW1wbGUgZnJvbSBcIi4vY29tcG9uZW50cy9FeGVtcGxlXCI7XG5pbXBvcnQgRXhlbXBsZUV2ZW50IGZyb20gXCIuL2NvbXBvbmVudHMvRXhlbXBsZUV2ZW50XCI7XG5pbXBvcnQgU3RlcEJhciBmcm9tIFwiLi9jb21wb25lbnRzL1N0ZXBCYXJcIjtcbmltcG9ydCBDdXN0b21JbnN0YWxsbWVudHMgZnJvbSBcIi4vY29tcG9uZW50cy9DdXN0b21JbnN0YWxsbWVudHNcIjtcbmltcG9ydCBDdXN0b21JbnN0YWxsbWVudFBlckl0ZW1zIGZyb20gXCIuL2NvbXBvbmVudHMvQ3VzdG9tSW5zdGFsbG1lbnRQZXJJdGVtc1wiO1xuaW1wb3J0IExvZ2luTW9kYWwgZnJvbSBcIi4vY29tcG9uZW50cy9Mb2dpbk1vZGFsXCI7XG5cbmNvbnN0IG0zQ2hlY2tvdXQgPSBuZXcgQ29udGFpbmVyKHtcbiAgICBhcHBOYW1lOiBcIm0zLWNoZWNrb3V0XCIsXG4gICAgY29tcG9uZW50czogW0NoZWNrb3V0VUksIEV4ZW1wbGUsIEV4ZW1wbGVFdmVudCwgU3RlcEJhciwgQ3VzdG9tSW5zdGFsbG1lbnRzLCBDdXN0b21JbnN0YWxsbWVudFBlckl0ZW1zLCBMb2dpbk1vZGFsXSxcbn0pO1xuXG5tM0NoZWNrb3V0LnN0YXJ0KCk7XG5cbiJdLCJzb3VyY2VSb290IjoiIn0=