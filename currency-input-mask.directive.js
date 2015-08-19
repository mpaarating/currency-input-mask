/**
 * CurrencyInputMask -- A custom directive for currency input box.
 *                     The directive consists of an addon with a '$'
 *                     sign to the left of the input.
 *
 *   ////////////////////////////////////////////////////
 *   Available options for the directive are:
 *      id:                    // the id for the input
 *      inline:                { Boolean } // if the currency input is used inline
 *      required:              { Boolean } // add the HTML required attribute
 *      disabled:              { Boolean } // disable the input and hide the input group addon
 *      ng-model:              // the model
 *      ng-class:
 *      ng-trim:               { Boolean }
 *      ng-disabled:
 *   ////////////////////////////////////////////////////
 *
 *  ////////////////////////////////////////////////////
 *  Example usages:
 *     1. As a block element
 *          <ngc-currency-input id="some-id"
                                ngc-secure-field="Contract.requestedFinancedAmount"
                                ng-model="exampleModel"
                                required="true">
                <!-- ANY TRANSCLUDED STUFF GOES HERE -->
            </ngc-currency-input>

        2. As an inline element
            <ngc-currency-input id="amount-being-paid-input"
                                ng-model="dataItem.amountBeingPaid"
                                ng-disabled="!dataItem.isAmountBeingEdited"
                                ng-trim="false"
                                inline="true">
                <!-- ANY TRANSCLUDED STUFF GOES HERE -->
            </ngc-currency-input>
    ////////////////////////////////////////////////////
 */

