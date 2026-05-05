var lastClick = 0

var delay = 100

var mz_Receita = {
  run: () => {
    mz_Receita.initExtraJQ()
    mz_Receita.ajustImg()
  },

  init: () => {
    vtexjs.checkout.getOrderForm().done(orderForm => {
      mz_Receita.initAfterLoadOrderForm(orderForm)
    })
  },

  initAfterLoadOrderForm: () => {
    mz_Receita.ajustImg()
  },

  ajustImg: () => {
    const imgs = $('.product-item .product-image > a > img')

    if (imgs.length) {
      imgs.map((i, e) => {
        $(e).attr(
          'src',
          $(e)
            .attr('src')
            .replace('55-55', '45-45')
        )
      })
    } else {
      setTimeout(() => {
        mz_Receita.ajustImg()
      }, 100)
    }
  },

  orderFormUpdate: orderForm => {
    mz_Receita.verificarItemsComReceita(orderForm)
  },

  hashChange: () => {},

  ajaxStop: () => {
    mz_Receita.ajustImg()
  },

  windowOnload: () => {},

  initExtraJQ: function () {
    var script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.11.2/jquery.mask.js'
    document.getElementsByTagName('head')[0].appendChild(script)
  },

  verificarItemsComReceita: orderForm => {
    const { items } = orderForm

    items.forEach((e, i) => {
      const { productId } = e

      $.ajax({
        url: `/api/catalog_system/pub/products/search/?fq=productId:${productId}`,
        type: 'GET',
      }).done(res => {
        const { Receita } = res[0]
        const trItemTable = $(`.cart-template .cart-items tr.product-item[data-sku="${productId}`)

        if (!Receita) return

        if (!Receita.length) return

        if (Receita[0] != 'Sim') return

        mz_Receita.verificaSeJaPossuiReceitaAnexada(orderForm, productId).then(res => {
          if (res.success) {
            $(trItemTable).after(`<tr><td colspan="7" class="trItemWrapper" data-sku="${productId}">`)

            setTimeout(() => {
              $(`.trItemWrapper[data-sku="${productId}"]`)
                .first()
                .html(mz_Receita.formReceita(productId))

              mz_Receita.setActionsFormReceita(productId)
            }, 1000)

            $('#cart-to-orderform').hide()
          } else {
            $(`<tr><td colspan="7"><div class="MZ-receita-success" data-productId="${productId}" data-id="${res.id}">
              Receita anexada com sucesso
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8 0C3.58065 0 0 3.58065 0 8C0 12.4194 3.58065 16 8 16C12.4194 16 16 12.4194 16 8C16 3.58065 12.4194 0 8 0ZM11.9226 10.1C12.0742 10.2516 12.0742 10.4968 11.9226 10.6484L10.6452 11.9226C10.4935 12.0742 10.2484 12.0742 10.0968 11.9226L8 9.80645L5.9 11.9226C5.74839 12.0742 5.50323 12.0742 5.35161 11.9226L4.07742 10.6452C3.92581 10.4935 3.92581 10.2484 4.07742 10.0968L6.19355 8L4.07742 5.9C3.92581 5.74839 3.92581 5.50323 4.07742 5.35161L5.35484 4.07419C5.50645 3.92258 5.75161 3.92258 5.90323 4.07419L8 6.19355L10.1 4.07742C10.2516 3.92581 10.4968 3.92581 10.6484 4.07742L11.9258 5.35484C12.0774 5.50645 12.0774 5.75161 11.9258 5.90323L9.80645 8L11.9226 10.1Z" fill="#CE5662"></path></svg>
            </div></td></tr>`).insertAfter(trItemTable)

            setTimeout(() => {
              mz_Receita.setActionsSuccessReceita(trItemTable, productId)
            }, 1000)

            $('#cart-to-orderform').show()
          }
        })
      })
    })
  },

  setActionsSuccessReceita: (trItemTable, productId) => {
    const buttonRemoveReceita = $(`.MZ-receita-success[data-productId="${productId}"] svg`)
    const id = $(`.MZ-receita-success[data-productId="${productId}"]`).attr('data-id')

    buttonRemoveReceita.click(() => {
      if (window.confirm('Deseja realmente remover essa receita?')) {
        mz_Receita.addLoadingReceita(trItemTable)

        $.ajax({
          url: `/api/dataentities/RC/documents/${id}`,
          type: 'DELETE',
          timeout: 0,
          headers: {
            'Content-Type': 'application/json',
          },
        }).done(function (response) {
          setTimeout(() => {
            location.reload()
          }, 1000)
        })
      }
    })
  },

  verificaSeJaPossuiReceitaAnexada: (orderForm, productId) =>
    new Promise(function (resolve, reject) {
      const { orderFormId } = orderForm

      $.ajax({
        url: `/api/dataentities/RC/search?_where=orderFormId=${orderFormId} AND product_id=${productId}&_fields=orderFormId,product_id,id&_v=${new Date().getTime()}`,
        type: 'GET',
      }).done(function (response) {
        if (response.length)
          resolve({
            success: false,
            id: response[0].id,
          })
        else
          resolve({
            success: true,
          })
      })
    }),

  formReceita: productId => {
    let html = ''
    html += `<div class="MZ-receita" data-productId="${productId}">`

    /** TITLE */
    html += '<div class="MZ-receita-title">Envie sua receita</div>'
    /** TITLE */

    /** CONTAINER UPLOAD */
    html += `
    <div class="MZ-receita-file-container">
      <div class="MZ-receita-file-block">
        <div class="MZ-receita-file-block-title">
          Anexar receita
        </div>
        <div class="MZ-receita-file-block-description">
          Anexar até 4 arquivos com terminações em:.png .jpg .gif .doc .pdf com no máximo 5mb.
        </div>
        <div class="MZ-receita-file-block-button">
          <input type="file" style="display:none" />
          <button>Adicionar mais receitas</button>
        </div>
      </div>

      <div class="MZ-receita-file-block">
        <div class="MZ-receita-file-block-title">
          Enviar receita digital
        </div>
        <div class="MZ-receita-file-block-description">
          Insira o código token da sua receita digital abaixo.
        </div>
        <div class="MZ-receita-file-block-button">
          <input type="text" name="token" placeholder="Código token" style="display:none" />
          <button>Insira o código token</button>
        </div>
      </div>
    </div>`
    /** CONTAINER UPLOAD */

    /** TITLE */
    html += '<div class="MZ-receita-title">Dados Pessoais</div>'
    /** TITLE */

    /** CONTAINER INPUTS */
    html += `
    <div class="MZ-receita-inputs-container">
      <div class="MZ-receita-input-container">
        <label>Nome completo</label>
        <input type="text" name="name" placeholder="Ex: João Pedro" />
      </div>

      <div class="MZ-receita-input-container">
        <label>RG</label>
        <input type="text" name="rg" />
      </div>

      <div class="MZ-receita-input-container">
        <label>Data de nascimento</label>
        <input type="date" name="birthday" placeholder="dd/mm/aaaa" />
      </div>

      <div class="MZ-receita-input-container">
        <label>Endereço</label>
        <input type="text" name="address" placeholder="Ex: Nome rua, 123" />
      </div>

      <div class="MZ-receita-input-container">
        <label>Número/Complemento</label>
        <input type="text" name="addressNumber" />
      </div>

      <div class="MZ-receita-input-container">
        <label>Bairro</label>
        <input type="text" name="bairro" />
      </div>

      <div class="MZ-receita-input-container">
        <label>Cidade</label>
        <input type="text" name="city" />
      </div>

      <div class="MZ-receita-input-container">
        <label>Estado</label>
        <input type="text" name="state" />
      </div>

      <div class="MZ-receita-input-container">
        <label>Telefone</label>
        <input type="text" name="phone" placeholder="Ex: (11) 9 9691 9095"/>
      </div>

      <div class="MZ-receita-button-container">
        <button>Enviar Receita</button>
      </div>
    </div>`
    /** CONTAINER INPUTS */

    html += '</div></td></tr>'

    return html
  },

  setActionsFormReceita: productId => {
    const trItemReceita = $(`.MZ-receita[data-productId=${productId}]`)

    const buttonUpload = trItemReceita.find('.MZ-receita-file-block:first-child .MZ-receita-file-block-button button')
    const buttonToken = trItemReceita.find('.MZ-receita-file-block:last-child .MZ-receita-file-block-button button')
    const buttonSubmit = trItemReceita.find('.MZ-receita-button-container button')
    const inputUpload = trItemReceita.find('.MZ-receita-file-block:first-child .MZ-receita-file-block-button input')

    buttonUpload.click(function () {
      $(this)
        .parent()
        .find('input')
        .click()
    })

    buttonToken.click(function () {
      $(this)
        .parent()
        .find('input')
        .show()
    })

    inputUpload.change(function () {
      const _this = this

      if ($(_this)[0].files.length) {
        const { name } = $(_this)[0].files[0]

        $(`<div class="MZ-receita-file-block-button-file">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8 0C3.58065 0 0 3.58065 0 8C0 12.4194 3.58065 16 8 16C12.4194 16 16 12.4194 16 8C16 3.58065 12.4194 0 8 0ZM11.9226 10.1C12.0742 10.2516 12.0742 10.4968 11.9226 10.6484L10.6452 11.9226C10.4935 12.0742 10.2484 12.0742 10.0968 11.9226L8 9.80645L5.9 11.9226C5.74839 12.0742 5.50323 12.0742 5.35161 11.9226L4.07742 10.6452C3.92581 10.4935 3.92581 10.2484 4.07742 10.0968L6.19355 8L4.07742 5.9C3.92581 5.74839 3.92581 5.50323 4.07742 5.35161L5.35484 4.07419C5.50645 3.92258 5.75161 3.92258 5.90323 4.07419L8 6.19355L10.1 4.07742C10.2516 3.92581 10.4968 3.92581 10.6484 4.07742L11.9258 5.35484C12.0774 5.50645 12.0774 5.75161 11.9258 5.90323L9.80645 8L11.9226 10.1Z" fill="#CE5662"></path></svg>
            ${name}
          </div>`).insertBefore(buttonUpload)

        setTimeout(() => {
          $(_this)
            .parent()
            .find('.MZ-receita-file-block-button-file svg')
            .click(() => {
              $(_this).val(null)
              inputUpload
                .parent()
                .find('.MZ-receita-file-block-button-file')
                .remove()
            })
        }, 500)
      } else {
        inputUpload
          .parent()
          .find('.MZ-receita-file-block-button-file')
          .remove()
      }
    })

    buttonSubmit.click(() => {
      if (lastClick >= Date.now() - delay) {
        return
      }

      lastClick = Date.now()

      mz_Receita.submitReceita(trItemReceita, productId)
    })

    $('input[name="rg"]').mask('00.000.000-0')
    $('input[name="phone"]').mask('00 00000-0000', { reverse: true })
  },

  submitReceita: async (trItemReceita, productId) => {
    mz_Receita.addLoadingReceita(trItemReceita)
    $('#alert-obrigatorio').remove()
    const { orderFormId } = vtexjs.checkout.orderForm

    var dataForm = {
      product_id: productId,
      orderFormId,
    }

    const inputs = trItemReceita.find('input[type!=file]')

    let processar = true

    await inputs.map((i, e) => {
      if ($(e).attr('name') != 'token') {
        if ($(e).val() == '' || !$(e).val()) {
          processar = false

          $('#alert-obrigatorio').remove()

          trItemReceita.find('.MZ-receita-button-container').append(
            $(`
              <div id="alert-obrigatorio" style="position: absolute;bottom: 5px;color: tomato;font-weight: 600;font-size: 13px;">
                * Campo ${$(e)
                  .parent()
                  .find('label')
                  .html()} é obrigatório
              </div>`)
          )

          mz_Receita.removeLoadingReceita(trItemReceita)
          return false
        }
      } else {
        if ($(e).val() == '' || !$(e).val()) {
          if (!$('.MZ-receita-file-block-button input')[0].files.length) {
            processar = false

            mz_Receita.removeLoadingReceita(trItemReceita)

            $('#alert-obrigatorio').remove()

            trItemReceita.find('.MZ-receita-button-container').append(
              $(`
                <div id="alert-obrigatorio" style="position: absolute;bottom: 5px;color: tomato;font-weight: 600;font-size: 13px;">
                  * Campo Anexo ou Token são obrigatórios
                </div>`)
            )
          }
        }
      }

      if (!processar) return

      dataForm[$(e).attr('name')] = $(e).val()

      if (i == inputs.length - 1) {
        setTimeout(() => {
          const { orderFormId } = vtexjs.checkout.orderForm

          // The following app only works because the checkout Custom Data has been configured properly
          // Reference: https://developers.vtex.com/vtex-rest-api/reference/configuration
          const appName = 'orderForm'

          const appField = 'id'

          const updateCustomData = async () => {
            await fetch(`/api/checkout/pub/orderForm/${orderFormId}/customData/${appName}/${appField}`, {
              method: 'PUT',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: orderFormId }),
            })
          }

          updateCustomData()

          $.ajax({
            url: '/api/dataentities/RC/documents',
            type: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            data: JSON.stringify(dataForm),
          }).done(function (response) {
            const { DocumentId } = response

            if (trItemReceita.find('.MZ-receita-file-block-button input')[0].files.length) {
              const file = trItemReceita.find('.MZ-receita-file-block-button input')[0].files[0]

              const form = new FormData()

              const name = file.name.replace(/ /g, '-')

              form.append('file', file, name)

              $.ajax({
                url: `/api/dataentities/RC/documents/${DocumentId}/receita/attachments`,
                type: 'POST',
                processData: false,
                mimeType: 'multipart/form-data',
                contentType: false,
                data: form,
              }).done(resUpload => {
                console.log(resUpload)

                verificaAtualizacaoMD()
              })
            } else {
              verificaAtualizacaoMD()
            }

            function verificaAtualizacaoMD () {
              mz_Receita.verificaSeJaPossuiReceitaAnexada(vtexjs.checkout.orderForm, productId).then(res => {
                if (!res.success) {
                  location.reload()
                } else {
                  setTimeout(() => {
                    verificaAtualizacaoMD()
                  }, 1000)
                }
              })
            }
          })
        }, 500)
      }
    })
  },

  addLoadingReceita: trItemTable => trItemTable.addClass('loading-receita'),

  removeLoadingReceita: trItemTable => trItemTable.removeClass('loading-receita'),

  __findIndexArray: (array, position, find) => {
    const findArray = array => array[position] == this
    return array.indexOf(array.find(findArray, find))
  },
}

