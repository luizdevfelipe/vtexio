const buscaCepUrl = 'https://www.correios.com.br/busca-cep'

var rdomain = 'copag' //alterar aqui
var firstName = ''
var lastName = ''
var userEmail = ''
var newUser = false
var firstRD = true
var idorder = ''

var mycheckout = {
  // init: function () {
  //   vtexjs.checkout.getOrderForm().done(function (orderForm) {
  //     var userProfileId = orderForm.userProfileId

  //     idorder = orderForm.orderFormId


  //     // descobre e-mail, nome e sobrenome

  //     //novo
  //     if (userProfileId == null) {
  //       newUser = true
  //       var wrap = $('.payment-confirmation-wrap')

  //       if ($('.confirme-aceite', wrap).length == 0) wrap.prepend(
  //         '<div style="display:block" class="wrap-group">' +
  //         '<div style="margin:0; padding-bottom:0" class="group-check">' +
  //         '<span style="color:#000; margin-left:0">Ao informar meus dados eu concordo com a <a style="text-decoration:underline; href="/institucional/politica-privacidade" target="_blank">Política de Privacidade</a>  e os <a href="/institucional/condicoes-de-uso" target="_blank">Termos de Uso.</a></span>' +
  //         '</div>' +
  //         '<div class="confirme-aceite group-check">' +
  //         '<input type="checkbox" id="fcheck"><span style="color:#000">Eu concordo em receber comunicações</span>' +
  //         '</div>' +
  //         '</div>'
  //       )

  //       return false

  //       //recorrente
  //     } else {

  //       var checked = orderForm.clientPreferencesData.optinNewsLetter

  //       var button = $('.confirme-aceite')
  //       var wrap = $('.payment-confirmation-wrap')
  //       var mark = ''
  //       var display = 'block'

  //       if (checked) {
  //         display = 'none'
  //       }

  //       //se for a primeira vez que chegou no checkout passa para RD
  //       if (button.length < 1) {
  //         wrap.prepend(
  //           '<div style="display:' + display + '" class="wrap-group">' +
  //           '<div style="margin:0; padding-bottom:0" class="group-check">' +
  //           '<span style="color:#000; margin-left:0">Ao informar meus dados eu concordo com a <a style="text-decoration:underline; href="/institucional/politica-privacidade" target="_blank">Política de Privacidade</a>  e os <a href="/institucional/condicoes-de-uso" target="_blank">Termos de Uso.</a></span>' +
  //           '</div>' +
  //           '<div class="confirme-aceite group-check">' +
  //           '<input type="checkbox" id="fcheck"><span style="color:#000">Eu concordo em receber comunicações</span>' +
  //           '</div>' +
  //           '</div>'
  //         )
  //       }

  //       //não identificado
  //       if (!orderForm.loggedIn) {

  //         //buscar o cliente no masterdata
  //         $.ajax({
  //           type: 'GET',
  //           url: 'https://lojavtex.com.br/' + rdomain + '/rd/user.php?user=' + userProfileId,
  //           success: function (data, textStatus, xhr) {
  //             var result = JSON.parse(data)

  //             userEmail = orderForm.clientProfileData.email
  //             firstName = result[ 0 ].firstName
  //             lastName = result[ 0 ].lastName

  //             if (firstRD) {
  //               mycheckout.sendrd(userEmail, firstName, lastName, checked)
  //             }

  //           },
  //           error: function (error) {
  //             console.error('error', error)
  //           },
  //           complete: function () { },
  //         })


  //         //identificado
  //       } else {
  //         const orderForm = vtexjs.checkout.orderForm
  //         userEmail = orderForm.clientProfileData.email
  //         firstName = orderForm.clientProfileData.firstName
  //         lastName = orderForm.clientProfileData.lastName

  //         if (firstRD) {
  //           mycheckout.sendrd(userEmail, firstName, lastName, checked)
  //         }
  //       }
  //     }
  //   })
  // },

  sendrd: function (remail, rname, rlastname, rcheck) {
    var fields = {
      name: rname + ' ' + rlastname,
      email: remail,
      isNewsletterOptIn: rcheck,
      identifier: 'Chegou no checkout'
    }

    firstRD = false


    $.ajax({
      type: 'POST',
      url: 'https://lojavtex.com.br/' + rdomain + '/rd/check.php',
      data: fields,
      success: function (data, textStatus, xhr) {
        firstRD = false
        mycheckout.createCookie('_rdc', encodeURI(rname) + ' ' + encodeURI(rlastname) + '-' + rcheck, 1)

      },
      error: function (error) {
        console.error('error', error)
      },
      complete: function () { },
    })
  },

  event: function () {
    $('body').on('change', '#opt-in-newsletter', function () {

      //passa para RD
      if (newUser) {
        userEmail = $('input#client-email').val()
        firstName = $('#client-first-name').val()
        lastName = $('#client-last-name').val()
      }

      var isNewsletterOptIn = false

      // para todos
      if ($(this).is(':checked')) {
        isNewsletterOptIn = true
      }

      mycheckout.sendrd(userEmail, firstName, lastName, isNewsletterOptIn)

    })

    $('body').on('change', '#fcheck', function () {

      var isNewsletterOptIn = false

      // para todos
      if ($(this).is(':checked')) {
        isNewsletterOptIn = true
      }
      if (newUser) {
        userEmail = $('input#client-email').val()
        firstName = $('#client-first-name').val()
        lastName = $('#client-last-name').val()
      }

      mycheckout.sendrd(userEmail, firstName, lastName, isNewsletterOptIn)

      var fieldsVtex = {
        locale: 'pt-BR',
        optinNewsLetter: isNewsletterOptIn,
      }
      $.ajax({
        type: 'POST',
        url: '/api/checkout/pub/orderForm/' + idorder + '/attachments/clientPreferencesData',
        data: JSON.stringify(fieldsVtex),
        success: function (data, textStatus, xhr) {
        },
        error: function (error) {
          console.error('error', error)
        },
        complete: function () { },
      })
    })
  },

  createCookie: function (name, value, days) {
    var expires = ''

    if (days) {
      var date = new Date()
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      expires = '; expires=' + date.toUTCString()
    }
    document.cookie = name + '=' + value + expires + '; path=/'
  },

  readCookie: function (name) {
    var nameEQ = name + '='
    var ca = document.cookie.split(';')

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i]
      while (c.charAt(0) == ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  },

  removeCookie: function (name) {
    mycheckout.createCookie(name, '', -1)
  }
}
function getUrlParam(url, param) {
  return new URL(url).searchParams.get(param)
}
function findCouponInput() {
  if ($('#cart-coupon').length) {
    couponWarningConfig()
  } else {
    setTimeout(findCouponInput, 500)
  }
}
function couponWarningConfig() {
  $('#cart-coupon').on('input', handleCouponWarning)
  var target = $('#cart-coupon')[0]
  if (target) {
    var observer = new MutationObserver(handleRemoveCouponWarning)
    var config = {
      attributes: true,
      childList: true,
      characterData: true,
    }
    observer.observe(target, config)
  }
}
function handleCouponWarning() {
  if ($('#cart-coupon').val().toLowerCase() == '139copag') {
    $('<span id="warning">Esse cupom não é cumulativo com outras promoções.</span>').css('position', 'absolute').css('top', '110%').css('left', '0').css('font-size', '15px').css('font-weight', 'bold').css('color', '#ff0557').insertAfter($('span.info'))
    $('p.coupon-fields').css('position', 'relative')
  } else {
    $('.coupon-fields').find('#warning').remove()
  }
}
function handleRemoveCouponWarning() {
  if ($('#cart-coupon').val() == '') $('.coupon-fields').find('#warning').remove()
}
function changeCorreiosUrl() {
  const linkBusca = $('#cart-dont-know-postal-code')
  if (linkBusca.length) {
    linkBusca.attr('href', buscaCepUrl)
  } else {
    setTimeout(changeCorreiosUrl, 1000)
  }
}
function alertOutletProduct() {
  const outletCategoryId = 94747
  vtexjs.checkout.getOrderForm().then((orderForm) => {
    const itemsToRemove = []
    const { items } = orderForm
    const outletItems = items.filter((item, index) => {
      const outletItem = item.productCategories[outletCategoryId]
      if (outletItem) {
        itemsToRemove.push({
          index,
          quantity: 0,
        })
        return outletItem
      }
    })
    if (outletItems.length > 0) {
      $.getScript('https://unpkg.com/sweetalert/dist/sweetalert.min.js').then(function () {
        swal({
          text: 'Seu carrinho contém produtos marcados como “outlet”, que podem ter um ou mais componentes faltantes e/ou pequenos defeitos. Os detalhes estão listados no anúncio do produto. Deseja realmente continuar?',
          icon: 'warning',
          buttons: ['NÃO', 'SIM'],
        }).then((confirm) => {
          if (!confirm) {
            vtexjs.checkout.removeItems(itemsToRemove)
            swal('Os items marcados como "outlet" foram removidos do seu carrinho.')
          }
        })
      })
    }
  })
}
function checkIsBlacklisted() {
  const waitLoadUserdata = setInterval(() => {
    var hasUserData = vtexjs.checkout.orderForm.clientProfileData
    if (hasUserData) {
      clearInterval(waitLoadUserdata)
      const userEmail = vtexjs.checkout.orderForm.clientProfileData.email
      $.ajax({
        url: "/api/io/safedata/CL/search?_where=email=" + userEmail + "&_fields=email,IsBlackList,firstName,userId",
        type: "GET",
        cache: false,
        async: false,
        success: (response) => {
          let isBlacklisted = response[0].IsBlackList
          if (isBlacklisted) {
            const waitFormLoad = setInterval(() => {
              let formLoaded = $('#payment-group-creditCardPaymentGroup').length > 0
              if (formLoaded) {
                $('#payment-group-creditCardPaymentGroup').remove()
                $('#payment-group-bankInvoicePaymentGroup').trigger('click')
              }
            }, 100);
          }
        }
      })
    }
  }, 200);
}
function blockBlacklistedEmail(orderForm) {
  console.log('blockBlacklistedEmail', orderForm)
  var blackList = [
    'm037leow@gmail.com',
    'vitor.nishiy3@gmail.com',
  ]
  
  var email = orderForm && orderForm.clientProfileData && orderForm.clientProfileData.email
  if (!email) return

  console.log('email', email)

  var isBlocked = blackList.some(function (blocked) {
    return blocked.toLowerCase() === email.toLowerCase()
  })

  console.log('isBlocked', isBlocked)

  var $submitWrapper = $('#payment-submit-wrap')
  console.log('submitWrapper', $submitWrapper)

  if (!$submitWrapper.length) return

  if (isBlocked) {
    $submitWrapper.style.display = 'none'
  } else {
    $submitWrapper.style.display = 'block'
  }
}

