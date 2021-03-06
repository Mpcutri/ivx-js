import { Style } from './style.js';
import { Form as BasicForm } from '../basic/form.js';

export class Form extends BasicForm {
    constructor(inputHTML, name, additionalAttrHTML, settings) {
       super(inputHTML, name, additionalAttrHTML, settings, Style); 
    }

    get beforeClasses(){
        return 'ivx-input-before ivx-input-before-submit-button';
    }

    get afterClasses(){
        return 'ivx-input-after ivx-input-after-submit-button';
    }
    
    get submitButtonHTML() {        
        let {submit = {}, beforeClasses : defaultBeforeClasses, afterClasses : defaultAfterClasses} = this;
        let {label: submitLabel = "Submit", labelHTML: submitLabelHTML, input: submitInput = {}, container: submitContainer = {}, attributes = '', beforeHtml : beforeSettings = {}, afterHtml : afterSettings = {}} = submit;
        let {classes: submitInputClasses = ""} = submitInput;
        let {classes: submitContainerClasses = ""} = submitContainer;

        submitLabel = submitLabelHTML ? submitLabelHTML : submitLabel;

        const {html : beforeHtml = "", classes : beforeClasses = ""} = beforeSettings;
        const {html : afterHtml = "", classes : afterClasses = ""} = afterSettings;

        let submitHTML = submitLabel.length >= 0 ?
            `
            <div class="row">
                <div class="col-md-12 ${submitContainerClasses} ivx-input-container ivx-input-container-submit-button">
                    <div class="${beforeClasses} ${defaultBeforeClasses}">${beforeHtml}</div>
                    <button class="btn ${submitInputClasses} ivx-input ivx-input-submit-button" type='submit'>
                        ${submitLabel}
                    </button>
                    <div class="${afterClasses} ${defaultAfterClasses}">${afterHtml}</div>
                </div>
            </div>
            ` : '';

        return submitHTML;
    }
}