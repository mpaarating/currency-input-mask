##  A custom directive for currency input box masking.
* The directive consists of an addon with a '$' sign to the left of the input.
* Creates a badge icon when the input is disabled

### Usage
* Reference the script in your HTML
* Add `currencyInputMask` as a dependency in your app.
```javascript
angular.module('demo', ['currencyInputMask']);
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
<ngc-currency-input id="some-id"
                    ng-model="exampleModel"
                    ng-disabled="true"
                    ng-trim="false"
                    inline="true">
    <!-- ANY TRANSCLUDED STUFF GOES HERE -->
</ngc-currency-input>
```
### All Options for directive
```
id:                    // the id for the input
required:              { Boolean } // add the HTML required attribute
disabled:              { Boolean } // disable the input and hide the input group addon
colored-money-val:     { Boolean } // uses classes to color the money input values (green for pos, red for neg).
ng-model:
ng-class:
ng-trim:               { Boolean }
ng-disabled:
```

**Note:** Bootstrap required for any css styling. Look at dependencies for further details
