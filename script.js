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
    vtexjs.checkout.getOrderForm().then(orderForm => {
      insertPerItemInstallments(orderForm)
    })
  
    // Atualiza mudanças do orderForm 
    $(window).on('orderFormUpdated.vtex', function (_, orderForm) {
      InsertStylesMinicartItems()
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
  //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhY2thZ2VzL2NvcmUvQ29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFVBQVUsQ0FBQztBQW1DOUIsTUFBTSxDQUFDLE9BQU8sT0FBTyxTQUFTO0lBWTdCLFlBQVksRUFDWCxPQUFPLEVBQ1AsVUFBVSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLEtBQUssR0FDWTtRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRXBELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU8sYUFBYTtRQUNwQixPQUFPO1lBQ04sTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDdEMsQ0FBQztJQUNILENBQUM7SUFFTyxvQkFBb0IsQ0FBQyxTQUFjO1FBQzFDLElBQUk7WUFDSCxJQUFJLE9BQU8sU0FBUyxLQUFLLFVBQVUsRUFBRTtnQkFDcEMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FDN0MsSUFBSSxDQUFDLEdBQUcsRUFDUixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUNyQyxDQUFDO2lCQUNGO3FCQUFNO29CQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDekQ7Z0JBQ0QsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDO2FBQ3RCO2lCQUFNO2dCQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDOUM7U0FDRDtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNwQjtJQUNGLENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxPQUFZO1FBQ3RDLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxFQUFFO1lBQ2xDLElBQUk7Z0JBQ0gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQzthQUM5QztZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEI7U0FDRDthQUFNO1lBQ04sT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM1QztJQUNGLENBQUM7SUFFTyxVQUFVLENBQUksV0FBbUI7UUFDeEMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0RSxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFTyxhQUFhO1FBQ3BCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDcEMsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssV0FBVyxFQUFFO2dCQUN6QyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDO29CQUNsQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FDM0IsQ0FBQztxQkFDRjthQUNGO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sZUFBZTtRQUN0QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRU8sbUJBQW1CO1FBQzFCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN2QyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDO2dCQUNsQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUNoQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQy9CLENBQUM7aUJBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFTSxJQUFJO1FBQ1YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRU0sSUFBSSxDQUFDLFFBQWdCLEVBQUUsTUFBVztRQUN4QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFFTSxLQUFLO1FBQ1gsSUFDQyxRQUFRLENBQUMsV0FBVztZQUNuQixDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVO1lBQ3BDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFDbkM7WUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDWjthQUFNO1lBQ04sUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDcEU7SUFDRixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaXNQYWdlIGZyb20gXCIuL2lzUGFnZVwiO1xuaW1wb3J0IElSdWxlciBmcm9tIFwiLi9JUnVsZXJcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJQ29udGFpbmVyUHJvcHMge1xuXHRhcHBOYW1lOiBzdHJpbmc7XG5cdGNvbXBvbmVudHM/OiBhbnlbXTtcblx0cGFnZXM/OiBJUGFnZUNvbXBvbmVudHNbXTtcblx0c2VydmljZXM/OiBhbnlbXTtcblx0Y29uZmlnPzogYW55O1xuXHRydWxlcj86IElSdWxlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUGFnZUNvbXBvbmVudHMge1xuXHRwYWdlUmVmczogc3RyaW5nW107XG5cdGNvbXBvbmVudHM6IGFueVtdO1xuXHRzZXJ2aWNlcz86IGFueVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElDb250YWluZXJDb250ZXh0IHtcblx0Y29uZmlnOiBhbnk7XG5cdGdldFNlcnZpY2U6IDxUPihzZXJ2aWNlTmFtZTogc3RyaW5nKSA9PiBUIHwgZmFsc2U7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcblx0aW50ZXJmYWNlIFdpbmRvdyB7XG5cdFx0bTNBcHBzOiBSZWNvcmQ8c3RyaW5nLCBDb250YWluZXI+O1xuXHR9XG5cblx0aW50ZXJmYWNlIERvY3VtZW50IHtcblx0XHRhdHRhY2hFdmVudDpcblx0XHRcdHwgKChldmVudDogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcikgPT4gYm9vbGVhbiB8IGZhbHNlKVxuXHRcdFx0fCB1bmRlZmluZWQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIHtcblx0cHJpdmF0ZSBydWxlcjogSVJ1bGVyO1xuXHRwcml2YXRlIGFwcE5hbWU6IHN0cmluZztcblx0cHJpdmF0ZSBjb25maWc6IGFueTtcblx0cHJpdmF0ZSBjb21wb25lbnRzQ29uZmlnOiBhbnk7XG5cdHByaXZhdGUgY29tcG9uZW50czogYW55W107XG5cdHByaXZhdGUgcGFnZUNvbXBvbmVudHM6IElQYWdlQ29tcG9uZW50c1tdO1xuXHRwcml2YXRlIHNlcnZpY2VzOiBhbnlbXTtcblx0cHJpdmF0ZSBzZXJ2aWNlTWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuXHRwcml2YXRlIGluc3RhbmNlczogUmVjb3JkPHN0cmluZywgb2JqZWN0Pjtcblx0cHJpdmF0ZSBjdHg6IElDb250YWluZXJDb250ZXh0O1xuXG5cdGNvbnN0cnVjdG9yKHtcblx0XHRhcHBOYW1lLFxuXHRcdGNvbXBvbmVudHMsXG5cdFx0cGFnZXMsXG5cdFx0c2VydmljZXMsXG5cdFx0Y29uZmlnLFxuXHRcdHJ1bGVyLFxuXHR9OiBJQ29udGFpbmVyUHJvcHMpIHtcblx0XHR0aGlzLmFwcE5hbWUgPSBhcHBOYW1lO1xuXHRcdHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG5cdFx0dGhpcy5wYWdlQ29tcG9uZW50cyA9IHBhZ2VzID8gWy4uLnBhZ2VzXSA6IFtdO1xuXHRcdHRoaXMuY29tcG9uZW50cyA9IGNvbXBvbmVudHMgPyBbLi4uY29tcG9uZW50c10gOiBbXTtcblxuXHRcdHRoaXMuc2VydmljZXMgPSBzZXJ2aWNlcyA/IFsuLi5zZXJ2aWNlc10gOiBbXTtcblx0XHR0aGlzLnNlcnZpY2VNYXAgPSB7fTtcblxuXHRcdHRoaXMuaW5zdGFuY2VzID0ge307XG5cdFx0dGhpcy5jb21wb25lbnRzQ29uZmlnID0ge307XG5cblx0XHR0aGlzLnJ1bGVyID0gcnVsZXIgPyBydWxlciA6IG5ldyBpc1BhZ2UoKTtcblxuXHRcdHRoaXMuY3R4ID0gdGhpcy5jcmVhdGVDb250ZXh0LmNhbGwodGhpcyk7XG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZUNvbnRleHQoKTogSUNvbnRhaW5lckNvbnRleHQge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjb25maWc6IHRoaXMuY29uZmlnLFxuXHRcdFx0Z2V0U2VydmljZTogdGhpcy5nZXRTZXJ2aWNlLmJpbmQodGhpcyksXG5cdFx0fTtcblx0fVxuXG5cdHByaXZhdGUgaW5zdGFudGlhdGVDb21wb25lbnQoQ29tcG9uZW50OiBhbnkpIHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKHR5cGVvZiBDb21wb25lbnQgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRpZiAodGhpcy5jb21wb25lbnRzQ29uZmlnW0NvbXBvbmVudC5uYW1lXSkge1xuXHRcdFx0XHRcdHRoaXMuaW5zdGFuY2VzW0NvbXBvbmVudC5uYW1lXSA9IG5ldyBDb21wb25lbnQoXG5cdFx0XHRcdFx0XHR0aGlzLmN0eCxcblx0XHRcdFx0XHRcdHRoaXMuY29tcG9uZW50c0NvbmZpZ1tDb21wb25lbnQubmFtZV1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuaW5zdGFuY2VzW0NvbXBvbmVudC5uYW1lXSA9IG5ldyBDb21wb25lbnQodGhpcy5jdHgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBDb21wb25lbnQubmFtZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIk5vdCBhbiBDb25zdHJ1Y3RvclwiLCBDb21wb25lbnQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oZXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgaW5zdGFudGlhdGVTZXJ2aWNlKFNlcnZpY2U6IGFueSkge1xuXHRcdGlmICh0eXBlb2YgU2VydmljZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLnNlcnZpY2VNYXBbU2VydmljZS5uYW1lXSA9IG5ldyBTZXJ2aWNlKCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJOb3QgYW4gQ29uc3RydWN0b3JcIiwgU2VydmljZSk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBnZXRTZXJ2aWNlPFQ+KHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBUIHwgZmFsc2Uge1xuXHRcdGlmICh0aGlzLnNlcnZpY2VNYXBbc2VydmljZU5hbWVdKSByZXR1cm4gdGhpcy5zZXJ2aWNlTWFwW3NlcnZpY2VOYW1lXTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwcml2YXRlIGJ1aWxkU2VydmljZXMoKSB7XG5cdFx0dGhpcy5wYWdlQ29tcG9uZW50cy5mb3JFYWNoKChpdGVtKSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIGl0ZW0uc2VydmljZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0aWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoXCJwYWdlUmVmc1wiKSlcblx0XHRcdFx0XHRpZiAodGhpcy5ydWxlci5pcyhpdGVtLnBhZ2VSZWZzKSkge1xuXHRcdFx0XHRcdFx0aXRlbS5zZXJ2aWNlcy5mb3JFYWNoKChzZXJ2aWNlKSA9PlxuXHRcdFx0XHRcdFx0XHR0aGlzLnNlcnZpY2VzLnB1c2goc2VydmljZSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXMuc2VydmljZXMubWFwKHRoaXMuaW5zdGFudGlhdGVTZXJ2aWNlLmJpbmQodGhpcykpO1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZENvbXBvbmVudHMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5tYXAodGhpcy5pbnN0YW50aWF0ZUNvbXBvbmVudC5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdHByaXZhdGUgYnVpbGRQYWdlQ29tcG9uZW50cygpIHtcblx0XHRyZXR1cm4gdGhpcy5wYWdlQ29tcG9uZW50cy5tYXAoKGl0ZW0pID0+IHtcblx0XHRcdGlmIChpdGVtLmhhc093blByb3BlcnR5KFwicGFnZVJlZnNcIikpXG5cdFx0XHRcdGlmICh0aGlzLnJ1bGVyLmlzKGl0ZW0ucGFnZVJlZnMpKSB7XG5cdFx0XHRcdFx0aXRlbS5jb21wb25lbnRzLmZvckVhY2goKENvbXApID0+XG5cdFx0XHRcdFx0XHR0aGlzLmluc3RhbnRpYXRlQ29tcG9uZW50KENvbXApXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHVibGljIGluaXQoKSB7XG5cdFx0dGhpcy5idWlsZFNlcnZpY2VzLmNhbGwodGhpcyk7XG5cdFx0dGhpcy5idWlsZENvbXBvbmVudHMuY2FsbCh0aGlzKTtcblx0XHR0aGlzLmJ1aWxkUGFnZUNvbXBvbmVudHMuY2FsbCh0aGlzKTtcblxuXHRcdHdpbmRvd1tcIm0zQXBwc1wiXSA9IHsgW3RoaXMuYXBwTmFtZV06IHRoaXMgfTtcblx0fVxuXG5cdHB1YmxpYyBiaW5kKGNvbXBOYW1lOiBzdHJpbmcsIGNvbmZpZzogYW55KSB7XG5cdFx0dGhpcy5jb21wb25lbnRzQ29uZmlnW2NvbXBOYW1lXSA9IGNvbmZpZztcblx0fVxuXG5cdHB1YmxpYyBzdGFydCgpIHtcblx0XHRpZiAoXG5cdFx0XHRkb2N1bWVudC5hdHRhY2hFdmVudFxuXHRcdFx0XHQ/IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIlxuXHRcdFx0XHQ6IGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiXG5cdFx0KSB7XG5cdFx0XHR0aGlzLmluaXQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgdGhpcy5pbml0LmJpbmQodGhpcykpO1xuXHRcdH1cblx0fVxufVxuIl19
  
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
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0NoZWNrb3V0VUkuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvY29tcG9uZW50cy9DdXN0b21JbnN0YWxsbWVudFBlckl0ZW1zLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2NvbXBvbmVudHMvQ3VzdG9tSW5zdGFsbG1lbnRzLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2NvbXBvbmVudHMvRXhlbXBsZS5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0V4ZW1wbGVFdmVudC5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jb21wb25lbnRzL0xvZ2luTW9kYWwuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvY29tcG9uZW50cy9TdGVwQmFyLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4vc3JjL2FycXVpdm9zL2pzL2hlbHBlcnMvTWVkaWFzTWF0Y2guanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvaGVscGVycy92dGV4VXRpbHMuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi9zcmMvYXJxdWl2b3MvanMvaGVscGVycy93YWl0Rm9yRWwuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL1N0YXRlTWFuYWdlci9QdWJTdWIuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL1N0YXRlTWFuYWdlci9TdG9yZS5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uLi9ub2RlX21vZHVsZXMvQGFnZW5jaWFtMy9wa2cvZGlzdC9saWIvU3RhdGVNYW5hZ2VyL21lcmdlU3RvcmVzLmpzIiwid2VicGFjazovL2NoZWNrb3V0Ly4uL25vZGVfbW9kdWxlcy9AYWdlbmNpYW0zL3BrZy9kaXN0L2xpYi9jb3JlL0NvbnRhaW5lci5qcyIsIndlYnBhY2s6Ly9jaGVja291dC8uLi9ub2RlX21vZHVsZXMvQGFnZW5jaWFtMy9wa2cvZGlzdC9saWIvY29yZS9pc1BhZ2UuanMiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvLi4vbm9kZV9tb2R1bGVzL0BhZ2VuY2lhbTMvcGtnL2Rpc3QvbGliL2luZGV4LmpzIiwid2VicGFjazovL2NoZWNrb3V0L2V4dGVybmFsIFwialF1ZXJ5XCIiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NoZWNrb3V0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2hlY2tvdXQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jaGVja291dC8uL3NyYy9hcnF1aXZvcy9qcy9jaGVja291dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBMEQ7QUFDUztBQUN0Qjs7QUFFOUI7QUFDZjtBQUNBOztBQUVBLFlBQVksa0VBQWdCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsQ0FBQztBQUN0Qix3QkFBd0IsQ0FBQztBQUN6Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUIsdUJBQXVCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFD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V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTmlEO0FBQ047QUFDQTtBQUNVO0FBQ1Y7QUFDc0I7QUFDYztBQUM5Qjs7QUFFakQsdUJBQXVCLHFEQUFTO0FBQ2hDO0FBQ0EsaUJBQWlCLDJEQUFVLEVBQUUsd0RBQU8sRUFBRSw2REFBWSxFQUFFLDREQUFPLEVBQUUsdUVBQWtCLEVBQUUsOEVBQXlCLEVBQUUsK0RBQVU7QUFDdEgsQ0FBQzs7QUFFRCIsImZpbGUiOiJndWFyYXJhcGVzLXRlbXBsYXRlLS1jaGVja291dC1idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1NtYWxsZXJUaGVuNzY4IH0gZnJvbSBcIi4uL2hlbHBlcnMvTWVkaWFzTWF0Y2hcIjtcbmltcG9ydCB7IGFsdGVyYXJUYW1hbmhvSW1hZ2VtU3JjVnRleCB9IGZyb20gXCIuLi9oZWxwZXJzL3Z0ZXhVdGlsc1wiO1xuaW1wb3J0IHdhaXRGb3JFbCBmcm9tIFwiLi4vaGVscGVycy93YWl0Rm9yRWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hlY2tvdXRVSSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgICAgIGlmIChpc1NtYWxsZXJUaGVuNzY4KSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycygpO1xuICAgICAgICAgICAgdGhpcy5ldmVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Rm9vdGVyRHJvcGRvd24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdG9ycygpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9ICQoXCIuZm9vdGVyQ2hlY2tvdXRfX3RpdGxlXCIpO1xuICAgICAgICB0aGlzLmNvbnRlbnRzID0gJChcIi5mb290ZXJDaGVja291dF9fY29udGVudFwiKTtcbiAgICB9XG5cbiAgICBldmVudHMoKSB7XG4gICAgICAgIHRoaXMudGl0bGUuY2xpY2sodGhpcy50b2dnbGVGb290ZXJEcm9wZG93bi5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzZXRGb290ZXJEcm9wZG93bigpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRpdGxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnRpdGxlW2ldLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bl9fdGl0bGVcIik7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzW2ldLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bl9fY29udGVudC0tY2xvc2VkXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlRm9vdGVyRHJvcGRvd24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoXCJjbG9zZWRcIik7XG5cbiAgICAgICAgZXZlbnQudGFyZ2V0Lm5leHRFbGVtZW50U2libGluZy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAgICAgXCJkcm9wZG93bl9fY29udGVudC0tY2xvc2VkXCJcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLmNvbmZpZ1RodW1iKCk7XG4gICAgICAgIHdhaXRGb3JFbChcIi5wcm9kdWN0LWltYWdlIGltZ1wiLCB0aGlzLnJlc2l6ZUltYWdlcy5iaW5kKHRoaXMpKTtcbiAgICAgICAgJCh3aW5kb3cpLm9uKFwib3JkZXJGb3JtVXBkYXRlZC52dGV4XCIsIHRoaXMucmVzaXplSW1hZ2VzLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbmZpZ1RodW1iKCkge1xuICAgICAgICBpZiAoaXNTbWFsbGVyVGhlbjc2OCkge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IDczO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSA5NjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSA2MztcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gODM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNpemVJbWFnZXMoKSB7XG4gICAgICAgICQoXCIucHJvZHVjdC1pbWFnZSBpbWdcIikuZWFjaCgoaSwgZWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0ICRlbCA9ICQoZWwpO1xuICAgICAgICAgICAgJGVsLmF0dHIoXG4gICAgICAgICAgICAgICAgXCJzcmNcIixcbiAgICAgICAgICAgICAgICBhbHRlcmFyVGFtYW5ob0ltYWdlbVNyY1Z0ZXgoXG4gICAgICAgICAgICAgICAgICAgICRlbC5hdHRyKFwic3JjXCIpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vIEluamV0YSBlc3RpbG9zIGRvIGNvbXBvbmVudGUgZGUgcGFyY2VsYXMgbm9zIGl0ZW5zIGRvIGNhcnJpbmhvICh1bWEgdmV6KVxuZnVuY3Rpb24gSW5zZXJ0U3R5bGVzTWluaWNhcnRJdGVtcygpIHtcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXN0b20taW5zdGFsbG1lbnQtaXRlbS1taW5pY2FydC1zdHlsZScpKSByZXR1cm5cbiAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gIHN0eWxlLmlkID0gJ2N1c3RvbS1pbnN0YWxsbWVudC1pdGVtLW1pbmljYXJ0LXN0eWxlJ1xuICBzdHlsZS5pbm5lckhUTUwgPSBgXG4gICAgLmN1c3RvbS1pbnN0YWxsbWVudC10b3RhbCB7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBjb2xvcjogIzcwNzA3MDtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgd2lkdGg6IDE5MHB4O1xuICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgZ3JpZC1hcmVhOiAyIC8gMSAvIDIgLyAtMTtcbiAgICAgIGZvbnQtZmFtaWx5OiAnVWJ1bnR1Jywgc2Fucy1zZXJpZjtcbiAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgICBsaW5lLWhlaWdodDogMTZweDtcbiAgICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgfVxuICAgIEBtZWRpYSAobWluLXdpZHRoOiAxMDI0cHgpIHtcbiAgICAgIC5jdXN0b20taW5zdGFsbG1lbnQtdG90YWwge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgfVxuICAgIH1cbiAgYFxuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKVxufVxuXG4vLyBBZ3VhcmRhIFZURVggSlMgKG9yZGVyRm9ybSkgZXN0YXIgZGlzcG9uw612ZWwgYW50ZXMgZGUgZXhlY3V0YXIgYSBsw7NnaWNhXG5mdW5jdGlvbiB3YWl0Rm9yVnRleGpzKGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHJldHVyblxuICBpZiAod2luZG93LnZ0ZXhqcyAmJiB3aW5kb3cudnRleGpzLmNoZWNrb3V0ICYmIHdpbmRvdy52dGV4anMuY2hlY2tvdXQuZ2V0T3JkZXJGb3JtKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfSBlbHNlIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHdhaXRGb3JWdGV4anMoY2FsbGJhY2spLCAyMDAwKTtcbiAgfVxufVxuXG4vLyBCbG9jbyBwcmluY2lwYWw6IHJlZ2lzdHJhIGVzdGFkb3MsIGluamV0YSBlc3RpbG9zIGUgYW1hcnJhIGV2ZW50b3MgZGUgYXR1YWxpemHDp8Ojb1xud2FpdEZvclZ0ZXhqcyhmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHJlbmRlcmVkTGluZUl0ZW1LZXlzID0gbmV3IFNldCgpXG4gIGNvbnN0IGluRmxpZ2h0TGluZUl0ZW1LZXlzID0gbmV3IFNldCgpXG4gIGNvbnN0IHNpbXVsYXRpb25DYWNoZSA9IG5ldyBNYXAoKVxuXG4gIC8vIENoYW1hIGEgQVBJIGRlIHNpbXVsYcOnw6NvIGRvIGNoZWNrb3V0IHBhcmEgb2J0ZXIgb3DDp8O1ZXMgZGUgcGFyY2VsYW1lbnRvIGRvIFNLVVxuICBhc3luYyBmdW5jdGlvbiBzaW11bGF0ZUl0ZW1JbnN0YWxsbWVudHMoc2t1SWQsIHF1YW50aXR5KSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL2FwaS9jaGVja291dC9wdWIvb3JkZXJGb3Jtcy9zaW11bGF0aW9uJywge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICB7IGlkOiBza3VJZCwgcXVhbnRpdHk6IHF1YW50aXR5LCBzZWxsZXI6ICcxJyB9LFxuICAgICAgICBdLFxuICAgICAgICBwb3N0YWxDb2RlOiAnMDcxNDAtMjMzJyxcbiAgICAgICAgY291bnRyeTogJ0JSQScsXG4gICAgICB9KSxcbiAgICB9KVxuICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcignU2ltdWxhdGlvbiBlcnJvcicpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgLy8gUmV0b3JuYSBzaW11bGHDp8OjbyBkbyBjYWNoZSBvdSBleGVjdXRhIGUgYXJtYXplbmEgYW50ZXMgZGUgcmV0b3JuYXJcbiAgZnVuY3Rpb24gZ2V0U2ltdWxhdGlvbihza3VJZCwgcXVhbnRpdHkpIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGAke3NrdUlkfToke3F1YW50aXR5fWBcbiAgICBpZiAoc2ltdWxhdGlvbkNhY2hlLmhhcyhjYWNoZUtleSkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc2ltdWxhdGlvbkNhY2hlLmdldChjYWNoZUtleSkpXG4gICAgfVxuICAgIHJldHVybiBzaW11bGF0ZUl0ZW1JbnN0YWxsbWVudHMoc2t1SWQsIHF1YW50aXR5KS50aGVuKHJlcyA9PiB7XG4gICAgICBzaW11bGF0aW9uQ2FjaGUuc2V0KGNhY2hlS2V5LCByZXMpXG4gICAgICByZXR1cm4gcmVzXG4gICAgfSlcbiAgfVxuXG4gIC8vIEZvcm1hdGEgdmFsb3IgKGFycmVkb25kYSBwYXJhIDIgY2FzYXMgZGVjaW1haXMpXG4gIGZ1bmN0aW9uIGZvcm1hdEN1cnJlbmN5KHZhbHVlSW5DZW50cykge1xuICAgIHJldHVybiAodmFsdWVJbkNlbnRzIC8gMTAwKS50b0xvY2FsZVN0cmluZygncHQtQlInLCB7XG4gICAgICBzdHlsZTogJ2N1cnJlbmN5JyxcbiAgICAgIGN1cnJlbmN5OiAnQlJMJ1xuICAgIH0pXG4gIH1cblxuICAvLyBQYXJhIGNhZGEgaXRlbSBkbyBjYXJyaW5obywgaW5zZXJlIChvdSByZWFwcm92ZWl0YSkgdW0gYmxvY28gZGUgcGFyY2VsYXMgbG9nbyBhcMOzcyAudG90YWwtcHJpY2UgZSBwcmVlbmNoZSBjb20gYSBtZWxob3Igb3DDp8Ojb1xuICBmdW5jdGlvbiBpbnNlcnRQZXJJdGVtSW5zdGFsbG1lbnRzKG9yZGVyRm9ybSkge1xuICAgIHJlbmRlcmVkTGluZUl0ZW1LZXlzLmNsZWFyKClcbiAgICBvcmRlckZvcm0/Lml0ZW1zPy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3Qgc2t1ID0gaXRlbT8uaWRcbiAgICAgIGNvbnN0IHF1YW50aXR5ID0gaXRlbT8ucXVhbnRpdHlcbiAgICAgIFxuICAgICAgY29uc3QgdG90YWxQcmljZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRvdGFsLXByaWNlJylbaW5kZXhdXG4gICAgICBpZiAoIXNrdSB8fCAhcXVhbnRpdHkgfHwgIXRvdGFsUHJpY2VFbCkgcmV0dXJuXG5cbiAgICAgIC8vIENoYXZlIGVzdMOhdmVsIHBvciBsaW5oYSAodW5pcXVlSWQgcXVhbmRvIGRpc3BvbsOtdmVsKVxuICAgICAgY29uc3Qga2V5ID0gaXRlbS51bmlxdWVJZCB8fCBgJHtza3V9LSR7aW5kZXh9YFxuICAgICAgaWYgKGluRmxpZ2h0TGluZUl0ZW1LZXlzLmhhcyhrZXkpKSByZXR1cm5cbiAgICAgIGluRmxpZ2h0TGluZUl0ZW1LZXlzLmFkZChrZXkpXG5cbiAgICAgIC8vIEdhcmFudGUgYSBleGlzdMOqbmNpYSBkbyBjb250w6ppbmVyIGxvZ28gYXDDs3MgbyB0b3RhbCBkbyBpdGVtXG4gICAgICBsZXQgY3VzdG9tSW5zdGFsbG1lbnRDb21wb25lbnQgPSB0b3RhbFByaWNlRWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCcuY3VzdG9tLWluc3RhbGxtZW50LXRvdGFsJylcbiAgICAgIGlmICghY3VzdG9tSW5zdGFsbG1lbnRDb21wb25lbnQpIHtcbiAgICAgICAgY3VzdG9tSW5zdGFsbG1lbnRDb21wb25lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBjdXN0b21JbnN0YWxsbWVudENvbXBvbmVudC5jbGFzc05hbWUgPSAnY3VzdG9tLWluc3RhbGxtZW50LXRvdGFsJ1xuICAgICAgICB0b3RhbFByaWNlRWwuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGN1c3RvbUluc3RhbGxtZW50Q29tcG9uZW50KVxuICAgICAgfVxuXG4gICAgICAvLyBCdXNjYSBzaW11bGHDp8OjbyBlIGVzY3JldmUgYSBtZWxob3Igb3DDp8OjbyBkZSBwYXJjZWxhXG4gICAgICBnZXRTaW11bGF0aW9uKFN0cmluZyhza3UpLCBxdWFudGl0eSlcbiAgICAgICAgLnRoZW4oc2ltID0+IHtcbiAgICAgICAgICBjb25zdCBpbnN0YWxsbWVudHMgPSBzaW0/LnBheW1lbnREYXRhPy5pbnN0YWxsbWVudE9wdGlvbnM/LlswXT8uaW5zdGFsbG1lbnRzXG4gICAgICAgICAgY29uc3QgYmVzdCA9IGluc3RhbGxtZW50cz8uW2luc3RhbGxtZW50cy5sZW5ndGggLSAxXVxuICAgICAgICAgIGlmIChiZXN0KSB7XG4gICAgICAgICAgICBjdXN0b21JbnN0YWxsbWVudENvbXBvbmVudC5pbm5lclRleHQgPSBgb3UgZW0gYXTDqSAke2Jlc3QuY291bnR9eCBkZSAke2Zvcm1hdEN1cnJlbmN5KGJlc3QudmFsdWUpfWBcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIH0pXG4gICAgICAgIC5maW5hbGx5KCgpID0+IGluRmxpZ2h0TGluZUl0ZW1LZXlzLmRlbGV0ZShrZXkpKVxuICAgIH0pXG4gIH1cblxuICAvLyBJbmpldGEgZXN0aWxvcywgbGltcGEgc29icmFzIGUgcmVuZGVyaXphIHBvciBpdGVtXG4gIEluc2VydFN0eWxlc01pbmljYXJ0SXRlbXMoKVxuICB2dGV4anMuY2hlY2tvdXQuZ2V0T3JkZXJGb3JtKCkudGhlbihvcmRlckZvcm0gPT4ge1xuICAgIGluc2VydFBlckl0ZW1JbnN0YWxsbWVudHMob3JkZXJGb3JtKVxuICB9KVxuXG4gIC8vIEF0dWFsaXphIG11ZGFuw6dhcyBkbyBvcmRlckZvcm0gXG4gICQod2luZG93KS5vbignb3JkZXJGb3JtVXBkYXRlZC52dGV4JywgZnVuY3Rpb24gKF8sIG9yZGVyRm9ybSkge1xuICAgIEluc2VydFN0eWxlc01pbmljYXJ0SXRlbXMoKVxuICAgIGluc2VydFBlckl0ZW1JbnN0YWxsbWVudHMob3JkZXJGb3JtKVxuICB9KVxuXG4gIC8vIFJlYWdlIGEgbmF2ZWdhw6fDo28gZGVudHJvIGRvIGNoZWNrb3V0IChoYXNoY2hhbmdlKVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsICgpID0+IHtcbiAgICB2dGV4anMuY2hlY2tvdXQuZ2V0T3JkZXJGb3JtKCkudGhlbihvcmRlckZvcm0gPT4ge1xuICAgICAgaW5zZXJ0UGVySXRlbUluc3RhbGxtZW50cyhvcmRlckZvcm0pXG4gICAgfSlcbiAgfSlcbn0pXG4iLCJmdW5jdGlvbiB3YWl0Rm9yVnRleGpzKGNhbGxiYWNrKSB7XG4gIGlmICh3aW5kb3cudnRleGpzICYmIHdpbmRvdy52dGV4anMuY2hlY2tvdXQgJiYgd2luZG93LnZ0ZXhqcy5jaGVja291dC5nZXRPcmRlckZvcm0pIHtcbiAgICBjYWxsYmFjaygpO1xuICB9IGVsc2Uge1xuICAgIHNldFRpbWVvdXQoKCkgPT4gd2FpdEZvclZ0ZXhqcyhjYWxsYmFjayksIDIwMCk7XG4gIH1cbn1cblxud2FpdEZvclZ0ZXhqcyhmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGluc2VydFN0eWxlcygpIHtcbiAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1c3RvbS1pbnN0YWxsbWVudC1zdHlsZScpKSByZXR1cm5cblxuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgIHN0eWxlLmlkID0gJ2N1c3RvbS1pbnN0YWxsbWVudC1zdHlsZSdcbiAgICBzdHlsZS5pbm5lckhUTUwgPSBgXG4gICAgICAgIC5jdXN0b20taW5zdGFsbG1lbnQtaW5mbyB7XG4gICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICAgIGNvbG9yOiAjNzA3MDcwO1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgd2lkdGg6IDE3MXB4O1xuICAgICAgICAgIG1heC1oZWlnaHQ6IDEwcHg7XG4gICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiAnVWJ1bnR1Jywgc2Fucy1zZXJpZjtcbiAgICAgICAgICBmb250LXdlaWdodDogNDAwO1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICAgICAgICAgIHJpZ2h0OiAtMnB4O1xuICAgICAgICAgIGJvdHRvbTogMjAycHg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIEBtZWRpYSAobWluLXdpZHRoOiA3NjdweCkgYW5kIChtYXgtd2lkdGg6IDEwMjRweCkge1xuICAgICAgICAgIC5jdXN0b20taW5zdGFsbG1lbnQtaW5mbyB7XG4gICAgICAgICAgICBib3R0b206IDE2NHB4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICBcbiAgICAgICAgQG1lZGlhIChtaW4td2lkdGg6IDEwMjRweCkge1xuICAgICAgICAgIC5jdXN0b20taW5zdGFsbG1lbnQtaW5mbyB7XG4gICAgICAgICAgICByaWdodDogNnB4O1xuICAgICAgICAgICAgYm90dG9tOiAxMjJweDtcbiAgICAgICAgICAgIHdpZHRoOiAxODBweDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIGBcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKVxuICB9XG5cbiAgZnVuY3Rpb24gaW5zZXJ0QmVzdEluc3RhbGxtZW50SW5mbyhvcmRlckZvcm0pIHtcbiAgICBjb25zdCBzdW1tYXJ5VG90YWxpemVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zdW1tYXJ5LXRvdGFsaXplcnMnKVxuICAgIGlmICghb3JkZXJGb3JtIHx8ICFzdW1tYXJ5VG90YWxpemVycykge1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmN1c3RvbS1pbnN0YWxsbWVudC1pbmZvJyk/LnJlbW92ZSgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBleGlzdGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jdXN0b20taW5zdGFsbG1lbnQtaW5mbycpXG4gICAgaWYgKGV4aXN0aW5nKSBleGlzdGluZy5yZW1vdmUoKVxuXG4gICAgY29uc3QgaW5zdGFsbG1lbnRPcHRpb25zID0gb3JkZXJGb3JtPy5wYXltZW50RGF0YT8uaW5zdGFsbG1lbnRPcHRpb25zO1xuICAgIGNvbnN0IGluc3RhbGxtZW50cyA9IGluc3RhbGxtZW50T3B0aW9ucz8uWzBdPy5pbnN0YWxsbWVudHNcbiAgICBpZiAoIWluc3RhbGxtZW50cyB8fCBpbnN0YWxsbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAgIGNvbnN0IGJlc3QgPSBpbnN0YWxsbWVudHNbaW5zdGFsbG1lbnRzLmxlbmd0aCAtIDFdXG4gICAgaWYgKCFiZXN0KSByZXR1cm5cblxuICAgIGNvbnN0IHZhbHVlRm9ybWF0dGVkID0gKGJlc3QudmFsdWUgLyAxMDApLnRvTG9jYWxlU3RyaW5nKCdwdC1CUicsIHtcbiAgICAgIHN0eWxlOiAnY3VycmVuY3knLFxuICAgICAgY3VycmVuY3k6ICdCUkwnLFxuICAgICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuICAgIH0pXG5cbiAgICBjb25zdCBpbnN0YWxsbWVudFRleHQgPSBgb3UgZW0gYXTDqSAke2Jlc3QuY291bnR9eCBkZSAke3ZhbHVlRm9ybWF0dGVkfWBcblxuICAgIGNvbnN0IGluc3RhbGxtZW50RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGluc3RhbGxtZW50RWwuY2xhc3NOYW1lID0gJ2N1c3RvbS1pbnN0YWxsbWVudC1pbmZvJ1xuICAgIGluc3RhbGxtZW50RWwuaW5uZXJUZXh0ID0gaW5zdGFsbG1lbnRUZXh0XG5cbiAgICBzdW1tYXJ5VG90YWxpemVycy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpbnN0YWxsbWVudEVsLCBzdW1tYXJ5VG90YWxpemVycy5uZXh0U2libGluZylcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhaXRGb3JTdW1tYXJ5VG90YWxpemVyc0FuZEluc2VydChvcmRlckZvcm0pIHtcbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGNvbnN0IHN1bW1hcnlUb3RhbGl6ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1bW1hcnktdG90YWxpemVycycpO1xuICAgICAgaWYgKHN1bW1hcnlUb3RhbGl6ZXJzKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICBpbnNlcnRCZXN0SW5zdGFsbG1lbnRJbmZvKG9yZGVyRm9ybSk7XG4gICAgICB9XG4gICAgfSwgMjAwKTtcbiAgICAvLyBPcGNpb25hbDogdGltZW91dCBwYXJhIG7Do28gcm9kYXIgcGFyYSBzZW1wcmVcbiAgICBzZXRUaW1lb3V0KCgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpLCAxMDAwMCk7XG4gIH1cblxuICBpbnNlcnRTdHlsZXMoKVxuXG4gIHZ0ZXhqcy5jaGVja291dC5nZXRPcmRlckZvcm0oKS50aGVuKG9yZGVyRm9ybSA9PiB7XG4gICAgd2FpdEZvclN1bW1hcnlUb3RhbGl6ZXJzQW5kSW5zZXJ0KG9yZGVyRm9ybSlcbiAgfSlcblxuICAkKHdpbmRvdykub24oJ29yZGVyRm9ybVVwZGF0ZWQudnRleCcsIGZ1bmN0aW9uIChfLCBvcmRlckZvcm0pIHsgIFxuICAgIGluc2VydFN0eWxlcygpXG4gICAgd2FpdEZvclN1bW1hcnlUb3RhbGl6ZXJzQW5kSW5zZXJ0KG9yZGVyRm9ybSlcbiAgfSlcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsICgpID0+IHtcbiAgICB2dGV4anMuY2hlY2tvdXQuZ2V0T3JkZXJGb3JtKCkudGhlbih3YWl0Rm9yU3VtbWFyeVRvdGFsaXplcnNBbmRJbnNlcnQpXG4gIH0pXG59KTtcbiIsImltcG9ydCB3YWl0Rm9yRWwgZnJvbSBcIi4uL2hlbHBlcnMvd2FpdEZvckVsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4ZW1wbGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbml0KCkge1xuICAgICAgICBhd2FpdCB0aGlzLnNlbGVjdG9ycygpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLml0ZW0pO1xuICAgIH1cblxuICAgIGFzeW5jIHNlbGVjdG9ycygpIHtcbiAgICAgICAgdGhpcy5pdGVtID0gYXdhaXQgd2FpdEZvckVsKFxuICAgICAgICAgICAgXCIuc3VtbWFyeS1jYXJ0LXRlbXBsYXRlLWhvbGRlciAuY2FydC1pdGVtc1wiXG4gICAgICAgICk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhlbXBsZUV2ZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudG9zKCk7XG4gICAgfVxuICAgIGV2ZW50b3MoKSB7XG4gICAgICAgICQod2luZG93KS5vbihcIm9yZGVyRm9ybVVwZGF0ZWQudnRleFwiLCB0aGlzLm9uVXBkYXRlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXBkYXRlKG9yZGVyRm9ybSkge1xuICAgICAgICBjb25zb2xlLmxvZyhvcmRlckZvcm0pO1xuICAgIH1cbn1cbiIsIihmdW5jdGlvbiAoKSB7XG5mdW5jdGlvbiB2ZXJpZnlMb2dnZWRJbigpIHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uPy5oYXNoO1xuICBcbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGNvbnN0IG9yZGVyRm9ybSA9IHZ0ZXhqcz8uY2hlY2tvdXQ/Lm9yZGVyRm9ybTtcbiAgICAgIGNvbnN0IGlzTG9nZ2VkID0gb3JkZXJGb3JtPy5sb2dnZWRJbjtcbiAgICAgIGlmKGlzTG9nZ2VkICE9PSB1bmRlZmluZWQpIHsgXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpOyBcbiAgXG4gICAgICAgIGlmKCFpc0xvZ2dlZCAmJiBoYXNoLmluY2x1ZGVzKFwiL3NoaXBwaW5nXCIpIHx8IGhhc2guaW5jbHVkZXMoXCIvcGF5bWVudFwiKSkge1xuICAgICAgICAgIGNoZWNrb3V0LmxvZ2luKCk7XG4gICAgICAgIH0gXG4gICAgICB9XG4gICAgfSwgMTAwMClcbiAgfVxuICBcbiAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIHZlcmlmeUxvZ2dlZEluKCk7XG4gIH0pXG4gIFxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsICgpID0+IHtcbiAgICB2ZXJpZnlMb2dnZWRJbigpO1xuICB9KVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiByZW5kZXJDaGVja291dFN0ZXBzKCkge1xuICAgIGNvbnN0IGJyb3duID0gXCIjRDJBRTgyXCI7ICAgXG4gICAgY29uc3QgZGFyayA9IFwiIzJEMkQyOFwiOyAgICBcbiAgICBjb25zdCB3aGl0ZSA9IFwiI2ZmZlwiO1xuICAgIGNvbnN0IGNpcmNsZVNpemUgPSAzMjtcblxuICAgIGNvbnN0IHN0ZXBzID0gWydDYXJyaW5obycsICdEYWRvcyBQZXNzb2FpcycsICdFbnRyZWdhJywgJ1BhZ2FtZW50byddO1xuXG4gICAgbGV0IHN0ZXBzSFRNTCA9IGA8ZGl2IGNsYXNzPVwiaGVhZGVyLWNoZWNrb3V0LXN0ZXBzXCIgc3R5bGU9XCJ3aWR0aDoxMDAlO21hcmdpbjoxNnB4IDAgNDRweCAwO3Bvc2l0aW9uOnJlbGF0aXZlO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Zm9udC1mYW1pbHk6ICdNb250c2VycmF0JywgQXJpYWw7XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3RlcHMtZmxleFwiIHN0eWxlPVwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjt3aWR0aDo5NSU7bWFyZ2luOjAgYXV0bztwb3NpdGlvbjpyZWxhdGl2ZTtcIj5gO1xuXG4gICAgc3RlcHMuZm9yRWFjaCgodGl0bGUsIGkpID0+IHtcbiAgICAgIGlmIChpID4gMCkge1xuICAgICAgICBzdGVwc0hUTUwgKz0gYDxkaXYgY2xhc3M9XCJsaW5lXCIgc3R5bGU9XCJmbGV4OjE7aGVpZ2h0OjJweDthbGlnbi1zZWxmOmNlbnRlcjtiYWNrZ3JvdW5kOiR7YnJvd259O3RyYW5zaXRpb246YmFja2dyb3VuZCAwLjJzO21pbi13aWR0aDowO1wiPjwvZGl2PmA7XG4gICAgICB9XG4gICAgICBzdGVwc0hUTUwgKz0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwic3RlcC1jaXJjbGUtd3JhcFwiIHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjthbGlnbi1pdGVtczpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0ZXAtbnVtYmVyLWNpcmNsZVwiIGlkPVwiY2lyY2xlLSR7aSArIDF9XCIgc3R5bGU9XCJ3aWR0aDoke2NpcmNsZVNpemV9cHg7aGVpZ2h0OiR7Y2lyY2xlU2l6ZX1weDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MnB4IHNvbGlkICR7YnJvd259O2JhY2tncm91bmQ6JHt3aGl0ZX07Y29sb3I6JHticm93bn07ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZvbnQtd2VpZ2h0OjQwMDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxNHB4O2xldHRlci1zcGFjaW5nOjAlO2ZvbnQtZmFtaWx5OidNb250c2VycmF0Jywgc2Fucy1zZXJpZjtmb250LXdlaWdodDo0MDA7dHJhbnNpdGlvbjphbGwgMC4yczt6LWluZGV4OjE7XCI+JHtpICsgMX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RlcC10aXRsZVwiIGlkPVwibGFiZWwtJHtpICsgMX1cIiBzdHlsZT1cInBvc2l0aW9uOmFic29sdXRlO3RvcDozOHB4O2xlZnQ6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGVYKC01MCUpO3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE0cHg7Y29sb3I6JHticm93bn07Zm9udC13ZWlnaHQ6NDAwO2xldHRlci1zcGFjaW5nOjAlO2ZvbnQtZmFtaWx5OidNb250c2VycmF0Jywgc2Fucy1zZXJpZjt2ZXJ0aWNhbC1hbGlnbjptaWRkbGU7dHJhbnNpdGlvbjpjb2xvciAwLjJzOyR7aSA9PT0gMSA/ICd3aGl0ZS1zcGFjZTpub3dyYXA7JyA6ICcnfVwiPiR7dGl0bGV9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgYDtcbiAgICB9KTtcblxuICAgIHN0ZXBzSFRNTCArPSBgPC9kaXY+PC9kaXY+YDtcblxuICAgIGNvbnN0IGhlYWRlckNoZWNrb3V0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlYWRlckNoZWNrb3V0IC5jb250YWluZXInKTtcbiAgICBjb25zdCBleGlzdGluZ1N0ZXBCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVhZGVyLWNoZWNrb3V0LXN0ZXBzJyk7XG4gICAgaWYgKGV4aXN0aW5nU3RlcEJhcikgZXhpc3RpbmdTdGVwQmFyLnJlbW92ZSgpO1xuICAgIGlmIChoZWFkZXJDaGVja291dENvbnRhaW5lcikge1xuICAgICAgaGVhZGVyQ2hlY2tvdXRDb250YWluZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBzdGVwc0hUTUwpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0ZXBzSGFzaCA9IFtcIi9jaGVja291dCMvY2FydFwiLCBcIi9jaGVja291dCMvcHJvZmlsZVwiLCBcIi9jaGVja291dCMvc2hpcHBpbmdcIiwgXCIvY2hlY2tvdXQjL3BheW1lbnRcIl07XG4gIGNvbnN0IHVybE1hcHBpbmcgPSB7XG4gICAgXCIvY2hlY2tvdXQjL2VtYWlsXCI6IFwiL2NoZWNrb3V0Iy9wcm9maWxlXCJcbiAgfTtcblxuICBmdW5jdGlvbiB1cGRhdGVQcm9ncmVzcygpIHtcbiAgICBjb25zdCBicm93biA9IFwiI0QyQUU4MlwiO1xuICAgIGNvbnN0IGRhcmsgPSBcIiMyRDJEMjhcIjtcbiAgICBjb25zdCB3aGl0ZSA9IFwiI2ZmZlwiO1xuXG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGNvbnN0IGZ1bGxQYXRoID0gYC9jaGVja291dCR7aGFzaH1gO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gdXJsTWFwcGluZ1tmdWxsUGF0aF0gfHwgZnVsbFBhdGg7XG4gICAgY29uc3QgY3VycmVudFN0ZXBJbmRleCA9IHN0ZXBzSGFzaC5pbmRleE9mKG5vcm1hbGl6ZWRQYXRoKTtcbiAgICBpZiAoY3VycmVudFN0ZXBJbmRleCA9PT0gLTEpIHJldHVybjtcblxuICAgIC8vIEJvbGluaGFzIGUgdGV4dG9zXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgIGNvbnN0IGNpcmNsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBjaXJjbGUtJHtpICsgMX1gKTtcbiAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGxhYmVsLSR7aSArIDF9YCk7XG4gICAgICBpZiAoIWNpcmNsZSB8fCAhbGFiZWwpIGNvbnRpbnVlO1xuICAgICAgY2lyY2xlLnN0eWxlLmJhY2tncm91bmQgPSB3aGl0ZTtcbiAgICAgIGNpcmNsZS5zdHlsZS5jb2xvciA9IGJyb3duO1xuICAgICAgY2lyY2xlLnN0eWxlLmJvcmRlckNvbG9yID0gYnJvd247XG4gICAgICBsYWJlbC5zdHlsZS5jb2xvciA9IGJyb3duO1xuICAgICAgbGFiZWwuc3R5bGUuZm9udFdlaWdodCA9IFwiNDAwXCI7XG5cbiAgICAgIGlmIChpIDw9IGN1cnJlbnRTdGVwSW5kZXgpIHtcbiAgICAgICAgY2lyY2xlLnN0eWxlLmJhY2tncm91bmQgPSBkYXJrO1xuICAgICAgICBjaXJjbGUuc3R5bGUuY29sb3IgPSB3aGl0ZTtcbiAgICAgICAgY2lyY2xlLnN0eWxlLmJvcmRlckNvbG9yID0gZGFyaztcbiAgICAgICAgbGFiZWwuc3R5bGUuY29sb3IgPSBkYXJrO1xuICAgICAgICBsYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gXCI3MDBcIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBsaW5lRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubGluZScpO1xuICAgIGxpbmVFbGVtZW50cy5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGluZGV4IDwgY3VycmVudFN0ZXBJbmRleCkge1xuICAgICAgICBsaW5lLnN0eWxlLmJhY2tncm91bmQgPSBkYXJrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGluZS5zdHlsZS5iYWNrZ3JvdW5kID0gYnJvd247XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XG4gICAgY29uc3Qgc3RlcEJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXItY2hlY2tvdXQtc3RlcHMnKTtcbiAgICBpZiAoc3RlcEJhcikgc3RlcEJhci5yZW1vdmUoKTtcbiAgICByZW5kZXJDaGVja291dFN0ZXBzKCk7XG4gICAgdXBkYXRlUHJvZ3Jlc3MoKTtcbiAgfSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICByZW5kZXJDaGVja291dFN0ZXBzKCk7XG4gICAgdXBkYXRlUHJvZ3Jlc3MoKTtcbiAgfSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIHVwZGF0ZVByb2dyZXNzKTtcblxuICAkKHdpbmRvdykub24oJ29yZGVyRm9ybVVwZGF0ZWQudnRleCcsIGZ1bmN0aW9uIChldnQsIG9yZGVyRm9ybSkge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaCA9PT0gJyMvc2hpcHBpbmcnKSB7XG4gICAgfVxuICB9KTtcblxuICByZW5kZXJDaGVja291dFN0ZXBzKCk7XG4gIHVwZGF0ZVByb2dyZXNzKCk7XG5cbn0pKCk7XG4iLCJleHBvcnQgY29uc3QgaXNTbWFsbGVyVGhlbjc2OCA9IHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1heC13aWR0aDo3NjhweClcIikubWF0Y2hlcztcbiIsIi8qKlxuICogQWx0ZXJhIGFzIGRpbWVuw6fDtWVzIGVzcGVjaWZpY2FkYXMgbmEgdXJsIGRhIGltZ1xuICogQHBhcmFtIHtzdHJpbmd9IHNyYyB1cmwgZGEgaW1hZ2VtIG5hIFZURVhcbiAqIEBwYXJhbSB7aW50fSB3aWR0aFxuICogQHBhcmFtIHtpbnR9IGhlaWdodFxuICogQHJldHVybiB7c3RyaW5nfSB1cmwgZGEgaW1hZ2VtIGNvbSBvIHRhbWFuaG8gYWx0ZXJhZG9cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYWx0ZXJhclRhbWFuaG9JbWFnZW1TcmNWdGV4KHNyYywgd2lkdGgsIGhlaWdodCkge1xuICAgIGlmICh0eXBlb2Ygc3JjID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiUGFyYW1ldHJvICdzcmMnIG7Do28gcmVjZWJpZG8uXCIpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgd2lkdGggPSB0eXBlb2Ygd2lkdGggPT0gXCJ1bmRlZmluZWRcIiA/IDEgOiB3aWR0aDtcbiAgICBoZWlnaHQgPSB0eXBlb2YgaGVpZ2h0ID09IFwidW5kZWZpbmVkXCIgPyB3aWR0aCA6IGhlaWdodDtcblxuICAgIHNyYyA9IHNyYy5yZXBsYWNlKFxuICAgICAgICAvXFwvKFxcZCspKC0oXFxkKy1cXGQrKXwoX1xcZCspKVxcLy9nLFxuICAgICAgICBcIi8kMS1cIiArIHdpZHRoICsgXCItXCIgKyBoZWlnaHQgKyBcIi9cIlxuICAgICk7XG4gICAgcmV0dXJuIHNyYztcbn1cblxuLyoqXG4gKiBPYnRlbSBQcmVjb1xuICogY2FzbyBvIHByZWNvIHJlY2ViaWRvIHNlamEgdW0gRmxvYXQgb3UgaW50LFxuICogXHQnRXguJzogMTAuMiAtPicxMCwyMCdcbiAqIFJlY2ViZW5kbyB1bWEgc3RyaW5nIG8gdmFsb3Igc2VyYSByZXRvcm5hZG8gY29tbyB1bSBmbG9hdFxuICogXHQnRXguJzogJ1IkMS4yMzQsMzAnIC0+IDEyMzQuM1xuICogQHBhcmFtICB7RmxvYXRac3RyaW5nfSBwcmljZSBwcmXDp29cbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJpY2UocHJpY2UpIHtcbiAgICBpZiAoIXByaWNlKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGlmIChpc05hTihwcmljZSkpIHtcbiAgICAgICAgbGV0IG5ld1ByaWNlID0gcGFyc2VGbG9hdChcbiAgICAgICAgICAgIHByaWNlLnJlcGxhY2UoXCJSJFwiLCBcIlwiKS5yZXBsYWNlKFwiLlwiLCBcIlwiKS5yZXBsYWNlKFwiLFwiLCBcIi5cIilcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG5ld1ByaWNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByaWNlID0gcHJpY2UgfHwgMDtcbiAgICAgICAgcHJpY2UgPSBwcmljZS50b0xvY2FsZVN0cmluZyhcInB0LUJSXCIsIHtcbiAgICAgICAgICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMixcbiAgICAgICAgICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHByaWNlO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEN1cnJlbmN5KCkge1xuICAgIHJldHVybiBOdW1iZXIodmFsdWUpLnRvTG9jYWxlU3RyaW5nKFwicHQtQlJcIiwge1xuICAgICAgICBzdHlsZTogXCJjdXJyZW5jeVwiLFxuICAgICAgICBjdXJyZW5jeTogXCJCUkxcIixcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9idGVyQ2FubmFsRGVWZW5kYXMoKSB7XG4gICAgdmFyIG5hbWUgPSBcIlZURVhTQz1zYz1cIjtcbiAgICB2YXIgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSBjYVtpXTtcbiAgICAgICAgd2hpbGUgKGMuY2hhckF0KDApID09IFwiIFwiKSBjID0gYy5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGlmIChjLmluZGV4T2YobmFtZSkgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLCBjLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIDE7XG59XG4iLCIvKipcbiAqIEVzcGVyYSB1bSBlbGVtZW50byBleGl0aXIgbm8gZG9tIGUgZXhlY3V0YSBvIGNhbGxiYWNrXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIHNlbGV0b3IgZG8gZWxlbWVudG8gcXVlIGRlamVzYSBlc3BlcmFyIHBlbGEgY3JpYcOnw6NvXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBGdW7Dp8OjbyBhIHNlciBleGVjdXRhZGEgcXVhbmRvIHRhbCBlbGVtZW50byBleGlzdGlyXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd2FpdEZvckVsKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGlmIChqUXVlcnkoc2VsZWN0b3IpLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzb2x2ZShqUXVlcnkoc2VsZWN0b3IpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdhaXRGb3JFbChzZWxlY3RvciwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHViU3ViIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XHJcbiAgICB9XHJcbiAgICBzdWJzY3JpYmUoZXZlbnQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50cy5oYXNPd25Qcm9wZXJ0eShldmVudCkpIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50c1tldmVudF0ucHVzaChjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgICBwdWJsaXNoKGV2ZW50LCBkYXRhID0ge30pIHtcclxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50c1tldmVudF0ubWFwKChjYWxsYmFjaykgPT4gY2FsbGJhY2soZXZlbnQsIGRhdGEpKTtcclxuICAgIH1cclxuICAgIHVuc3Vic2NyaWJlKGV2ZW50LCBjYikge1xyXG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IHRoaXMuZXZlbnRzW2V2ZW50XS5maWx0ZXIoKGZuKSA9PiBmbiAhPT0gY2IpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVIVmlVM1ZpTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDNCaFkydGhaMlZ6TDFOMFlYUmxUV0Z1WVdkbGNpOVFkV0pUZFdJdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzVFVGQlRTeERRVUZETEU5QlFVOHNUMEZCVHl4TlFVRk5PMGxCUVROQ08xRkJRMU1zVjBGQlRTeEhRVUZaTEVWQlFVVXNRMEZCUXp0SlFXMUNPVUlzUTBGQlF6dEpRV3BDVHl4VFFVRlRMRU5CUVVNc1MwRkJZU3hGUVVGRkxGRkJRV3RDTzFGQlEycEVMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEdOQlFXTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSVHRaUVVOMlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF6dFRRVU40UWp0UlFVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03U1VGRE1VTXNRMEZCUXp0SlFVVk5MRTlCUVU4c1EwRkJReXhMUVVGaExFVkJRVVVzU1VGQlNTeEhRVUZITEVWQlFVVTdVVUZEZEVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNZMEZCWXl4RFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRk8xbEJRM1pETEU5QlFVOHNSVUZCUlN4RFFVRkRPMU5CUTFZN1VVRkRSQ3hQUVVGUExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeEZRVUZGTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZEY0VVc1EwRkJRenRKUVVWTkxGZEJRVmNzUTBGQlF5eExRVUZoTEVWQlFVVXNSVUZCV1R0UlFVTTNReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEV0QlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNN1NVRkRia1VzUTBGQlF6dERRVU5FSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaVpYaHdiM0owSUdSbFptRjFiSFFnWTJ4aGMzTWdVSFZpVTNWaUlIdGNibHgwY0hKcGRtRjBaU0JsZG1WdWRITTZJRWxGZG1WdWRITWdQU0I3ZlR0Y2JseHVYSFJ3ZFdKc2FXTWdjM1ZpYzJOeWFXSmxLR1YyWlc1ME9pQnpkSEpwYm1jc0lHTmhiR3hpWVdOck9pQkdkVzVqZEdsdmJpa2dlMXh1WEhSY2RHbG1JQ2doZEdocGN5NWxkbVZ1ZEhNdWFHRnpUM2R1VUhKdmNHVnlkSGtvWlhabGJuUXBLU0I3WEc1Y2RGeDBYSFIwYUdsekxtVjJaVzUwYzF0bGRtVnVkRjBnUFNCYlhUdGNibHgwWEhSOVhHNWNkRngwY21WMGRYSnVJSFJvYVhNdVpYWmxiblJ6VzJWMlpXNTBYUzV3ZFhOb0tHTmhiR3hpWVdOcktUdGNibHgwZlZ4dVhHNWNkSEIxWW14cFl5QndkV0pzYVhOb0tHVjJaVzUwT2lCemRISnBibWNzSUdSaGRHRWdQU0I3ZlNrZ2UxeHVYSFJjZEdsbUlDZ2hkR2hwY3k1bGRtVnVkSE11YUdGelQzZHVVSEp2Y0dWeWRIa29aWFpsYm5RcEtTQjdYRzVjZEZ4MFhIUnlaWFIxY200Z1cxMDdYRzVjZEZ4MGZWeHVYSFJjZEhKbGRIVnliaUIwYUdsekxtVjJaVzUwYzF0bGRtVnVkRjB1YldGd0tDaGpZV3hzWW1GamF5a2dQVDRnWTJGc2JHSmhZMnNvWlhabGJuUXNJR1JoZEdFcEtUdGNibHgwZlZ4dVhHNWNkSEIxWW14cFl5QjFibk4xWW5OamNtbGlaU2hsZG1WdWREb2djM1J5YVc1bkxDQmpZam9nUm5WdVkzUnBiMjRwT2lCMmIybGtJSHRjYmx4MFhIUjBhR2x6TG1WMlpXNTBjMXRsZG1WdWRGMGdQU0IwYUdsekxtVjJaVzUwYzF0bGRtVnVkRjB1Wm1sc2RHVnlLQ2htYmlrZ1BUNGdabTRnSVQwOUlHTmlLVHRjYmx4MGZWeHVmVnh1WEc1cGJuUmxjbVpoWTJVZ1NVVjJaVzUwY3lCN1hHNWNkRnRyWlhrNklITjBjbWx1WjEwNklFWjFibU4wYVc5dVcxMDdYRzU5WEc0aVhYMD0iLCJpbXBvcnQgUHViU3ViIGZyb20gXCIuL1B1YlN1YlwiO1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9yZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih7IG1vZHVsZU5hbWUsIGFjdGlvbnMsIG11dGF0aW9ucywgc3RhdGUgfSkge1xyXG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGFjdGlvbnMpO1xyXG4gICAgICAgIHRoaXMubXV0YXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgbXV0YXRpb25zKTtcclxuICAgICAgICB0aGlzLm1vZHVsZSA9IG1vZHVsZU5hbWUgfHwgXCJzdG9yZVwiO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gXCJkZWZhdWx0IHN0YXRlXCI7XHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSBuZXcgUHViU3ViKCk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IG5ldyBQcm94eShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSkgfHwge30sIHtcclxuICAgICAgICAgICAgc2V0OiAoc3RhdGUsIGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHN0YXRlW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBtb2R1bGU6ICR7dGhpcy5tb2R1bGV9IHN0YXRlQ2hhbmdlOiAke2tleX06YCwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHMucHVibGlzaChcInN0YXRlQ2hhbmdlXCIsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHMucHVibGlzaChgc3RhdGVDaGFuZ2U6JHtrZXl9YCwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgIT09IFwibXV0YXRpb25cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBZb3Ugc2hvdWxkIHVzZSBhIG11dGF0aW9uIHRvIHNldCAke2tleX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gXCJyZXN0aW5nXCI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGRpc3BhdGNoKGFjdGlvbktleSwgcGF5bG9hZCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2FjdGlvbktleV0gIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQWN0aW9uIFwiJHthY3Rpb25LZXl9IGRvZXNuJ3QgZXhpc3QuYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coYEFDVElPTjogJHthY3Rpb25LZXl9YCk7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBcImFjdGlvblwiO1xyXG4gICAgICAgIHRoaXMuYWN0aW9uc1thY3Rpb25LZXldKHRoaXMsIHBheWxvYWQpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY29tbWl0KG11dGF0aW9uS2V5LCBwYXlsb2FkKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm11dGF0aW9uc1ttdXRhdGlvbktleV0gIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTXV0YXRpb24gXCIke211dGF0aW9uS2V5fVwiIGRvZXNuJ3QgZXhpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN0YXR1cyA9IFwibXV0YXRpb25cIjtcclxuICAgICAgICBsZXQgbmV3U3RhdGUgPSB0aGlzLm11dGF0aW9uc1ttdXRhdGlvbktleV0odGhpcy5zdGF0ZSwgcGF5bG9hZCk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgbmV3U3RhdGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVUzUnZjbVV1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12Y0dGamEyRm5aWE12VTNSaGRHVk5ZVzVoWjJWeUwxTjBiM0psTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTlCUVU4c1RVRkJUU3hOUVVGTkxGVkJRVlVzUTBGQlF6dEJRVVU1UWl4TlFVRk5MRU5CUVVNc1QwRkJUeXhQUVVGUExFdEJRVXM3U1VGUmVrSXNXVUZCV1N4RlFVRkZMRlZCUVZVc1JVRkJSU3hQUVVGUExFVkJRVVVzVTBGQlV5eEZRVUZGTEV0QlFVc3NSVUZCYTBJN1VVRkRjRVVzU1VGQlNTeERRVUZETEU5QlFVOHNjVUpCUVZFc1QwRkJUeXhEUVVGRkxFTkJRVU03VVVGRE9VSXNTVUZCU1N4RFFVRkRMRk5CUVZNc2NVSkJRVkVzVTBGQlV5eERRVUZGTEVOQlFVTTdVVUZEYkVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eFZRVUZWTEVsQlFVa3NUMEZCVHl4RFFVRkRPMUZCUTNCRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVkQlFVY3NaVUZCWlN4RFFVRkRPMUZCUXpsQ0xFbEJRVWtzUTBGQlF5eE5RVUZOTEVkQlFVY3NTVUZCU1N4TlFVRk5MRVZCUVVVc1EwRkJRenRSUVVVelFpeEpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRWxCUVVrc1MwRkJTeXhEUVVGSkxHdENRVUZMTEV0QlFVc3NTMEZCVFN4RlFVRkZMRVZCUVVVN1dVRkROME1zUjBGQlJ5eEZRVUZGTEVOQlFVTXNTMEZCVlN4RlFVRkZMRWRCUVZjc1JVRkJSU3hMUVVGVkxFVkJRVVVzUlVGQlJUdG5Ra0ZETlVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEV0QlFVc3NRMEZCUXp0blFrRkRia0lzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZEVml4WFFVRlhMRWxCUVVrc1EwRkJReXhOUVVGTkxHbENRVUZwUWl4SFFVRkhMRWRCUVVjc1JVRkROME1zUzBGQlN5eERRVU5NTEVOQlFVTTdaMEpCUTBZc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNZVUZCWVN4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dG5Ra0ZETDBNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNaVUZCWlN4SFFVRkhMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdaMEpCUTNSRUxFbEJRVWtzU1VGQlNTeERRVUZETEUxQlFVMHNTMEZCU3l4VlFVRlZMRVZCUVVVN2IwSkJReTlDTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc2IwTkJRVzlETEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNN2FVSkJRM1pFTzJkQ1FVTkVMRWxCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzVTBGQlV5eERRVUZETzJkQ1FVTjRRaXhQUVVGUExFbEJRVWtzUTBGQlF6dFpRVU5pTEVOQlFVTTdVMEZEUkN4RFFVRkRMRU5CUVVNN1NVRkRTaXhEUVVGRE8wbEJSVTBzVVVGQlVTeERRVUZETEZOQlFXbENMRVZCUVVVc1QwRkJXVHRSUVVNNVF5eEpRVUZKTEU5QlFVOHNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zUzBGQlN5eFZRVUZWTEVWQlFVVTdXVUZEYkVRc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFhRVUZYTEZOQlFWTXNhVUpCUVdsQ0xFTkJRVU1zUTBGQlF6dFpRVU51UkN4UFFVRlBMRXRCUVVzc1EwRkJRenRUUVVOaU8xRkJRMFFzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4WFFVRlhMRk5CUVZNc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRGNFTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJSeXhSUVVGUkxFTkJRVU03VVVGRGRrSXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNN1VVRkRka01zVDBGQlR5eEpRVUZKTEVOQlFVTTdTVUZEWWl4RFFVRkRPMGxCUlUwc1RVRkJUU3hEUVVGRExGZEJRVzFDTEVWQlFVVXNUMEZCV1R0UlFVTTVReXhKUVVGSkxFOUJRVThzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4WFFVRlhMRU5CUVVNc1MwRkJTeXhWUVVGVkxFVkJRVVU3V1VGRGRFUXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhoUVVGaExGZEJRVmNzYVVKQlFXbENMRU5CUVVNc1EwRkJRenRaUVVOMlJDeFBRVUZQTEV0QlFVc3NRMEZCUXp0VFFVTmlPMUZCUTBRc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eFZRVUZWTEVOQlFVTTdVVUZEZWtJc1NVRkJTU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkRPMUZCUTJoRkxFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMUZCUTJwRUxFOUJRVThzU1VGQlNTeERRVUZETzBsQlEySXNRMEZCUXp0RFFVTkVJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpYVcxd2IzSjBJRkIxWWxOMVlpQm1jbTl0SUZ3aUxpOVFkV0pUZFdKY0lqdGNibHh1Wlhod2IzSjBJR1JsWm1GMWJIUWdZMnhoYzNNZ1UzUnZjbVU4VkNCbGVIUmxibVJ6SUc5aWFtVmpkRDRnZTF4dVhIUndjbWwyWVhSbElHRmpkR2x2Ym5NNklGSmxZMjl5WkR4emRISnBibWNzSUNoemRHOXlaVG9nVTNSdmNtVThWRDRzSUhCaGVXeHZZV1E2SUdGdWVTa2dQVDRnZG05cFpENDdYRzVjZEhCeWFYWmhkR1VnYlhWMFlYUnBiMjV6T2lCU1pXTnZjbVE4YzNSeWFXNW5MQ0FvYzNSaGRHVTZJRlFzSUhCaGVXeHZZV1E2SUdGdWVTa2dQVDRnVkQ0N1hHNWNkSEJ5YVhaaGRHVWdiVzlrZFd4bE9pQnpkSEpwYm1jN1hHNWNkSEJ5YVhaaGRHVWdjM1JoZEhWek9pQmNJbTExZEdGMGFXOXVYQ0lnZkNCY0ltRmpkR2x2Ymx3aUlId2dYQ0p5WlhOMGFXNW5YQ0lnZkNCY0ltUmxabUYxYkhRZ2MzUmhkR1ZjSWp0Y2JseDBjSFZpYkdsaklHVjJaVzUwY3pvZ1VIVmlVM1ZpTzF4dVhIUndkV0pzYVdNZ2MzUmhkR1U2SUZRN1hHNWNibHgwWTI5dWMzUnlkV04wYjNJb2V5QnRiMlIxYkdWT1lXMWxMQ0JoWTNScGIyNXpMQ0J0ZFhSaGRHbHZibk1zSUhOMFlYUmxJSDA2SUZOMGIzSmxVR0Z5WVcxelBGUStLU0I3WEc1Y2RGeDBkR2hwY3k1aFkzUnBiMjV6SUQwZ2V5QXVMaTVoWTNScGIyNXpJSDA3WEc1Y2RGeDBkR2hwY3k1dGRYUmhkR2x2Ym5NZ1BTQjdJQzR1TG0xMWRHRjBhVzl1Y3lCOU8xeHVYSFJjZEhSb2FYTXViVzlrZFd4bElEMGdiVzlrZFd4bFRtRnRaU0I4ZkNCY0luTjBiM0psWENJN1hHNWNkRngwZEdocGN5NXpkR0YwZFhNZ1BTQmNJbVJsWm1GMWJIUWdjM1JoZEdWY0lqdGNibHgwWEhSMGFHbHpMbVYyWlc1MGN5QTlJRzVsZHlCUWRXSlRkV0lvS1R0Y2JseHVYSFJjZEhSb2FYTXVjM1JoZEdVZ1BTQnVaWGNnVUhKdmVIazhWRDRvZXlBdUxpNXpkR0YwWlNCOUlIeDhJSHQ5TENCN1hHNWNkRngwWEhSelpYUTZJQ2h6ZEdGMFpUb2dZVzU1TENCclpYazZJSE4wY21sdVp5d2dkbUZzZFdVNklHRnVlU2tnUFQ0Z2UxeHVYSFJjZEZ4MFhIUnpkR0YwWlZ0clpYbGRJRDBnZG1Gc2RXVTdYRzVjZEZ4MFhIUmNkR052Ym5OdmJHVXViRzluS0Z4dVhIUmNkRngwWEhSY2RHQnRiMlIxYkdVNklDUjdkR2hwY3k1dGIyUjFiR1Y5SUhOMFlYUmxRMmhoYm1kbE9pQWtlMnRsZVgwNllDeGNibHgwWEhSY2RGeDBYSFIyWVd4MVpWeHVYSFJjZEZ4MFhIUXBPMXh1WEhSY2RGeDBYSFIwYUdsekxtVjJaVzUwY3k1d2RXSnNhWE5vS0Z3aWMzUmhkR1ZEYUdGdVoyVmNJaXdnZEdocGN5NXpkR0YwWlNrN1hHNWNkRngwWEhSY2RIUm9hWE11WlhabGJuUnpMbkIxWW14cGMyZ29ZSE4wWVhSbFEyaGhibWRsT2lSN2EyVjVmV0FzSUhSb2FYTXVjM1JoZEdVcE8xeHVYSFJjZEZ4MFhIUnBaaUFvZEdocGN5NXpkR0YwZFhNZ0lUMDlJRndpYlhWMFlYUnBiMjVjSWlrZ2UxeHVYSFJjZEZ4MFhIUmNkR052Ym5OdmJHVXViRzluS0dCWmIzVWdjMmh2ZFd4a0lIVnpaU0JoSUcxMWRHRjBhVzl1SUhSdklITmxkQ0FrZTJ0bGVYMWdLVHRjYmx4MFhIUmNkRngwZlZ4dVhIUmNkRngwWEhSMGFHbHpMbk4wWVhSMWN5QTlJRndpY21WemRHbHVaMXdpTzF4dVhIUmNkRngwWEhSeVpYUjFjbTRnZEhKMVpUdGNibHgwWEhSY2RIMHNYRzVjZEZ4MGZTazdYRzVjZEgxY2JseHVYSFJ3ZFdKc2FXTWdaR2x6Y0dGMFkyZ29ZV04wYVc5dVMyVjVPaUJ6ZEhKcGJtY3NJSEJoZVd4dllXUTZJR0Z1ZVNrNklHSnZiMnhsWVc0Z2UxeHVYSFJjZEdsbUlDaDBlWEJsYjJZZ2RHaHBjeTVoWTNScGIyNXpXMkZqZEdsdmJrdGxlVjBnSVQwOUlGd2lablZ1WTNScGIyNWNJaWtnZTF4dVhIUmNkRngwWTI5dWMyOXNaUzVzYjJjb1lFRmpkR2x2YmlCY0lpUjdZV04wYVc5dVMyVjVmU0JrYjJWemJpZDBJR1Y0YVhOMExtQXBPMXh1WEhSY2RGeDBjbVYwZFhKdUlHWmhiSE5sTzF4dVhIUmNkSDFjYmx4MFhIUmpiMjV6YjJ4bExteHZaeWhnUVVOVVNVOU9PaUFrZTJGamRHbHZia3RsZVgxZ0tUdGNibHgwWEhSMGFHbHpMbk4wWVhSMWN5QTlJRndpWVdOMGFXOXVYQ0k3WEc1Y2RGeDBkR2hwY3k1aFkzUnBiMjV6VzJGamRHbHZia3RsZVYwb2RHaHBjeXdnY0dGNWJHOWhaQ2s3WEc1Y2RGeDBjbVYwZFhKdUlIUnlkV1U3WEc1Y2RIMWNibHh1WEhSd2RXSnNhV01nWTI5dGJXbDBLRzExZEdGMGFXOXVTMlY1T2lCemRISnBibWNzSUhCaGVXeHZZV1E2SUdGdWVTazZJR0p2YjJ4bFlXNGdlMXh1WEhSY2RHbG1JQ2gwZVhCbGIyWWdkR2hwY3k1dGRYUmhkR2x2Ym5OYmJYVjBZWFJwYjI1TFpYbGRJQ0U5UFNCY0ltWjFibU4wYVc5dVhDSXBJSHRjYmx4MFhIUmNkR052Ym5OdmJHVXViRzluS0dCTmRYUmhkR2x2YmlCY0lpUjdiWFYwWVhScGIyNUxaWGw5WENJZ1pHOWxjMjRuZENCbGVHbHpkR0FwTzF4dVhIUmNkRngwY21WMGRYSnVJR1poYkhObE8xeHVYSFJjZEgxY2JseDBYSFIwYUdsekxuTjBZWFIxY3lBOUlGd2liWFYwWVhScGIyNWNJanRjYmx4MFhIUnNaWFFnYm1WM1UzUmhkR1VnUFNCMGFHbHpMbTExZEdGMGFXOXVjMXR0ZFhSaGRHbHZia3RsZVYwb2RHaHBjeTV6ZEdGMFpTd2djR0Y1Ykc5aFpDazdYRzVjZEZ4MGRHaHBjeTV6ZEdGMFpTQTlJRTlpYW1WamRDNWhjM05wWjI0b2RHaHBjeTV6ZEdGMFpTd2dibVYzVTNSaGRHVXBPMXh1WEhSY2RISmxkSFZ5YmlCMGNuVmxPMXh1WEhSOVhHNTlYRzVjYm1WNGNHOXlkQ0JwYm5SbGNtWmhZMlVnVTNSdmNtVlFZWEpoYlhNOFZDQmxlSFJsYm1SeklHOWlhbVZqZEQ0Z2UxeHVYSFJ0YjJSMWJHVk9ZVzFsT2lCemRISnBibWM3WEc1Y2JseDBZV04wYVc5dWN6b2dVbVZqYjNKa1BITjBjbWx1Wnl3Z0tITjBiM0psT2lCVGRHOXlaVHhVUGl3Z2NHRjViRzloWkRvZ1lXNTVLU0E5UGlCMmIybGtQanRjYmx4dVhIUnRkWFJoZEdsdmJuTTZJRkpsWTI5eVpEeHpkSEpwYm1jc0lDaHpkR0YwWlRvZ1ZDd2djR0Y1Ykc5aFpEb2dZVzU1S1NBOVBpQlVQanRjYmx4dVhIUnpkR0YwWlRvZ1ZEdGNibjFjYmlKZGZRPT0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZVN0b3JlcyguLi5zdG9yZXNPYmopIHtcclxuICAgIGNvbnN0IHN0b3JlID0ge307XHJcbiAgICBzdG9yZXNPYmouZm9yRWFjaCgocykgPT4ge1xyXG4gICAgICAgIHN0b3JlLnN0YXRlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBzdG9yZS5zdGF0ZSksIHMuc3RhdGUpO1xyXG4gICAgICAgIHN0b3JlLm11dGF0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgc3RvcmUubXV0YXRpb25zKSwgcy5tdXRhdGlvbnMpO1xyXG4gICAgICAgIHN0b3JlLmFjdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHN0b3JlLmFjdGlvbnMpLCBzLmFjdGlvbnMpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc3RvcmU7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYldWeVoyVlRkRzl5WlhNdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOHVMaTl6Y21NdmNHRmphMkZuWlhNdlUzUmhkR1ZOWVc1aFoyVnlMMjFsY21kbFUzUnZjbVZ6TG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVVkJMRTFCUVUwc1EwRkJReXhQUVVGUExGVkJRVlVzVjBGQlZ5eERRVUZETEVkQlFVY3NVMEZCTmtJN1NVRkRia1VzVFVGQlRTeExRVUZMTEVkQlFUSkNMRVZCUVVVc1EwRkJRenRKUVVONlF5eFRRVUZUTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVU3VVVGRGRrSXNTMEZCU3l4RFFVRkRMRXRCUVVzc2JVTkJRVkVzUzBGQlN5eERRVUZETEV0QlFVc3NSMEZCU3l4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRkxFTkJRVU03VVVGRE4wTXNTMEZCU3l4RFFVRkRMRk5CUVZNc2JVTkJRVkVzUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCU3l4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRkxFTkJRVU03VVVGRGVrUXNTMEZCU3l4RFFVRkRMRTlCUVU4c2JVTkJRVkVzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCU3l4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRkxFTkJRVU03U1VGRGNFUXNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkZTQ3hQUVVGUExFdEJRVXNzUTBGQlF6dEJRVU5rTEVOQlFVTWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpwYlhCdmNuUWdleUJUZEc5eVpWQmhjbUZ0Y3lCOUlHWnliMjBnWENJdUwxTjBiM0psWENJN1hHNWNibVY0Y0c5eWRDQmtaV1poZFd4MElHWjFibU4wYVc5dUlHMWxjbWRsVTNSdmNtVnpLQzR1TG5OMGIzSmxjMDlpYWpvZ1UzUnZjbVZRWVhKaGJYTThZVzU1UGx0ZEtTQjdYRzVjZEdOdmJuTjBJSE4wYjNKbE9pQlRkRzl5WlZCaGNtRnRjenhoYm5rK0lId2dZVzU1SUQwZ2UzMDdYRzVjZEhOMGIzSmxjMDlpYWk1bWIzSkZZV05vS0NoektTQTlQaUI3WEc1Y2RGeDBjM1J2Y21VdWMzUmhkR1VnUFNCN0lDNHVMbk4wYjNKbExuTjBZWFJsTENBdUxpNXpMbk4wWVhSbElIMDdYRzVjZEZ4MGMzUnZjbVV1YlhWMFlYUnBiMjV6SUQwZ2V5QXVMaTV6ZEc5eVpTNXRkWFJoZEdsdmJuTXNJQzR1TG5NdWJYVjBZWFJwYjI1eklIMDdYRzVjZEZ4MGMzUnZjbVV1WVdOMGFXOXVjeUE5SUhzZ0xpNHVjM1J2Y21VdVlXTjBhVzl1Y3l3Z0xpNHVjeTVoWTNScGIyNXpJSDA3WEc1Y2RIMHBPMXh1WEc1Y2RISmxkSFZ5YmlCemRHOXlaVHRjYm4xY2JpSmRmUT09IiwiaW1wb3J0IGlzUGFnZSBmcm9tIFwiLi9pc1BhZ2VcIjtcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHsgYXBwTmFtZSwgY29tcG9uZW50cywgcGFnZXMsIHNlcnZpY2VzLCBjb25maWcsIHJ1bGVyLCB9KSB7XHJcbiAgICAgICAgdGhpcy5hcHBOYW1lID0gYXBwTmFtZTtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICB0aGlzLnBhZ2VDb21wb25lbnRzID0gcGFnZXMgPyBbLi4ucGFnZXNdIDogW107XHJcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0gY29tcG9uZW50cyA/IFsuLi5jb21wb25lbnRzXSA6IFtdO1xyXG4gICAgICAgIHRoaXMuc2VydmljZXMgPSBzZXJ2aWNlcyA/IFsuLi5zZXJ2aWNlc10gOiBbXTtcclxuICAgICAgICB0aGlzLnNlcnZpY2VNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLmluc3RhbmNlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50c0NvbmZpZyA9IHt9O1xyXG4gICAgICAgIHRoaXMucnVsZXIgPSBydWxlciA/IHJ1bGVyIDogbmV3IGlzUGFnZSgpO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jcmVhdGVDb250ZXh0LmNhbGwodGhpcyk7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVDb250ZXh0KCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXHJcbiAgICAgICAgICAgIGdldFNlcnZpY2U6IHRoaXMuZ2V0U2VydmljZS5iaW5kKHRoaXMpLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpbnN0YW50aWF0ZUNvbXBvbmVudChDb21wb25lbnQpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIENvbXBvbmVudCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb21wb25lbnRzQ29uZmlnW0NvbXBvbmVudC5uYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzW0NvbXBvbmVudC5uYW1lXSA9IG5ldyBDb21wb25lbnQodGhpcy5jdHgsIHRoaXMuY29tcG9uZW50c0NvbmZpZ1tDb21wb25lbnQubmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZXNbQ29tcG9uZW50Lm5hbWVdID0gbmV3IENvbXBvbmVudCh0aGlzLmN0eCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQ29tcG9uZW50Lm5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJOb3QgYW4gQ29uc3RydWN0b3JcIiwgQ29tcG9uZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpbnN0YW50aWF0ZVNlcnZpY2UoU2VydmljZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgU2VydmljZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VNYXBbU2VydmljZS5uYW1lXSA9IG5ldyBTZXJ2aWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJOb3QgYW4gQ29uc3RydWN0b3JcIiwgU2VydmljZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0U2VydmljZShzZXJ2aWNlTmFtZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlcnZpY2VNYXBbc2VydmljZU5hbWVdKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlTWFwW3NlcnZpY2VOYW1lXTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBidWlsZFNlcnZpY2VzKCkge1xyXG4gICAgICAgIHRoaXMucGFnZUNvbXBvbmVudHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0uc2VydmljZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KFwicGFnZVJlZnNcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucnVsZXIuaXMoaXRlbS5wYWdlUmVmcykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5zZXJ2aWNlcy5mb3JFYWNoKChzZXJ2aWNlKSA9PiB0aGlzLnNlcnZpY2VzLnB1c2goc2VydmljZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLm1hcCh0aGlzLmluc3RhbnRpYXRlU2VydmljZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuICAgIGJ1aWxkQ29tcG9uZW50cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1hcCh0aGlzLmluc3RhbnRpYXRlQ29tcG9uZW50LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG4gICAgYnVpbGRQYWdlQ29tcG9uZW50cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYWdlQ29tcG9uZW50cy5tYXAoKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoXCJwYWdlUmVmc1wiKSlcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJ1bGVyLmlzKGl0ZW0ucGFnZVJlZnMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jb21wb25lbnRzLmZvckVhY2goKENvbXApID0+IHRoaXMuaW5zdGFudGlhdGVDb21wb25lbnQoQ29tcCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmJ1aWxkU2VydmljZXMuY2FsbCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJ1aWxkQ29tcG9uZW50cy5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnVpbGRQYWdlQ29tcG9uZW50cy5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHdpbmRvd1tcIm0zQXBwc1wiXSA9IHsgW3RoaXMuYXBwTmFtZV06IHRoaXMgfTtcclxuICAgIH1cclxuICAgIGJpbmQoY29tcE5hbWUsIGNvbmZpZykge1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50c0NvbmZpZ1tjb21wTmFtZV0gPSBjb25maWc7XHJcbiAgICB9XHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuYXR0YWNoRXZlbnRcclxuICAgICAgICAgICAgPyBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCJcclxuICAgICAgICAgICAgOiBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIikge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHRoaXMuaW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pUTI5dWRHRnBibVZ5TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDNCaFkydGhaMlZ6TDJOdmNtVXZRMjl1ZEdGcGJtVnlMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFOUJRVThzVFVGQlRTeE5RVUZOTEZWQlFWVXNRMEZCUXp0QlFXMURPVUlzVFVGQlRTeERRVUZETEU5QlFVOHNUMEZCVHl4VFFVRlRPMGxCV1RkQ0xGbEJRVmtzUlVGRFdDeFBRVUZQTEVWQlExQXNWVUZCVlN4RlFVTldMRXRCUVVzc1JVRkRUQ3hSUVVGUkxFVkJRMUlzVFVGQlRTeEZRVU5PTEV0QlFVc3NSMEZEV1R0UlFVTnFRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eEhRVUZITEU5QlFVOHNRMEZCUXp0UlFVTjJRaXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXp0UlFVVnlRaXhKUVVGSkxFTkJRVU1zWTBGQll5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNN1VVRkRPVU1zU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUnl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRE8xRkJSWEJFTEVsQlFVa3NRMEZCUXl4UlFVRlJMRWRCUVVjc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF6dFJRVU01UXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hIUVVGSExFVkJRVVVzUTBGQlF6dFJRVVZ5UWl4SlFVRkpMRU5CUVVNc1UwRkJVeXhIUVVGSExFVkJRVVVzUTBGQlF6dFJRVU53UWl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUlROQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NUVUZCVFN4RlFVRkZMRU5CUVVNN1VVRkZNVU1zU1VGQlNTeERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTXhReXhEUVVGRE8wbEJSVThzWVVGQllUdFJRVU53UWl4UFFVRlBPMWxCUTA0c1RVRkJUU3hGUVVGRkxFbEJRVWtzUTBGQlF5eE5RVUZOTzFsQlEyNUNMRlZCUVZVc1JVRkJSU3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNN1UwRkRkRU1zUTBGQlF6dEpRVU5JTEVOQlFVTTdTVUZGVHl4dlFrRkJiMElzUTBGQlF5eFRRVUZqTzFGQlF6RkRMRWxCUVVrN1dVRkRTQ3hKUVVGSkxFOUJRVThzVTBGQlV5eExRVUZMTEZWQlFWVXNSVUZCUlR0blFrRkRjRU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZPMjlDUVVNeFF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEZOQlFWTXNRMEZETjBNc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGRFVpeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVTnlReXhEUVVGRE8ybENRVU5HTzNGQ1FVRk5PMjlDUVVOT0xFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFbEJRVWtzVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRwUWtGRGVrUTdaMEpCUTBRc1QwRkJUeXhUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETzJGQlEzUkNPMmxDUVVGTk8yZENRVU5PTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc2IwSkJRVzlDTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1lVRkRPVU03VTBGRFJEdFJRVUZETEU5QlFVOHNTMEZCU3l4RlFVRkZPMWxCUTJZc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0VFFVTndRanRKUVVOR0xFTkJRVU03U1VGRlR5eHJRa0ZCYTBJc1EwRkJReXhQUVVGWk8xRkJRM1JETEVsQlFVa3NUMEZCVHl4UFFVRlBMRXRCUVVzc1ZVRkJWU3hGUVVGRk8xbEJRMnhETEVsQlFVazdaMEpCUTBnc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1NVRkJTU3hQUVVGUExFVkJRVVVzUTBGQlF6dGhRVU01UXp0WlFVRkRMRTlCUVU4c1MwRkJTeXhGUVVGRk8yZENRVU5tTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03WVVGRGNFSTdVMEZEUkR0aFFVRk5PMWxCUTA0c1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eHZRa0ZCYjBJc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dFRRVU0xUXp0SlFVTkdMRU5CUVVNN1NVRkZUeXhWUVVGVkxFTkJRVWtzVjBGQmJVSTdVVUZEZUVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEZkQlFWY3NRMEZCUXp0WlFVRkZMRTlCUVU4c1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0UlFVTjBSU3hQUVVGUExFdEJRVXNzUTBGQlF6dEpRVU5rTEVOQlFVTTdTVUZGVHl4aFFVRmhPMUZCUTNCQ0xFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVU3V1VGRGNFTXNTVUZCU1N4UFFVRlBMRWxCUVVrc1EwRkJReXhSUVVGUkxFdEJRVXNzVjBGQlZ5eEZRVUZGTzJkQ1FVTjZReXhKUVVGSkxFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNWVUZCVlN4RFFVRkRPMjlDUVVOc1F5eEpRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlR0M1FrRkRha01zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJTeERRVU5xUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZETTBJc1EwRkJRenR4UWtGRFJqdGhRVU5HTzFGQlEwWXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkZTQ3hQUVVGUExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU01UkN4RFFVRkRPMGxCUlU4c1pVRkJaVHRSUVVOMFFpeFBRVUZQTEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eHZRa0ZCYjBJc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTnNSU3hEUVVGRE8wbEJSVThzYlVKQlFXMUNPMUZCUXpGQ0xFOUJRVThzU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJUdFpRVU4yUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVlVGQlZTeERRVUZETzJkQ1FVTnNReXhKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJUdHZRa0ZEYWtNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSU3hEUVVOb1F5eEpRVUZKTEVOQlFVTXNiMEpCUVc5Q0xFTkJRVU1zU1VGQlNTeERRVUZETEVOQlF5OUNMRU5CUVVNN2FVSkJRMFk3VVVGRFNDeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTktMRU5CUVVNN1NVRkZUU3hKUVVGSk8xRkJRMVlzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRE9VSXNTVUZCU1N4RFFVRkRMR1ZCUVdVc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZEYUVNc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVVZ3UXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzUTBGQlF6dEpRVU0zUXl4RFFVRkRPMGxCUlUwc1NVRkJTU3hEUVVGRExGRkJRV2RDTEVWQlFVVXNUVUZCVnp0UlFVTjRReXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzVFVGQlRTeERRVUZETzBsQlF6RkRMRU5CUVVNN1NVRkZUU3hMUVVGTE8xRkJRMWdzU1VGRFF5eFJRVUZSTEVOQlFVTXNWMEZCVnp0WlFVTnVRaXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEZWQlFWVXNTMEZCU3l4VlFVRlZPMWxCUTNCRExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4TFFVRkxMRk5CUVZNc1JVRkRia003V1VGRFJDeEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1UwRkRXanRoUVVGTk8xbEJRMDRzVVVGQlVTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExHdENRVUZyUWl4RlFVRkZMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1UwRkRjRVU3U1VGRFJpeERRVUZETzBOQlEwUWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpwYlhCdmNuUWdhWE5RWVdkbElHWnliMjBnWENJdUwybHpVR0ZuWlZ3aU8xeHVhVzF3YjNKMElFbFNkV3hsY2lCbWNtOXRJRndpTGk5SlVuVnNaWEpjSWp0Y2JseHVaWGh3YjNKMElHbHVkR1Z5Wm1GalpTQkpRMjl1ZEdGcGJtVnlVSEp2Y0hNZ2UxeHVYSFJoY0hCT1lXMWxPaUJ6ZEhKcGJtYzdYRzVjZEdOdmJYQnZibVZ1ZEhNL09pQmhibmxiWFR0Y2JseDBjR0ZuWlhNL09pQkpVR0ZuWlVOdmJYQnZibVZ1ZEhOYlhUdGNibHgwYzJWeWRtbGpaWE0vT2lCaGJubGJYVHRjYmx4MFkyOXVabWxuUHpvZ1lXNTVPMXh1WEhSeWRXeGxjajg2SUVsU2RXeGxjanRjYm4xY2JseHVaWGh3YjNKMElHbHVkR1Z5Wm1GalpTQkpVR0ZuWlVOdmJYQnZibVZ1ZEhNZ2UxeHVYSFJ3WVdkbFVtVm1jem9nYzNSeWFXNW5XMTA3WEc1Y2RHTnZiWEJ2Ym1WdWRITTZJR0Z1ZVZ0ZE8xeHVYSFJ6WlhKMmFXTmxjejg2SUdGdWVWdGRPMXh1ZlZ4dVhHNWxlSEJ2Y25RZ2FXNTBaWEptWVdObElFbERiMjUwWVdsdVpYSkRiMjUwWlhoMElIdGNibHgwWTI5dVptbG5PaUJoYm5rN1hHNWNkR2RsZEZObGNuWnBZMlU2SUR4VVBpaHpaWEoyYVdObFRtRnRaVG9nYzNSeWFXNW5LU0E5UGlCVUlId2dabUZzYzJVN1hHNTlYRzVjYm1SbFkyeGhjbVVnWjJ4dlltRnNJSHRjYmx4MGFXNTBaWEptWVdObElGZHBibVJ2ZHlCN1hHNWNkRngwYlROQmNIQnpPaUJTWldOdmNtUThjM1J5YVc1bkxDQkRiMjUwWVdsdVpYSStPMXh1WEhSOVhHNWNibHgwYVc1MFpYSm1ZV05sSUVSdlkzVnRaVzUwSUh0Y2JseDBYSFJoZEhSaFkyaEZkbVZ1ZERwY2JseDBYSFJjZEh3Z0tDaGxkbVZ1ZERvZ2MzUnlhVzVuTENCc2FYTjBaVzVsY2pvZ1JYWmxiblJNYVhOMFpXNWxjaWtnUFQ0Z1ltOXZiR1ZoYmlCOElHWmhiSE5sS1Z4dVhIUmNkRngwZkNCMWJtUmxabWx1WldRN1hHNWNkSDFjYm4xY2JseHVaWGh3YjNKMElHUmxabUYxYkhRZ1kyeGhjM01nUTI5dWRHRnBibVZ5SUh0Y2JseDBjSEpwZG1GMFpTQnlkV3hsY2pvZ1NWSjFiR1Z5TzF4dVhIUndjbWwyWVhSbElHRndjRTVoYldVNklITjBjbWx1Wnp0Y2JseDBjSEpwZG1GMFpTQmpiMjVtYVdjNklHRnVlVHRjYmx4MGNISnBkbUYwWlNCamIyMXdiMjVsYm5SelEyOXVabWxuT2lCaGJuazdYRzVjZEhCeWFYWmhkR1VnWTI5dGNHOXVaVzUwY3pvZ1lXNTVXMTA3WEc1Y2RIQnlhWFpoZEdVZ2NHRm5aVU52YlhCdmJtVnVkSE02SUVsUVlXZGxRMjl0Y0c5dVpXNTBjMXRkTzF4dVhIUndjbWwyWVhSbElITmxjblpwWTJWek9pQmhibmxiWFR0Y2JseDBjSEpwZG1GMFpTQnpaWEoyYVdObFRXRndPaUJTWldOdmNtUThjM1J5YVc1bkxDQmhibmsrTzF4dVhIUndjbWwyWVhSbElHbHVjM1JoYm1ObGN6b2dVbVZqYjNKa1BITjBjbWx1Wnl3Z2IySnFaV04wUGp0Y2JseDBjSEpwZG1GMFpTQmpkSGc2SUVsRGIyNTBZV2x1WlhKRGIyNTBaWGgwTzF4dVhHNWNkR052Ym5OMGNuVmpkRzl5S0h0Y2JseDBYSFJoY0hCT1lXMWxMRnh1WEhSY2RHTnZiWEJ2Ym1WdWRITXNYRzVjZEZ4MGNHRm5aWE1zWEc1Y2RGeDBjMlZ5ZG1salpYTXNYRzVjZEZ4MFkyOXVabWxuTEZ4dVhIUmNkSEoxYkdWeUxGeHVYSFI5T2lCSlEyOXVkR0ZwYm1WeVVISnZjSE1wSUh0Y2JseDBYSFIwYUdsekxtRndjRTVoYldVZ1BTQmhjSEJPWVcxbE8xeHVYSFJjZEhSb2FYTXVZMjl1Wm1sbklEMGdZMjl1Wm1sbk8xeHVYRzVjZEZ4MGRHaHBjeTV3WVdkbFEyOXRjRzl1Wlc1MGN5QTlJSEJoWjJWeklEOGdXeTR1TG5CaFoyVnpYU0E2SUZ0ZE8xeHVYSFJjZEhSb2FYTXVZMjl0Y0c5dVpXNTBjeUE5SUdOdmJYQnZibVZ1ZEhNZ1B5QmJMaTR1WTI5dGNHOXVaVzUwYzEwZ09pQmJYVHRjYmx4dVhIUmNkSFJvYVhNdWMyVnlkbWxqWlhNZ1BTQnpaWEoyYVdObGN5QS9JRnN1TGk1elpYSjJhV05sYzEwZ09pQmJYVHRjYmx4MFhIUjBhR2x6TG5ObGNuWnBZMlZOWVhBZ1BTQjdmVHRjYmx4dVhIUmNkSFJvYVhNdWFXNXpkR0Z1WTJWeklEMGdlMzA3WEc1Y2RGeDBkR2hwY3k1amIyMXdiMjVsYm5SelEyOXVabWxuSUQwZ2UzMDdYRzVjYmx4MFhIUjBhR2x6TG5KMWJHVnlJRDBnY25Wc1pYSWdQeUJ5ZFd4bGNpQTZJRzVsZHlCcGMxQmhaMlVvS1R0Y2JseHVYSFJjZEhSb2FYTXVZM1I0SUQwZ2RHaHBjeTVqY21WaGRHVkRiMjUwWlhoMExtTmhiR3dvZEdocGN5azdYRzVjZEgxY2JseHVYSFJ3Y21sMllYUmxJR055WldGMFpVTnZiblJsZUhRb0tUb2dTVU52Ym5SaGFXNWxja052Ym5SbGVIUWdlMXh1WEhSY2RISmxkSFZ5YmlCN1hHNWNkRngwWEhSamIyNW1hV2M2SUhSb2FYTXVZMjl1Wm1sbkxGeHVYSFJjZEZ4MFoyVjBVMlZ5ZG1salpUb2dkR2hwY3k1blpYUlRaWEoyYVdObExtSnBibVFvZEdocGN5a3NYRzVjZEZ4MGZUdGNibHgwZlZ4dVhHNWNkSEJ5YVhaaGRHVWdhVzV6ZEdGdWRHbGhkR1ZEYjIxd2IyNWxiblFvUTI5dGNHOXVaVzUwT2lCaGJua3BJSHRjYmx4MFhIUjBjbmtnZTF4dVhIUmNkRngwYVdZZ0tIUjVjR1Z2WmlCRGIyMXdiMjVsYm5RZ1BUMDlJRndpWm5WdVkzUnBiMjVjSWlrZ2UxeHVYSFJjZEZ4MFhIUnBaaUFvZEdocGN5NWpiMjF3YjI1bGJuUnpRMjl1Wm1sblcwTnZiWEJ2Ym1WdWRDNXVZVzFsWFNrZ2UxeHVYSFJjZEZ4MFhIUmNkSFJvYVhNdWFXNXpkR0Z1WTJWelcwTnZiWEJ2Ym1WdWRDNXVZVzFsWFNBOUlHNWxkeUJEYjIxd2IyNWxiblFvWEc1Y2RGeDBYSFJjZEZ4MFhIUjBhR2x6TG1OMGVDeGNibHgwWEhSY2RGeDBYSFJjZEhSb2FYTXVZMjl0Y0c5dVpXNTBjME52Ym1acFoxdERiMjF3YjI1bGJuUXVibUZ0WlYxY2JseDBYSFJjZEZ4MFhIUXBPMXh1WEhSY2RGeDBYSFI5SUdWc2MyVWdlMXh1WEhSY2RGeDBYSFJjZEhSb2FYTXVhVzV6ZEdGdVkyVnpXME52YlhCdmJtVnVkQzV1WVcxbFhTQTlJRzVsZHlCRGIyMXdiMjVsYm5Rb2RHaHBjeTVqZEhncE8xeHVYSFJjZEZ4MFhIUjlYRzVjZEZ4MFhIUmNkSEpsZEhWeWJpQkRiMjF3YjI1bGJuUXVibUZ0WlR0Y2JseDBYSFJjZEgwZ1pXeHpaU0I3WEc1Y2RGeDBYSFJjZEdOdmJuTnZiR1V1ZDJGeWJpaGNJazV2ZENCaGJpQkRiMjV6ZEhKMVkzUnZjbHdpTENCRGIyMXdiMjVsYm5RcE8xeHVYSFJjZEZ4MGZWeHVYSFJjZEgwZ1kyRjBZMmdnS0dWeWNtOXlLU0I3WEc1Y2RGeDBYSFJqYjI1emIyeGxMbmRoY200b1pYSnliM0lwTzF4dVhIUmNkSDFjYmx4MGZWeHVYRzVjZEhCeWFYWmhkR1VnYVc1emRHRnVkR2xoZEdWVFpYSjJhV05sS0ZObGNuWnBZMlU2SUdGdWVTa2dlMXh1WEhSY2RHbG1JQ2gwZVhCbGIyWWdVMlZ5ZG1salpTQTlQVDBnWENKbWRXNWpkR2x2Ymx3aUtTQjdYRzVjZEZ4MFhIUjBjbmtnZTF4dVhIUmNkRngwWEhSMGFHbHpMbk5sY25acFkyVk5ZWEJiVTJWeWRtbGpaUzV1WVcxbFhTQTlJRzVsZHlCVFpYSjJhV05sS0NrN1hHNWNkRngwWEhSOUlHTmhkR05vSUNobGNuSnZjaWtnZTF4dVhIUmNkRngwWEhSamIyNXpiMnhsTG5kaGNtNG9aWEp5YjNJcE8xeHVYSFJjZEZ4MGZWeHVYSFJjZEgwZ1pXeHpaU0I3WEc1Y2RGeDBYSFJqYjI1emIyeGxMbmRoY200b1hDSk9iM1FnWVc0Z1EyOXVjM1J5ZFdOMGIzSmNJaXdnVTJWeWRtbGpaU2s3WEc1Y2RGeDBmVnh1WEhSOVhHNWNibHgwY0hKcGRtRjBaU0JuWlhSVFpYSjJhV05sUEZRK0tITmxjblpwWTJWT1lXMWxPaUJ6ZEhKcGJtY3BPaUJVSUh3Z1ptRnNjMlVnZTF4dVhIUmNkR2xtSUNoMGFHbHpMbk5sY25acFkyVk5ZWEJiYzJWeWRtbGpaVTVoYldWZEtTQnlaWFIxY200Z2RHaHBjeTV6WlhKMmFXTmxUV0Z3VzNObGNuWnBZMlZPWVcxbFhUdGNibHgwWEhSeVpYUjFjbTRnWm1Gc2MyVTdYRzVjZEgxY2JseHVYSFJ3Y21sMllYUmxJR0oxYVd4a1UyVnlkbWxqWlhNb0tTQjdYRzVjZEZ4MGRHaHBjeTV3WVdkbFEyOXRjRzl1Wlc1MGN5NW1iM0pGWVdOb0tDaHBkR1Z0S1NBOVBpQjdYRzVjZEZ4MFhIUnBaaUFvZEhsd1pXOW1JR2wwWlcwdWMyVnlkbWxqWlhNZ0lUMDlJRndpZFc1a1pXWnBibVZrWENJcElIdGNibHgwWEhSY2RGeDBhV1lnS0dsMFpXMHVhR0Z6VDNkdVVISnZjR1Z5ZEhrb1hDSndZV2RsVW1WbWMxd2lLU2xjYmx4MFhIUmNkRngwWEhScFppQW9kR2hwY3k1eWRXeGxjaTVwY3locGRHVnRMbkJoWjJWU1pXWnpLU2tnZTF4dVhIUmNkRngwWEhSY2RGeDBhWFJsYlM1elpYSjJhV05sY3k1bWIzSkZZV05vS0NoelpYSjJhV05sS1NBOVBseHVYSFJjZEZ4MFhIUmNkRngwWEhSMGFHbHpMbk5sY25acFkyVnpMbkIxYzJnb2MyVnlkbWxqWlNsY2JseDBYSFJjZEZ4MFhIUmNkQ2s3WEc1Y2RGeDBYSFJjZEZ4MGZWeHVYSFJjZEZ4MGZWeHVYSFJjZEgwcE8xeHVYRzVjZEZ4MGNtVjBkWEp1SUhSb2FYTXVjMlZ5ZG1salpYTXViV0Z3S0hSb2FYTXVhVzV6ZEdGdWRHbGhkR1ZUWlhKMmFXTmxMbUpwYm1Rb2RHaHBjeWtwTzF4dVhIUjlYRzVjYmx4MGNISnBkbUYwWlNCaWRXbHNaRU52YlhCdmJtVnVkSE1vS1NCN1hHNWNkRngwY21WMGRYSnVJSFJvYVhNdVkyOXRjRzl1Wlc1MGN5NXRZWEFvZEdocGN5NXBibk4wWVc1MGFXRjBaVU52YlhCdmJtVnVkQzVpYVc1a0tIUm9hWE1wS1R0Y2JseDBmVnh1WEc1Y2RIQnlhWFpoZEdVZ1luVnBiR1JRWVdkbFEyOXRjRzl1Wlc1MGN5Z3BJSHRjYmx4MFhIUnlaWFIxY200Z2RHaHBjeTV3WVdkbFEyOXRjRzl1Wlc1MGN5NXRZWEFvS0dsMFpXMHBJRDArSUh0Y2JseDBYSFJjZEdsbUlDaHBkR1Z0TG1oaGMwOTNibEJ5YjNCbGNuUjVLRndpY0dGblpWSmxabk5jSWlrcFhHNWNkRngwWEhSY2RHbG1JQ2gwYUdsekxuSjFiR1Z5TG1sektHbDBaVzB1Y0dGblpWSmxabk1wS1NCN1hHNWNkRngwWEhSY2RGeDBhWFJsYlM1amIyMXdiMjVsYm5SekxtWnZja1ZoWTJnb0tFTnZiWEFwSUQwK1hHNWNkRngwWEhSY2RGeDBYSFIwYUdsekxtbHVjM1JoYm5ScFlYUmxRMjl0Y0c5dVpXNTBLRU52YlhBcFhHNWNkRngwWEhSY2RGeDBLVHRjYmx4MFhIUmNkRngwZlZ4dVhIUmNkSDBwTzF4dVhIUjlYRzVjYmx4MGNIVmliR2xqSUdsdWFYUW9LU0I3WEc1Y2RGeDBkR2hwY3k1aWRXbHNaRk5sY25acFkyVnpMbU5oYkd3b2RHaHBjeWs3WEc1Y2RGeDBkR2hwY3k1aWRXbHNaRU52YlhCdmJtVnVkSE11WTJGc2JDaDBhR2x6S1R0Y2JseDBYSFIwYUdsekxtSjFhV3hrVUdGblpVTnZiWEJ2Ym1WdWRITXVZMkZzYkNoMGFHbHpLVHRjYmx4dVhIUmNkSGRwYm1SdmQxdGNJbTB6UVhCd2Mxd2lYU0E5SUhzZ1czUm9hWE11WVhCd1RtRnRaVjA2SUhSb2FYTWdmVHRjYmx4MGZWeHVYRzVjZEhCMVlteHBZeUJpYVc1a0tHTnZiWEJPWVcxbE9pQnpkSEpwYm1jc0lHTnZibVpwWnpvZ1lXNTVLU0I3WEc1Y2RGeDBkR2hwY3k1amIyMXdiMjVsYm5SelEyOXVabWxuVzJOdmJYQk9ZVzFsWFNBOUlHTnZibVpwWnp0Y2JseDBmVnh1WEc1Y2RIQjFZbXhwWXlCemRHRnlkQ2dwSUh0Y2JseDBYSFJwWmlBb1hHNWNkRngwWEhSa2IyTjFiV1Z1ZEM1aGRIUmhZMmhGZG1WdWRGeHVYSFJjZEZ4MFhIUS9JR1J2WTNWdFpXNTBMbkpsWVdSNVUzUmhkR1VnUFQwOUlGd2lZMjl0Y0d4bGRHVmNJbHh1WEhSY2RGeDBYSFE2SUdSdlkzVnRaVzUwTG5KbFlXUjVVM1JoZEdVZ0lUMDlJRndpYkc5aFpHbHVaMXdpWEc1Y2RGeDBLU0I3WEc1Y2RGeDBYSFIwYUdsekxtbHVhWFFvS1R0Y2JseDBYSFI5SUdWc2MyVWdlMXh1WEhSY2RGeDBaRzlqZFcxbGJuUXVZV1JrUlhabGJuUk1hWE4wWlc1bGNpaGNJa1JQVFVOdmJuUmxiblJNYjJGa1pXUmNJaXdnZEdocGN5NXBibWwwTG1KcGJtUW9kR2hwY3lrcE8xeHVYSFJjZEgxY2JseDBmVnh1ZlZ4dUlsMTkiLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBpc1BhZ2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIGNvbnN0IG1ldGFQYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwicGFnZVwiXScpO1xyXG4gICAgICAgIHRoaXMuaWRlbnRpZmljYWNhb01ldGFQYWdlID0gbWV0YVBhZ2VcclxuICAgICAgICAgICAgPyBtZXRhUGFnZS5nZXRBdHRyaWJ1dGUoXCJjb250ZW50XCIpIHx8IFwiXCJcclxuICAgICAgICAgICAgOiBcIlwiO1xyXG4gICAgICAgIHRoaXMuY2xhc3NUYWdCb2R5ID0gQXJyYXkuZnJvbShkb2N1bWVudC5ib2R5LmNsYXNzTGlzdCk7XHJcbiAgICAgICAgdGhpcy5wYWdlRGF0YUxheWVyID0gXCJcIjtcclxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5kYXRhTGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5wYWdlRGF0YUxheWVyID0gKF9hID0gd2luZG93LmRhdGFMYXllclswXSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBhZ2VDYXRlZ29yeTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpcyhydWxlcykge1xyXG4gICAgICAgIGxldCBpcyA9IGZhbHNlO1xyXG4gICAgICAgIHJ1bGVzLmZvckVhY2goKHJ1bGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaWRlbnRpZmljYWNhb01ldGFQYWdlLnNlYXJjaChydWxlKSA+PSAwIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VEYXRhTGF5ZXIgPT09IHJ1bGUgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NUYWdCb2R5LmluY2x1ZGVzKHJ1bGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gaXM7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVhOUVlXZGxMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMM0JoWTJ0aFoyVnpMMk52Y21VdmFYTlFZV2RsTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFXZENRU3hOUVVGTkxFTkJRVU1zVDBGQlR5eFBRVUZQTEUxQlFVMDdTVUZMTVVJN08xRkJRME1zVFVGQlRTeFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMR0ZCUVdFc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4RFFVRkRPMUZCUXpkRUxFbEJRVWtzUTBGQlF5eHhRa0ZCY1VJc1IwRkJSeXhSUVVGUk8xbEJRM0JETEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1dVRkJXU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVWQlFVVTdXVUZEZUVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF6dFJRVVZPTEVsQlFVa3NRMEZCUXl4WlFVRlpMRWRCUVVjc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8xRkJRM2hFTEVsQlFVa3NRMEZCUXl4aFFVRmhMRWRCUVVjc1JVRkJSU3hEUVVGRE8xRkJRM2hDTEVsQlFVa3NUMEZCVHl4TlFVRk5MRU5CUVVNc1UwRkJVeXhMUVVGTExGZEJRVmNzUlVGQlJUdFpRVU0xUXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hUUVVGSExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMREJEUVVGRkxGbEJRVmtzUTBGQlF6dFRRVU4yUkR0SlFVTkdMRU5CUVVNN1NVRlBSQ3hGUVVGRkxFTkJRVU1zUzBGQlpUdFJRVU5xUWl4SlFVRkpMRVZCUVVVc1IwRkJSeXhMUVVGTExFTkJRVU03VVVGRlppeExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVU3V1VGRGRFSXNTVUZEUXl4SlFVRkpMRU5CUVVNc2NVSkJRWEZDTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU03WjBKQlF6VkRMRWxCUVVrc1EwRkJReXhoUVVGaExFdEJRVXNzU1VGQlNUdG5Ra0ZETTBJc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUXk5Q08yZENRVU5FTEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNN1lVRkRWanRSUVVOR0xFTkJRVU1zUTBGQlF5eERRVUZETzFGQlJVZ3NUMEZCVHl4RlFVRkZMRU5CUVVNN1NVRkRXQ3hEUVVGRE8wTkJRMFFpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKcGJYQnZjblFnU1ZKMWJHVnlJR1p5YjIwZ1hDSXVMMGxTZFd4bGNsd2lPMXh1WEc1a1pXTnNZWEpsSUdkc2IySmhiQ0I3WEc1Y2RHbHVkR1Z5Wm1GalpTQlhhVzVrYjNjZ2UxeHVYSFJjZEdSaGRHRk1ZWGxsY2pvZ1JHRjBZVXhoZVdWeVQySnFaV04wVzEwZ2ZDQjFibVJsWm1sdVpXUTdYRzVjZEgxY2JseHVYSFJwYm5SbGNtWmhZMlVnUkdGMFlVeGhlV1Z5VDJKcVpXTjBJSHRjYmx4MFhIUndZV2RsUTJGMFpXZHZjbms2SUhOMGNtbHVaenRjYmx4MGZWeHVmVnh1THlvcVhHNGdLaUFnUTJ4aGMzTmxJSEJoY21FZ2RtVnlhV1pwWTJGeUlITmxJR1Z6ZEdGdGIzTWdaVzBnZFcxaElHUmhjeUJ3WVdkcGJtRnpYRzRnS2lBZ2NYVmxJSFBEbzI4Z2NHRnpjMkZrWVhNZ2NHOXlJR0Z5WjNWdFpXNTBiMXh1SUNvdlhHNWNibVY0Y0c5eWRDQmtaV1poZFd4MElHTnNZWE56SUdselVHRm5aU0JwYlhCc1pXMWxiblJ6SUVsU2RXeGxjaUI3WEc1Y2RIQnlhWFpoZEdVZ2FXUmxiblJwWm1sallXTmhiMDFsZEdGUVlXZGxPaUJ6ZEhKcGJtYzdYRzVjZEhCeWFYWmhkR1VnWTJ4aGMzTlVZV2RDYjJSNU9pQnpkSEpwYm1kYlhUdGNibHgwY0hKcGRtRjBaU0J3WVdkbFJHRjBZVXhoZVdWeU9pQnpkSEpwYm1jN1hHNWNibHgwWTI5dWMzUnlkV04wYjNJb0tTQjdYRzVjZEZ4MFkyOXVjM1FnYldWMFlWQmhaMlVnUFNCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlLQ2R0WlhSaFcyNWhiV1U5WENKd1lXZGxYQ0pkSnlrN1hHNWNkRngwZEdocGN5NXBaR1Z1ZEdsbWFXTmhZMkZ2VFdWMFlWQmhaMlVnUFNCdFpYUmhVR0ZuWlZ4dVhIUmNkRngwUHlCdFpYUmhVR0ZuWlM1blpYUkJkSFJ5YVdKMWRHVW9YQ0pqYjI1MFpXNTBYQ0lwSUh4OElGd2lYQ0pjYmx4MFhIUmNkRG9nWENKY0lqdGNibHh1WEhSY2RIUm9hWE11WTJ4aGMzTlVZV2RDYjJSNUlEMGdRWEp5WVhrdVpuSnZiU2hrYjJOMWJXVnVkQzVpYjJSNUxtTnNZWE56VEdsemRDazdYRzVjZEZ4MGRHaHBjeTV3WVdkbFJHRjBZVXhoZVdWeUlEMGdYQ0pjSWp0Y2JseDBYSFJwWmlBb2RIbHdaVzltSUhkcGJtUnZkeTVrWVhSaFRHRjVaWElnSVQwOUlGd2lkVzVrWldacGJtVmtYQ0lwSUh0Y2JseDBYSFJjZEhSb2FYTXVjR0ZuWlVSaGRHRk1ZWGxsY2lBOUlIZHBibVJ2ZHk1a1lYUmhUR0Y1WlhKYk1GMC9MbkJoWjJWRFlYUmxaMjl5ZVR0Y2JseDBYSFI5WEc1Y2RIMWNibHh1WEhRdktpcGNibHgwSUNvZ0tpQkFjR0Z5WVcwZ2UyRnljbUY1ZlNCYllYSm5jMTBnZFcwZ2IzVWdkVzBnWVhKeVlYa2daR1VnYzNSeWFXNW5jeUJqYjI1MFpXNWtieUJoSUhCaGJHRjJjbUVnWTJoaGRtVWdjR0Z5WVNCcFpHVnVkR2xtYVdOaGNpQmhJSEJoWjJsdVlWeHVYSFFnS2lCQWNtVjBkWEp1SUh0Q2IyOXNaV0Z1ZlNCeVpYUnZjbTVoSUhSeWRXVWdjMlVnZFcwZ1pHOXpJR0Z5WjNWdFpXNTBiM01nWlhOMGFYWmxjaUJ1WVNCdFpYUmhMMkp2WkhsRGJHRnpjeTkwWVdkY2JseDBJQ292WEc1Y2JseDBhWE1vY25Wc1pYTTZJSE4wY21sdVoxdGRLVG9nWW05dmJHVmhiaUI3WEc1Y2RGeDBiR1YwSUdseklEMGdabUZzYzJVN1hHNWNibHgwWEhSeWRXeGxjeTVtYjNKRllXTm9LQ2h5ZFd4bEtTQTlQaUI3WEc1Y2RGeDBYSFJwWmlBb1hHNWNkRngwWEhSY2RIUm9hWE11YVdSbGJuUnBabWxqWVdOaGIwMWxkR0ZRWVdkbExuTmxZWEpqYUNoeWRXeGxLU0ErUFNBd0lIeDhYRzVjZEZ4MFhIUmNkSFJvYVhNdWNHRm5aVVJoZEdGTVlYbGxjaUE5UFQwZ2NuVnNaU0I4ZkZ4dVhIUmNkRngwWEhSMGFHbHpMbU5zWVhOelZHRm5RbTlrZVM1cGJtTnNkV1JsY3loeWRXeGxLVnh1WEhSY2RGeDBLU0I3WEc1Y2RGeDBYSFJjZEdseklEMGdkSEoxWlR0Y2JseDBYSFJjZEgxY2JseDBYSFI5S1R0Y2JseHVYSFJjZEhKbGRIVnliaUJwY3p0Y2JseDBmVnh1ZlZ4dUlsMTkiLCJleHBvcnQgeyBkZWZhdWx0IGFzIENvbnRhaW5lciB9IGZyb20gXCIuL2NvcmUvQ29udGFpbmVyXCI7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSXNQYWdlIH0gZnJvbSBcIi4vY29yZS9pc1BhZ2VcIjtcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBQdWJTdWIgfSBmcm9tIFwiLi9TdGF0ZU1hbmFnZXIvUHViU3ViXCI7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3RvcmUgfSBmcm9tIFwiLi9TdGF0ZU1hbmFnZXIvU3RvcmVcIjtcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBtZXJnZVN0b3JlcyB9IGZyb20gXCIuL1N0YXRlTWFuYWdlci9tZXJnZVN0b3Jlc1wiO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhVzVrWlhndWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12Y0dGamEyRm5aWE12YVc1a1pYZ3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1QwRkJUeXhGUVVGRkxFOUJRVThzU1VGQlNTeFRRVUZUTEVWQlFVVXNUVUZCVFN4clFrRkJhMElzUTBGQlF6dEJRVU40UkN4UFFVRlBMRVZCUVVVc1QwRkJUeXhKUVVGSkxFMUJRVTBzUlVGQlJTeE5RVUZOTEdWQlFXVXNRMEZCUXp0QlFVTnNSQ3hQUVVGUExFVkJRVVVzVDBGQlR5eEpRVUZKTEUxQlFVMHNSVUZCUlN4TlFVRk5MSFZDUVVGMVFpeERRVUZETzBGQlF6RkVMRTlCUVU4c1JVRkJSU3hQUVVGUExFbEJRVWtzUzBGQlN5eEZRVUZGTEUxQlFVMHNjMEpCUVhOQ0xFTkJRVU03UVVGRGVFUXNUMEZCVHl4RlFVRkZMRTlCUVU4c1NVRkJTU3hYUVVGWExFVkJRVVVzVFVGQlRTdzBRa0ZCTkVJc1EwRkJReUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSW1WNGNHOXlkQ0I3SUdSbFptRjFiSFFnWVhNZ1EyOXVkR0ZwYm1WeUlIMGdabkp2YlNCY0lpNHZZMjl5WlM5RGIyNTBZV2x1WlhKY0lqdGNibVY0Y0c5eWRDQjdJR1JsWm1GMWJIUWdZWE1nU1hOUVlXZGxJSDBnWm5KdmJTQmNJaTR2WTI5eVpTOXBjMUJoWjJWY0lqdGNibVY0Y0c5eWRDQjdJR1JsWm1GMWJIUWdZWE1nVUhWaVUzVmlJSDBnWm5KdmJTQmNJaTR2VTNSaGRHVk5ZVzVoWjJWeUwxQjFZbE4xWWx3aU8xeHVaWGh3YjNKMElIc2daR1ZtWVhWc2RDQmhjeUJUZEc5eVpTQjlJR1p5YjIwZ1hDSXVMMU4wWVhSbFRXRnVZV2RsY2k5VGRHOXlaVndpTzF4dVpYaHdiM0owSUhzZ1pHVm1ZWFZzZENCaGN5QnRaWEpuWlZOMGIzSmxjeUI5SUdaeWIyMGdYQ0l1TDFOMFlYUmxUV0Z1WVdkbGNpOXRaWEpuWlZOMGIzSmxjMXdpTzF4dUlsMTkiLCJtb2R1bGUuZXhwb3J0cyA9IGpRdWVyeTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcblx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZTsgfTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIGRlZmluaXRpb24pIHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTsgfSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IENoZWNrb3V0VUkgZnJvbSBcIi4vY29tcG9uZW50cy9DaGVja291dFVJXCI7XG5pbXBvcnQgeyBDb250YWluZXIgfSBmcm9tIFwiQGFnZW5jaWFtMy9wa2dcIjtcbmltcG9ydCBFeGVtcGxlIGZyb20gXCIuL2NvbXBvbmVudHMvRXhlbXBsZVwiO1xuaW1wb3J0IEV4ZW1wbGVFdmVudCBmcm9tIFwiLi9jb21wb25lbnRzL0V4ZW1wbGVFdmVudFwiO1xuaW1wb3J0IFN0ZXBCYXIgZnJvbSBcIi4vY29tcG9uZW50cy9TdGVwQmFyXCI7XG5pbXBvcnQgQ3VzdG9tSW5zdGFsbG1lbnRzIGZyb20gXCIuL2NvbXBvbmVudHMvQ3VzdG9tSW5zdGFsbG1lbnRzXCI7XG5pbXBvcnQgQ3VzdG9tSW5zdGFsbG1lbnRQZXJJdGVtcyBmcm9tIFwiLi9jb21wb25lbnRzL0N1c3RvbUluc3RhbGxtZW50UGVySXRlbXNcIjtcbmltcG9ydCBMb2dpbk1vZGFsIGZyb20gXCIuL2NvbXBvbmVudHMvTG9naW5Nb2RhbFwiO1xuXG5jb25zdCBtM0NoZWNrb3V0ID0gbmV3IENvbnRhaW5lcih7XG4gICAgYXBwTmFtZTogXCJtMy1jaGVja291dFwiLFxuICAgIGNvbXBvbmVudHM6IFtDaGVja291dFVJLCBFeGVtcGxlLCBFeGVtcGxlRXZlbnQsIFN0ZXBCYXIsIEN1c3RvbUluc3RhbGxtZW50cywgQ3VzdG9tSW5zdGFsbG1lbnRQZXJJdGVtcywgTG9naW5Nb2RhbF0sXG59KTtcblxubTNDaGVja291dC5zdGFydCgpO1xuXG4iXSwic291cmNlUm9vdCI6IiJ9