mz_Receita.run()
$(() => {
  mz_Receita.init()
  $(window).load(mz_Receita.windowOnload())
  $(document.body).addClass('jsFullLoaded')
})
$(document).ajaxStop(mz_Receita.ajaxStop())
$(window).on('hashchange', e => {
  mz_Receita.hashChange()
})


function disableButtonQuantityPBM (orderForm) {
  if (!orderForm) return
  const { items = [] } = orderForm
  const hasPBMitens =
    orderForm.customData &&
    orderForm.customData.customApps &&
    orderForm.customData.customApps.find((app) => app.id === 'pbm')
  if (!hasPBMitens) return

  items.forEach((item) => {
    if (item.manualPrice !== null && item.manualPrice !== undefined && item.manualPrice !== '') {
      const { id } = item
      const buttonDecrement = document.getElementById('item-quantity-change-decrement-' + id)
      const inputQuantity = document.getElementById('item-quantity-' + id)
      const buttonIncrement = document.getElementById('item-quantity-change-increment-' + id)
      if (!buttonDecrement || !buttonIncrement || !inputQuantity) return
      buttonDecrement.classList.add('disabled')
      buttonIncrement.classList.add('disabled')
      inputQuantity.classList.add('disabled')
    }
  })
}
function addFlagPBM (orderForm) {
  if (!orderForm) return
  const hasPBMitens =
    orderForm.customData &&
    orderForm.customData.customApps &&
    orderForm.customData.customApps.find((app) => app.id === 'pbm')
  if (!hasPBMitens) return

  const { items = [] } = orderForm
  items.forEach((item) => {
    if (
      item.manualPrice === null ||
      item.manualPrice === undefined ||
      item.manualPrice === ''
    ) {
      return
    }
    const { id } = item
    const nameEl = document.getElementById('product-name' + id)
    if (!nameEl) return
    const next = nameEl.nextElementSibling
    if (next && next.classList && next.classList.contains('pbm-product-flag-pbm')) {
      return
    }
    nameEl.insertAdjacentHTML(
      'afterend',
      '<span class="pbm-product-flag-pbm">Desconto de Laboratório</span>'
    )
  })
}

const observer = new MutationObserver(() => {
  const orderForm =
    typeof vtexjs !== 'undefined' && vtexjs.checkout
      ? vtexjs.checkout.orderForm
      : undefined
  disableButtonQuantityPBM(orderForm)
  addFlagPBM(orderForm)
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

$(window).on('orderFormUpdated.vtex', () => {
  const orderForm =
    typeof vtexjs !== 'undefined' && vtexjs.checkout
      ? vtexjs.checkout.orderForm
      : undefined
  mz_Receita.orderFormUpdate(vtexjs.checkout.orderForm)
  disableButtonQuantityPBM(orderForm)
  addFlagPBM(orderForm)
})

$(document).ready(function () {
  vtexjs.checkout.getOrderForm().done(function (orderForm) {
    disableButtonQuantityPBM(orderForm)
    addFlagPBM(orderForm)
  })
})