$(window).on('orderFormUpdated.vtex', function (evt, orderForm) {
  console.log('orderFormUpdated.vtex Blacklisted Email', orderForm)
  blockBlacklistedEmail(orderForm)
})

$(window).on('hashchange', function () {
  if (window.location.hash.indexOf('#/payment') === -1) return
  if (window.vtexjs && vtexjs.checkout && vtexjs.checkout.orderForm) {
    console.log('hashchange Blacklisted Email', vtexjs.checkout.orderForm)
    blockBlacklistedEmail(vtexjs.checkout.orderForm)
  }
})
function showLGPDWarning() {
  window.onpopstate = function (event) {
    $('.wrap-group').each(function () {
      $(this).remove()
    })
    if (window.location.hash == '#/payment') {
      let htmlTemplate = `
        <div class="wrap-group">
          <div style="margin:0; padding-bottom:0" class="group-check">
            <span style="color:#000; margin-left:0">Ao informar meus dados eu concordo com a <a style="text-decoration:underline; href="/institucional/politica-privacidade" target="_blank">Política de Privacidade</a>  e os <a href="/institucional/condicoes-de-uso" target="_blank">Termos de Uso.</a></span>
          </div>
        </div>
      `
      $('.summary-template-holder').after(htmlTemplate)
    }
  }
}
function showAddressConfirm() {
  function render() {
    if (window.location.hash != '#/shipping') return $('.accept-checkbox-container').remove()
    const $form = $('.vtex-omnishipping-1-x-addressForm')
    if (!$form.length) return setTimeout(render, 300)
    if ($('.accept-checkbox-container').length) return
    $form.after(`
      <div class="accept-checkbox-container">
        <input type="checkbox" id="address-confirm-check">
        <div class="accept-checkbox-content">
          <strong class="accept-checkbox-title">Tudo certo com o endereço?</strong>
          <span class="accept-checkbox-subtitle">Dados incorretos podem causar falha na entrega e cancelamento do pedido.</span>
        </div>
      </div>
    `)
  }
  $(window).on('hashchange orderFormUpdated.vtex', render)
  render()
  $('body').on('click', '.btn-go-to-payment', function (e) {
    const $box = $('.accept-checkbox-container')
    if (!$box.length || $box.find('input').is(':checked')) return
    e.preventDefault()
    e.stopImmediatePropagation()
    $box.addClass('is-error')
    if (!$box.find('.accept-checkbox-error').length) {
      $box.append('<span class="accept-checkbox-error">*Confirme os dados para seguir!</span>')
    }
    return false
  })
  $('body').on('change', '#address-confirm-check', function () {
    if (!this.checked) return
    $('.accept-checkbox-container').removeClass('is-error').find('.accept-checkbox-error').remove()
  })
}
function removeGiftColaboradores(orderform) {
  function removeGift(orderform) {
    let gifts = []
    let isColaborador = false
    orderform.ratesAndBenefitsData &&
      orderform.ratesAndBenefitsData.rateAndBenefitsIdentifiers.forEach((benefit) => {
        if (benefit.name.toLowerCase().includes('colaborador')) isColaborador = true
        if (benefit.matchedParameters['buyAndWin@Marketing'] || benefit.name.toLowerCase().includes('brinde')) gifts.push(benefit)
      })
    if (!isColaborador) showGiftList()
    else {
      hideGiftList()
      if (gifts.length > 0) {
        removeGiftAsync(gifts, orderform)
      }
    }
  }
  function removeGiftAsync(gifts, orderform) {
    const remainingGifts = gifts
    const gift = remainingGifts.pop()
    $.post(`/api/checkout/pub/orderForm/${orderform.orderFormId}/selectable-gifts/${gift.id}`, { id: gift.id, selectedGifts: [] }).then(() => {
      if (gifts.length > 0) removeGiftAsync(remainingGifts, orderform)
      else vtexjs.checkout.getOrderForm(['items', 'ratesAndBenefitsData'])
    })
  }
  function showGiftList() {
    if ($('.cart-select-gift-placeholder').length) {
      $('.cart-select-gift-placeholder').show()
      $('#cart-to-orderform').removeClass('colaborador')
    } else setTimeout(showGiftList, 500)
  }
  function hideGiftList() {
    if ($('.cart-select-gift-placeholder').length) {
      $('.cart-select-gift-placeholder').hide()
      $('#cart-to-orderform').addClass('colaborador')
    } else setTimeout(hideGiftList, 500)
  }
  removeGift(orderform)
}
function moveShipping() {
  $('.full-cart .summary-totalizers').first().prepend($('.full-cart #shipping-preview-container'))
  if (!$('.full-cart .summary-totalizers #shipping-preview-container').length) setTimeout(moveShipping, 100)
  else {
    $('.summary-totalizers .forms.coupon-column').show()
  }
}
function showShippingMessage() {
  const shippingNameContainer = document.querySelector('.srp-delivery-current-many__name')
  const shippingCurrentContainer = document.querySelector('.srp-delivery-current-many__text')
  if (shippingCurrentContainer) {
    if (shippingNameContainer && shippingNameContainer.textContent == 'Entrega Expressa') {
      if (!shippingCurrentContainer.querySelector('.message-expressa')) shippingCurrentContainer.insertAdjacentHTML('beforeend', "<div class='message-expressa'></div>")
    } else {
      const shippingMessageContainer = shippingCurrentContainer.querySelector('.message-expressa')
      if (shippingMessageContainer) shippingMessageContainer.remove()
    }
  } else setTimeout(showShippingMessage, 300)
}
function changeShippingDisplay() {
  $('.srp-delivery-select optgroup').each(function () { const option = $(this).find('option'); option.text($(this).attr('label') + ' - ' + option.text()); $(this).parent().append(option); $(this).remove() })
}
if ($("script[src^='/files/checkout6-custom.js']").length > 0 && getUrlParam(window.location.href, 'lid') == 'true') {
  $("script[src^='/files/checkout6-custom.js']").remove()
  $('body').append(`<script type="text/javascript" src="/files/checkout6-custom-lid.js?v=${Math.random()}"></script>`)
} else {
  (function (window, jQuery) {
    jQuery(function ($) {

      function Step1() {

      }

      function Step2() {

      }

      function Step3() {

      }

      function Step4() {

      }

      function Step5() {

      }

      function Progress() {
        switch (window.location.hash || window.location.pathname) {
          case '#/cart':
            Step1()
            break
          case '#/email':

            Step2()
            break
          case '#/profile':
            Step3()
            break
          case '#/shipping':
            Step3()
            break
          case '#/payment':
            Step4()
            break
          case '/checkout/orderPlaced/':
            Step5()
            break
        }
      }

      window.onpopstate = function (event) {
        Progress()
      }

      window.onload = function () {
        Progress()
      }

    })

  })(window, window.jQuery)


  $(window).on('orderFormUpdated.vtex', (event, orderform) => {
    showShippingMessage()
    removeGiftColaboradores(orderform)
    checkCep()
  })

  $(window).load(function () {
    checkIsBlacklisted()
    checkCep()
    if ($('.available-gift').length > 0) {
      setInterval(function () {
        function verificaBrinde() {
          setTimeout(function () {
            if ($('.table.cart-gift-items .checkbox-selector.icon-check-sign.active').length > 0) {
              $('a#cart-to-orderform').css('background-color', '#e4244b')
              $('a#cart-to-orderform').css('pointer-events', 'auto')
              $('.aviso-brinde').remove()
              $('#cart-to-orderform').removeClass('obs-brinde')
            } else {
              if ($('.aviso-brinde').length < 1) {
                var avisoBrinde = "<div class='pai-aviso-brinde'><div class='aviso-brinde'> Não esqueça de escolher seu brinde </div></div>"
                $('cart-select-gift-placeholder').prepend($(avisoBrinde))
                $('#cart-to-orderform').addClass('obs-brinde')
              }
            }
          }, 1000)
        }

        $('.table.cart-gift-items i.checkbox-selector').on('click', function () {
          verificaBrinde()
        })
        verificaBrinde()
      }, 1000)
      clearInterval()
    }
  })

  // cep validation
  let lastCheckedCep = ''
  function checkCep() {
    setTimeout(() => {
      const cep = vtexjs.checkout.orderForm?.shippingData?.selectedAddresses?.[0]?.postalCode
      if (!cep || cep === lastCheckedCep) return
      lastCheckedCep = cep
      $('.errorCepRequest').remove()
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
          if (data.erro === true || data.erro === 'true') {
            $('.ship-postalCode').after("<span class='errorCepRequest'>CEP INVÁLIDO!</span>")
            $('.vtex-omnishipping-1-x-addressForm, .vtex-omnishipping-1-x-deliveryGroup, .accept-checkbox-container, .srp-delivery-select-container').hide()
            $('.btn-go-to-payment').prop('disabled', true)
            $('#shipping-preview-container .srp-content').after("<span class='errorCepRequest'>CEP INVÁLIDO!</span>")
            $('#cart-to-orderform').css('display', 'none')
          } else {
            $('.errorCepRequest').remove()
            $('.vtex-omnishipping-1-x-addressForm, .vtex-omnishipping-1-x-deliveryGroup, .accept-checkbox-container, .srp-delivery-select-container').show()
            $('.btn-go-to-payment').prop('disabled', false)
            $('#cart-to-orderform').css('display', 'flex')
          }
        })
    }, 1000)
  }

  $(document).ready(function () {
    alertOutletProduct()
    findCouponInput()
    changeCorreiosUrl()
    moveShipping()
    showShippingMessage()
    changeShippingDisplay()
    showLGPDWarning()
    showAddressConfirm()
    vtexjs.checkout.getOrderForm().then((orderform) => removeGiftColaboradores(orderform))
    let autoCalcDone = false
    setInterval(() => {
      if (!autoCalcDone && $('#shipping-calculate-link').is(':visible')) {
        $('#shipping-calculate-link').trigger('click')
        autoCalcDone = true
      }
    }, 200)
  })
}

