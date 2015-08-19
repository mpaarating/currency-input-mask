##  A custom directive for currency input box masking.
The directive consists of an addon with a '$' sign to the left of the input.
If the input is disabled, it creates a badge icon with the amount

* Reference the script in your HTML
* Add `currencyInputMask` as a dependency in your app.
```javascript
var app = angular.module('demo', ['currencyInputMask']);
```
* Add the `currency-mask` attribute to your text input.
1. As a block element
```javascript
<currency-input-mask id="some-id"
                    colored-money-val="true"
                    ng-model="exampleModel"
                    required="true">
    <!-- ANY TRANSCLUDED STUFF GOES HERE -->
</currency-input-mask>
```
2. As an inline element
```javascript
<ngc-currency-input id="amount-being-paid-input"
                    ng-model="dataItem.amountBeingPaid"
                    ng-disabled="!dataItem.isAmountBeingEdited"
                    ng-trim="false"
                    inline="true">
    <!-- ANY TRANSCLUDED STUFF GOES HERE -->
</ngc-currency-input>
```
**Note:** Bootstrap required for any css styling. Look at dependencies for further details