(function() {
  'use strict';

  angular.module('currencyInputMask', [])
    .directive('currencyInputMask', CurrencyInput);

  CurrencyInput.$inject = ['$compile'];

  function CurrencyInput($compile) {
    return {
      restrict: 'E',
      transclude: true,
      require: 'ngModel',
      scope: {
        id: '=',
        inline: '=',
        required: '=',
        disabled: '=',
        coloredMoneyVal: '=',
        ngModel: '=',
        ngClass: '=',
        ngTrim: '=',
        ngDisabled: '=',
      },
      template: function(element, attrs) {
        var template = '';
        var input;
        var  inputGroupDiv;

        // disabled input (aka money badge) does
        // not need a $ input group addon
        if (attrs.disabled === 'true') {
          template = angular.element([
            '<input type="text" ',
            'ng-model="tempCurrency"',
            'ng-trim="ngTrim"',
            'ng-class="ngClass"',
            'ng-disabled="ngDisabled" />',
          ].join(' '));
        } else {
          template = angular.element([
            '<div class="input-group">',
            '<div class="input-group-addon">$</div>',
            '<input type="text" ',
            'ng-model="tempCurrency"',
            'ng-trim="ngTrim"',
            'ng-class="ngClass"',
            'ng-disabled="ngDisabled" />',
            '</div>',
          ].join(' '));
        }

        input = template.find('input');

        // add the id provided in the directive to the input
        if (attrs.id && attrs.id.length > 0) {
          input.attr('id', attrs.id);

          // remove the id from the original directive to
          // avoid interference with tests
          element.removeAttr('id');
        }

        // we have to do this in the template function because
        // angular transclusion occurs when the template is constructed.
        if (attrs.inline === 'true') {
          // append the transcluded html after the input
          input.after('<span ng-transclude></span>');
        } else {
          // append the transcluded html after the input-group
          inputGroupDiv = template.find('.input-group');
          inputGroupDiv.after('<span ng-transclude></span>');
        }

        return template[0].outerHTML;
      },

      link: function link(scope, element, attrs, ngModelController) {
        var input = element.find('input');
        if (attrs.disabled === 'true') {
          var addCurrencySymbol = true;
        }

        buildInputAttrs(scope, input, attrs);

        var unbind = scope.$watch('ngModel', function(value) {
          if (value && value !== 'undefined') {
            scope.tempCurrency = formatValue(scope, value, input, false, addCurrencySymbol);
            unbind();
          }
        });

        scope.$watch('tempCurrency', _.debounce(function(newVal, oldVal) {
          if (newVal !== 'undefined' && newVal !== oldVal) {
            scope.$apply(function() {
              scope.ngModel = formatModel(newVal);
            });
          }
        }, 250));

        ngModelController.$formatters.push(function(modelValue) {
          if (!modelValue || modelValue.length === 0) {
            modelValue = '0.00';
            return modelValue;
          }

          return modelValue;
        });

        var applyFormatting = function() {
          var value = input.val();
          if (!value || value.length === 0) {
            return;
          }

          value = formatValue(scope, value, input, false, addCurrencySymbol);
          input.val(value);
          input.triggerHandler('input');
        };

        // Limits input to numbers only
        input.bind('keyup', function(e) {
          var keycode = e.keyCode;
          var isTextInputKey =
            (keycode > 47 && keycode < 58) || // number keys
            keycode === 32 || keycode === 8 || // spacebar or backspace
            (keycode > 64 && keycode < 91) || // letter keys
            (keycode > 95 && keycode < 112) || // numpad keys
            (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
            (keycode > 218 && keycode < 223); // [\]' (in order)
          if (isTextInputKey) {
            applyFormatting();
          }
        });
      },
    };

    function formatModel(viewValue) {
      // Sets the value to 0 in case the user
      // deletes the field value
      if (viewValue === '') {
        viewValue = '0.00';
      }

      viewValue = viewValue.toString();
      viewValue = viewValue.replace(/[^0-9\.\-]/g, '');
      return viewValue;
    }

    function formatValue(scope, val, input, addExtraZero, addCurrencySymbol) {
      if (!val) {
        return '';
      }

      var str = val.toString();
      var masked = true;
      var negative;

      if (addExtraZero === undefined) {
        addExtraZero = false;
      }

      // Assumes asterisk used for masking
      if (!str.match(/\*+/)) {
        masked = false;
        negative = _.startsWith(str, '-');

        if (addExtraZero === undefined) {
          addExtraZero = false;
        }

        str = str.toString();
        str = str.replace(/[^0-9\-]/g, ''); // Remove decimal, comma, dollar sign
        str = _.trimLeft(str, '0'); // Remove leading zeros
        str = str.replace(/(\d*)(\d{2})$/g, '$1.$2'); // Place the decimal point
        var parts = str.split('.');
        parts[0] = parts[0].replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, '$&,'); // Place the commas
        if (parts[1] && parts[1].length > 2) {
          parts[1] = parts[1].replace(/[^0-9]/g, '');
          parts[1] = parts[1].substring(0, 2);
        }

        if (addExtraZero && parts[1] && (parts[1].length === 1)) {
          parts[1] = parts[1] + '0';
        }

        str = parts.join('.');

        if (addCurrencySymbol) {
          str = '$' + str;
        }

      }

      if (scope.disabled) {

        // remove the existing badge so we can re-create it with the latest value
        removeExistingViewOnlyBadge();
        createViewOnlyBadge();
        showTheBadgeAndHideTheInput();
      }

      if (negative && scope.coloredMoneyVal) {
        input.removeClass('text-success');
        input.addClass('text-danger');
      } else if (scope.coloredMoneyVal) {
        input.removeClass('text-danger');
        input.addClass('text-success');
      }

      return str;

      ////////////////////////
      // INTERNAL FUNCTIONS //
      ////////////////////////
      function createDisabledVersion() {
        var clazz = '';
        var  html = '';

        if (!masked) {
          clazz = negative ? 'badge-money-negative' : 'badge-money-positive';
        }

        html = '<span class="badge disabled view-only-badge ' + clazz + '">' + str + '</span>';
        return $compile(html)(scope);
      }

      function removeExistingViewOnlyBadge() {
        input.parent().find('.badge').remove();
      }

      function createViewOnlyBadge() {
        input.parent().append(createDisabledVersion());
      }

      function showTheBadgeAndHideTheInput() {
        input.parent().find('span').css('display', 'inline');
        input.parent().find('input').css('display', 'none');
      }
    }

    function buildInputAttrs(scope, element, attrs) {
      // let the client implement the currency box inline
      if (scope.inline) {
        element.addClass('money-input pull-left');
      }

      // default is in block element
      else {
        element.addClass('form-control');
      }

      // add HTML required if applicable
      if (scope.required) {
        element.attr('required', '');
      }

      return $compile(element)(scope);
    }
  }
})();
